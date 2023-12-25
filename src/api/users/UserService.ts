import { IUserRepository } from "./contracts/IUserRepository";
import { IUserService } from "./contracts/IUserService";
import { CreateUserRequest } from "./contracts/controllerRequests/CreateUserRequest";
import { UserUniqueViolationError } from "../../errors/api/users/UserUniqueViolationError";
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { LoginUserRequest } from "./contracts/controllerRequests/LoginUserRequest";
import { User } from "./contracts/dataTypes/User";
import { UserToken } from "./contracts/dataTypes/UserToken";
import { sendPasswordResetEmail } from "../../utils/email/sendPasswordResetEmail";
import { UserCredentials } from "./contracts/dataTypes/UserCredentials";
import { IJwtTokenHandler } from "../../utils/users/authentication/IJwtTokenHandler";
import { IPasswordHandler } from "../../utils/users/authentication/IPasswordHandler";
dotenv.config();

export class UserService implements IUserService {

    private readonly _userRepository: IUserRepository;
    private readonly _jwtTokenHandler: IJwtTokenHandler;
    private readonly _passwordHandler: IPasswordHandler;

    constructor(userRepository: IUserRepository, jwtTokenHandler: IJwtTokenHandler, passwordHandler: IPasswordHandler) {
        this._userRepository = userRepository;
        this._jwtTokenHandler = jwtTokenHandler;
        this._passwordHandler = passwordHandler;
    }

    async updateUserPassword(userId: number, password: string): Promise<void> {
        const bcryptPassword = this._passwordHandler.hash(password);
        await this._userRepository.updateUserPassword(userId, bcryptPassword);
    }

    // Sends an email to reset the password for the inputted email.
    async emailPasswordReset(email: string): Promise<void> {
        const user: User = ((await this._userRepository.getUsersByEmail(email)) as User[])[0];
        sendPasswordResetEmail(user.user_id, user.email, user.username);
    }

    /**
     * Logs in a user by returning a JWT authorization token
     * @throws InvalidUserCredentialsError if the username, email, or password is invalid.
     */
    async loginUser(loginUserRequest: LoginUserRequest): Promise<string> {
        const user: User | null = await this._userRepository.getUserByUsernameOrEmail(
            loginUserRequest.username, loginUserRequest.email);
        if (user === null) {
            throw new Error("InvalidUserCredentialsError");
        }
        const isPasswordValid = this._passwordHandler.compare(loginUserRequest.password, user.password);
        if (!isPasswordValid) {
            throw new Error("InvalidUserCredentialsError");
        }
        const jwtToken: string = this._jwtTokenHandler.sign({
            user_id: user.user_id, username: user.username}, {expiresIn: "2hr"});

        return jwtToken;
    }

    /**
     * Creates a user and returns JWT authorization token
     * @throws {UserUniqueViolationError} If the username or email is not unique.
     */
    async createUser(createUserRequest: CreateUserRequest): Promise<string> {
        const isUsernameUnique = (await this._userRepository.getUsersByUsername(createUserRequest.username)).length==0;
        const isEmailUnique = (await this._userRepository.getUsersByEmail(createUserRequest.email)).length==0;
        if (!isUsernameUnique || !isEmailUnique) {
            throw new UserUniqueViolationError(isUsernameUnique, isEmailUnique, "UserUniqueViolationError");
        }

        // Encrypts the user's password with bcrypt
        const bcryptPassword = this._passwordHandler.hash(createUserRequest.password);

        /* If the created user has the same email as an unregistered user 
        (A user never created but signed in with google auth), then the unregistered user is deleted so that
        the created user can use that email.
        */
        await this._userRepository.deleteUnregisteredUser(createUserRequest.email) 

        const userCredentials: UserCredentials = {
            username: createUserRequest.username,
            email: createUserRequest.email,
            password: bcryptPassword
        }

        // Inserts the user into the database. That user is then returned back.
        const createdUser = await this._userRepository.insertUser(userCredentials);

        /* Returns a signed JWT token with an expiration date. 
        Used for immediate authorization after a user is created on the client side.
        */
        const jwtToken: string = this._jwtTokenHandler.sign({ 
            user_id: createdUser.user_id, username: createdUser.username}, {expiresIn: "2hr"});

        return jwtToken;
    }

    // Validates a JWT token. Returns the user token object if the JWT token is valid.
    async authenticateUser(jwtToken: string): Promise<UserToken> {
        const userToken: UserToken = this._jwtTokenHandler.verify(jwtToken);
        return userToken;
    }
}