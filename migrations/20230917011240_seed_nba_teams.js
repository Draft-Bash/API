const fs = require('fs');
const csvParser = require('csv-parser');
const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

exports.up = async function (knex) {
    
    // Database connection configuration
    const dbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    };
    
    // CSV file path
    const csvFilePath = 'nbaData/nbaTeams.csv';
    
    // Function to read data from CSV and insert into database
    async function insertTeamData() {
      const client = new pg.Client(dbConfig);
    
      try {
        await client.connect();
        console.log('Connected to the database.');
    
        await new Promise((resolve, reject) => {
          const data = [];
          fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (row) => {
              data.push(row);
            })
            .on('end', async () => {
              try {
                // Insert all rows into the database table
                for (const row of data) {
                  await client.query(
                    'INSERT INTO nba_team (team_id, team_abbreviation, team_name, city_name) VALUES ($1, $2, $3, $4)',
                    [row.team_id, row.team_abbreviation, row.team_name, row.city_name]
                  );
                  console.log('Inserted row:', row);
                }
                resolve();
              } catch (error) {
                reject(error);
              }
            });
        });
    
        console.log('Data insertion completed.');
      } catch (error) {
        console.log('Error connecting to the database:', error.message);
      } finally {
        // Close the database connection
        console.log("Hello")
        client.end();
      }
    }
    
    await insertTeamData();
};

exports.down = function (knex) {
  // Define the SQL query to delete data from the nba_team table (if needed)
  const sqlQuery = `
    DELETE FROM nba_team;
  `;

  // Execute the raw SQL query to delete data from the nba_team table
  return knex.raw(sqlQuery);
};