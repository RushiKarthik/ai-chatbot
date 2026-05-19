import jwt from 'jsonwebtoken';

// Create JWT token for authenticated user
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
