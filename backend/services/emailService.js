// This file exports EXACTLY what your authController is looking for
export const sendVerificationOtp = async (email, otp) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.EMAIL_PASS,
    },
    body: JSON.stringify({
      sender: { name: "AI Chatbot", email: process.env.EMAIL_USER },
      to: [{ email: email }],
      subject: "Verify Your Account",
      htmlContent: `<h3>Your Verification OTP: <b>${otp}</b></h3>`
    })
  });
  return response.ok;
};

export const sendResetOtp = async (email, otp) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.EMAIL_PASS,
    },
    body: JSON.stringify({
      sender: { name: "AI Chatbot Support", email: process.env.EMAIL_USER },
      to: [{ email: email }],
      subject: "Password Reset Request",
      htmlContent: `<h3>Your Reset OTP: <b>${otp}</b></h3>`
    })
  });
  return response.ok;
};