const axios = require("axios");

// Check required env vars immediately
if (!process.env.BREVO_API_KEY) {
  console.warn("⚠️ BREVO_API_KEY is missing. Email sending will fail.");
}

const sendMail = async ({ to, subject, text, otp }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.MAIL_FROM || "no-reply@mindmend.com";
  const senderName = "MindMend";

  console.log(`🚀 Sending email via Brevo API to: ${to}`);

  // Professional HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">MindMend</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Your Mental Wellness Partner</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 16px 0; color: #1a202c; font-size: 24px; font-weight: 600;">Verification Code</h2>
                  <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">${text}</p>
                  
                  ${otp ? `
                  <!-- OTP Display -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; display: inline-block;">
                          <p style="margin: 0 0 8px 0; color: rgba(255, 255, 255, 0.9); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Code</p>
                          <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  ` : ''}
                  
                  <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                    This code will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f7fafc; padding: 30px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 8px 0; color: #718096; font-size: 12px; text-align: center;">
                    If you didn't request this code, please ignore this email.
                  </p>
                  <p style="margin: 0; color: #a0aec0; font-size: 12px; text-align: center;">
                    © ${new Date().getFullYear()} MindMend. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const emailData = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent,
    textContent: text + (otp ? `\n\nYour verification code: ${otp}` : ''),
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
