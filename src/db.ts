const Pool = require("pg").Pool;
import dotenv from 'dotenv';
dotenv.config();

// Creates the Postgres database connection so that queries can be made to the database.
const dbConn = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

module.exports = dbConn;