require('dotenv').config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg', // PostgreSQL
    connection: {
      host: process.env.DB_HOST, // Your PostgreSQL host
      user: process.env.DB_USER, // Your PostgreSQL username
      password: process.env.DB_PASSWORD, // Your PostgreSQL password
      database: process.env.DB_NAME, // Your PostgreSQL database name
      port: process.env.DB_PORT
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};