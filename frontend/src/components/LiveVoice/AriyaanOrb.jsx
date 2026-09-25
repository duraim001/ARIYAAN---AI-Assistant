import React, { useMemo } from 'react';
import { Sparkles, Mic, Volume2, Loader2, AlertCircle } from 'lucide-react';
import { LIVE_STATE } from '../../voice/useLiveVoiceController';

/**
 * AriyaanOrb – High-performance, state-reactive AI voice visualizer.
 *
 * States:
 * - IDLE: Calm, breathing ambient glow, gentle floating
 * - LISTENING: Expands & ripples to live mic volume & frequency bands
 * - PROCESSING: Orbiting aurora glow, revolving energy sparks
 * - SPEAKING: Dynamic acoustic wave ripples synchronized with voice cadence
 * - ERROR: Subtle warm rose warning glow
 */
export function AriyaanOrb({ state, audioLevel = 0, frequencyData = [] }) {
  // Compute reactive dynamic styles based on audio level
  const reactiveScale = useMemo(() => {
    if (state === LIVE_STATE.LISTENING) {
      return 1 + Math.min(0.35, audioLevel * 0.45);
    }
    if (state === LIVE_STATE.SPEAKING) {
      return 1 + Math.min(0.28, audioLevel * 0.35);
    }
    if (state === LIVE_STATE.PROCESSING) {
      return 1.05;
    }
    return 1;
  }, [state, audioLevel]);

  const reactiveGlow = useMemo(() => {
    if (state === LIVE_STATE.LISTENING) {
      const spread = 35 + Math.round(audioLevel * 60);
      const alpha = 0.4 + Math.min(0.5, audioLevel * 0.6);
      return `0 0 ${spread}px rgba(99, 102, 241, ${alpha}), 0 0 ${spread * 1.6}px rgba(6, 182, 212, ${alpha * 0.7})`;
    }
    if (state === LIVE_STATE.SPEAKING) {
      const spread = 40 + Math.round(audioLevel * 50);
      return `0 0 ${spread}px rgba(6, 182, 212, 0.6), 0 0 ${spread * 1.5}px rgba(139, 92, 246, 0.5)`;
    }
    if (state === LIVE_STATE.PROCESSING) {
      return `0 0 50px rgba(139, 92, 246, 0.65), 0 0 80px rgba(99, 102, 241, 0.4)`;
    }
    if (state === LIVE_STATE.ERROR) {
      return `0 0 45px rgba(244, 63, 94, 0.55)`;
    }
    return `0 0 40px rgba(99, 102, 241, 0.4)`;
  }, [state, audioLevel]);

  // Waveform bars for listening/speaking (8 symmetric bars on each side)
  const waveBars = useMemo(() => {
    const bars = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const freq = frequencyData[i] || 0;
      let height;
      if (state === LIVE_STATE.LISTENING) {
        height = Math.max(6, Math.min(60, freq * 70 + audioLevel * 20));
      } else if (state === LIVE_STATE.SPEAKING) {
        height = Math.max(8, Math.min(65, freq * 75 + audioLevel * 30));
      } else {
        height = 6;
      }
      bars.push(height);
    }
    return bars;
  }, [frequencyData, audioLevel, state]);

  return (
    <div className={`ariyaan-live-orb-wrapper state-${state}`}>
      {/* Ambient background glow haze */}
      <div
        className="live-orb-ambient-glow"
        style={{
          transform: `scale(${reactiveScale * 1.2})`,
          opacity: state === LIVE_STATE.IDLE ? 0.35 : 0.65
        }}
      />

      {/* Ripple ring 3 (outermost) */}
      <div
        className="live-orb-ring ring-3"
        style={{
          transform: `scale(${reactiveScale * (state === LIVE_STATE.LISTENING ? 1.45 + audioLevel * 0.4 : 1.35)})`,
          opacity: state === LIVE_STATE.LISTENING ? 0.3 + audioLevel * 0.5 : 0.25
        }}
      />

      {/* Ripple ring 2 (middle) */}
      <div
        className="live-orb-ring ring-2"
        style={{
          transform: `scale(${reactiveScale * (state === LIVE_STATE.LISTENING ? 1.25 + audioLevel * 0.3 : 1.2)})`,
          opacity: state === LIVE_STATE.LISTENING ? 0.45 + audioLevel * 0.4 : 0.35
        }}
      />

      {/* Ripple ring 1 (inner rotating dashed ring) */}
      <div
        className="live-orb-ring ring-1"
        style={{
          transform: `scale(${reactiveScale * 1.08})`
        }}
      />

      {/* Orbital particle ring active during processing / thinking */}
      {state === LIVE_STATE.PROCESSING && (
        <div className="live-orb-orbital-container">
          <div className="live-orbital-particle p-1" />
          <div className="live-orbital-particle p-2" />
          <div className="live-orbital-particle p-3" />
        </div>
      )}

      {/* Core Glowing Sphere */}
      <div
        className="live-orb-core"
        style={{
          transform: `scale(${reactiveScale})`,
          boxShadow: reactiveGlow
        }}
      >
        <div className="live-orb-shimmer" />

        {/* State Icon in Core */}
        <div className="live-orb-icon-wrapper">
          {state === LIVE_STATE.PROCESSING ? (
            <Loader2 size={36} className="orb-spin-icon" />
          ) : state === LIVE_STATE.SPEAKING ? (
            <Volume2 size={34} className="orb-speaking-icon" />
          ) : state === LIVE_STATE.LISTENING ? (
            <Mic size={34} className="orb-listening-icon" />
          ) : state === LIVE_STATE.ERROR ? (
            <AlertCircle size={34} className="orb-error-icon" />
          ) : (
            <Sparkles size={34} className="orb-sparkle-icon" />
          )}
        </div>
      </div>

      {/* Symmetric Acoustic Sound Wave Bars (shown when speaking or listening) */}
      {(state === LIVE_STATE.LISTENING || state === LIVE_STATE.SPEAKING) && (
        <div className="live-acoustic-wave-container">
          <div className="live-wave-side left">
            {waveBars.map((height, idx) => (
              <span
                key={`left-${idx}`}
                className="live-wave-bar"
                style={{
                  height: `${height}px`,
                  transition: 'height 0.08s ease'
                }}
              />
            ))}
          </div>
          <div className="live-wave-spacer" />
          <div className="live-wave-side right">
            {[...waveBars].reverse().map((height, idx) => (
              <span
                key={`right-${idx}`}
                className="live-wave-bar"
                style={{
                  height: `${height}px`,
                  transition: 'height 0.08s ease'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
