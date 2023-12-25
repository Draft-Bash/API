import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Creates the Postgres database connection so that queries can be made to the database.
const dbConn = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    ssl: process.env.SSL ? JSON.parse(process.env.SSL) : false
});

export default dbConn;