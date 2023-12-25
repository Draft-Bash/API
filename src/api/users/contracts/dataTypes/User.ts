export interface User {
    user_id: number;
    username: string;
    email: string;
    password: string;
    is_google_authenticated: boolean;
}