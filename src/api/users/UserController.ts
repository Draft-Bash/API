import { IUserService } from './contracts/IUserService';
import { Request, Response } from 'express';
import { UserUniqueViolationError } from '../../errors/api/users/UserUniqueViolationError';
import { CreateUserRequest } from './contracts/controllerRequests/CreateUserRequest';
import { LoginUserRequest } from './contracts/controllerRequests/LoginUserRequest';
import { UserJwtResponse } from './contracts/controllerResponses/UserJwtResponse';
import { User } from './contracts/dataTypes/User';
import { UserToken } from './contracts/dataTypes/UserToken';
import { SearchUsersByUsernameResponse } from './contracts/controllerResponses/SearchUsersByUsernameResponse';

export class UserController {

    private readonly _userService: IUserService;

    constructor(userService: IUserService) {
        this._userService = userService;
    }

    searchUsersByUsername = async (req: Request, res: Response) => {
        try {
            const username: string = req.body.username as string;
            const result: SearchUsersByUsernameResponse = await this._userService.searchUsersByUsername(username);
            res.status(200).send(result);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ error: error.message });
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    createUser = async (req: Request, res: Response) => {
        try {
            const createUserRequest: CreateUserRequest = req.body;
            const result: string = await this._userService.createUser(createUserRequest)
            const createdUserResponse: UserJwtResponse = {jwt_token: result};
            res.status(201).send(createdUserResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error instanceof UserUniqueViolationError) {
                    res.status(409).send({ 
                        error: error.message, 
                        isUsernameUnique: error.isUsernameUnique, 
                        isEmailUnique: error.isEmailUnique });
                } else {
                    res.status(500).send({ 
                        error: error.message });
                }
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    loginUser = async (req: Request, res: Response) => {
        try {
            const loginUserRequest: CreateUserRequest = req.body;
            const result: string = await this._userService.loginUser(loginUserRequest)
            const loginUserResponse: UserJwtResponse = {jwt_token: result};
            res.status(200).send(loginUserResponse);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.message==="InvalidUserCredentialsError") {
                    res.status(401).send({ error: error.message });
                } else {
                    res.status(500).send({ 
                        error: error.message
                     });
                }
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    authenticateUser = async (req: Request, res: Response) => {
        try {
            const jwt_token: string = req.query.jwt_token as string;
            const result: UserToken = await this._userService.authenticateUser(jwt_token);
            res.status(200).send(result);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(401).send({ error: error.message });
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    emailPasswordReset = async (req: Request, res: Response) => {
        try {
            const email: string = req.body.email as string;
            await this._userService.emailPasswordReset(email);
            res.sendStatus(200);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ error: error.message });
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }

    updateUserPassword = async (req: Request, res: Response) => {
        try {
            const user_id: number = Number(req.params.user_id);
            const email: string = req.body.email as string;
            await this._userService.updateUserPassword(user_id, email);
            res.sendStatus(200)
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).send({ error: error.message });
            }
            else {
                res.status(500).send({ error: 'An unknown error occurred.' });
            }
        }
    }
}