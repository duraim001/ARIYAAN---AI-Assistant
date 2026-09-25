/**
 * ARIYAAN Voice Module – Command / Intent Layer
 *
 * A modular, lightweight intent-detection layer that sits ABOVE the existing
 * Gemini AI pipeline. It maps common spoken commands to structured intents so
 * the app can react immediately for simple PC-control actions.
 *
 * IMPORTANT: This does NOT replace the existing LLM/NLP system.
 * - Simple commands (open app, time, etc.) → handled here immediately
 * - Everything else → passed straight through to ARIYAAN's Gemini backend
 *
 * Future: Add Tamil command patterns here when Tamil STT is integrated.
 */

export const INTENT = {
  OPEN_CHROME:      'OPEN_CHROME',
  OPEN_CALCULATOR:  'OPEN_CALCULATOR',
  OPEN_NOTEPAD:     'OPEN_NOTEPAD',
  OPEN_FILE_MANAGER:'OPEN_FILE_MANAGER',
  GET_TIME:         'GET_TIME',
  GET_DATE:         'GET_DATE',
  GREETING:         'GREETING',
  FAREWELL:         'FAREWELL',
  UNKNOWN:          'UNKNOWN'         // → route to Gemini AI
};

/** Intent pattern definitions */
const INTENT_PATTERNS = [
  {
    intent: INTENT.OPEN_CHROME,
    patterns: [
      /\bopen\s+(google\s+)?chrome\b/i,
      /\blaunch\s+(google\s+)?chrome\b/i,
      /\bstart\s+(google\s+)?chrome\b/i
    ]
  },
  {
    intent: INTENT.OPEN_CALCULATOR,
    patterns: [
      /\bopen\s+calc(ulator)?\b/i,
      /\blaunch\s+calc(ulator)?\b/i,
      /\bstart\s+calc(ulator)?\b/i
    ]
  },
  {
    intent: INTENT.OPEN_NOTEPAD,
    patterns: [
      /\bopen\s+notepad\b/i,
      /\blaunch\s+notepad\b/i,
      /\bstart\s+notepad\b/i
    ]
  },
  {
    intent: INTENT.OPEN_FILE_MANAGER,
    patterns: [
      /\bopen\s+(file\s+)?explorer\b/i,
      /\bopen\s+file\s+manager\b/i,
      /\blaunch\s+(file\s+)?explorer\b/i
    ]
  },
  {
    intent: INTENT.GET_TIME,
    patterns: [
      /\bwhat(\s+is|\s+'s)?\s+(the\s+)?time\b/i,
      /\btell\s+me\s+the\s+time\b/i,
      /\bcurrent\s+time\b/i
    ]
  },
  {
    intent: INTENT.GET_DATE,
    patterns: [
      /\bwhat(\s+is|\s+'s)?\s+(the\s+)?date\b/i,
      /\btell\s+me\s+the\s+date\b/i,
      /\btoday('s)?\s+date\b/i,
      /\bwhat\s+day\s+is\s+(it|today)\b/i
    ]
  },
  {
    intent: INTENT.GREETING,
    patterns: [
      /^(hi|hello|hey|howdy|good\s+(morning|afternoon|evening|night))\b/i,
      /^(hi|hello|hey)\s+ariyaan\b/i
    ]
  },
  {
    intent: INTENT.FAREWELL,
    patterns: [
      /^(bye|goodbye|see\s+you|take\s+care|exit|quit)\b/i,
      /^(bye|goodbye|see\s+you)\s+ariyaan\b/i,
      /\bgoodbye\s+ariyaan\b/i
    ]
  }
];

/**
 * Detect an intent from a spoken command string.
 *
 * @param {string} text - Raw recognized speech
 * @returns {{ intent: string, text: string }}
 */
export function detectIntent(text) {
  const normalized = text.trim();
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some(p => p.test(normalized))) {
      return { intent, text: normalized };
    }
  }
  return { intent: INTENT.UNKNOWN, text: normalized };
}

/**
 * Handle a simple local intent immediately (time, date, greeting).
 * Returns a response string, or null if the intent should be passed
 * to the Gemini AI backend.
 *
 * @param {string} intent
 * @returns {string|null}
 */
export function handleLocalIntent(intent) {
  switch (intent) {
    case INTENT.GET_TIME: {
      const now = new Date();
      return `The current time is ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`;
    }
    case INTENT.GET_DATE: {
      const now = new Date();
      return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }
    // Computer-control intents (open apps) are handled via the backend API
    // route /api/voice/command so they can run OS-level commands server-side.
    // Return null here → ChatContext.sendMessage() will include the original
    // text so Gemini can also explain what it's doing.
    default:
      return null;
  }
}
