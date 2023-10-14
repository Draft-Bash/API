import express, { Request, Response } from 'express';
import { createWebSocket } from './websocket';
const cors = require('cors');
const app = express();
const port = process.env.PORT || '3000';
const db = require("./db");
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config() 

app.use(express.json());
app.use(cors()); // Configures the cross site resource sharing policy

app.use(express.json())
app.use(passport.initialize())

app.get('/test', (req, res) => {
  res.send(process.env.GOOGLE_CLIENT_ID+" "+process.env.GOOGLE_CLIENT_SECRET+" "+process.env.GOOGLE_CALLBACK_URL);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
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
    }
  )
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    if (req.user) {
      const token = req.user;
      if (process.env.CLIENT_URL) {
        res.redirect(`${process.env.CLIENT_URL}/google-auth?token=${token}`);
      }
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
app.use("/api/v1/users", require("./routes/users"));
// Route containing endpoints related to drafts
app.use("/api/v1/drafts", require("./routes/drafts"));

// Creates port listener
const httpServer = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Creates the websocket, which will listen on the same port as the API.
// In the production environment, the port is 443 (HTTPS)
createWebSocket(httpServer);