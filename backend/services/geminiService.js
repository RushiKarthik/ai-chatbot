import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in backend .env file');
  }
  return new Groq({ apiKey });
};

// Text completion handler (supports arrays of messages or single strings)
export const getChatResponse = async (messagesInput) => {
  try {
    const groq = getGroqClient();

    let formattedMessages = [];

    if (Array.isArray(messagesInput)) {
      // Map database messages to standard Groq role format
      formattedMessages = messagesInput.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: String(msg.content || ''),
      }));
    } else if (typeof messagesInput === 'object' && messagesInput !== null) {
      formattedMessages = [
        {
          role: 'user',
          content: String(messagesInput.content || messagesInput.text || ''),
        },
      ];
    } else {
      formattedMessages = [
        {
          role: 'user',
          content: String(messagesInput || ''),
        },
      ];
    }

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.1-70b-versatile',
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};

// Vision completion handler
export const getVisionResponse = async (messagesInput, imageBase64) => {
  try {
    const groq = getGroqClient();

    let textPrompt = 'Analyze this image';
    if (Array.isArray(messagesInput) && messagesInput.length > 0) {
      const lastMsg = messagesInput[messagesInput.length - 1];
      textPrompt = lastMsg.content || textPrompt;
    } else if (typeof messagesInput === 'string') {
      textPrompt = messagesInput;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: String(textPrompt) },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:')
                  ? imageBase64
                  : `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      model: 'llama-3.2-11b-vision-preview',
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq Vision API Error:', error);
    throw error;
  }
};

export const generateResponse = getChatResponse;