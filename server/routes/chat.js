// ============================================================
//  TalkBuddy — Chat Route
//  Handles POST /api/chat requests from the frontend
// ============================================================

// express.Router() creates a mini-app for just this route group
const router      = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { getAIReply, getRewrittenMessage } = require('../services/gemini');

// ============================================================
//  POST /api/chat
//  
//  What happens when frontend sends a message:
//  1. verifyToken middleware checks the user is logged in
//  2. We extract the message from the request body
//  3. We call Gemini TWICE (reply + rewrite) at the same time
//  4. We send both results back to the frontend
// ============================================================
router.post('/', verifyToken, async (req, res) => {
  // Step 1: Get the message the user typed
  const { message } = req.body;

  // Basic validation — don't process empty messages
  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    // Step 2: Call Gemini functions sequentially (one after the other)
    // to avoid triggering concurrent request rate limits on the free tier.
    const aiReply = await getAIReply(message);
    const rewrittenMessage = await getRewrittenMessage(message);

    // Step 3: Send both results back to the frontend as JSON
    res.status(200).json({
      aiReply,         // TalkBuddy's professional response
      rewrittenMessage // Polished version of what the user said
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Check if it's a rate limit / quota error
    const errText = error.toString();
    if (errText.includes('RESOURCE_EXHAUSTED') || errText.includes('quota') || errText.includes('429')) {
      return res.status(429).json({
        error: 'TalkBuddy is resting! The free-tier Gemini API rate limit was hit. Please try again in 10-15 seconds.'
      });
    }

    res.status(500).json({ 
      error: 'Something went wrong with the AI. Please try again.' 
    });
  }
});

module.exports = router;
