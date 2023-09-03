import { Request, Response } from 'express';
const db = require("../db");
const bcrypt = require('bcrypt');

class UsersModel {
    public async createUser(req: Request) {
        const user = req.body;
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const bcryptPassword = await bcrypt.hash(user.password, salt);

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