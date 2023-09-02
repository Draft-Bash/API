const Pool = require("pg").Pool;

const dbConn = new Pool({
    user: "ojklqiko",
    password: "lbrOLmLgAkLVlpLqh1i3Dhw48qu5kw1b",
    host: "fanny.db.elephantsql.com",
    port: 5432,
    database: "ojklqiko"
});

module.exports = dbConn;