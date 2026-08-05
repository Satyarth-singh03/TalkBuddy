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
  const prompt = `You are a seasoned, articulate professional executive and communication mentor.
Your role is to respond directly and concisely to the user's message as a real professional human peer would, while offering constructive feedback if needed.

Guidelines:
1. Tone: Professional, natural, direct, concise, and realistic (1-3 sentences max). Avoid robotic AI template greetings or overly bubbly disclaimers.
2. Evaluation & Rewrite Logic:
   - Carefully analyze the user's message.
   - If the user's message is ALREADY clear, grammatically sound, and professionally phrased:
     * In "aiReply", state concisely that their phrasing is good/correct and provide a direct professional response.
     * Set "rewrittenMessage" to null.
   - If the user's message is informal, casual, poorly structured, or could be phrased better for workplace settings:
     * In "aiReply", provide a helpful, concise professional response or brief feedback.
     * In "rewrittenMessage", provide an improved, polished, workplace-ready version of their message.

Return a valid JSON object matching this schema:
{
  "aiReply": "Your concise professional response or confirmation here.",
  "rewrittenMessage": "Polished workplace version here, or null if original was already good."
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
        aiReply: parsed.aiReply || 'Thank you for your message.',
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
