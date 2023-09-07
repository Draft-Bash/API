const Pool = require("pg").Pool;
import { DB_USER, DB_NAME, DB_HOST, DB_PASSWORD, DB_PORT } from "./env";
import dotenv from 'dotenv';
dotenv.config();

const dbConn = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

module.exports = dbConn;