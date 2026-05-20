export const sendResetOtp = async (email, otp) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.EMAIL_PASS, // Your xkeysib-... key
    },
    body: JSON.stringify({
      sender: { name: "AI Chatbot", email: process.env.EMAIL_USER },
      to: [{ email: email }],
      subject: "Password Reset Request",
      htmlContent: `<h3>Your OTP: <b>${otp}</b></h3>`
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Brevo API Error: ${errorData.message}`);
  }
  
  return await response.json();
};