const usersRouter = require("express").Router();
const UsersController = require("../controllers/UsersController");

usersRouter.route("/")
    .post(UsersController.createUser)

usersRouter.route("/login")
    .post(UsersController.loginUser)

module.exports = usersRouter;