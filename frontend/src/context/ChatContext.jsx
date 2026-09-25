import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { sendChatMessage, fetchHealthStatus } from '../services/api';
import { useVoiceController } from '../voice/useVoiceController';

const ChatContext = createContext();

const STORAGE_KEY_SESSIONS = 'ARIYAAN_CHAT_SESSIONS_V1';
const STORAGE_KEY_SETTINGS = 'ARIYAAN_SETTINGS_V1';

const DEFAULT_SETTINGS = {
  model: 'gemini-3.5-flash-lite',
  temperature: 0.7,
  theme: 'dark',
  customApiKey: ''
};

export function ChatProvider({ children }) {
  // Load initial settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Load initial sessions
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeView, setActiveView] = useState('chat'); // 'chat' | 'live'
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle'); // 'idle' | 'thinking' | 'responding' | 'error'
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const liveTTSListenerRef = useRef(null);

  // Apply Theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Save Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Save Sessions to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  // Check Health & API key on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    const status = await fetchHealthStatus();
    setHealthStatus(status);
    if (!status.keyConfigured && !settings.customApiKey) {
      setAiStatus('error');
      setError({
        code: 'MISSING_API_KEY',
        userMessage: 'Gemini API key is not configured. Please add your Gemini API key in Settings or the project environment configuration (.env).'
      });
    } else {
      setAiStatus('idle');
    }
  };

  // Start a new chat session
  const createNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setError(null);
    setAiStatus('idle');
  };

  // Select an existing session
  const selectChatSession = (id) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages || []);
      setError(null);
      setAiStatus('idle');
    }
  };

  // Delete a chat session
  const deleteChatSession = (id, e) => {
    if (e) e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id) {
      createNewChat();
    }
  };

  // Clear all sessions
  const clearAllSessions = () => {
    setSessions([]);
    createNewChat();
  };

  // Filtered sessions based on search query
  const filteredSessions = sessions.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatches = s.title && s.title.toLowerCase().includes(q);
    const contentMatches = s.messages && s.messages.some(m => m.content && m.content.toLowerCase().includes(q));
    return titleMatches || contentMatches;
  });

  // Helper to generate concise titles from first prompt
  const generateTitle = (text) => {
    const cleaned = text.trim();
    if (cleaned.length <= 32) return cleaned;
    return cleaned.slice(0, 32) + '...';
  };

  // Send a user message to ARIYAAN
  const voiceRef = useRef(null);

  // Send a user message to ARIYAAN (from typed chat or voice)
  const sendMessage = async (userText, fromVoice = false) => {
    console.log('[ARIYAAN ChatContext] sendMessage called:', userText, 'fromVoice:', fromVoice);
    if (!userText || !userText.trim() || isLoading) return;

    setError(null);
    setAiStatus('thinking');
    const userMessageObj = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: userText.trim(),
      fromVoice,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessageObj];
    setMessages(newMessages);
    setIsLoading(true);

    // Format history for context (role + content)
    const historyForBackend = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    setAiStatus('responding');
    console.log('[ARIYAAN ChatContext] Sending to backend /api/chat...');
    const response = await sendChatMessage({
      message: userText.trim(),
      history: historyForBackend,
      model: settings.model,
      temperature: settings.temperature,
      apiKey: settings.customApiKey || undefined
    });

    setIsLoading(false);

    if (!response.success) {
      console.warn('[ARIYAAN ChatContext] Error from backend:', response.error);
      setAiStatus('error');
      setError(response.error);
      return;
    }

    console.log('[ARIYAAN ChatContext] Response received from Gemini:', response.text?.slice(0, 60));
    setAiStatus('idle');
    const assistantMessageObj = {
      id: 'msg-' + (Date.now() + 1),
      role: 'assistant',
      content: response.text,
      modelUsed: response.modelUsed || settings.model,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      _speakOnAdd: fromVoice
    };

    const updatedMessages = [...newMessages, assistantMessageObj];
    setMessages(updatedMessages);

    // Speak reply immediately if triggered by voice and voice output is enabled
    if (fromVoice && voiceRef.current?.voiceSettings?.voiceOutputEnabled) {
      console.log('[ARIYAAN ChatContext] Speaking reply via TTS...');
      voiceRef.current.speakResponse(response.text, {
        onEnd: () => {
          if (liveTTSListenerRef.current) {
            liveTTSListenerRef.current();
          }
        },
        onError: () => {
          if (liveTTSListenerRef.current) {
            liveTTSListenerRef.current();
          }
        }
      });
    } else if (fromVoice) {
      // If voice output is not enabled or not supported, notify live listener immediately
      if (liveTTSListenerRef.current) {
        liveTTSListenerRef.current();
      }
    }

    // Update or create chat session in sidebar history
    let currentId = activeSessionId;
    if (!currentId) {
      currentId = 'session-' + Date.now();
      setActiveSessionId(currentId);
      const newSession = {
        id: currentId,
        title: generateTitle(userText),
        createdAt: new Date().toLocaleDateString(),
        messages: updatedMessages
      };
      setSessions(prev => [newSession, ...prev]);
    } else {
      setSessions(prev =>
        prev.map(s => s.id === currentId ? { ...s, messages: updatedMessages } : s)
      );
    }

    return response;
  };

  // Regenerate last response
  const regenerateResponse = async () => {
    if (isLoading || messages.length === 0) return;
    // Find last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    // Filter out the trailing assistant message if present
    let trimmedMessages = [...messages];
    if (trimmedMessages[trimmedMessages.length - 1].role === 'assistant') {
      trimmedMessages.pop();
    }
    setMessages(trimmedMessages);
    
    // Resend
    setIsLoading(true);
    setAiStatus('responding');
    setError(null);

    const historyForBackend = trimmedMessages.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await sendChatMessage({
      message: lastUserMsg.content,
      history: historyForBackend,
      model: settings.model,
      temperature: settings.temperature,
      apiKey: settings.customApiKey || undefined
    });

    setIsLoading(false);

    if (!response.success) {
      setAiStatus('error');
      setError(response.error);
      return;
    }

    setAiStatus('idle');
    const newAssistantMsg = {
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: response.text,
      modelUsed: response.modelUsed || settings.model,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...trimmedMessages, newAssistantMsg];
    setMessages(updatedMessages);

    if (activeSessionId) {
      setSessions(prev =>
        prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages } : s)
      );
    }
  };

  const updateSettings = (newFields) => {
    setSettings(prev => ({ ...prev, ...newFields }));
    setError(null);
  };

  // ─── Voice Controller ─────────────────────────────────────────────────────
  const voice = useVoiceController({
    sendMessage: (text) => sendMessage(text, true),
    onVoiceError: (msg) => {
      console.warn('[ARIYAAN Voice Error]', msg);
    }
  });
  voiceRef.current = voice;

  // ─── Live Voice Screen Controls ──────────────────────────────────────────
  const openLiveVoice = useCallback(() => {
    setActiveView('live');
  }, []);

  const closeLiveVoice = useCallback(() => {
    if (voiceRef.current) {
      voiceRef.current.stopVoice();
    }
    setActiveView('chat');
  }, []);

  const registerLiveTTSListener = useCallback((callback) => {
    liveTTSListenerRef.current = callback;
    return () => {
      if (liveTTSListenerRef.current === callback) {
        liveTTSListenerRef.current = null;
      }
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        settings,
        updateSettings,
        sessions,
        filteredSessions,
        searchQuery,
        setSearchQuery,
        activeSessionId,
        activeView,
        setActiveView,
        openLiveVoice,
        closeLiveVoice,
        registerLiveTTSListener,
        messages,
        isLoading,
        aiStatus,
        error,
        setError,
        createNewChat,
        selectChatSession,
        deleteChatSession,
        clearAllSessions,
        sendMessage,
        sendMessageWithVoice: sendMessage,
        regenerateResponse,
        isSidebarOpen,
        setIsSidebarOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isAboutOpen,
        setIsAboutOpen,
        healthStatus,
        checkHealth,
        // Voice
        voice
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
