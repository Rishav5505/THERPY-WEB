const axios = require("axios");

// Check required env vars immediately
if (!process.env.BREVO_API_KEY) {
  console.warn("⚠️ BREVO_API_KEY is missing. Email sending will fail.");
}

const sendMail = async ({ to, subject, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.MAIL_FROM || "no-reply@mindmend.com";
  const senderName = "MindMend";

  console.log(`🚀 Sending email via Brevo API to: ${to}`);

  const emailData = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject: subject,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4F46E5;">MindMend</h2>
        <p style="font-size: 16px;">${text}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888;">This is an automated message, please do not reply.</p>
      </div>
    `,
    textContent: text,
  };

  try {
    const response = await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      timeout: 10000,
    });

    console.log(`✅ Email sent successfully! MessageId: ${response.data.messageId}`);
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error("❌ Brevo API Failed:", errMsg);
    throw new Error(`Email sending failed: ${errMsg}`);
  }
};

module.exports = sendMail;
