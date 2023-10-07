import * as nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function sendJoinEmails(user_email: string) {
  // Converting image to base64 to image can be embedded in the email

  const html_body = `
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
      </style>
  </head>
  <body>
      <h1>Thank you for joining Draft Bash Fantasy!</h1>
      <main>
          <h3>This is an email confirming your registration. No further action is needed.</h3>
          <br>
          <a href="https://draftbashfantasy.com/">
            <img src="images/basketball.png">
          </a>
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
      subject: 'New logo',
      html: html_body,
    });

    console.log("Message Sent, ID: " + info.messageId);
    console.log(info.accepted); // array of accepted emails
    console.log(info.rejected); // array of denied emails
  } catch (error) {
    console.log(error);
  }
}