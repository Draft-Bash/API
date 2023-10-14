import express, { Request, Response } from 'express';
import { createWebSocket } from './websocket';
const cors = require('cors');
const app = express();
const port = process.env.PORT || '3000';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config() 

app.use(express.json());
app.use(cors()); // Configures the cross site resource sharing policy

app.use(express.json())
app.use(passport.initialize())

console.log(process.env.GOOGLE_CLIENT_ID)
console.log(process.env.GOOGLE_CLIENT_SECRET)
console.log(process.env.JWT_SECRET)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    (accessToken, refreshToken, profile, done) => {
      // You can customize this function to store user data in your database
      // For simplicity, we'll just generate a JWT with the user's Google ID as the payload.
      const user = { 
        id: profile.id,
        };
      if (profile.emails) {
        console.log(profile.emails[0].value)
      }
      const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });
      return done(null, token);
    }
  )
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // The user is authenticated, and we have a JWT token.
    // You can redirect the user to another page or send the token as a response.
    res.json({ 'hello':'hi'});
  }
);

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.get('/ping', (req, res) => {
  console.log("Responding to ping");
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