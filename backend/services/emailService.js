import nodemailer from 'nodemailer';

// Create a reusable transporter using the official Gmail SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL/TLS for port 465
  auth: {
    user: process.env.EMAIL_USER, // Your full gmail address
    pass: process.env.EMAIL_PASS, // Your 16-character Google App Password (no spaces)
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer Transporter Verification Failed:', error.message);
  } else {
    console.log('Nodemailer is fully configured and ready to send emails! 🚀');
  }
});

// Function to send registration verification emails
export const sendVerificationOtp = async (email, otp) => {
  const mailOptions = {
    from: `"AI Chatbot Assistant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your New Account - OTP Code',
    text: `Welcome! Your 6-digit verification code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2>Welcome to AI Chatbot!</h2>
        <p>Please use the following One-Time Password (OTP) to verify your registration:</p>
        <h1 style="color: #4f46e5; letter-spacing: 2px;">${otp}</h1>
        <p style="font-size: 12px; color: #666;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Function to send forgot password reset emails
export const sendResetOtp = async (email, otp) => {
  const mailOptions = {
    from: `"AI Chatbot Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - OTP Code',
    text: `You requested a password reset. Your 6-digit OTP code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Use the code below to proceed:</p>
        <h1 style="color: #ef4444; letter-spacing: 2px;">${otp}</h1>
        <p style="font-size: 12px; color: #666;">This code expires in 10 minutes. If you did not make this request, secure your account immediately.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};