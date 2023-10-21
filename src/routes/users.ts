const usersRouter = require("express").Router();
const UsersController = require("../controllers/UsersController");

usersRouter.route("/login")
    .post(UsersController.loginUser)
    .get(UsersController.checkIfUserAuthenticated)

usersRouter.route("/reset-passwords/emails")
    .post(UsersController.sendPasswordResetEmail)


usersRouter.route("/")
    .post(UsersController.createUser)
    .put(UsersController.updateUser)

module.exports = usersRouter;