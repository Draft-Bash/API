import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
const dbConn = require("./db");

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});