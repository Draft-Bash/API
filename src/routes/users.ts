const usersRouter = require("express").Router();
const UsersController = require("../controllers/UsersController");

usersRouter.route("/login")
    .post(UsersController.loginUser)
    .get(UsersController.checkIfUserAuthenticated)

usersRouter.route("/reset-passwords/email")
    .post(UsersController.sendResetPasswordEmail)

usersRouter.route("/")
    .post(UsersController.createUser)

module.exports = usersRouter;