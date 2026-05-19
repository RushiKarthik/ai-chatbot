import Chat from '../models/Chat.js';
import { getChatResponse, getVisionResponse } from '../services/geminiService.js';

// User-friendly Gemini error messages
const formatGeminiError = (error) => {
  let message = error.message;
  if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
    return 'Invalid Gemini API key. Check GEMINI_API_KEY in backend .env';
  }
  if (message.includes('429') || message.includes('quota')) {
    return 'Gemini API quota exceeded. Wait a few minutes or check Google AI Studio.';
  }
  if (message.includes('404') && message.includes('not found')) {
    return 'Gemini model not available. Update the model name in geminiService.js';
  }
  return message;
};

// Get all chats for logged-in user
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .select('title updatedAt createdAt')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single chat with messages
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new empty chat
export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      userId: req.user._id,
      title: 'New Chat',
      messages: [],
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rename a chat
export const renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title: title.trim().slice(0, 60) },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ _id: chat._id, title: chat.title });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message and get AI response (text only)
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    let chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    chat.messages.push(userMessage);

    // Auto-generate title from first message
    if (chat.messages.length === 1) {
      chat.title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
    }

    // Get AI response from Gemini
    const aiContent = await getChatResponse(
      chat.messages.map((m) => ({ role: m.role, content: m.content }))
    );

    const assistantMessage = {
      role: 'assistant',
      content: aiContent,
      timestamp: new Date(),
    };
    chat.messages.push(assistantMessage);
    await chat.save();

    res.json({
      userMessage,
      assistantMessage,
      chatId: chat._id,
      title: chat.title,
    });
  } catch (error) {
    res.status(500).json({ message: formatGeminiError(error) });
  }
};

// Send message with image for vision analysis
export const sendImageMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    let chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Convert image to base64 for storage and Gemini
    const imageBase64 = file.buffer.toString('base64');
    const imageDataUrl = `data:${file.mimetype};base64,${imageBase64}`;

    const userMessage = {
      role: 'user',
      content: content || 'Analyze this image',
      imageUrl: imageDataUrl,
      timestamp: new Date(),
    };
    chat.messages.push(userMessage);

    if (chat.messages.length === 1) {
      chat.title = 'Image Analysis';
    }

    // Get vision response from Gemini
    const aiContent = await getVisionResponse(
      chat.messages.map((m) => ({ role: m.role, content: m.content })),
      imageBase64,
      file.mimetype
    );

    const assistantMessage = {
      role: 'assistant',
      content: aiContent,
      timestamp: new Date(),
    };
    chat.messages.push(assistantMessage);
    await chat.save();

    res.json({
      userMessage,
      assistantMessage,
      chatId: chat._id,
      title: chat.title,
    });
  } catch (error) {
    res.status(500).json({ message: formatGeminiError(error) });
  }
};
