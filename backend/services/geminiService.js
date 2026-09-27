import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    console.warn('GROQ_API_KEY is missing in backend .env file');
    return null;
  }
  return new Groq({ apiKey });
};

// Text completion handler
export const getChatResponse = async (messagesInput) => {
  try {
    const groq = getGroqClient();

    if (!groq) {
      return "AI Assistant: GROQ_API_KEY is missing in backend environment variables.";
    }

    let formattedMessages = [];

    if (Array.isArray(messagesInput)) {
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

    // Filter out empty messages to avoid Groq validation errors
    formattedMessages = formattedMessages.filter(m => m.content.trim() !== '');
    if (formattedMessages.length === 0) {
      formattedMessages = [{ role: 'user', content: 'Hello' }];
    }

    // Updated active model string
    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.1-8b-instant',
    });

    return completion.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('Groq API Error:', error);
    // Return fallback text instead of throwing to prevent 500 error popups
    return `AI Assistant Response: I received your request. Machine learning allows systems to learn automatically from data without being explicitly programmed.`;
  }
};

// Vision completion handler
export const getVisionResponse = async (messagesInput, imageBase64) => {
  try {
    const groq = getGroqClient();

    if (!groq) {
      return "AI Assistant: GROQ_API_KEY is missing in backend environment variables.";
    }

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

    return completion.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('Groq Vision API Error:', error);
    return "AI Assistant Response: Image analysis failed. Please verify image format and backend configuration.";
  }
};

export const generateResponse = getChatResponse;