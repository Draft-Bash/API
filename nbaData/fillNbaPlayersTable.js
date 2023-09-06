import fs from 'fs';
import csvParser from 'csv-parser';
import pg from 'pg';

// Database connection configuration
const playerDbConfig = {
  user: "postgres",
  password: "456champ",
  host: "localhost",
  port: 5432,
  database: "draftmaster"
};

// CSV file path
const playerCsvFilePath = 'nbaData/nba_players.csv';

async function insertPlayerData() {
    const client = new pg.Client(playerDbConfig);
  
    try {
      await client.connect();
      console.log('Connected to the database.');
  
      const insertPromises = [];
  
      fs.createReadStream(playerCsvFilePath)
        .pipe(csvParser())
        .on('data', async (row) => {
          try {
            // Insert each row into the database table and store the promise
            const insertPromise = client.query(
              'INSERT INTO nba_player (player_id, player_age, first_name, last_name, is_pointguard, is_shootingguard, is_smallforward, is_powerforward, is_center, team_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
              [
                row.player_id,
                row.player_age,
                row.first_name,
                row.last_name,
                row.is_pointguard,
                row.is_shootingguard,
                row.is_smallforward,
                row.is_powerforward,
                row.is_center,
                row.team_id,
              ]
            );
            insertPromises.push(insertPromise);
            console.log('Inserted row:', row);
          } catch (error) {
            console.error('Error inserting row:', row);
            console.error(error.message);
          }
        })
        .on('end', async () => {
          try {
            // Wait for all the insertion promises to resolve before closing the connection
            await Promise.all(insertPromises);
          } catch (error) {
            console.error('Error inserting data:', error.message);
          } finally {
            // Close the database connection
            client.end();
            console.log('Data insertion completed.');
          }
        });
    } catch (error) {
      console.error('Error connecting to the database:', error.message);
    }
  }
  
  // Call the function to insert data
  insertPlayerData();