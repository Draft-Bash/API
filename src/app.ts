import express, { Request, Response } from 'express';
import { createWebSocket } from './websocket';
const cors = require('cors');
const app = express();
const port = process.env.PORT || '3000';
import passport from 'passport';
import dotenv from 'dotenv';
import { test } from './utils/test';

const cron = require('node-cron');

dotenv.config() 

app.use(express.json());
app.use(cors()); // Configures the cross site resource sharing policy

app.use(express.json())
app.use(passport.initialize())

app.post('/test', async (req, res) => {
  res.json(await test());
});

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

// Route containging endpoints related to draft invites
app.use("/api/v1/draft-invites", require("./routes/draftInvites"));

// Creates port listener
const httpServer = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Creates the websocket, which will listen on the same port as the API.
// In the production environment, the port is 443 (HTTPS)
createWebSocket(httpServer);