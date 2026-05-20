import SibApiV3Sdk from '@getbrevo/brevo';

// Safe initialization of the Brevo API Client
let apiInstance = null;

try {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  
  if (process.env.EMAIL_PASS) {
    apiKey.apiKey = process.env.EMAIL_PASS;
    apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    console.log("Brevo API Client successfully verified! 🚀");
  } else {
    console.error("Warning: EMAIL_PASS variable is missing on host configuration.");
  }
} catch (initError) {
  console.error("Brevo Init Warning: ", initError.message);
}

// Send registration verification code
export const sendVerificationOtp = async (email, otp) => {
  if (!apiInstance) throw new Error("Email service is currently offline.");
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "Verify Your Account - OTP";
  sendSmtpEmail.htmlContent = `<h3>Your verification code is <b>${otp}</b></h3>`;
  sendSmtpEmail.sender = { name: "AI Chatbot", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: email }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

// Send password reset code
export const sendResetOtp = async (email, otp) => {
  if (!apiInstance) throw new Error("Email service is currently offline.");

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = "Password Reset Request - OTP";
  sendSmtpEmail.htmlContent = `<h3>Your password reset code is <b>${otp}</b></h3>`;
  sendSmtpEmail.sender = { name: "AI Chatbot Support", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: email }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};