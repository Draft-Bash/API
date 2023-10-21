import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
const jwt = require('jsonwebtoken');
dotenv.config();

export async function sendPasswordResetEmail(userId: number, email: string,  username: string) {

    const jwtData = jwt.sign({user_id: userId, username: username}, process.env.JWT_SECRET);

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mock Draft</title>
        <style type="text/css">
            /* Define your CSS styles here */
            button {
                border: none;
                outline: none;
                border-radius: 25px;
                padding: 10px 25px 10px 25px;
                cursor: pointer;
                transition: 0.3s;
                font-size: 18px;
                color: white;
                font-family: Verdana, Geneva, sans-serif;
            }
            body {
                padding: 20px;
                background-color: rgb(40, 45, 70);
                color: white;
            }
            button:hover {box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3)}
            h1 {
                text-align: center;
                font-family: Verdana, Geneva, sans-serif;
            }
            main {
                display: flex;
                justify-content: center;
                gap: 20px;
            }
            .change-password {background-color: rgb(75, 175, 250)}
        </style>
    </head>
    <body>
        <h1>Reset password for ${username}</h1>
        <main>
            <a href=${process.env.CLIENT_URL+"/reset-password?token="+jwtData}>
                <button class="change-password">Change Password</button>
            </a>
        </main>
    </body>
    </html>
    `

    try {
        // where email is being sent from
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            // credentials of the email being used to send the information
            auth: {
                user: "draftbashfantasy@gmail.com",
                pass: process.env.EMAIL_PASSWORD,
            },
            debug: true,
        });

        const info = await transporter.sendMail({
            from: "DraftBashFantasy <draftbashfantasy@gmail.com>",
            to: email,
            subject: "Password Reset",
            html: htmlBody,
        });
    } catch (error) {
        console.log(error);
    }
}
