const nodemailer = require("nodemailer");
require("dotenv").config();


// Always send OTP to the user's signup email (to)
const sendMail = async ({ to, subject, text }) => {
  console.log(`Sending Email via Brevo to: ${to}`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"MindMend Support" <no-reply@mindmend.com>',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Checkpoint - Email sent: %s", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error; // Re-throw to be caught by the controller
  }
};

module.exports = sendMail;
