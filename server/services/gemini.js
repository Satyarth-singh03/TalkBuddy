// ============================================================
//  TalkBuddy — Gemini AI Service
//  This file handles ALL communication with Google's Gemini AI
//  Includes automatic retry logic for high demand (503) & rate limits
// ============================================================

const { GoogleGenAI } = require('@google/genai');

// Create a Gemini client using our API key from .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// "gemini-2.5-flash" is the only active model available on this key
const MODEL = 'gemini-2.5-flash';

// ============================================================
//  Helper: callWithRetry
//  Automatically retries a function if it fails due to network/demand
// ============================================================
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
      console.log(`⚠️ Gemini busy or rate-limited. Retrying in ${delayMs}ms... (${retries} attempts left)`);
      // Wait for delayMs
      await new Promise(resolve => setTimeout(resolve, delayMs));
      // Retry with double the delay (exponential backoff)
      return callWithRetry(fn, retries - 1, delayMs * 2);
    }
    // If no retries left or not a retryable error, throw it
    throw error;
  }
}

// ============================================================
//  Function 1: getAIReply
// ============================================================
async function getAIReply(userMessage) {
  const prompt = `You are TalkBuddy, a friendly and professional communication coach.
Your job is to help users improve their professional communication skills.
Respond to the user's message in a warm, helpful, and professional tone.
Keep your response concise (2-4 sentences max).
If the user is asking something casual, gently guide them toward professional phrasing.

User message: "${userMessage}"`;

  // Wrap the call in our retry function
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    return response.text;
  });
}

// ============================================================
//  Function 2: getRewrittenMessage
// ============================================================
async function getRewrittenMessage(userMessage) {
  const prompt = `Rewrite the following message to make it more professional, 
clear, and suitable for a workplace or formal setting.
Return ONLY the rewritten message with no extra explanation or labels.
Keep the same meaning but improve the tone, grammar, and structure.

Original message: "${userMessage}"`;

  // Wrap the call in our retry function
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    return response.text;
  });
}

module.exports = { getAIReply, getRewrittenMessage };
