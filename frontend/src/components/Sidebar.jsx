import React from 'react';
import { Plus, MessageSquare, Trash2, X, Sparkles, Search, Settings, Info } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export function Sidebar() {
  const {
    filteredSessions,
    searchQuery,
    setSearchQuery,
    activeSessionId,
    selectChatSession,
    deleteChatSession,
    createNewChat,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsSettingsOpen,
    setIsAboutOpen
  } = useChat();

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
          <Sparkles size={18} color="var(--accent-primary)" />
          <span>ARIYAAN Workspace</span>
        </div>
        <button
          className="icon-btn mobile-only"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: '0.85rem' }}>
        <button className="sidebar-new-chat" onClick={createNewChat}>
          <Plus size={18} />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-history">
        <div className="history-section-title">
          {searchQuery.trim() ? `Search Results (${filteredSessions.length})` : 'Recent Conversations'}
        </div>
        {filteredSessions.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            {searchQuery.trim() ? 'No matching chats found.' : 'No previous conversations. Start asking ARIYAAN questions!'}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`history-item ${activeSessionId === session.id ? 'active' : ''}`}
              onClick={() => {
                selectChatSession(session.id);
                setIsSidebarOpen(false);
              }}
            >
              <MessageSquare size={15} style={{ flexShrink: 0, marginRight: '8px', color: 'var(--accent-primary)' }} />
              <span className="history-title" title={session.title}>
                {session.title}
              </span>
              <button
                className="history-delete-btn"
                onClick={(e) => deleteChatSession(session.id, e)}
                title="Delete Conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button
          className="history-item"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={() => {
            setIsSettingsOpen(true);
            setIsSidebarOpen(false);
          }}
        >
          <Settings size={16} style={{ marginRight: '8px' }} />
          <span>System Settings</span>
        </button>
        <button
          className="history-item"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={() => {
            setIsAboutOpen(true);
            setIsSidebarOpen(false);
          }}
        >
          <Info size={16} style={{ marginRight: '8px' }} />
          <span>About ARIYAAN</span>
        </button>
      </div>
    </aside>
  );
}
