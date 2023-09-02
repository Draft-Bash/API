import express from 'express';
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const dbConn = require("./db");

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express.');
});

app.get('/users', async (req, res) => {
    try {
        const users = await dbConn.query("SELECT * FROM user_account");
        res.json(users.rows);
    } catch (error) {console.log(error)}
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});