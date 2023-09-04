import express, { Request, Response } from 'express';
const app = express();
const port = process.env.PORT || 3000;
const dbConn = require("./db");
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.use("/api/v1/users", require("./routes/users"));

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});