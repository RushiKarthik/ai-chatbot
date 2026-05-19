import nodemailer from 'nodemailer';

// Create email transporter using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,  
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send OTP email for registration verification
export const sendVerificationOtp = async (email, otp) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your AI Chat account',
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};

// Send OTP email for password reset
export const sendResetOtp = async (email, otp) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Password Reset</h2>
      <p>Your reset OTP is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};
