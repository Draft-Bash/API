const usersRouter = require("express").Router();
const UsersController = require("../controllers/UsersController");

usersRouter.route("/")
    .get(UsersController.createUser)

module.exports = usersRouter;