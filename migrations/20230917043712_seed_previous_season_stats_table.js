const fs = require('fs');
const csvParser = require('csv-parser');
const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
  return new Promise(async (resolve, reject) => {
    // Database connection configuration
    const seasonStatsDbConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    };
    
    // CSV file path
    const seasonStatsCsvFilePath = 'nbaData/previousSeasonStats.csv';
    
    // Function to read data from CSV and insert into the database table
    async function insertSeasonStatsData() {
      const client = new pg.Client(seasonStatsDbConfig);
    
      try {
        await client.connect();
        console.log('Connected to the database.');
    
        const data = [];
    
        fs.createReadStream(seasonStatsCsvFilePath)
          .pipe(csvParser())
          .on('data', (row) => {
            data.push(row);
          })
          .on('end', async () => {
            try {
              for (const row of data) {
                // Insert each row into the database table
                await client.query(
                  'INSERT INTO nba_player_season_totals (player_id, season_name, games_played, minutes_played, fieldgoals_made, fieldgoals_attempted, threes_made, threes_attempted, freethrows_made, freethrows_attempted, rebounds_total, assists_total, steals_total, blocks_total, turnovers_total, points_total) ' +
                  'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
                  [
                    row.player_id,
                    row.season_name,
                    row.games_played,
                    row.minutes_played,
                    row.fieldgoals_made,
                    row.fieldgoals_attempted,
                    row.threes_made,
                    row.threes_attempted,
                    row.freethrows_made,
                    row.freethrows_attempted,
                    row.rebounds_total,
                    row.assists_total,
                    row.steals_total,
                    row.blocks_total,
                    row.turnovers_total,
                    row.points_total,
                  ]
                );
                console.log('Inserted row:', row);
              }
              console.log('Data insertion completed.');
              resolve(); // Resolve the outer promise to signal completion
            } catch (error) {
              console.error('Error inserting data:', error.message);
              reject(error); // Reject the outer promise in case of an error
            } finally {
              // Close the database connection
              client.end();
            }
          });
      } catch (error) {
        console.error('Error connecting to the database:', error.message);
        reject(error); // Reject the outer promise if connection fails
      }
    }
    
    try {
      // Call the function to insert data
      await insertSeasonStatsData();
    } catch (error) {
      console.error('Error during data insertion:', error.message);
    }
  });
};

exports.down = function (knex) {
  // Define the SQL query to delete data from the nba_player_season_totals table (if needed)
  const sqlQuery = `
    DELETE FROM nba_player_season_totals;
  `;
  
  // Execute the raw SQL query to delete data from the nba_player_season_totals table
  return knex.raw(sqlQuery);
};