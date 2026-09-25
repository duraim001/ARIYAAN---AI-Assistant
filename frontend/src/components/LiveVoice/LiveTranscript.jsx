import React, { useRef, useEffect } from 'react';
import { MessageSquare, ChevronDown, Sparkles, User, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

/**
 * LiveTranscript – Minimal, secondary conversation history drawer.
 *
 * Shows recent exchanges without cluttering the live voice canvas.
 * Can be collapsed or expanded at any time by the user.
 */
export function LiveTranscript({ isOpen, onClose }) {
  const { messages } = useChat();
  const transcriptEndRef = useRef(null);

  // Auto-scroll to latest conversation entry when open
  useEffect(() => {
    if (isOpen && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  return (
    <div className="live-transcript-panel" role="region" aria-label="Conversation Transcript">
      <div className="live-transcript-header">
        <div className="live-transcript-title">
          <MessageSquare size={16} className="text-accent" />
          <span>Recent Conversation</span>
          <span className="live-transcript-badge">{messages.length}</span>
        </div>
        <button
          className="live-transcript-close-btn"
          onClick={onClose}
          title="Hide Transcript"
          aria-label="Close conversation transcript"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      <div className="live-transcript-body">
        {messages.length === 0 ? (
          <div className="live-transcript-empty">
            <Sparkles size={20} className="empty-sparkle" />
            <p>No conversation yet. Speak to ARIYAAN to begin!</p>
          </div>
        ) : (
          <div className="live-transcript-entries">
            {messages.slice(-8).map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`live-transcript-entry ${isUser ? 'entry-user' : 'entry-assistant'}`}
                >
                  <div className="live-transcript-speaker">
                    {isUser ? (
                      <>
                        <User size={12} />
                        <span>You</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>ARIYAAN</span>
                      </>
                    )}
                    <span className="entry-timestamp">{msg.timestamp}</span>
                  </div>
                  <div className="live-transcript-text">
                    {msg.content}
                  </div>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
