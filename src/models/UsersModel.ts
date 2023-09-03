import { Request, Response } from 'express';
const db = require("../db");

class UsersModel {
    public async createUser(req: Request) {
        const user = req.body;

            await db.query("INSERT INTO user_account (username, email, password) VALUES ($1, $2, $3)", [
            user.username, user.email, user.password
            ]);

        return true;
    }
}
  
module.exports = new UsersModel();