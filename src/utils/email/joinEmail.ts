import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function sendJoinEmails(user_email: string, username: string) {
  // Converting image to base64 to image can be embedded in the email

  const html_body = `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Mock Draft</title>
      <style type="text/css">
          /* Define your CSS styles here */
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

          .note {
            text-align: center;
            font-size: 10px;
            font-family: Verdana, Geneva, sans-serif;
          }
          .accept {background-color: rgb(75, 175, 250)}
      </style>
  </head>
  <body padding="20px" background-color="rgb(40, 45, 70)" color="white">
      <h1>Thank you for joining Draft Bash Fantasy!</h1>
      <main>
      <h3>Username: ${username}</h3>
          <p>This is an email confirming your registration. No further action is needed.</p>
      <p class="note">This is an auto-generated email. Please do not respond.</p>
      <p class="note">Draft Bash Fantasy</p>
      </main>
  </body>
  </html>
  `;

  // array of emails
  const email: string[] = [user_email];

  try {
    // where email is being sent from
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      // credentials of the email being used to send the information
      auth: {
        user: 'draftbashfantasy@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true,
    });

    const info = await transporter.sendMail({
      from: 'DraftBashFantasy <draftbashfantasy@gmail.com>',
      to: email,
      subject: 'Thank You For Joining Draft Bash Fantasy!',
      html: html_body,
    });

    console.log("Message Sent, ID: " + info.messageId);
    console.log(info.accepted); // array of accepted emails
    console.log(info.rejected); // array of denied emails
  } catch (error) {
    console.log(error);
  }
}