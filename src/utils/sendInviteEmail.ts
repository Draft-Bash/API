import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
const jwt = require('jsonwebtoken');

export interface Recipient {
	email: string;
	userId: number;
    draftId: number;
}
dotenv.config();

export async function sendEmailInvites(recipients: Recipient[], sentByUsername: string) {

    recipients.forEach(async recipient => {
        const jwtData = jwt.sign(recipient, process.env.JWT_SECRET);

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
                .accept {background-color: rgb(75, 175, 250)}
                .decline {background-color: rgb(240, 0, 0)}
            </style>
        </head>
        <body>
            <h1>${sentByUsername} has invited you to join their draft!</h1>
            <main>
                <a href=${process.env.API_URL+"/drafts/emails/members?isInviteAccepted=true"+"&jwtUser="+jwtData}>
                    <button class="accept">Accept</button>
                </a>
                <a href=${process.env.API_URL+"/drafts/emails/members?isInviteAccepted=false"+"&jwtUser="+jwtData}>
                    <button class="decline">Decline</button>
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
                to: recipient.email,
                subject: "Mock Draft",
                html: htmlBody,
            });
        } catch (error) {
            console.log(error);
        }
    })
}