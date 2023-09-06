import express, { Request, Response } from 'express';
import { createWebSocket } from './websocket';
import { WEBSOCKET_PORT } from './env';
const cors = require('cors');
const app = express();
const apiPort = process.env.PORT || '3000';

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/drafts", require("./routes/drafts"));

const httpServer = app.listen(apiPort, () => {
  console.log(`Server is listening on port ${apiPort}`);
});

createWebSocket(httpServer);