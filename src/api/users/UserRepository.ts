import { IUserRepository } from "./contracts/IUserRepository";
import { User } from "./contracts/dataTypes/User";
import { DatabaseConnection } from "../../database/DatabaseConnection";
import { UserCredentials } from "./contracts/dataTypes/UserCredentials";

export class UserRepository implements IUserRepository {

    private db: DatabaseConnection;

    constructor() {
        this.db = new DatabaseConnection();
    }

    async updateUserPassword(userId: number, password: string): Promise<void> {
        await this.db.query(`
            UPDATE users SET password = $1 WHERE user_id = $2;`, 
        [password, userId]);
    }

    async getUserByUsernameOrEmail(username: string, email: string): Promise<User | null> {
        const users: User[] = (await this.db.query(
            `SELECT * 
            FROM users 
            WHERE username = $1 OR email = $2 AND is_google_authenticated = FALSE;`,
            [username, email]));
        if (users.length === 0) {
            return null;
        }
        return users[0];
    }

    async deleteUnregisteredUser(email: string): Promise<void> {
        await this.db.query(
            `DELETE FROM users WHERE email = $1 AND is_google_authenticated = TRUE`,
            [email]);
    }

    async getUsersByEmail(email: string): Promise<User[]> {
        const users: User[] = await this.db.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]);
        return users;
    }

    async getUsersByUsername(username: string): Promise<User[]> {
        const users: User[] = await this.db.query(
            `SELECT * FROM users WHERE username = $1`,
            [username]);
        return users;
    }

    async insertUser(userCredentials: UserCredentials): Promise<User> {
        const users: User = (await this.db.query(
            `INSERT INTO users (username, email, password) 
            VALUES ($1, $2, $3)
            RETURNING *`,
            [userCredentials.username, userCredentials.email, userCredentials.password]))[0];
        return users;
    }
}