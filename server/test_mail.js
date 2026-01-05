const sendMail = require("./utils/sendMail");
require("dotenv").config();

async function test() {
    try {
        await sendMail({
            to: process.env.EMAIL_USER,
            subject: "MindMend Test",
            text: "Testing email service"
        });
        console.log("Email sent successfully!");
    } catch (err) {
        console.error("Email failed:", err);
    }
}

test();
