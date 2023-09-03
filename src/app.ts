import express, { Request, Response } from 'express';
const app = express();
const port = process.env.PORT || 3000;
const dbConn = require("./db");
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.use("/api/v1/users", require("./routes/users"));

app.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await dbConn.query("SELECT * FROM user_account");
        res.json(users.rows);
    } catch (error) {console.log(error)}
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});