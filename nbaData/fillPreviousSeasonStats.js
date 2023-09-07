import fs from 'fs';
import csvParser from 'csv-parser';
import pg from 'pg';

// Database connection configuration
const prevSeasonDbConfig = {
  user: "postgres",
  password: "456champ",
  host: "localhost",
  port: 5432,
  database: "draftmaster"
};

// CSV file path
const prevSeasonCsvFilePath = 'nbaData/previousSeasonStats.csv';

// Create a connection to the database
const db = pgp(prevSeasonDbConfig);

// Function to insert data from CSV into the database table
async function insertPrevSeasonData() {
  try {
    const rows = []; // Store rows for batch insert

    await new Promise((resolve, reject) => {
      fs.createReadStream(prevSeasonCsvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    if (rows.length > 0) {
      // Batch insert
      await db.tx(async (t) => {
        const insertQueries = rows.map((row) => {
          return t.none(
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
        });

        await t.batch(insertQueries);
      });

      console.log('Data insertion completed.');
      console.log('Total rows processed:', rows.length);
    }

    pgp.end(); // Close the database connection
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call the function to insert data
insertPrevSeasonData();