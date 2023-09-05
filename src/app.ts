import express, { Request, Response } from 'express';
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/drafts", require("./routes/drafts"));

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});