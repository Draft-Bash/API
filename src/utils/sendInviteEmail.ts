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

        const html_body = `
        <h1>${sentByUsername} has invited you to join their draft!</h1>
        <a href=${process.env.API_URL+"/drafts/emails/members?isInviteAccepted=true"+"&jwtUser="+jwtData}>
            <button>Accept</button>
        </a>
        <a href=${process.env.API_URL+"/drafts/emails/members?isInviteAccepted=false"+"&jwtUser="+jwtData}>
            <button>Decline</button>
        </a>
        `;

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
                html: html_body,
            });
        } catch (error) {
            console.log(error);
        }
    })
}
