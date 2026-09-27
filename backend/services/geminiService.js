import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in backend .env file');
  }
  return new Groq({ apiKey });
};

// Text completion handler using reliable Groq model string
export const getChatResponse = async (prompt) => {
  try {
    const groq = getGroqClient();

    // Extract text if prompt arrives as object/array from frontend
    let userText = prompt;
    if (typeof prompt === 'object' && prompt !== null) {
      userText = prompt.text || prompt.content || prompt.message || JSON.stringify(prompt);
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: String(userText || ''),
        },
      ],
      model: 'llama-3.1-70b-versatile',
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};

// Vision completion handler
export const getVisionResponse = async (prompt, imageBase64) => {
  try {
    const groq = getGroqClient();
    
    let textPrompt = prompt;
    if (typeof prompt === 'object' && prompt !== null) {
      textPrompt = prompt.text || prompt.content || prompt.message || JSON.stringify(prompt);
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: String(textPrompt || '') },
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