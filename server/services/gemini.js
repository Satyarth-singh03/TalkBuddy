const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-2.5-flash';

async function callWithRetry(fn, retries = 3, delayMs = 1500) {
  try {
    return await fn();
  } catch (error) {
    const errorText = error.toString();
    const isRetryable = 
      errorText.includes('503') || 
      errorText.includes('UNAVAILABLE') || 
      errorText.includes('RESOURCE_EXHAUSTED') || 
      errorText.includes('429');

    if (retries > 0 && isRetryable) {
      console.log(`Gemini busy or rate-limited. Retrying in ${delayMs}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return callWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

async function getAIChatResponse(userMessage) {
  const prompt = `You are an articulate, courteous, and seasoned professional colleague.

Your task is to produce two fields in a JSON object based on the user's input:

1. "aiReply": A direct, polite, and professional conversation reply to the user's message.
   - Converse naturally as a real professional person (e.g., if user says "hi wats up?", reply "Hello! I am doing well, thank you. How are you doing today?").
   - DO NOT lecture the user, coach them, or criticize their tone in this field (do NOT say "This is too casual" or "You should be more formal"). Just respond to their message directly and professionally in 1-2 sentences.

2. "rewrittenMessage": A polished, workplace-ready version of the user's input.
   - If the user's input is casual, informal, or grammatically poor, provide the professional/formal equivalent of what they meant to say (e.g., for "hi wats up?", return "Hello, how are you?").
   - If the user's input is ALREADY clear, grammatically sound, and professionally phrased, set "rewrittenMessage" to null.

Return ONLY a valid JSON object matching this schema:
{
  "aiReply": "Your professional conversational reply here.",
  "rewrittenMessage": "Polished workplace version of user message, or null if user message was already professional."
}

User Message: "${userMessage}"`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsed = JSON.parse(response.text);
      return {
        aiReply: parsed.aiReply || 'Hello! How can I assist you today?',
        rewrittenMessage: parsed.rewrittenMessage || null,
      };
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON response:', response.text);
      return {
        aiReply: response.text,
        rewrittenMessage: null,
      };
    }
  });
}

module.exports = { getAIChatResponse };
