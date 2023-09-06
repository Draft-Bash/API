const Pool = require("pg").Pool;
import { DB_USER, DB_NAME, DB_HOST, DB_PASSWORD, DB_PORT } from "./env";

const dbConn = new Pool({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME
});

module.exports = dbConn;