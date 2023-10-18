import { Request, Response } from 'express';
const db = require("../db");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emails = require('../utils/joinEmail')
import dotenv from 'dotenv';
import { sendResetPasswordEmail } from '../utils/sendResetPasswordEmail';
dotenv.config();


class UsersModel {
    // Creates a user
    public async createUser(req: Request) {
        const user = req.body; // Data for the user such as their username, email, password, etc

        // Encryps the user's password with bcrypt
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const bcryptPassword = bcrypt.hashSync(user.password, salt);

        // Checks if the username and email are unique
        const uniqueColumns = {isUsernameUnique: true, isEmailUnique: true}
        const duplicateUsernames = await db.query("SELECT * FROM user_account WHERE username = $1", [
            user.username
        ]);
        const duplicateEmails = await db.query("SELECT * FROM user_account WHERE email = $1", [
            user.email
        ])
        uniqueColumns.isUsernameUnique = duplicateUsernames.rows.length < 1;
        uniqueColumns.isEmailUnique = duplicateEmails.rows.length < 1;

        // Inserts the user into the database.
        if (uniqueColumns.isUsernameUnique && uniqueColumns.isEmailUnique) {
            const userData = await db.query(
                `INSERT INTO user_account (username, email, password) 
                VALUES ($1, $2, $3)
                RETURNING user_id, username`, [
                user.username, user.email, bcryptPassword
            ]);

            /*If the user account is successfully created, they will receive an email */
            emails.sendJoinEmails(user.email, user.username)

            /* Creates a json web token for when the user 
            is created so that the user is immediately logged in */
            const token = jwt.sign(userData.rows[0], process.env.JWT_SECRET, {expiresIn: "2hr"});

            /* Returns json back so that the frontend can access the jwt token
            and see that the username and email is unique */

            return {uniqueColumns: uniqueColumns, jwtToken: token};
        }
        /* Returns a null jwt token and a uniqueColumns object so 
        that the frontend sees if the email and username are unique */
        return {uniqueColumns: uniqueColumns, jwtToken: null};
    }

    // Checks if the user's jwt token is verified
    public async checkIfUserAuthenticated(req: Request) {
        const jwtToken = req.header("token");
        try {
            /* Checks if the jwt token passed in is still valid. 
            This is used to check if the logged in user has a currently valid jwt token.
            A token expires every 2 hours. */
            const user = jwt.verify(jwtToken, process.env.JWT_SECRET, {expiresIn: "2hr"});
            return user;
        } catch (error) {
            return false;
        }
    }

    // Checks if the user credentials are correct and generates a signed jwt token for the client to use
    public async loginUser(req: Request) {
        try {
            const { username, email, password} = req.body;
            const user = await db.query("SELECT * FROM user_account WHERE username = $1 OR email = $2;", [
                username, email
            ]);

            // Data that will be encapsulated in the jwt token.
            const userData = {user_id: user.rows[0].user_id, username: user.rows[0].username}
            // Checks if the password provided matches the true password belonging to the username
            const validPassword = bcrypt.compareSync(password, user.rows[0].password);

            // Signs and returns a jwt token. That token has the user's id and username in it.
            if (validPassword) {
                const token = jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: "2hr"});
                return token;
            }
            // Returns false if the login was wrong.
            return false;
        } catch (error) {}
    }
       // Change a user's password
       public async changePassword(req: Request) {
        const { user_id, currentPassword, newPassword } = req.body;

        try {
            // Check if the user's JWT token is verified
            const jwtToken = req.header("token");
            const user = jwt.verify(jwtToken, process.env.JWT_SECRET, { expiresIn: "2hr" });

            if (user && user.user_id === user_id) {
                // Retrieve the current user's information from the database
                const client = await db.connect();
                const result = await client.query("SELECT * FROM user_account WHERE user_id = $1;", [user_id]);
                const userData = result.rows[0];
                client.release();

                if (!userData) {
                    return false; // User not found
                }

                // Check if the current password matches the stored password
                const validPassword = bcrypt.compareSync(currentPassword, userData.password);

                if (validPassword) {
                    // Encrypt the new password
                    const saltRounds = 10;
                    const salt = bcrypt.genSaltSync(saltRounds);
                    const bcryptPassword = bcrypt.hashSync(newPassword, salt);

                    // Update the user's password in the database
                    const updatedUserData = await db.query(
                        "UPDATE user_account SET password = $1 WHERE user_id = $2 RETURNING user_id;",
                        [bcryptPassword, user_id]
                    );

                    if (updatedUserData.rows.length > 0) {
                        return true; // Password changed successfully
                    }
                }
            }

            return false; // Password change failed
        } catch (error) {
            return false; // Error occurred during password change
        }
    }

    public async sendResetPasswordEmail(req: Request) {
        try {
            const email = req.body.email;
            const user = await db.query(`SELECT user_id FROM user_account WHERE email = $1 LIMIT 1;`, [email]);
            sendResetPasswordEmail(req.body.email, user.rows[0].user_id);
            return 200
        } catch (error) {return 500}
    }

}
  
module.exports = new UsersModel();