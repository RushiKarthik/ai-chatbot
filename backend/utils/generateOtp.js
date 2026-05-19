// Generate 6-digit OTP for email verification and password reset
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
