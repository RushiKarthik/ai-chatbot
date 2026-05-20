import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { generateOtp } from '../utils/generateOtp.js';
import { sendVerificationOtp, sendResetOtp } from '../services/emailService.js';

// Helper function to prevent Nodemailer from hanging indefinitely on cloud hosts
const emailTimeoutGate = (ms = 3500) => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("SMTP Network Timeout")), ms)
  );
};

// Register new user and send verification OTP
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });

    try {
      // Race email sending against our 3.5s timeout gate
      await Promise.race([
        sendVerificationOtp(email, otp),
        emailTimeoutGate()
      ]);

      return res.status(201).json({
        message: 'Registration successful. Please verify your email with OTP.',
        userId: user._id,
        email: user.email,
      });

    } catch (emailError) {
      console.error("Nodemailer Register Bypassed: ", emailError.message);
      
      // Graceful fallback response containing the OTP for easy frontend verification
      return res.status(201).json({
        message: 'Account created, but failed to deliver OTP email. Use the debug OTP to verify.',
        userId: user._id,
        email: user.email,
        debugOtp: otp
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Verify email with OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp.trim() || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = '';
    user.otpExpiry = undefined;
    await user.save();

    return res.json({
      message: 'Email verified successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Resend verification OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await Promise.race([
        sendVerificationOtp(email, otp),
        emailTimeoutGate()
      ]);

      return res.json({ message: 'OTP sent successfully' });

    } catch (emailError) {
      console.error("Nodemailer Resend Bypassed: ", emailError.message);
      return res.json({ 
        message: 'OTP regenerated, but email failed to send. Use debug OTP.',
        debugOtp: otp 
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login with email and password
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email first',
        needsVerification: true,
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Forgot password - send reset OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await Promise.race([
        sendResetOtp(email, otp),
        emailTimeoutGate()
      ]);

      return res.json({ message: 'Reset OTP sent to your email' });

    } catch (emailError) {
      console.error("Nodemailer Forgot Password Bypassed: ", emailError.message);
      
      // Instantly returns the OTP payload so your UI can shift into step 2 without hanging!
      return res.status(200).json({ 
        message: 'Reset OTP generated, but email delivery failed. Use debug OTP.',
        debugOtp: otp 
      });
    }
  } catch (error) {
    console.error("Forgot Password Main Controller Failure: ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// Reset password with OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetOtp !== otp.trim() || new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = '';
    user.resetOtpExpiry = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    await user.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};