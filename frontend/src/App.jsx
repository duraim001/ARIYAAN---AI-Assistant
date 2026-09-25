import React from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { DatasetRecorder } from './voice/DatasetRecorder';
import { AriyaanLiveScreen } from './components/LiveVoice/AriyaanLiveScreen';

// Show the dataset recorder when URL contains ?recorder
const isRecorderMode = new URLSearchParams(window.location.search).has('recorder');

function AppContent() {
  const { activeView } = useChat();

  return (
    <div className="app-container">
      {activeView === 'live' ? (
        <AriyaanLiveScreen />
      ) : (
        <>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <Header />
            <ChatInterface />
          </div>
        </>
      )}
      <SettingsModal />
      <AboutModal />
    </div>
  );
}

export default function App() {
  if (isRecorderMode) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem', overflowY: 'auto' }}>
        <DatasetRecorder />
      </div>
    );
  }

  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

