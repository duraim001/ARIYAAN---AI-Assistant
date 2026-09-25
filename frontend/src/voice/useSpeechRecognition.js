/**
 * ARIYAAN Voice Module – Speech Recognition (STT)
 * 
 * Uses the browser's built-in Web Speech API (SpeechRecognition).
 * Works offline in Chrome/Edge. No external dependencies required.
 * 
 * Future: swap recognizeAudio() to call the Python Whisper backend endpoint
 * for higher accuracy or Tamil support.
 */

/**
 * Check if the browser supports Speech Recognition
 */
export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Create and configure a SpeechRecognition instance for English.
 * Returns null if the browser doesn't support it.
 *
 * @param {Object} options
 * @param {function} options.onResult        - Called with the recognized text string
 * @param {function} options.onStart         - Called when listening begins
 * @param {function} options.onEnd           - Called when listening ends (any reason)
 * @param {function} options.onError         - Called with an error message string
 * @param {boolean}  options.continuous      - Keep listening until stop() called
 * @param {string}   options.language        - BCP-47 language tag (default: 'en-US')
 */
export function createSpeechRecognizer({
  onResult,
  onInterim,
  onStart,
  onEnd,
  onError,
  continuous = false,
  language = null
} = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognizer = new SpeechRecognition();

  // Configuration - use browser language (e.g. en-IN, en-US) if not specified
  const browserLang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-IN';
  recognizer.lang = language || browserLang;
  recognizer.continuous = continuous;
  recognizer.interimResults = true; // Real-time feedback as user speaks
  recognizer.maxAlternatives = 1;

  console.log('[ARIYAAN STT] Initializing recognizer with language:', recognizer.lang);

  let capturedTranscript = '';
  let deliveredResult = false;

  recognizer.onstart = () => {
    console.log('[ARIYAAN STT] Recognition started successfully');
    capturedTranscript = '';
    deliveredResult = false;
    if (onStart) onStart();
  };

  recognizer.onresult = (event) => {
    try {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item && item[0] && item[0].transcript) {
          if (item.isFinal) {
            finalTranscript += item[0].transcript + ' ';
          } else {
            interimTranscript += item[0].transcript + ' ';
          }
        }
      }

      const currentSpeech = (finalTranscript + interimTranscript).trim();
      if (currentSpeech) {
        capturedTranscript = currentSpeech;
      }

      if (interimTranscript.trim() && onInterim) {
        onInterim(interimTranscript.trim());
      }

      if (finalTranscript.trim()) {
        const textToSend = finalTranscript.trim();
        capturedTranscript = textToSend;
        deliveredResult = true;
        console.log('[ARIYAAN STT] Final recognized:', textToSend);
        if (onResult) onResult(textToSend);
      }
    } catch (err) {
      console.error('[ARIYAAN STT] Result error:', err);
      if (onError) onError('Failed to process speech result.');
    }
  };

  recognizer.onerror = (event) => {
    console.warn('[ARIYAAN STT] Recognition error:', event.error);
    let message = "Sorry, I couldn't understand that.";
    switch (event.error) {
      case 'no-speech':
        message = 'No speech detected. Click the mic and speak clearly.';
        break;
      case 'audio-capture':
        message = 'Microphone unavailable. Check your microphone settings.';
        break;
      case 'not-allowed':
        message = 'Microphone access denied. Please click the 🔒 icon in the browser address bar and allow microphone access.';
        break;
      case 'network':
        message = 'Speech recognition network error. Please check your internet connection.';
        break;
      case 'aborted':
        // User clicked stop or interrupted - not a fatal error
        return;
      default:
        message = `Speech recognition error: ${event.error}`;
    }
    if (onError) onError(message);
  };

  recognizer.onend = () => {
    console.log('[ARIYAAN STT] Recognition ended. Captured:', capturedTranscript, 'Delivered:', deliveredResult);
    // If recognition finished and we have captured speech that was not yet delivered as final:
    if (!deliveredResult && capturedTranscript.trim()) {
      deliveredResult = true;
      console.log('[ARIYAAN STT] Delivering captured speech on end:', capturedTranscript.trim());
      if (onResult) onResult(capturedTranscript.trim());
    }
    if (onEnd) onEnd();
  };

  return recognizer;
}

/**
 * Request microphone permission explicitly.
 * Returns { granted: true } or { granted: false, reason: string }
 */
export async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately – we just needed the permission grant
    stream.getTracks().forEach(track => track.stop());
    return { granted: true };
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return { granted: false, reason: 'Microphone permission denied by the user.' };
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return { granted: false, reason: 'No microphone device found.' };
    }
    return { granted: false, reason: `Microphone error: ${err.message}` };
  }
}
