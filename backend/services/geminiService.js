import { GoogleGenerativeAI } from '@google/generative-ai';

// gemini-1.5-flash is deprecated — use gemini-2.5-flash with Google AI Studio keys
const MODEL_NAME = 'gemini-2.5-flash';

// Lazy init so dotenv loads before we read GEMINI_API_KEY
const getGenAI = () => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in backend .env file');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Text-only chat with Gemini
export const getChatResponse = async (messages) => {
  const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });

  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1];
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
};

// Image analysis with Gemini Vision
export const getVisionResponse = async (messages, imageBase64, mimeType) => {
  const model = getGenAI().getGenerativeModel({ model: MODEL_NAME });

  const lastMessage = messages[messages.length - 1];
  const textPrompt = lastMessage.content || 'Describe this image in detail.';

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType || 'image/jpeg',
    },
  };

  const result = await model.generateContent([textPrompt, imagePart]);
  return result.response.text();
};
