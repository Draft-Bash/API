import fs from 'fs';
import csvParser from 'csv-parser';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Database connection configuration
const ptsRankingDbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
};

// CSV file path
const ptsRankingCsvFilePath = 'nbaData/previousSeasonStats.csv';

// Function to read data from CSV and insert into the database table
async function insertPtsRankingData() {
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
          for (const row of data) {
            // Insert each row into the database table
            console.log(row);
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
        } catch (error) {
          console.error('Error inserting data:', error.message);
        } finally {
          // Close the database connection
          client.end();
        }
      });
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
}

// Call the function to insert data
insertPtsRankingData();