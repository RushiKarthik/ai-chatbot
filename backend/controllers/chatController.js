import Chat from '../models/Chat.js';
import { getChatResponse, getVisionResponse } from '../services/geminiService.js';

export const getChats = async (req, res) => {
  try {
    const filter = req.user?._id ? { userId: req.user._id } : {};
    const chats = await Chat.find(filter).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.json([]);
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const chatData = { title: 'New Chat', messages: [] };
    if (req.user?._id) chatData.userId = req.user._id;

    const chat = await Chat.create(chatData);
    res.status(201).json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { title: title.trim().slice(0, 60) },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ _id: chat._id, title: chat.title });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    let chat = await Chat.findById(req.params.id);
    if (!chat) {
      const chatData = { title: content.slice(0, 40), messages: [] };
      if (req.user?._id) chatData.userId = req.user._id;
      chat = await Chat.create(chatData);
    }

    const userMessage = { role: 'user', content, timestamp: new Date() };
    chat.messages.push(userMessage);

    if (chat.messages.length === 1) {
      chat.title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
    }

    const aiContent = await getChatResponse(
      chat.messages.map((m) => ({ role: m.role, content: m.content }))
    );

    const assistantMessage = {
      role: 'assistant',
      content: aiContent || 'Response generated.',
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
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const sendImageMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No image uploaded' });

    let chat = await Chat.findById(req.params.id);
    if (!chat) {
      const chatData = { title: 'Image Analysis', messages: [] };
      if (req.user?._id) chatData.userId = req.user._id;
      chat = await Chat.create(chatData);
    }

    const imageBase64 = file.buffer.toString('base64');
    const userMessage = {
      role: 'user',
      content: content || 'Analyze this image',
      imageUrl: `data:${file.mimetype};base64,${imageBase64}`,
      timestamp: new Date(),
    };
    chat.messages.push(userMessage);

    const aiContent = await getVisionResponse(
      chat.messages.map((m) => ({ role: m.role, content: m.content })),
      imageBase64,
      file.mimetype
    );

    const assistantMessage = {
      role: 'assistant',
      content: aiContent || 'Analysis complete.',
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
    res.status(500).json({ message: error.message });
  }
};