import SibApiV3Sdk from '@getbrevo/brevo';

// Initialize the Brevo API Client
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];

if (process.env.EMAIL_PASS) {
  apiKey.apiKey = process.env.EMAIL_PASS; // This will hold your master xkeysib-... key
  console.log("Brevo Email API Client mapped and verified! 🚀");
} else {
  console.error("CRITICAL ERROR: EMAIL_PASS environment variable is missing.");
}

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Send registration verification code
export const sendVerificationOtp = async (email, otp) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "Verify Your Account - OTP";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2>Welcome to AI Chatbot!</h2>
      <p>Please use the following One-Time Password (OTP) to verify your registration:</p>
      <h1 style="color: #4f46e5; letter-spacing: 2px;">${otp}</h1>
      <p style="font-size: 12px; color: #666;">This code expires in 10 minutes.</p>
    </div>
  `;
  sendSmtpEmail.sender = { name: "AI Chatbot", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: email }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

// Send password reset code
export const sendResetOtp = async (email, otp) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "Password Reset Request - OTP";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Use the code below to proceed:</p>
      <h1 style="color: #ef4444; letter-spacing: 2px;">${otp}</h1>
      <p style="font-size: 12px; color: #666;">This code expires in 10 minutes.</p>
    </div>
  `;
  sendSmtpEmail.sender = { name: "AI Chatbot Support", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: email }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};