import React, { useMemo, useState } from 'react';
import { Bot, User, Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { useChat } from '../context/ChatContext';

// Configure marked with highlight.js syntax highlighting
marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true
});

export function MessageBubble({ message }) {
  const { regenerateResponse, isLoading, settings, voice } = useChat();
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null); // true | false | null
  const [isSpeaking, setIsSpeaking] = useState(false);

  const parsedMarkdown = useMemo(() => {
    if (isUser) return null;
    try {
      return marked.parse(message.content || '');
    } catch {
      return message.content;
    }
  }, [message.content, isUser]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!voice) return;
    if (isSpeaking) {
      voice.stopVoice();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voice.speakResponse(message.content);
      // Reset flag when TTS finishes (detected via voice state becoming idle)
    }
  };

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="avatar assistant">
          <Sparkles size={20} />
        </div>
      )}

      <div className="message-bubble">
        {!isUser && (
          <div className="assistant-identity-bar">
            <div className="assistant-identity">
              <span style={{ fontSize: '1.1rem' }}>◉</span>
              <span>ARIYAAN</span>
            </div>
            <span className="model-badge">
              {message.modelUsed || settings.model}
            </span>
          </div>
        )}

        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{message.content}</div>
        ) : (
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: parsedMarkdown }}
          />
        )}

        <div className="message-footer" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '0.75rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          fontSize: '0.75rem',
          color: isUser ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)'
        }}>
          <span>{message.timestamp}</span>

          {!isUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleCopyMessage}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copied ? 'var(--accent-emerald)' : 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'color 0.15s ease'
                }}
                title="Copy response to clipboard"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={regenerateResponse}
                disabled={isLoading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: isLoading ? 0.5 : 1
                }}
                title="Regenerate ARIYAAN response"
              >
                <RefreshCw size={13} className={isLoading ? 'spin-slow' : ''} />
                <span>Retry</span>
              </button>

              {/* Speak this response button */}
              {voice?.ttsSupported && voice?.voiceSettings?.voiceOutputEnabled && (
                <button
                  className={`speak-response-btn ${isSpeaking ? 'active' : ''}`}
                  onClick={handleSpeak}
                  title={isSpeaking ? 'Stop speaking' : 'Speak this response'}
                >
                  {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span>{isSpeaking ? 'Stop' : 'Speak'}</span>
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                <button
                  onClick={() => setLiked(liked === true ? null : true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: liked === true ? 'var(--accent-primary)' : 'inherit',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  title="Helpful response"
                >
                  <ThumbsUp size={13} />
                </button>
                <button
                  onClick={() => setLiked(liked === false ? null : false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: liked === false ? 'var(--accent-rose)' : 'inherit',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  title="Not helpful"
                >
                  <ThumbsDown size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="avatar user">
          <User size={18} />
        </div>
      )}
    </div>
  );
}
