import express, { Request, Response } from 'express';
const cors = require('cors');
const app = express();
const port = process.env.PORT || '3000';
import dotenv from 'dotenv';

dotenv.config() 

app.use(express.json());
app.use(cors()); // Configures the cross site resource sharing policy

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.get('/ping', (req, res) => {
  res.json({ message: 'Server is awake!' });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});