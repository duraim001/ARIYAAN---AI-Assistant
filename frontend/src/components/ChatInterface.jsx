import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Settings } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { MessageBubble } from './MessageBubble';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatInput } from './ChatInput';

export function ChatInterface() {
  const { messages, error, setIsSettingsOpen } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, error]);

  return (
    <div className="main-content">
      <div className="chat-body">
        {error && (
          <div className="error-banner" style={{ maxWidth: '860px', margin: '0 auto 1rem auto' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <strong style={{ display: 'block', marginBottom: '2px' }}>
                {error.code || 'Attention Required'}
              </strong>
              <span>{error.userMessage}</span>
            </div>
            {error.code === 'MISSING_API_KEY' || error.code === 'INVALID_API_KEY' ? (
              <button
                className="btn-primary-sm"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings size={14} />
                <span>Open Settings</span>
              </button>
            ) : null}
          </div>
        )}

        {messages.length === 0 ? (
          <WelcomeScreen />
        ) : (
          <div className="chat-thread">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  );
}
