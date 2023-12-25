const fs = require('fs');
const csvParser = require('csv-parser');
const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Database connection configuration
const ptsRankingDbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: JSON.parse(process.env.SSL)
};

// CSV file path
const ptsRankingCsvFilePath = 'nbaData/previousSeasonStats.csv';

// Export the seed function directly
module.exports = function () {
  return new Promise(async (resolve, reject) => {
    const client = new pg.Client(ptsRankingDbConfig);

    try {
      await client.connect();
      console.log('Connected to the database.');

      const data = [];

      fs.createReadStream(ptsRankingCsvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
          data.push(row);
        })
        .on('end', async () => {
          try {
            const insertPromises = [];

            for (const row of data) {
              // Insert or update each row into the database table and store the promise
              const insertPromise = client.query(
                `INSERT INTO nba_player_season_totals (player_id, season_name, games_played, 
                  minutes_played, fieldgoals_made, fieldgoals_attempted, threes_made, 
                  threes_attempted, freethrows_made, freethrows_attempted, rebounds_total, 
                  assists_total, steals_total, blocks_total, turnovers_total, points_total)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
                  ON CONFLICT (player_id, season_name) DO UPDATE SET
                  games_played = EXCLUDED.games_played, minutes_played = EXCLUDED.minutes_played, 
                  fieldgoals_made = EXCLUDED.fieldgoals_made, fieldgoals_attempted = EXCLUDED.fieldgoals_attempted, 
                  threes_made = EXCLUDED.threes_made, threes_attempted = EXCLUDED.threes_attempted,
                  freethrows_made = EXCLUDED.freethrows_made, freethrows_attempted = EXCLUDED.freethrows_attempted, 
                  rebounds_total = EXCLUDED.rebounds_total, assists_total = EXCLUDED.assists_total, 
                  steals_total = EXCLUDED.steals_total, blocks_total = EXCLUDED.blocks_total,
                  turnovers_total = EXCLUDED.turnovers_total, points_total = EXCLUDED.points_total`,
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
              insertPromises.push(insertPromise);
              console.log('Inserted or updated row:', row);
            }

            // Wait for all the insertion promises to resolve before closing the connection
            await Promise.all(insertPromises);

            console.log('Data insertion or update completed.');
            resolve(); // Resolve the promise to signal completion
          } catch (error) {
            console.error('Error inserting or updating data:', error.message);
            reject(error); // Reject the promise in case of an error
          } finally {
            // Close the database connection
            client.end();
          }
        });
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
      reject(error); // Reject the promise if the connection fails
    }
  });
};