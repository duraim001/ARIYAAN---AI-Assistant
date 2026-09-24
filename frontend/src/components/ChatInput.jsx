import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Paperclip, X, Zap, CornerDownLeft } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export function ChatInput() {
  const { sendMessage, isLoading, aiStatus } = useChat();
  const [text, setText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef(null);

  // Quick prompt templates
  const templatePrompts = [
    { title: 'Explain Code', text: 'Explain the following code step by step:' },
    { title: 'Debug Error', text: 'Analyze and fix the following error trace:' },
    { title: 'Summarize Text', text: 'Summarize the key points from the following text:' },
    { title: 'Project Rationale', text: 'Explain why the ARIYAAN project uses React, Node.js, and Google Gemini API.' }
  ];

  // Auto resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    sendMessage(text);
    setText('');
    setShowTemplates(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  const insertTemplate = (templateText) => {
    setText(templateText + ' ');
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="input-container">
      {/* Active AI Status Overlay during generation */}
      {isLoading && (
        <div className="input-box" style={{ marginBottom: '0.65rem', padding: '0.6rem 1rem' }}>
          <div className="thinking-indicator">
            <Sparkles size={18} className="spin-slow" />
            <span>
              {aiStatus === 'responding' ? 'ARIYAAN is generating response...' : 'ARIYAAN is processing your request...'}
            </span>
            <div className="dot-pulse">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Prompt Templates Popup */}
      {showTemplates && (
        <div className="input-box" style={{ marginBottom: '0.5rem', padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Prompt Templates
            </span>
            <button className="input-tool-btn" onClick={() => setShowTemplates(false)}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {templatePrompts.map((tmpl, i) => (
              <button
                key={i}
                className="input-tool-btn"
                style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                onClick={() => insertTemplate(tmpl.text)}
              >
                <Zap size={14} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{tmpl.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="input-box">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Ask ARIYAAN anything..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />

        <div className="input-actions">
          <div className="input-tools">
            <button
              className="input-tool-btn"
              onClick={() => setShowTemplates(!showTemplates)}
              title="Quick Prompt Templates"
            >
              <Zap size={15} />
              <span className="mobile-only" style={{ display: 'none' }}>Templates</span>
            </button>

            {text.trim().length > 0 && (
              <button
                className="input-tool-btn"
                onClick={() => setText('')}
                title="Clear Text"
              >
                <X size={15} />
                <span>Clear</span>
              </button>
            )}

            <span className="input-hint" style={{ marginLeft: '0.5rem' }}>
              {text.trim().length > 0 ? `${text.trim().length} chars` : ''}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="input-hint mobile-only" style={{ display: 'none' }}>
              Shift + Enter for new line
            </span>

            <button
              className="send-btn"
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              title="Send Question to ARIYAAN (Enter)"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
