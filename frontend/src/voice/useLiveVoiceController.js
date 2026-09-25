/**
 * ARIYAAN Live – Dedicated Live Voice Controller
 *
 * Sits cleanly on top of the existing Voice system and ChatContext.
 * Coordinates real-time conversation loop:
 *   Listening -> Speech Recognized -> Gemini Processing -> Speaking -> Auto-Listen
 *
 * Provides:
 * - State machine: IDLE | LISTENING | PROCESSING | SPEAKING | ERROR | ENDED
 * - Audio analysis (Web Audio API AnalyserNode) for live orb reactivity
 * - Barge-in / Interrupt capability
 * - Continuous conversation loop
 * - Clean session teardown
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { VOICE_STATE } from './useVoiceController';

export const LIVE_STATE = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error',
  ENDED: 'ended'
};

export function useLiveVoiceController() {
  const {
    messages,
    isLoading,
    aiStatus,
    error: chatError,
    sendMessage,
    registerLiveTTSListener,
    closeLiveVoice,
    voice
  } = useChat();

  const {
    voiceState,
    voiceError,
    interimText,
    startListening,
    stopListening,
    stopVoice,
    clearVoiceError,
    sttSupported,
    ttsSupported,
    voiceSettings
  } = voice;

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [isContinuous, setIsContinuous] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0); // 0.0 to 1.0 (mic volume)
  const [frequencyData, setFrequencyData] = useState(() => new Array(16).fill(0));
  const [localError, setLocalError] = useState(null);

  // References for audio analysis
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const isMountedRef = useRef(true);
  const autoListenTimeoutRef = useRef(null);
  const isSpeakingSimRef = useRef(null);

  // ─── 1. Determine Current Assistant State ─────────────────────────────────
  const currentState = useMemo(() => {
    if (!isSessionActive) return LIVE_STATE.ENDED;
    if (localError || voiceError || (chatError && chatError.code !== 'MISSING_API_KEY')) {
      return LIVE_STATE.ERROR;
    }
    if (isLoading || aiStatus === 'thinking' || aiStatus === 'responding' || voiceState === VOICE_STATE.PROCESSING) {
      return LIVE_STATE.PROCESSING;
    }
    if (voiceState === VOICE_STATE.SPEAKING) {
      return LIVE_STATE.SPEAKING;
    }
    if (voiceState === VOICE_STATE.LISTENING) {
      return LIVE_STATE.LISTENING;
    }
    if (voiceState === VOICE_STATE.ERROR) {
      return LIVE_STATE.ERROR;
    }
    return LIVE_STATE.IDLE;
  }, [isSessionActive, localError, voiceError, chatError, isLoading, aiStatus, voiceState]);

  // ─── 2. Web Audio API for Real-Time Microphone Reactive Orb ──────────────
  const startAudioAnalysis = useCallback(async () => {
    try {
      if (mediaStreamRef.current) return; // already active

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!isMountedRef.current || !analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        const bins = 16;
        const step = Math.floor(dataArray.length / bins) || 1;
        const freqs = [];

        for (let i = 0; i < bins; i++) {
          const val = (dataArray[i * step] || 0) / 255;
          freqs.push(val);
          sum += val;
        }

        const avg = sum / bins;
        // Apply smooth noise gate and amplification
        const normalizedVolume = avg > 0.03 ? Math.min(1, avg * 2.2) : 0;

        setAudioLevel(normalizedVolume);
        setFrequencyData(freqs);

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('[ARIYAAN Live] Audio analysis stream unavailable (mic still works via STT):', err);
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setFrequencyData(new Array(16).fill(0));
  }, []);

  // Connect audio analyzer when listening, stop otherwise
  useEffect(() => {
    if (currentState === LIVE_STATE.LISTENING) {
      startAudioAnalysis();
    } else {
      stopAudioAnalysis();
    }
  }, [currentState, startAudioAnalysis, stopAudioAnalysis]);

  // ─── 3. TTS Speaking Pulse Simulation ────────────────────────────────────
  // When ARIYAAN is speaking, generate animated harmonic frequencies for the waveform
  useEffect(() => {
    if (currentState !== LIVE_STATE.SPEAKING) return;

    let startTime = Date.now();
    let simFrame;

    const simulateSpeakingWaves = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Multi-frequency harmonic envelope simulating human voice cadence
      const pulse = Math.sin(elapsed * 6) * 0.35 + Math.cos(elapsed * 10) * 0.25 + 0.55;
      const baseLevel = Math.max(0.15, Math.min(0.95, pulse));
      setAudioLevel(baseLevel);

      const simFreqs = [];
      for (let i = 0; i < 16; i++) {
        const f = Math.sin(elapsed * 5 + i * 0.4) * 0.3 + Math.cos(elapsed * 8 + i * 0.6) * 0.3 + 0.4;
        simFreqs.push(Math.max(0.1, Math.min(1, f)));
      }
      setFrequencyData(simFreqs);

      simFrame = requestAnimationFrame(simulateSpeakingWaves);
    };

    simulateSpeakingWaves();

    return () => {
      if (simFrame) cancelAnimationFrame(simFrame);
    };
  }, [currentState]);

  // ─── 4. Natural Continuous Conversation Loop ─────────────────────────────
  // Listen for TTS end event registered in ChatContext
  useEffect(() => {
    const unregister = registerLiveTTSListener(() => {
      console.log('[ARIYAAN Live] TTS completed. Continuous mode is:', isContinuous);
      if (!isMountedRef.current || !isSessionActive) return;

      if (isContinuous) {
        // Natural conversational pause (450ms) before listening again
        if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
        autoListenTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && isSessionActive) {
            console.log('[ARIYAAN Live] Auto-restarting listening for user reply...');
            startListening();
          }
        }, 450);
      }
    });

    return () => {
      unregister();
      if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
    };
  }, [registerLiveTTSListener, isContinuous, isSessionActive, startListening]);

  // ─── 5. Auto-start listening on initial screen mount ──────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    setIsSessionActive(true);

    // Initial warm greeting / listen start after 500ms
    const timer = setTimeout(() => {
      if (isMountedRef.current && voiceState === VOICE_STATE.IDLE) {
        startListening();
      }
    }, 500);

    return () => {
      isMountedRef.current = false;
      if (timer) clearTimeout(timer);
      if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
      stopAudioAnalysis();
    };
  }, []);

  // ─── 6. Controls & Actions ────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    setLocalError(null);
    clearVoiceError();

    if (currentState === LIVE_STATE.LISTENING) {
      stopListening();
    } else if (currentState === LIVE_STATE.SPEAKING) {
      // Barge-in: interrupt speaking and start listening
      stopVoice();
      setTimeout(() => startListening(), 100);
    } else if (currentState === LIVE_STATE.PROCESSING) {
      // Allow user to cancel processing
      stopVoice();
    } else {
      // IDLE or ERROR
      startListening();
    }
  }, [currentState, clearVoiceError, stopListening, stopVoice, startListening]);

  // Interrupt ARIYAAN while speaking (Barge-in)
  const interruptSpeaking = useCallback(() => {
    stopVoice();
    setTimeout(() => {
      if (isMountedRef.current && isSessionActive) {
        startListening();
      }
    }, 150);
  }, [stopVoice, isSessionActive, startListening]);

  // End Conversation Session cleanly
  const endSession = useCallback(() => {
    setIsSessionActive(false);
    if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
    stopAudioAnalysis();
    stopVoice();
    closeLiveVoice();
  }, [stopAudioAnalysis, stopVoice, closeLiveVoice]);

  // ─── 7. Captions / Latest Speech Text ────────────────────────────────────
  const latestMessage = useMemo(() => {
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1];
  }, [messages]);

  const activeCaption = useMemo(() => {
    if (currentState === LIVE_STATE.LISTENING) {
      if (interimText) return interimText;
      return "I'm listening...";
    }
    if (currentState === LIVE_STATE.PROCESSING) {
      return "Thinking...";
    }
    if (currentState === LIVE_STATE.SPEAKING) {
      if (latestMessage && latestMessage.role === 'assistant') {
        // Strip markdown headings/asterisks for sleek live subtitle
        return latestMessage.content
          .replace(/[#*`_~\[\]]/g, '')
          .slice(0, 140) + (latestMessage.content.length > 140 ? '...' : '');
      }
      return "Speaking...";
    }
    if (currentState === LIVE_STATE.ERROR) {
      return localError || voiceError || chatError?.userMessage || "Something went wrong. Tap mic to retry.";
    }
    return "Tap to start talking";
  }, [currentState, interimText, latestMessage, localError, voiceError, chatError]);

  return {
    // Current live state
    currentState,
    isSessionActive,
    isContinuous,
    setIsContinuous,
    audioLevel,
    frequencyData,
    interimText,
    activeCaption,
    errorMessage: localError || voiceError || chatError?.userMessage,

    // Audio support
    sttSupported,
    ttsSupported,
    voiceSettings,

    // Actions
    toggleListening,
    interruptSpeaking,
    endSession,
    clearError: () => {
      setLocalError(null);
      clearVoiceError();
    }
  };
}
