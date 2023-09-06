import express, { Request, Response } from 'express';
import { createWebSocket } from './websocket';
const cors = require('cors');
const app = express();
const apiPort = process.env.PORT || '3000';
const websocketPort = '3001';
app.use(express.json());
app.use(cors());

createWebSocket(websocketPort);

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/drafts", require("./routes/drafts"));

app.listen(apiPort, () => {
  console.log(`Server is listening on port ${apiPort}`);
});