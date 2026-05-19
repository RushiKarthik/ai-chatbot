import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: '' },
    otpExpiry: { type: Date },
    resetOtp: { type: String, default: '' },
    resetOtpExpiry: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
