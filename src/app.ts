import express, { Request, Response } from 'express';

const app = express();
const port: number = parseInt(process.env.PORT || '3000', 10); // Use the PORT environment variable or default to 3000

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express.');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});