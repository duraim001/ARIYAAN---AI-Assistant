/**
 * ARIYAAN Voice Dataset Recorder
 *
 * A browser-based utility to record your personal voice dataset.
 * Recordings are saved as WAV files with the naming convention:
 *   <category>/<command_slug>_<attempt_number>.wav
 *
 * This is a standalone React component – mount it at /dataset-recorder
 * or open dataset_recorder.html directly.
 *
 * Usage:
 *   1. Select a command from the list
 *   2. Click "Record" and speak the command clearly
 *   3. Click "Stop" when done
 *   4. Click "Download WAV" to save the file
 *   5. Repeat 3–5 times per command for variety
 *
 * Target: 30–50 commands × 3–5 recordings each = ~150–250 samples
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Dataset Command Definitions ─────────────────────────────────────────────
export const DATASET_COMMANDS = [
  // Greetings
  { category: 'greetings', id: 'hello',        text: 'Hello ARIYAAN',           hint: 'Warm greeting' },
  { category: 'greetings', id: 'hi',            text: 'Hi ARIYAAN',              hint: 'Casual greeting' },
  { category: 'greetings', id: 'good_morning',  text: 'Good morning ARIYAAN',    hint: 'Morning greeting' },
  { category: 'greetings', id: 'good_evening',  text: 'Good evening ARIYAAN',    hint: 'Evening greeting' },
  { category: 'greetings', id: 'hey',           text: 'Hey ARIYAAN',             hint: 'Casual greeting' },

  // Assistant identity
  { category: 'assistant', id: 'what_is_name',  text: 'What is your name?',      hint: 'Identity question' },
  { category: 'assistant', id: 'who_are_you',   text: 'Who are you?',            hint: 'Identity question' },
  { category: 'assistant', id: 'what_can_do',   text: 'What can you do?',        hint: 'Capability question' },
  { category: 'assistant', id: 'help',           text: 'Help me',                 hint: 'Help request' },
  { category: 'assistant', id: 'introduce',      text: 'Introduce yourself',      hint: 'Introduction request' },

  // Time & Date
  { category: 'time',      id: 'what_time',     text: 'What is the time?',       hint: 'Current time' },
  { category: 'time',      id: 'current_time',  text: 'Tell me the current time', hint: 'Current time' },
  { category: 'time',      id: 'what_date',     text: 'What is today\'s date?',   hint: 'Current date' },
  { category: 'time',      id: 'what_day',      text: 'What day is it today?',   hint: 'Day of week' },

  // System / App commands
  { category: 'system',    id: 'open_chrome',   text: 'Open Chrome',             hint: 'Launch Chrome browser' },
  { category: 'system',    id: 'launch_chrome',  text: 'Launch Google Chrome',    hint: 'Launch Chrome browser' },
  { category: 'system',    id: 'open_calculator',text: 'Open Calculator',         hint: 'Launch calculator' },
  { category: 'system',    id: 'open_notepad',  text: 'Open Notepad',            hint: 'Launch text editor' },
  { category: 'system',    id: 'open_explorer', text: 'Open File Explorer',      hint: 'Launch file manager' },
  { category: 'system',    id: 'open_settings', text: 'Open settings',           hint: 'ARIYAAN settings' },

  // General questions
  { category: 'general',   id: 'tell_joke',     text: 'Tell me a joke',          hint: 'Humor request' },
  { category: 'general',   id: 'weather',       text: 'What is the weather today?', hint: 'Weather question' },
  { category: 'general',   id: 'news',          text: 'Tell me the latest news', hint: 'News request' },
  { category: 'general',   id: 'capital_india', text: 'What is the capital of India?', hint: 'Geography' },
  { category: 'general',   id: 'explain_ai',    text: 'Explain artificial intelligence', hint: 'Tech explanation' },

  // Conversation control
  { category: 'control',   id: 'repeat',        text: 'Can you repeat that?',    hint: 'Repetition request' },
  { category: 'control',   id: 'stop',          text: 'Stop',                    hint: 'Stop command' },
  { category: 'control',   id: 'thank_you',     text: 'Thank you',               hint: 'Gratitude' },
  { category: 'control',   id: 'thanks_ariyaan',text: 'Thank you ARIYAAN',       hint: 'Gratitude with name' },
  { category: 'control',   id: 'goodbye',       text: 'Goodbye ARIYAAN',         hint: 'Farewell' },
  { category: 'control',   id: 'bye',           text: 'Bye ARIYAAN',             hint: 'Short farewell' },
  { category: 'control',   id: 'exit',          text: 'Exit',                    hint: 'Exit command' },

  // Tamil-English (future – recording for future dataset)
  { category: 'future_tamil', id: 'vanakkam',   text: 'Vanakkam ARIYAAN',        hint: 'Tamil greeting (future)' },
];

const MAX_RECORDINGS_PER_COMMAND = 5;

/**
 * Simple WAV encoder for raw PCM Float32 data
 */
