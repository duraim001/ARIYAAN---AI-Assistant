import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Mic,
  MicOff,
  VolumeX,
  Volume2,
  MessageSquare,
  PhoneOff,
  Repeat,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useLiveVoiceController, LIVE_STATE } from '../../voice/useLiveVoiceController';
import { AriyaanOrb } from './AriyaanOrb';
import { LiveTranscript } from './LiveTranscript';

/**
 * AriyaanLiveScreen – Fullscreen real-time conversational voice experience.
 *
 * Designed to feel like talking to a real personal AI assistant naturally,
 * with continuous hands-free dialogue, real-time audio visualization,
 * barge-in support, and minimal distractions.
 */
export function AriyaanLiveScreen() {
  const {
    currentState,
    audioLevel,
    frequencyData,
    interimText,
    activeCaption,
    errorMessage,
    isContinuous,
    setIsContinuous,
    sttSupported,
    ttsSupported,
    toggleListening,
    interruptSpeaking,
    endSession,
    clearError
  } = useLiveVoiceController();

  const [showTranscript, setShowTranscript] = useState(false);

  // Keyboard accessibility: Escape to end session or close transcript, Space to toggle mic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showTranscript) {
          setShowTranscript(false);
        } else {
          endSession();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTranscript, endSession]);

  // Status pill configuration
  const getStatusBadge = () => {
    switch (currentState) {
      case LIVE_STATE.LISTENING:
        return {
          label: 'Listening',
          className: 'status-listening',
          dotClass: 'dot-listening'
        };
      case LIVE_STATE.PROCESSING:
        return {
          label: 'Thinking...',
          className: 'status-processing',
          dotClass: 'dot-processing'
        };
      case LIVE_STATE.SPEAKING:
        return {
          label: 'Speaking',
          className: 'status-speaking',
          dotClass: 'dot-speaking'
        };
      case LIVE_STATE.ERROR:
        return {
          label: 'Attention Required',
          className: 'status-error',
          dotClass: 'dot-error'
        };
      default: // IDLE
        return {
          label: 'Ready',
          className: 'status-idle',
          dotClass: 'dot-idle'
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Microphone button configuration based on assistant state
  const getMicButtonProps = () => {
    switch (currentState) {
      case LIVE_STATE.LISTENING:
        return {
          icon: <MicOff size={28} />,
          label: 'Stop Listening',
          className: 'live-mic-btn btn-listening',
          title: 'Stop listening (click or space)',
          onClick: toggleListening
        };
      case LIVE_STATE.SPEAKING:
        return {
          icon: <VolumeX size={28} />,
          label: 'Interrupt',
          className: 'live-mic-btn btn-speaking',
          title: 'Stop ARIYAAN from speaking and listen',
          onClick: interruptSpeaking
        };
      case LIVE_STATE.PROCESSING:
        return {
          icon: <Mic size={28} />,
          label: 'Thinking...',
          className: 'live-mic-btn btn-processing',
          title: 'ARIYAAN is processing your request...',
          onClick: toggleListening
        };
      case LIVE_STATE.ERROR:
        return {
          icon: <RotateCcw size={28} />,
          label: 'Retry',
          className: 'live-mic-btn btn-error',
          title: 'Click to retry',
          onClick: toggleListening
        };
      default: // IDLE
        return {
          icon: <Mic size={28} />,
          label: 'Start Talking',
          className: 'live-mic-btn btn-idle',
          title: 'Start talking to ARIYAAN',
          onClick: toggleListening
        };
    }
  };

  const micProps = getMicButtonProps();

  return (
    <div className="ariyaan-live-container" role="main" aria-label="ARIYAAN Live Voice Session">
      {/* Top Navigation & Status Bar */}
      <header className="live-top-bar">
        <div className="live-top-left">
          <button
            className="live-back-btn"
            onClick={endSession}
            title="Return to normal chat (Esc)"
            aria-label="Return to chat"
          >
            <ArrowLeft size={18} />
            <span className="live-back-label">Chat</span>
          </button>
        </div>

        {/* Center Identity */}
        <div className="live-identity">
          <div className="live-brand-title">
            <Sparkles size={16} className="live-brand-sparkle" />
            <span>ARIYAAN</span>
          </div>
          <span className="live-brand-subtitle">Personal AI Assistant</span>
        </div>

        {/* Right Status & Continuous Mode Toggle */}
        <div className="live-top-right">
          <button
            className={`live-continuous-toggle ${isContinuous ? 'active' : ''}`}
            onClick={() => setIsContinuous(!isContinuous)}
            title={isContinuous ? 'Continuous conversation: Active' : 'Push-to-talk mode: Click to activate continuous'}
            aria-pressed={isContinuous}
          >
            <Repeat size={14} />
            <span className="toggle-text">
              {isContinuous ? 'Auto-Listen: On' : 'Auto-Listen: Off'}
            </span>
          </button>

          <div className={`live-status-pill ${statusBadge.className}`}>
            <span className={`live-status-dot ${statusBadge.dotClass}`} />
            <span className="live-status-text">{statusBadge.label}</span>
          </div>
        </div>
      </header>

      {/* Main Focus Area: Large AI Orb & Live Visualizer */}
      <main className="live-center-stage">
        <AriyaanOrb
          state={currentState}
          audioLevel={audioLevel}
          frequencyData={frequencyData}
        />

        {/* Dynamic Status / Caption Area */}
        <div className="live-caption-container">
          <h2 className="live-caption-title">
            {currentState === LIVE_STATE.LISTENING && "I'm listening..."}
            {currentState === LIVE_STATE.PROCESSING && "ARIYAAN is thinking..."}
            {currentState === LIVE_STATE.SPEAKING && "ARIYAAN is speaking..."}
            {currentState === LIVE_STATE.IDLE && "Talk naturally with ARIYAAN"}
            {currentState === LIVE_STATE.ERROR && "Voice issue detected"}
          </h2>

          {/* Subtitle / Real-time speech transcript or spoken response */}
          <div className="live-caption-bubble">
            <p className="live-caption-text">
              {activeCaption}
            </p>
          </div>

          {/* Error Message Callout if present */}
          {currentState === LIVE_STATE.ERROR && (
            <div className="live-error-callout" role="alert">
              <AlertTriangle size={16} />
              <span>{errorMessage || 'Microphone or connection issue. Tap retry to continue.'}</span>
              <button className="live-error-dismiss" onClick={clearError}>
                Dismiss
              </button>
            </div>
          )}

          {!sttSupported && (
            <div className="live-unsupported-notice">
              Speech recognition works best in Chrome or Microsoft Edge.
            </div>
          )}
        </div>
      </main>

      {/* Expandable Secondary Transcript Panel */}
      <LiveTranscript
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
      />

      {/* Bottom Control Dock */}
      <footer className="live-bottom-dock">
        {/* Left Control: Transcript Toggle */}
        <div className="live-dock-slot left">
          <button
            className={`live-action-btn ${showTranscript ? 'active' : ''}`}
            onClick={() => setShowTranscript(!showTranscript)}
            title={showTranscript ? 'Hide transcript' : 'Show recent conversation transcript'}
            aria-expanded={showTranscript}
          >
            <MessageSquare size={20} />
            <span className="dock-btn-label">Transcript</span>
          </button>
        </div>

        {/* Center Control: Large Microphone Action Button */}
        <div className="live-dock-slot center">
          <button
            id="ariyaan-live-main-mic-btn"
            className={micProps.className}
            onClick={micProps.onClick}
            title={micProps.title}
            aria-label={micProps.label}
          >
            <div className="live-mic-icon-circle">
              {micProps.icon}
            </div>
            <span className="live-mic-btn-text">{micProps.label}</span>
          </button>
        </div>

        {/* Right Control: End Conversation Button */}
        <div className="live-dock-slot right">
          <button
            className="live-end-btn"
            onClick={endSession}
            title="End conversation and return to chat (Esc)"
            aria-label="End Conversation"
          >
            <PhoneOff size={18} />
            <span className="dock-btn-label">End</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
