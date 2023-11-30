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
const ptsRankingCsvFilePath = 'nbaData/category_rankings.csv';

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
                `INSERT INTO category_draft_ranking (rank_number, player_id) VALUES ($1, $2) 
                ON CONFLICT (player_id) 
                DO UPDATE SET rank_number = EXCLUDED.rank_number`,
                [row.rank_number, row.player_id]
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