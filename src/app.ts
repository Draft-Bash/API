import express, { Request, Response } from 'express';
const cors = require('cors');
const app = express();
const port = process.env.PORT || '3000';
const db = require("./db");
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { playerNewsWebscraper } from './utils/playerNewsWebscraper';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { test } from './utils/test';
import userRouter from './api/users/UserRoutes';
import draftsRouter from './api/drafts/DraftsRoutes';
import { ISocketService } from './websockets/ISocketService';
import { SocketIOSocketService } from './websockets/SocketIOWebsocketService';
import { DraftsObserver, DraftsSocket } from './websockets/draftsSocket/DraftWebsocket';

const cron = require('node-cron');

dotenv.config() 

app.use(express.json());
app.use(cors()); // Configures the cross site resource sharing policy

app.use(express.json())
app.use(passport.initialize())

app.post('/test', async (req, res) => {
  res.json(await test());
});

try {
  
} catch (error) {
  
}
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (profile.emails) {
          const userEmail = profile.emails[0].value
          const user = await db.query(`
            SELECT * 
            FROM user_account 
            WHERE email = $1;`, [
            userEmail
          ]);
          if (user.rows.length > 0) {
            const token = jwt.sign(user.rows[0], process.env.JWT_SECRET!, { expiresIn: '2h' });
            return done(null, token);
          }
          else {
            const username = userEmail.split('@')[0];
            const user = await db.query(`
              INSERT INTO user_account (username, email, password, is_google_auth)
              VALUES ($1, $2, $3, $4)
              RETURNING user_id, username`, [
              username, userEmail, "google-auth", true
            ]);
            const token = jwt.sign(user.rows[0], process.env.JWT_SECRET!, { expiresIn: '2h' });
            return done(null, token);
          }
        }
        return done(null);
      } catch (error) {
        console.log(error);
      }
    }
  )
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    try {
      if (req.user) {
        const token = req.user;
        if (process.env.CLIENT_URL) {
          res.redirect(`${process.env.CLIENT_URL}/google-auth?token=${token}`);
        }
      } 
    } catch (error) {
      console.log(error);
    }
  }
);

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.get('/ping', (req, res) => {
  res.json({ message: 'Server is awake!' });
});

// Route containing endpoints related to users
//app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/users", userRouter);

// Route containing endpoints related to drafts
//app.use("/api/v1/drafts", require("./routes/drafts"));
app.use("/api/v1/drafts", draftsRouter);

// Route containing endpoints related to draft invites
app.use("/api/v1/draft-invites", require("./routes/draftInvites"));

// Creates port listener
const httpServer = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const webSocketService: ISocketService = new SocketIOSocketService(httpServer);

class DummyDraftObserver1 implements DraftsObserver {
  onDraftOrderChange(room: string, draftOrder: string[]): void {
    console.log(`Observer 1 in room ${room}: Draft order changed to ${draftOrder}`);
  }

  // Add logic to run when the timer is even
  onDraftTimerEven(room: string, timerValue: number): void {
    console.log(`Observer 1 in room ${room}: Timer is even - ${timerValue} seconds`);
    // Add your specific logic here for even timer values
  }

  // Add logic to run when the timer is odd
  onDraftTimerOdd(room: string, timerValue: number): void {
    console.log(`Observer 1 in room ${room}: Timer is odd - ${timerValue} seconds`);
    // Add your specific logic here for odd timer values
  }
}

class DummyDraftObserver2 implements DraftsObserver {
  onDraftOrderChange(room: string, draftOrder: string[]): void {
    console.log(`Observer 2 in room ${room}: Draft order changed to ${draftOrder}`);
  }

  // Add logic to run when the timer is odd
  onDraftTimerOdd(room: string, timerValue: number): void {
    console.log(`Observer 2 in room ${room}: Timer is odd - ${timerValue} seconds`);
    // Add your specific logic here for odd timer values
  }

  onDraftTimerEven(room: string, timerValue: number): void {
    console.log(`Observer 2 in room ${room}: Timer is even - ${timerValue} seconds`);
    // Add your specific logic here for even timer values
  }
}

const draftsNamespace = webSocketService.createNamespace('/drafts');
const draftsSocket = new DraftsSocket(draftsNamespace, [new DummyDraftObserver1(), new DummyDraftObserver2()]);
draftsSocket.setupEventHandlers();

cron.schedule('*/5 8-9 * * *', async () => {
  try {
      // Calculate the offset based on the total minutes passed since 8:00 AM
      const offset = Math.floor((Date.now() - new Date().setHours(8, 0, 0, 0)) / (5 * 60 * 1000)) * 15;

      // Fetch the next batch of players to scrape
      const players = await db.query(`
          SELECT first_name, last_name, P.player_id, rotowire_id 
          FROM nba_player AS P
          INNER JOIN nba_player_news AS N
          ON P.player_id = N.player_id
          ORDER BY news_date ASC
          OFFSET ${offset}
          LIMIT 15;
      `);

      // Call your playerNewsWebscraper function
      await playerNewsWebscraper(players.rows);
  } catch (error) {
      console.error(error);
  }
});