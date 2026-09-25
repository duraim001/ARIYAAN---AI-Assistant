import React from 'react';
import { Sparkles, Plus, Settings, Info, Sun, Moon, Menu, Radio } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export function Header() {
  const {
    settings,
    updateSettings,
    createNewChat,
    openLiveVoice,
    setIsSettingsOpen,
    setIsAboutOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    aiStatus,
    error
  } = useChat();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  // Determine label & class for status pill
  const getStatusDetails = () => {
    if (error) {
      return { class: 'error', label: 'Attention required' };
    }
    switch (aiStatus) {
      case 'thinking':
        return { class: 'thinking', label: 'ARIYAAN is thinking...' };
      case 'responding':
        return { class: 'responding', label: 'ARIYAAN is responding...' };
      default:
        return { class: 'idle', label: 'ARIYAAN is ready' };
    }
  };

  const statusInfo = getStatusDetails();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="icon-btn mobile-only"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Sidebar Menu"
        >
          <Menu size={20} />
        </button>

        <div className="brand-badge" onClick={createNewChat} title="ARIYAAN - Go to Home / New Chat">
          <div className="brand-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="brand-title">ARIYAAN</div>
            <span className="brand-tagline">Your Intelligent Personal AI Assistant</span>
          </div>
        </div>

        <div className={`ai-status-pill ${statusInfo.class}`} title="AI System Status">
          <div className="status-dot" />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="btn-live-voice"
          onClick={openLiveVoice}
          title="Open ARIYAAN Live Voice Assistant"
          aria-label="Open ARIYAAN Live Voice"
        >
          <span className="btn-live-voice-pulse" />
          <Radio size={16} />
          <span>Live Voice</span>
        </button>

        <button className="btn-primary-sm" onClick={createNewChat} title="Start a New Conversation">
          <Plus size={16} />
          <span>New Chat</span>
        </button>

        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="icon-btn"
          onClick={() => setIsSettingsOpen(true)}
          title="ARIYAAN Settings"
        >
          <Settings size={18} />
        </button>

        <button
          className="icon-btn"
          onClick={() => setIsAboutOpen(true)}
          title="About ARIYAAN"
        >
          <Info size={18} />
        </button>
      </div>
    </header>
  );
}
