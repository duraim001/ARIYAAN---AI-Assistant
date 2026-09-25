/**
 * ARIYAAN Voice Module – Microphone Button Component
 *
 * Integrates into the existing ChatInput without redesigning the UI.
 * Shows clear visual states: Idle / Listening / Processing / Speaking / Error
 */

import React from 'react';
import { Mic, MicOff, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { VOICE_STATE } from '../voice/useVoiceController';

export function MicButton() {
  const { voice, sendMessageWithVoice, isLoading } = useChat();
  const {
    voiceState,
    voiceError,
    voiceSettings,
    sttSupported,
    startListening,
    stopListening,
    stopVoice,
    clearVoiceError
  } = voice;

  if (!voiceSettings.voiceInputEnabled) return null;
  if (!sttSupported) return null;

  const handleClick = (e) => {
    e?.preventDefault?.();
    console.log('[ARIYAAN MicButton] Clicked! Current state:', voiceState);

    if (voiceState === VOICE_STATE.LISTENING) {
      stopListening();
    } else if (voiceState === VOICE_STATE.SPEAKING) {
      stopVoice();
    } else if (voiceState === VOICE_STATE.PROCESSING) {
      // Currently processing - wait
    } else {
      // IDLE, ERROR, or any other state
      clearVoiceError?.();
      startListening();
    }
  };

  const getButtonConfig = () => {
    switch (voiceState) {
      case VOICE_STATE.LISTENING:
        return {
          icon: <MicOff size={18} />,
          title: 'Stop recording (click to stop)',
          className: 'mic-btn mic-btn--listening',
          label: 'Stop'
        };
      case VOICE_STATE.PROCESSING:
        return {
          icon: <Loader2 size={18} className="spin-slow" />,
          title: 'Processing speech...',
          className: 'mic-btn mic-btn--processing',
          label: ''
        };
      case VOICE_STATE.SPEAKING:
        return {
          icon: <Volume2 size={18} />,
          title: 'ARIYAAN is speaking (click to stop)',
          className: 'mic-btn mic-btn--speaking',
          label: ''
        };
      case VOICE_STATE.ERROR:
        return {
          icon: <AlertCircle size={18} />,
          title: voiceError || 'Voice error – click to retry',
          className: 'mic-btn mic-btn--error',
          label: ''
        };
      default: // IDLE
        return {
          icon: <Mic size={18} />,
          title: 'Speak to ARIYAAN (click to start)',
          className: 'mic-btn mic-btn--idle',
          label: ''
        };
    }
  };

  const config = getButtonConfig();

  return (
    <button
      id="ariyaan-mic-btn"
      className={config.className}
      onClick={handleClick}
      disabled={voiceState === VOICE_STATE.PROCESSING || isLoading}
      title={config.title}
      aria-label={config.title}
    >
      {config.icon}
      {config.label && <span className="mic-btn-label">{config.label}</span>}
    </button>
  );
}
