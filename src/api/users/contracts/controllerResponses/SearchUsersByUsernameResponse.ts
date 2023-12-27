import { UserToken } from "../dataTypes/UserToken";

export interface SearchUsersByUsernameResponse {
    matching_user: UserToken | null;
    similar_users: string[];
}