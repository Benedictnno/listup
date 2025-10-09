require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

async function sendTestMail() {
  try {
    const info = await transporter.sendMail({
      from: '"ListUp Support" <support@listup.dev>', // sender address
      to: "benedictnnaoma0@gmail.com", // receiver
      subject: "Hello from Mailtrap",
      text: "This is a test email using Mailtrap + Node.js",
      html: "<b>This is a test email using Mailtrap + Node.js</b>",
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending mail:", error);
  }
}

sendTestMail();
