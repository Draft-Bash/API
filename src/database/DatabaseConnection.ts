import { Pool } from 'pg';
import dotenv from 'dotenv';
import { IDatabaseConnection } from './IDatabaseConnection';
dotenv.config();

// Define a class for a PostgreSQL database connection
export class DatabaseConnection implements IDatabaseConnection {
    
    private client: Pool;
  
    constructor() {
        this.client = new Pool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: "draftbash",
            ssl: process.env.SSL ? JSON.parse(process.env.SSL) : false
        });
    }

    async query(sql: string, params?: any[]): Promise<any> {
      const result = await this.client.query(sql, params);
      return result.rows;
    }
}