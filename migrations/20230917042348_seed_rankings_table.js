const fs = require('fs');
const csvParser = require('csv-parser');
const pg = require('pg');
const dotenv = require('dotenv');
dotenv.config();

exports.up = function (knex) {
  return new Promise(async (resolve, reject) => {
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
                await client.query(
                  'INSERT INTO points_draft_ranking (rank_number, player_id) VALUES ($1, $2)',
                  [row.rank_number, row.player_id]
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
      await insertPtsRankingData();
    } catch (error) {
      console.error('Error during data insertion:', error.message);
    }
  });
};

exports.down = function (knex) {
  // Define the SQL query to delete data from the points_draft_ranking table (if needed)
  const sqlQuery = `
    DELETE FROM points_draft_ranking;
  `;
  
  // Execute the raw SQL query to delete data from the points_draft_ranking table
  return knex.raw(sqlQuery);
};