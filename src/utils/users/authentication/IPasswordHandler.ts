export interface IPasswordHandler {
    hash(password: string): string;
    compare(password: string, hashedPassword: string): boolean;
}