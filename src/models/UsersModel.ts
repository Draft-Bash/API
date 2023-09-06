import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
const db = require("../db");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UsersModel {
    public async createUser(req: Request) {
        const user = req.body;
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const bcryptPassword = bcrypt.hashSync(user.password, salt);
        const uniqueColumns = {isUsernameUnique: true, isEmailUnique: true}

        return user;

        const duplicateUsernames = await db.query("SELECT * FROM user_account WHERE username = $1", [
            user.username
        ]);
        const duplicateEmails = await db.query("SELECT * FROM user_account WHERE email = $1", [
            user.email
        ])
        uniqueColumns.isUsernameUnique = duplicateUsernames.rows.length < 1;
        uniqueColumns.isEmailUnique = duplicateEmails.rows.length < 1;

        if (uniqueColumns.isUsernameUnique && uniqueColumns.isEmailUnique) {
            await db.query("INSERT INTO user_account (username, email, password) VALUES ($1, $2, $3)", [
                user.username, user.email, bcryptPassword
            ]);
        }
        return uniqueColumns;
    }

    public async checkIfUserAuthenticated(req: Request) {
        const jwtToken = req.header("token");
        try {
            const user = jwt.verify(jwtToken, process.env.JWT_SECRET, {expiresIn: "2hr"});
            return user;
        } catch (error) {
            return false;
        }
    }

    public async loginUser(req: Request) {
        try {
            const { username, email, password} = req.body;
            const user = await db.query("SELECT * FROM user_account WHERE username = $1 OR email = $2;", [
                username, email
            ]);

            const userData = {user_id: user.rows[0].user_id, username: user.rows[0].username}
            const validPassword = bcrypt.compareSync(password, user.rows[0].password);

            if (validPassword) {
                const token = jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: "2hr"});
                return token;
            }

            return false;
        } catch (error) {console.log(error)}
    }
}
  
module.exports = new UsersModel();