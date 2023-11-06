import * as nodemailer from "nodemailer";
import dotenv from "dotenv";
const jwt = require('jsonwebtoken');

dotenv.config();

export async function sendDraftSummaryEmail(email:string, draftId: number, 
    fanPtsTotal: number, draftRank: number, draftGrade: string) {

    const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Draft Summary</title>
    </head>
    <body
        <h1>Draft Summary</h1>
        <main>
            <p>Total Proj. Fan Pts: ${fanPtsTotal}</p>
            <p>Grade: ${draftGrade}</p>
            <p>Rank: ${draftRank}</p>
            <p>To re-visit the draft, click the button</p>
            <a href=${process.env.CLIENT_URL+"/modules/drafts/draftroom/"+draftId}>
                <button class="accept">Visit Draft</button>
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
            subject: "Draft Summary",
            html: htmlBody,
        });
    } catch (error) {
        console.log(error);
    }
}