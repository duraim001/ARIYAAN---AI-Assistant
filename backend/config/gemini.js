import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Gets a GoogleGenerativeAI client instance.
 * @param {string} [overrideApiKey] - Optional API key to override process.env
 * @returns {GoogleGenerativeAI}
 */
export const getGeminiClient = (overrideApiKey) => {
  const apiKey = overrideApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('MISSING_API_KEY');
  }
  return new GoogleGenerativeAI(apiKey);
};
