import api from '@getbrevo/brevo';

// Initialize the Brevo API Client using its correct instantiation pattern
let apiInstance = null;

try {
  if (process.env.EMAIL_PASS) {
    // Brevo uses a named or internal default client instantiation
    const defaultClient = api.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_PASS; // Holds your xkeysib-... master key
    
    apiInstance = new api.TransactionalEmailsApi();
    console.log("Brevo Email API Client mapped and verified! 🚀");
  } else {
    console.error("CRITICAL ERROR: EMAIL_PASS environment variable is missing.");
  }
} catch (error) {
  console.error("Brevo SDK Initialization Failed:", error.message);
}

// Send registration verification code
export const sendVerificationOtp = async (email, otp) => {
  if (!apiInstance) throw new Error("Email service is currently uninitialized.");

  const sendSmtpEmail = new api.SendSmtpEmail();
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
  if (!apiInstance) throw new Error("Email service is currently uninitialized.");

  const sendSmtpEmail = new api.SendSmtpEmail();
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