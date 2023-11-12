const fs = require('fs');
const csvParser = require('csv-parser');
const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Database connection configuration
const playerDbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: JSON.parse(process.env.SSL)
};

// CSV file path for nba_player_projections
const playerProjectionCsvFilePath = 'nbaData/nba_player_projections.csv';

// Export the seed function directly
module.exports = function () {
  return new Promise(async (resolve, reject) => {
    const client = new pg.Client(playerDbConfig);

    try {
      await client.connect();
      console.log('Connected to the database.');

      const insertPromises = [];

      fs.createReadStream(playerProjectionCsvFilePath)
        .pipe(csvParser())
        .on('data', async (row) => {
          try {
            // Adjust the query to match the nba_player_projections table
            const insertPromise = client.query(
              `INSERT INTO nba_player_projections (player_id, points_total, rebounds_total, 
                assists_total, blocks_total, steals_total, fieldgoal_percentage, 
                freethrow_percentage, threepointers_total, games_played, minutes_played, 
                turnovers_total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
                ON CONFLICT (player_id) DO UPDATE SET points_total = EXCLUDED.points_total,
                rebounds_total = EXCLUDED.rebounds_total, assists_total = EXCLUDED.assists_total,
                blocks_total = EXCLUDED.blocks_total, steals_total = EXCLUDED.steals_total, 
                fieldgoal_percentage = EXCLUDED.fieldgoal_percentage, 
                freethrow_percentage = EXCLUDED.freethrow_percentage, 
                threepointers_total = EXCLUDED.threepointers_total, games_played = EXCLUDED.games_played,
                minutes_played = EXCLUDED.minutes_played, turnovers_total = EXCLUDED.turnovers_total`,
              [
                row.player_id,
                row.points_total,
                row.rebounds_total,
                row.assists_total,
                row.blocks_total,
                row.steals_total,
                row.fieldgoal_percentage,
                row.freethrow_percentage,
                row.threepointers_total,
                row.games_played,
                row.minutes_played,
                row.turnovers_total,
              ]
            );
            insertPromises.push(insertPromise);
            console.log('Inserted or updated row:', row);
          } catch (error) {
            console.error('Error inserting or updating row:', row);
            console.error(error.message);
          }
        })
        .on('end', async () => {
          try {
            // Wait for all the insertion promises to resolve before closing the connection
            await Promise.all(insertPromises);
            resolve(); // Resolve the promise to signal completion
          } catch (error) {
            console.error('Error inserting or updating data:', error.message);
            reject(error); // Reject the promise in case of an error
          } finally {
            // Close the database connection
            client.end();
            console.log('Data insertion or update completed.');
          }
        });
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
      reject(error); // Reject the promise if the connection fails
    }
  });
};