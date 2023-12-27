import { User } from "./dataTypes/User";
import { UserCredentials } from "./dataTypes/UserCredentials";

export interface IUserRepository {
    getUsersLikeUsername(username: string): Promise<User[]>;
    insertUser(userCredentials: UserCredentials): Promise<User>;
    getUsersByUsername(username: string): Promise<User[]>;
    getUsersByEmail(username: string): Promise<User[]>;
    deleteUnregisteredUser(email: string): Promise<void>;
    getUserByUsernameOrEmail(username: string, email: string): Promise<User | null>;
    updateUserPassword(userId: number, password: string): Promise<void>;
}