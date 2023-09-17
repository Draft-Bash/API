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
  database: process.env.DB_NAME
};

// CSV file path
const ptsRankingCsvFilePath = 'nbaData/points_rankings.csv';

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
            for (const row of data) {
              // Insert each row into the database table
              await client.query(
                'INSERT INTO points_draft_ranking (rank_number, player_id) VALUES ($1, $2)',
                [row.rank_number, row.player_id]
              );
              console.log('Inserted row:', row);
            }
            console.log('Data insertion completed.');
            resolve(); // Resolve the promise to signal completion
          } catch (error) {
            console.error('Error inserting data:', error.message);
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