import { CreateUserRequest } from "./controllerRequests/CreateUserRequest";
import { LoginUserRequest } from "./controllerRequests/LoginUserRequest";
import { SearchUsersByUsernameResponse } from "./controllerResponses/SearchUsersByUsernameResponse";
import { User } from "./dataTypes/User";
import { UserToken } from "./dataTypes/UserToken";

export interface IUserService {
    searchUsersByUsername(username: string): Promise<SearchUsersByUsernameResponse>;
    createUser(createUserRequest: CreateUserRequest): Promise<string>;
    loginUser(loginUserRequest: LoginUserRequest): Promise<string>;
    authenticateUser(jwtToken: string): Promise<UserToken>;
    emailPasswordReset(email: string): Promise<void>;
    updateUserPassword(userId: number, password: string): Promise<void>;
}