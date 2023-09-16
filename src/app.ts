import express, { Request, Response } from 'express';
import { createWebSocket } from './websocket';
const cors = require('cors');
const app = express();
const port = process.env.PORT || '3000';

app.use(express.json());
app.use(cors()); // Configures the cross site resource sharing policy

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
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