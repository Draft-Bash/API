import { Request, Response } from 'express';
const db = require("../db");
const bcrypt = require('bcryptjs');

class UsersModel {
    public async createUser(req: Request) {
        const user = req.body;
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const bcryptPassword = bcrypt.hashSync(user.password, salt);
        const uniqueColumns = {isUsernameUnique: true, isEmailUnique: true}

        const duplicateUsernames = await db.query("SELECT * FROM user_account WHERE username = $1", [
            user.username
        ]);
        const duplicateEmails = await db.query("SELECT * FROM user_account WHERE email = $1", [
            user.email
        ])
        uniqueColumns.isUsernameUnique = duplicateUsernames.length < 1;
        uniqueColumns.isEmailUnique = duplicateEmails.length < 1;

        if (uniqueColumns.isUsernameUnique && uniqueColumns.isEmailUnique) {
            await db.query("INSERT INTO user_account (username, email, password) VALUES ($1, $2, $3)", [
                user.username, user.email, bcryptPassword
            ]);
        }
        return uniqueColumns;
    }
}
  
module.exports = new UsersModel();