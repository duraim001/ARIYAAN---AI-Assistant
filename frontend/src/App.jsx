import React from 'react';
import { ChatProvider } from './context/ChatContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';

export default function App() {
  return (
    <ChatProvider>
      <div className="app-container">
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <Header />
          <ChatInterface />
        </div>
        <SettingsModal />
        <AboutModal />
      </div>
    </ChatProvider>
  );
}