function encodeWAV(samples, sampleRate) {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  const clamp = (v) => Math.max(-1, Math.min(1, v));

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);       // PCM
  view.setUint16(20, 1, true);        // linear PCM
  view.setUint16(22, 1, true);        // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = clamp(samples[i]);
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }
  return buffer;
}

// ─── Dataset Recorder React Component ─────────────────────────────────────────
export function DatasetRecorder() {
  const [selectedCommand, setSelectedCommand] = useState(DATASET_COMMANDS[0]);
  const [recordingState, setRecordingState] = useState('idle'); // 'idle' | 'recording' | 'done'
  const [countdown, setCountdown] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [recordings, setRecordings] = useState({}); // { commandId: number }
  const [lastBlob, setLastBlob] = useState(null);
  const [lastFilename, setLastFilename] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const countdownRef = useRef(null);

  // Load saved recording counts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ARIYAAN_DATASET_COUNTS');
      if (saved) setRecordings(JSON.parse(saved));
    } catch {}
  }, []);

  const saveCount = (cmdId, count) => {
    const updated = { ...recordings, [cmdId]: count };
    setRecordings(updated);
    localStorage.setItem('ARIYAAN_DATASET_COUNTS', JSON.stringify(updated));
  };

  const getCount = (cmdId) => recordings[cmdId] || 0;

  const startRecording = useCallback(async () => {
    if (recordingState !== 'idle') return;

    const count = getCount(selectedCommand.id);
    if (count >= MAX_RECORDINGS_PER_COMMAND) {
      setStatusMsg(`✅ Already recorded ${MAX_RECORDINGS_PER_COMMAND} samples for this command. Move to the next!`);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
      setRecordingState('recording');
      setStatusMsg('🔴 Recording... Speak clearly!');

      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setRecordingState('done');

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const newCount = count + 1;
        const filename = `${selectedCommand.category}/${selectedCommand.id}_${String(newCount).padStart(2, '0')}.wav`;
        setLastFilename(filename);

        // Convert to WAV via AudioContext
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioCtx = new AudioContext();
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          const samples = decoded.getChannelData(0);
          const wavBuffer = encodeWAV(samples, decoded.sampleRate);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          setLastBlob(wavBlob);
          setStatusMsg(`✅ Recording complete! Download as: ${filename}`);
          saveCount(selectedCommand.id, newCount);
          await audioCtx.close();
        } catch (err) {
          // Fallback: offer webm download
          setLastBlob(blob);
          setLastFilename(`${selectedCommand.category}/${selectedCommand.id}_${String(newCount).padStart(2, '0')}.webm`);
          setStatusMsg('✅ Recording complete (WebM format – WAV conversion failed).');
          saveCount(selectedCommand.id, newCount);
        }
      };

      mr.start();

      // Auto-stop after 4 seconds
      countdownRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 4000);

    } catch (err) {
      setRecordingState('idle');
      if (err.name === 'NotAllowedError') {
        setStatusMsg('❌ Microphone permission denied. Please allow microphone access.');
      } else {
        setStatusMsg(`❌ Error: ${err.message}`);
      }
    }
  }, [recordingState, selectedCommand, recordings]);

  const stopRecording = useCallback(() => {
    clearTimeout(countdownRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const downloadRecording = () => {
    if (!lastBlob) return;
    const url = URL.createObjectURL(lastBlob);
    const a = document.createElement('a');
    // Extract just filename for browser download (subfolder is noted in UI)
    a.href = url;
    a.download = lastFilename.replace('/', '_');
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg(`📁 Saved! Place in: training/dataset/${lastFilename}`);
  };

  const resetToRecord = () => {
    setRecordingState('idle');
    setLastBlob(null);
    setStatusMsg('');
  };

  const categories = ['all', ...new Set(DATASET_COMMANDS.map(c => c.category))];
  const filteredCommands = filterCategory === 'all'
    ? DATASET_COMMANDS
    : DATASET_COMMANDS.filter(c => c.category === filterCategory);

  const completedCommands = DATASET_COMMANDS.filter(c => getCount(c.id) >= 3).length;
  const totalProgress = Math.round((completedCommands / DATASET_COMMANDS.length) * 100);

  return (
    <div className="dataset-recorder" style={{
      maxWidth: '860px', margin: '0 auto', padding: '2rem 1rem',
      fontFamily: 'var(--font-sans)', color: 'var(--text-primary)'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => { window.location.href = window.location.pathname; }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Return to ARIYAAN Assistant
          </button>
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🎙️ ARIYAAN Voice Dataset Recorder
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.6' }}>
          Record your personal English voice samples for future personalized recognition.
          Target: <strong>3–5 recordings per command.</strong>
        </p>

        {/* Overall Progress */}
        <div style={{ marginTop: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dataset Progress</span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
              {completedCommands}/{DATASET_COMMANDS.length} commands ≥3 samples ({totalProgress}%)
            </span>
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', height: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${totalProgress}%`, background: 'var(--accent-gradient)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left: Command List */}
        <div>
          <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '600',
                  border: '1px solid var(--border-color)',
                  background: filterCategory === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: filterCategory === cat ? '#fff' : 'var(--text-secondary)', cursor: 'pointer'
                }}
              >{cat}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '480px', overflowY: 'auto' }}>
            {filteredCommands.map(cmd => {
              const count = getCount(cmd.id);
              const isSelected = selectedCommand.id === cmd.id;
              const isDone = count >= MAX_RECORDINGS_PER_COMMAND;
              return (
                <button
                  key={cmd.id}
                  onClick={() => { setSelectedCommand(cmd); resetToRecord(); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', textAlign: 'left',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-tertiary)',
                    color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: isSelected ? '700' : '500'
                  }}
                >
                  <span>"{cmd.text}"</span>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: '700', padding: '0.1rem 0.5rem',
                    borderRadius: 'var(--radius-full)', flexShrink: 0, marginLeft: '0.5rem',
                    background: isDone ? 'var(--accent-emerald)' : count >= 3 ? 'var(--accent-primary)' : 'var(--bg-card)',
                    color: count > 0 ? '#fff' : 'var(--text-muted)'
                  }}>
                    {count}/{MAX_RECORDINGS_PER_COMMAND}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Recorder Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              {selectedCommand.category}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem' }}>
              "{selectedCommand.text}"
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{selectedCommand.hint}</div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Recordings: <strong style={{ color: 'var(--accent-primary)' }}>{getCount(selectedCommand.id)}/{MAX_RECORDINGS_PER_COMMAND}</strong>
              &nbsp;·&nbsp;Target filename: <code style={{ background: 'var(--bg-card)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                training/dataset/{selectedCommand.category}/{selectedCommand.id}_{String(getCount(selectedCommand.id) + 1).padStart(2, '0')}.wav
              </code>
            </div>

            {recordingState === 'idle' && (
              <button
                onClick={startRecording}
                disabled={getCount(selectedCommand.id) >= MAX_RECORDINGS_PER_COMMAND}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-gradient)', border: 'none', color: '#fff',
                  fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                  opacity: getCount(selectedCommand.id) >= MAX_RECORDINGS_PER_COMMAND ? 0.5 : 1
                }}
              >
                🎤 Start Recording
              </button>
            )}

            {recordingState === 'recording' && (
              <button
                onClick={stopRecording}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-rose)', border: 'none', color: '#fff',
                  fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                  animation: 'mic-pulse 1.4s ease-in-out infinite'
                }}
              >
                ⏹ Stop Recording (auto-stops in 4s)
              </button>
            )}

            {recordingState === 'done' && lastBlob && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <audio src={URL.createObjectURL(lastBlob)} controls style={{ width: '100%' }} />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={downloadRecording}
                    style={{
                      flex: 1, padding: '0.7rem', borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-emerald)', border: 'none', color: '#fff',
                      fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer'
                    }}
                  >📥 Download WAV</button>
                  <button
                    onClick={resetToRecord}
                    style={{
                      flex: 1, padding: '0.7rem', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer'
                    }}
                  >🔄 Record Again</button>
                </div>
              </div>
            )}

            {statusMsg && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {statusMsg}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Tips for good recordings:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
              <li>Speak naturally in your normal tone</li>
              <li>Record in a quiet room</li>
              <li>Vary your speed and pitch slightly between recordings</li>
              <li>Say the full phrase (don't truncate)</li>
              <li>Save each WAV into: <code>training/dataset/&lt;category&gt;/</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
