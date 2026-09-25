/**
 * ARIYAAN Voice Module – Text-to-Speech (TTS)
 *
 * Uses the browser's built-in SpeechSynthesis API.
 * Fully offline, no external dependencies.
 *
 * Future: swap speakText() to call a local TTS engine
 * (e.g., pyttsx3 via Python backend, or Coqui TTS) for
 * higher quality or Tamil voice support.
 */

/**
 * Check if the browser supports Speech Synthesis
 */
export function isTTSSupported() {
  return !!window.speechSynthesis;
}

/**
 * Get all available voices, sorted with English voices first.
 * Returns a promise because voices may load asynchronously.
 */
export function getAvailableVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(sortVoices(voices));
      return;
    }
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(sortVoices(window.speechSynthesis.getVoices()));
    };
    // Timeout fallback
    setTimeout(() => {
      resolve(sortVoices(window.speechSynthesis.getVoices()));
    }, 2000);
  });
}

function sortVoices(voices) {
  const english = voices.filter(v => v.lang.startsWith('en'));
  const others = voices.filter(v => !v.lang.startsWith('en'));
  return [...english, ...others];
}

/**
 * Speak a text string using the SpeechSynthesis API.
 *
 * @param {Object} options
 * @param {string}   options.text        - Text to speak
 * @param {string}   options.voiceURI    - SpeechSynthesisVoice URI (optional)
 * @param {number}   options.rate        - Speech rate 0.1–10 (default: 1.0)
 * @param {number}   options.pitch       - Speech pitch 0–2 (default: 1.0)
 * @param {string}   options.language    - BCP-47 language tag (default: 'en-US')
 * @param {function} options.onStart     - Called when speech starts
 * @param {function} options.onEnd       - Called when speech ends
 * @param {function} options.onError     - Called with error message string
 * @returns {{ cancel: function }} Object with cancel() method
 */
export function speakText({
  text,
  voiceURI = null,
  rate = 1.0,
  pitch = 1.0,
  language = 'en-US',
  onStart,
  onEnd,
  onError
} = {}) {
  if (!window.speechSynthesis) {
    if (onError) onError('Text-to-speech is not supported in this browser.');
    return { cancel: () => {} };
  }

  // Cancel any currently playing speech and unpause queue
  window.speechSynthesis.cancel();
  try {
    window.speechSynthesis.resume();
  } catch {}

  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return { cancel: () => {} };
  }

  // Strip markdown symbols for cleaner speech output
  const cleanText = stripMarkdown(text);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = language;
  utterance.rate = Math.max(0.1, Math.min(10, rate));
  utterance.pitch = Math.max(0, Math.min(2, pitch));

  // Set voice if specified
  if (voiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    console.log('[ARIYAAN TTS] Started speaking');
    if (onStart) onStart();
  };
  utterance.onend = () => {
    console.log('[ARIYAAN TTS] Finished speaking');
    if (onEnd) onEnd();
  };
  utterance.onerror = (event) => {
    // 'interrupted' and 'canceled' are not real errors (user stopped)
    if (event.error === 'interrupted' || event.error === 'canceled') {
      if (onEnd) onEnd();
      return;
    }
    console.warn('[ARIYAAN TTS] Utterance error:', event.error);
    if (onError) onError(`TTS error: ${event.error}`);
  };

  try {
    window.speechSynthesis.resume();
  } catch {}
  console.log('[ARIYAAN TTS] Speaking:', cleanText.slice(0, 60) + '...');
  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => {
      window.speechSynthesis.cancel();
    }
  };
}

/**
 * Stop any currently playing speech
 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech synthesis is currently speaking
 */
export function isSpeaking() {
  return window.speechSynthesis?.speaking ?? false;
}

/**
 * Remove common markdown syntax to produce cleaner spoken text.
 */
function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, 'code block')   // Code blocks
    .replace(/`([^`]+)`/g, '$1')                  // Inline code
    .replace(/#{1,6}\s+/g, '')                    // Headings
    .replace(/\*\*([^*]+)\*\*/g, '$1')            // Bold
    .replace(/\*([^*]+)\*/g, '$1')                // Italic
    .replace(/__([^_]+)__/g, '$1')                // Bold underscore
    .replace(/_([^_]+)_/g, '$1')                  // Italic underscore
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')      // Links
    .replace(/^\s*[-*+]\s+/gm, '')                // Unordered lists
    .replace(/^\s*\d+\.\s+/gm, '')               // Ordered lists
    .replace(/>\s+/g, '')                          // Blockquotes
    .replace(/\n{3,}/g, '\n\n')                   // Excessive newlines
    .trim();
}
