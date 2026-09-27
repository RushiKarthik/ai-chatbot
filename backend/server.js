import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getChatResponse } from './services/geminiService.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Mock Auth Handler to resolve frontend Login/Register requests
const handleAuth = (req, res) => {
  return res.json({
    message: 'Success',
    token: 'mock-jwt-token-12345',
    user: {
      id: '1',
      email: req.body.email || 'user@example.com',
      name: 'User'
    }
  });
};

// Listen on all possible Auth endpoints the frontend calls
app.post('/api/auth/login', handleAuth);
app.post('/api/auth/register', handleAuth);
app.post('/api/login', handleAuth);
app.post('/api/register', handleAuth);

// Chat handler function
const handleChatRequest = async (req, res) => {
  try {
    const prompt = req.body.prompt || req.body.message || req.body.content;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await getChatResponse(prompt);
    return res.json({ response, message: response });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Listen on both /api/chat and /api/chats to match frontend calls
app.post('/api/chat', handleChatRequest);
app.post('/api/chats', handleChatRequest);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});