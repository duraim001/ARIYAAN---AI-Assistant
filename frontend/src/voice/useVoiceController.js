/**
 * ARIYAAN Voice Module – Voice Controller Hook
 *
 * Central controller that orchestrates:
 *   Microphone → STT → Intent Detection → ARIYAAN AI Pipeline → TTS
 *
 * This hook is the single integration point. It does NOT duplicate any
 * AI logic – it calls the existing sendMessage() from ChatContext.
 *
 * Voice States:
 *   'idle'       → Mic button shows 🎤
 *   'listening'  → Mic button shows 🔴 (recording in progress)
 *   'processing' → Mic button shows ⏳ (STT + AI in progress)
 *   'speaking'   → Mic button shows 🔊 (TTS playing)
 *   'error'      → Mic button shows ❌ (error message shown)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createSpeechRecognizer,
  requestMicrophonePermission,
  isSpeechRecognitionSupported
} from './useSpeechRecognition';
import {
  speakText,
  stopSpeaking,
  getAvailableVoices,
  isTTSSupported
} from './useTextToSpeech';
import { detectIntent, handleLocalIntent, INTENT } from './intentDetector';
import { executeVoiceCommand } from '../services/api';

export const VOICE_STATE = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error'
};

/**
 * Default voice settings (persisted in localStorage alongside ARIYAAN_SETTINGS_V1)
 */
export const DEFAULT_VOICE_SETTINGS = {
  voiceInputEnabled: true,
  voiceOutputEnabled: true,
  ttsVoiceURI: '',
  ttsRate: 1.0,
  language: 'en-US'
};

const VOICE_STORAGE_KEY = 'ARIYAAN_VOICE_SETTINGS_V1';

