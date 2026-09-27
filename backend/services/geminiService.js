import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in backend .env file');
  }
  return new Groq({ apiKey });
};

// Text completion handler matching expected controller export
export const getChatResponse = async (prompt) => {
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};

// Vision/Image completion handler fallback (or LLaMA 3.2 Vision if needed)
export const getVisionResponse = async (prompt, imageBase64) => {
  try {
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
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

// Default fallback export
export const generateResponse = getChatResponse;