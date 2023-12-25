import { UserToken } from "../../../api/users/contracts/dataTypes/UserToken";
import { IJwtTokenHandler } from "./IJwtTokenHandler";
import * as jwt from 'jsonwebtoken';

export class JwtTokenHandler implements IJwtTokenHandler{

    private readonly _secret: string;
    
    constructor(secret: string) {
        this._secret = secret;
    }

    sign(userToken: UserToken, options?: any): string {
        const jwtToken: string = jwt.sign({ 
            user_id: userToken.user_id, username: userToken.username}, 
            this._secret, {expiresIn: "2hr"});
        return jwtToken;
    }
    verify(jwtToken: string): UserToken {
        const userToken: UserToken = jwt.verify(jwtToken, this._secret) as UserToken;
        return userToken;
    }
}