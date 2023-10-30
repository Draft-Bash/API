const Pool = require("pg").Pool;
import dotenv from 'dotenv';
dotenv.config();

interface Database {
    user: string;
    password: string;
    host: string;
    port: number;
    database: number;
    ssl?: boolean;
}

// Creates the Postgres database connection so that queries can be made to the database.
const dbConn: Database = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: JSON.parse(process.env.SSL as string)
});

module.exports = dbConn;