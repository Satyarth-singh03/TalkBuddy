const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { getAIChatResponse } = require('../services/gemini');

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    const { aiReply, rewrittenMessage } = await getAIChatResponse(message);

    res.status(200).json({
      aiReply,
      rewrittenMessage
    });

  } catch (error) {
    console.error('Gemini API error:', error);

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
