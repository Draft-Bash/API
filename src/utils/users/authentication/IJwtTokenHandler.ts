import { UserToken } from "../../../api/users/contracts/dataTypes/UserToken";

export interface IJwtTokenHandler {
    sign(userToken: UserToken, options?: any): string;
    verify(token: string): UserToken;
}