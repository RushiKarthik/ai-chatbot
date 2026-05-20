import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SibApiV3Sdk = require('@getbrevo/brevo');

// Initialize the API Client
let apiInstance = null;

try {
  if (process.env.EMAIL_PASS) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_PASS;
    
    apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    console.log("Brevo API Client successfully mapped! 🚀");
  } else {
    console.error("Warning: EMAIL_PASS variable is missing.");
  }
} catch (error) {
  console.error("Brevo SDK Initialization Failed:", error.message);
}

// Function to send emails
export const sendResetOtp = async (email, otp) => {
  if (!apiInstance) throw new Error("Email service uninitialized.");

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "Password Reset Request";
  sendSmtpEmail.htmlContent = `<h3>Your OTP: <b>${otp}</b></h3>`;
  sendSmtpEmail.sender = { name: "AI Chatbot", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: email }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};