export function useVoiceController({ sendMessage, onVoiceError }) {
  // ─── Persistent voice settings ───────────────────────────────────────────
  const [voiceSettings, setVoiceSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(VOICE_STORAGE_KEY);
      return saved ? { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_VOICE_SETTINGS;
    } catch {
      return DEFAULT_VOICE_SETTINGS;
    }
  });

  // ─── Runtime state ────────────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState(VOICE_STATE.IDLE);
  const [voiceError, setVoiceError] = useState(null);
  const [interimText, setInterimText] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [sttSupported] = useState(isSpeechRecognitionSupported);
  const [ttsSupported] = useState(isTTSSupported);

  const recognizerRef = useRef(null);
  const ttsHandleRef = useRef(null);
  const isMountedRef = useRef(true);
  const onTTSEndCallbackRef = useRef(null);

  // ─── Persist voice settings ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  // ─── Load available TTS voices ────────────────────────────────────────────
  useEffect(() => {
    if (!ttsSupported) return;
    getAvailableVoices().then(voices => {
      if (isMountedRef.current) setAvailableVoices(voices);
    });
  }, [ttsSupported]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (recognizerRef.current) {
        try { recognizerRef.current.abort(); } catch { }
      }
      stopSpeaking();
    };
  }, []);

  // ─── Update voice settings ────────────────────────────────────────────────
  const updateVoiceSettings = useCallback((fields) => {
    setVoiceSettings(prev => ({ ...prev, ...fields }));
  }, []);

  // ─── Speak a response text ────────────────────────────────────────────────
  const speakResponse = useCallback((text, options = {}) => {
    if (!voiceSettings.voiceOutputEnabled || !ttsSupported) {
      if (options.onEnd) options.onEnd();
      return;
    }

    setVoiceState(VOICE_STATE.SPEAKING);
    onTTSEndCallbackRef.current = options.onEnd || null;

    ttsHandleRef.current = speakText({
      text,
      voiceURI: voiceSettings.ttsVoiceURI || null,
      rate: voiceSettings.ttsRate,
      language: voiceSettings.language,
      onStart: () => {
        if (options.onStart) options.onStart();
      },
      onEnd: () => {
        if (isMountedRef.current) setVoiceState(VOICE_STATE.IDLE);
        if (onTTSEndCallbackRef.current) {
          const cb = onTTSEndCallbackRef.current;
          onTTSEndCallbackRef.current = null;
          cb();
        }
      },
      onError: (msg) => {
        if (isMountedRef.current) {
          setVoiceState(VOICE_STATE.IDLE); // Degrade gracefully
          console.warn('[ARIYAAN TTS]', msg);
        }
        if (options.onError) options.onError(msg);
        if (onTTSEndCallbackRef.current) {
          const cb = onTTSEndCallbackRef.current;
          onTTSEndCallbackRef.current = null;
          cb();
        }
      }
    });
  }, [voiceSettings, ttsSupported]);

  // ─── Stop everything ─────────────────────────────────────────────────────
  const stopVoice = useCallback(() => {
    if (recognizerRef.current) {
      try { recognizerRef.current.abort(); } catch { }
      recognizerRef.current = null;
    }
    stopSpeaking();
    onTTSEndCallbackRef.current = null;
    setInterimText('');
    setVoiceState(VOICE_STATE.IDLE);
    setVoiceError(null);
  }, []);

  // ─── Start Listening ──────────────────────────────────────────────────────
  const startListening = useCallback(async (options = {}) => {
    // If speaking, stop speaking first
    if (voiceState === VOICE_STATE.SPEAKING) {
      stopSpeaking();
    } else if (voiceState !== VOICE_STATE.IDLE && voiceState !== VOICE_STATE.ERROR) {
      return;
    }

    if (!sttSupported) {
      const msg = 'Speech recognition is not supported in this browser. Please use Chrome or Edge.';
      setVoiceError(msg);
      setVoiceState(VOICE_STATE.ERROR);
      return;
    }

    // Stop any playing TTS before listening
    stopSpeaking();
    setInterimText('');

    // Request microphone permission
    const perm = await requestMicrophonePermission();
    if (!perm.granted) {
      setVoiceError(perm.reason);
      setVoiceState(VOICE_STATE.ERROR);
      if (onVoiceError) onVoiceError(perm.reason);
      return;
    }

    setVoiceError(null);

    // Build the recognizer
    const recognizer = createSpeechRecognizer({
      language: voiceSettings.language,
      continuous: options.continuous ?? false,
      onStart: () => {
        if (isMountedRef.current) {
          setVoiceState(VOICE_STATE.LISTENING);
          if (options.onStart) options.onStart();
        }
      },
      onInterim: (text) => {
        if (isMountedRef.current) {
          setInterimText(text);
          if (options.onInterim) options.onInterim(text);
        }
      },
      onResult: async (transcript) => {
        if (!isMountedRef.current) return;
        setInterimText('');
        setVoiceState(VOICE_STATE.PROCESSING);
        recognizerRef.current = null;

        if (options.onResult) {
          options.onResult(transcript);
        }

        try {
          await processTranscript(transcript);
        } catch (err) {
          setVoiceError('An unexpected error occurred.');
          setVoiceState(VOICE_STATE.ERROR);
        }
      },
      onEnd: () => {
        if (isMountedRef.current) {
          setInterimText('');
          if (voiceState === VOICE_STATE.LISTENING) {
            setVoiceState(VOICE_STATE.IDLE);
          }
          if (options.onEnd) options.onEnd();
        }
      },
      onError: (msg) => {
        if (!isMountedRef.current) return;
        setInterimText('');
        setVoiceError(msg);
        setVoiceState(VOICE_STATE.ERROR);
        if (onVoiceError) onVoiceError(msg);
        if (options.onError) options.onError(msg);
      }
    });

    if (!recognizer) {
      setVoiceError('Could not initialize speech recognizer.');
      setVoiceState(VOICE_STATE.ERROR);
      return;
    }

    recognizerRef.current = recognizer;
    try {
      recognizer.start();
    } catch (err) {
      setVoiceError('Failed to start recording. Please try again.');
      setVoiceState(VOICE_STATE.ERROR);
    }
  }, [voiceState, sttSupported, voiceSettings, onVoiceError]);

  // ─── Process recognized transcript ───────────────────────────────────────
  const processTranscript = useCallback(async (transcript) => {
    const { intent, text } = detectIntent(transcript);

    // App-launch intents: fire the backend OS command (non-blocking)
    const APP_LAUNCH_INTENTS = [
      INTENT.OPEN_CHROME, INTENT.OPEN_CALCULATOR,
      INTENT.OPEN_NOTEPAD, INTENT.OPEN_FILE_MANAGER
    ];
    if (APP_LAUNCH_INTENTS.includes(intent)) {
      executeVoiceCommand(intent).catch(err => {
        console.warn('[ARIYAAN Voice] App launch failed:', err);
      });
    }

    // All intents → route to the existing ARIYAAN AI pipeline
    // Pass fromVoice=true so the response is auto-spoken
    setVoiceState(VOICE_STATE.PROCESSING);
    await sendMessage(text, true); // fromVoice = true
    // TTS will be triggered from ChatContext when _speakOnAdd is true
  }, [sendMessage]);

  // ─── Stop recording (push-to-talk style) ─────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch { }
      recognizerRef.current = null;
    }
    setInterimText('');
    if (voiceState === VOICE_STATE.LISTENING) {
      setVoiceState(VOICE_STATE.IDLE);
    }
  }, [voiceState]);

  // ─── Barge-in / Interrupt ────────────────────────────────────────────────
  const interrupt = useCallback(() => {
    stopVoice();
    startListening();
  }, [stopVoice, startListening]);

  return {
    // State
    voiceState,
    voiceError,
    interimText,
    voiceSettings,
    availableVoices,
    sttSupported,
    ttsSupported,

    // Actions
    startListening,
    stopListening,
    stopVoice,
    speakResponse,
    updateVoiceSettings,
    interrupt,

    // Setters
    clearVoiceError: () => {
      setVoiceError(null);
      setInterimText('');
      setVoiceState(VOICE_STATE.IDLE);
    }
  };
}
