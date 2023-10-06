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
      port: process.env.DB_PORT,
      ssl: (() => {
        try {
          return JSON.parse(process.env.SSL);
        } catch (error) {
          console.error('Error parsing SSL environment variable:', error);
          return true; // Set SSL to false by default in case of parsing errors
        }
      })()
    },
    migrations: {
      directory: './migrations/schema', // Schema migrations directory
    },
    seeds: {
      directory: './migrations/seeds', // Seed migrations directory
    },
  }
};