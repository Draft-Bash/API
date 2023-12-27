import { Router } from "express";
import { UserController } from "./UserController";
import { UserService } from "./UserService";
import { UserRepository } from "./UserRepository";
import { PasswordHandler } from "../../utils/users/authentication/PasswordHandler";
import { JwtTokenHandler } from "../../utils/users/authentication/JwtTokenHandler";
const userRouter = Router();

const passwordHandler: PasswordHandler = new PasswordHandler(); // Hashes and compares passwords

//Signs and verifies JWT tokens
const jwtTokenHandler: JwtTokenHandler = new JwtTokenHandler(process.env.JWT_SECRET as string);

// Create the layers and inject the dependencies from one layer into the next.
const userRepository: UserRepository = new UserRepository(); // Central class for executing the raw SQL queries
const userService: UserService = new UserService(userRepository, jwtTokenHandler, passwordHandler); // Performs business logic
const userController: UserController = new UserController(userService); // Handles HTTP requests

// Define the routes for user endpoints
userRouter.route("/reset-passwords/emails")
    .post(userController.emailPasswordReset)

userRouter.route("/search")
    .post(userController.searchUsersByUsername)

// POST /users
userRouter.post("/", userController.createUser);

// PUT /users/:userId
userRouter.put("/:user_id", userController.updateUserPassword);

userRouter.route("/login")
    .post(userController.loginUser)
    .get(userController.authenticateUser)

export default userRouter;