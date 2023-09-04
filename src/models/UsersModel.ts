import { Request, Response } from 'express';
const db = require("../db");
const bcrypt = require('bcryptjs');

class UsersModel {
    public async createUser(req: Request) {
        const user = req.body;
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const bcryptPassword = bcrypt.hashSync(user.password, salt);

        const duplicateRows = await db.query("SELECT * FROM user_account WHERE username = $1 OR email = $2", [
            user.username, user.email
        ]);


        if (duplicateRows.rows.length < 1) {
            await db.query("INSERT INTO user_account (username, email, password) VALUES ($1, $2, $3)", [
                user.username, user.email, bcryptPassword
            ]);
            return true;
        }
        return false;
    }
}
  
module.exports = new UsersModel();