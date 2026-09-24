import express from 'express';
import { generateChatResponse, testApiKey } from '../services/geminiService.js';

const router = express.Router();

/**
 * Health check & API key status
 */
router.get('/health', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = !!apiKey && apiKey !== 'PASTE_YOUR_GEMINI_API_KEY_HERE';

  res.json({
    status: 'ok',
    app: 'ARIYAAN AI Assistant',
    version: '1.0.0',
    keyConfigured: isConfigured,
    message: isConfigured
      ? 'Gemini API Key is configured and ready.'
      : 'Gemini API Key is missing or default. Please add your key in .env or Settings.'
  });
});

/**
 * Chat endpoint
 */
router.post('/chat', async (req, res) => {
  const { message, history, model, temperature, apiKey } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMPTY_INPUT',
        userMessage: 'Please enter a valid message.'
      }
    });
  }

  const result = await generateChatResponse({
    message: message.trim(),
    conversationHistory: history || [],
    model,
    temperature,
    apiKeyOverride: apiKey || null
  });

  if (!result.success) {
    return res.status(result.error.status || 500).json(result);
  }

  return res.json(result);
});

/**
 * Test API key endpoint
 */
router.post('/test-key', async (req, res) => {
  const { apiKey } = req.body;
  const keyToTest = apiKey || process.env.GEMINI_API_KEY;

  if (!keyToTest || keyToTest === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_API_KEY',
        userMessage: 'No API key provided to test. Please enter a key in Settings or configure .env.'
      }
    });
  }

  const result = await testApiKey(keyToTest);
  if (!result.success) {
    return res.status(result.error.status || 500).json(result);
  }

  return res.json(result);
});

export default router;
