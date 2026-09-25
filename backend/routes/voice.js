/**
 * ARIYAAN Voice API Route
 * Handles OS-level voice commands (open apps) server-side on Windows.
 * 
 * POST /api/voice/command
 * Body: { intent: 'OPEN_CHROME' | 'OPEN_CALCULATOR' | ... }
 * Returns: { success: true, message: '...' } or error
 */

import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = express.Router();

/**
 * Windows command mappings for each intent
 */
const COMMAND_MAP = {
  OPEN_CHROME:       'start chrome',
  OPEN_CALCULATOR:   'start calc',
  OPEN_NOTEPAD:      'start notepad',
  OPEN_FILE_MANAGER: 'start explorer'
};

const ALLOWED_INTENTS = new Set(Object.keys(COMMAND_MAP));

/**
 * POST /api/voice/command
 * Execute a known safe OS command for a voice intent.
 */
router.post('/command', async (req, res) => {
  const { intent } = req.body || {};

  if (!intent || !ALLOWED_INTENTS.has(intent)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UNKNOWN_INTENT',
        userMessage: `Unknown or unsupported voice command: ${intent}`
      }
    });
  }

  const command = COMMAND_MAP[intent];

  try {
    await execAsync(command, { timeout: 5000 });
    return res.json({
      success: true,
      intent,
      message: `Executed: ${intent}`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        userMessage: `Failed to execute command for ${intent}: ${err.message}`
      }
    });
  }
});

export default router;
