const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async ({ to, subject, text }) => {
    console.log(`Attempting to send mail to: ${to}`);
    console.log(`Using User: ${process.env.EMAIL_USER}`);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.response);
    } catch (error) {
        console.error("❌ SendMail Error Details:");
        console.error("Code:", error.code);
        console.error("Response:", error.response);
        console.error("Command:", error.command);
        console.error("Full Error:", error);
    }
};

sendMail({
    to: "rishavraj33372@gmail.com",
    subject: "Debug Mail",
    text: "Testing connection"
});
