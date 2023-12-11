# MVC
For the backend, we follow an MVC structure. To understand how to add to it, let's got through an example.
Suppose you wish to develop logic to handle users. To do this, you need to create a UsersModel in the models folder.
Then, you need to create a class called UsersModel and then define the methods you need to interact with the database. 
Usually, query parameters or body objects are sent to it through a Request object. An example of the model might look like this:
class UsersModel {
    public async loginUser(req: Request) {
            const { username, email, password} = req.body;
            const user = await db.query(`
                SELECT * 
                FROM user_account 
                WHERE username = $1 OR email = $2 AND is_google_auth = FALSE;`, [
                username, email
            ]);

            ...
    }
}

module.exports = new UsersModel();

Remember, if you need to interact with the database, import this: const db = require("../db").
This object has the connection neccessary to interact with the database.
Once you have created this model in the models folder, export it with module.exports = new UsersModel();
Now, we need a UsersController. It might look something like this:

import { Request, Response } from 'express';
const UsersModel = require('../models/UsersModel');

const loginUser = async (req: Request, res: Response) => {
    res.json(await UsersModel.loginUser(req));
}

module.exports = {
    loginUser
}

Now, we need to import our controller into the routes file users.ts in routes. It might look something like this:
const usersRouter = require("express").Router();
const UsersController = require("../controllers/UsersController");

usersRouter.route("/login")
    .post(UsersController.loginUser)
    .get(UsersController.checkIfUserAuthenticated)

module.exports = usersRouter;

Next, we need to make these routes accessible by adding this line of code into the app.ts file: 
app.use("/api/v1/users", require("./routes/users"));

Although I gave a concrete example, this is applicable for other things that might need models, such as drafts and leagues.