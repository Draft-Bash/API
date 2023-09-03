const usersRouter = require("express").Router();
const UsersController = require("../controllers/UsersController");

usersRouter.route("/")
    .post(UsersController.createUser)

module.exports = usersRouter;