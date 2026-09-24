import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, Check, RefreshCw, AlertCircle, Cpu, Sliders, Trash2, Download } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { testGeminiApiKey } from '../services/api';

export function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    settings,
    updateSettings,
    sessions,
    clearAllSessions,
    healthStatus,
    checkHealth
  } = useChat();

  const [activeTab, setActiveTab] = useState('api'); // 'api' | 'ai' | 'appearance' | 'data'
  const [apiKeyInput, setApiKeyInput] = useState(settings.customApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isSettingsOpen) return null;

  const handleSaveKey = () => {
    updateSettings({ customApiKey: apiKeyInput.trim() });
    setTestResult({ success: true, message: 'API key saved to session.' });
    checkHealth();
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testGeminiApiKey(apiKeyInput.trim() || undefined);
    setTesting(false);
    if (result.success) {
      setTestResult({
        success: true,
        message: 'Connection Successful! Gemini API key is valid and active.'
      });
    } else {
      setTestResult({
        success: false,
        message: result.error?.userMessage || 'Failed to connect with provided API key.'
      });
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ARIYAAN_Chat_History_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sliders size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.2rem' }}>ARIYAAN Control Center</h2>
          </div>
          <button className="icon-btn" onClick={() => setIsSettingsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Header Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
          <button
            onClick={() => setActiveTab('api')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'api' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'api' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'api' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Gemini API
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'ai' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'ai' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'ai' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            AI Engine
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'appearance' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'appearance' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'appearance' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Theme
          </button>

          <button
            onClick={() => setActiveTab('data')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'data' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'data' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'data' ? '700' : '500',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Data
          </button>
        </div>

        <div className="modal-body">
          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="setting-group">
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Google Gemini API Configuration
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Connect ARIYAAN to Google Gemini AI service. The API key is loaded server-side from your <code>.env</code> configuration file or can be overridden below for session testing.
              </p>

              <div className="setting-group" style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <label className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={16} color="var(--accent-primary)" />
                  <span>Gemini API Key</span>
                </label>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type={showKey ? 'text' : 'password'}
                    className="setting-input"
                    placeholder="PASTE_YOUR_GEMINI_API_KEY_HERE"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setShowKey(!showKey)}
                    title={showKey ? 'Hide Key' : 'Show Key'}
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="btn-primary-sm" onClick={handleSaveKey}>
                    <Check size={16} />
                    <span>Save Key</span>
                  </button>

                  <button
                    className="icon-btn"
                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    onClick={handleTestKey}
                    disabled={testing}
                  >
                    {testing ? <RefreshCw size={14} className="spin-slow" /> : null}
                    <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      fontSize: '0.85rem',
                      color: testResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Engine Tab */}
          {activeTab === 'ai' && (
            <div className="setting-group" style={{ gap: '1.25rem' }}>
              <div className="setting-group">
                <label className="setting-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={16} color="var(--accent-primary)" />
                  <span>Generative Gemini Model</span>
                </label>
                <select
                  className="setting-select"
                  value={settings.model}
                  onChange={(e) => updateSettings({ model: e.target.value })}
                >
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (Fast & Recommended)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Lightweight)</option>
                  <option value="gemini-flash-lite-latest">Gemini Flash-Lite Latest (Stable Auto)</option>
                </select>
              </div>

              <div className="setting-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="setting-label">Creativity / Temperature</label>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                    {settings.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer', margin: '0.5rem 0' }}
                />
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Lower values (0.2) produce deterministic answers for programming/math. Higher values (0.8) increase creative writing variability.
                </span>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="setting-group">
              <label className="setting-label">Visual Interface Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '0.5rem' }}>
                <div
                  className={`suggestion-card ${settings.theme === 'dark' ? 'active' : ''}`}
                  style={{
                    border: settings.theme === 'dark' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    padding: '1.25rem',
                    textAlign: 'center'
                  }}
                  onClick={() => updateSettings({ theme: 'dark' })}
                >
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Dark Mode (Default)
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Deep intelligent space background with frosted glassmorphism.
                  </span>
                </div>

                <div
                  className={`suggestion-card ${settings.theme === 'light' ? 'active' : ''}`}
                  style={{
                    border: settings.theme === 'light' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    padding: '1.25rem',
                    textAlign: 'center'
                  }}
                  onClick={() => updateSettings({ theme: 'light' })}
                >
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Light Mode
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Clean high-contrast daytime interface.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="setting-group" style={{ gap: '1rem' }}>
              <div className="setting-group">
                <label className="setting-label">Export Conversations</label>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Download a complete backup JSON file containing all saved ARIYAAN chat threads.
                </p>
                <button
                  className="btn-primary-sm"
                  style={{ width: 'fit-content', marginTop: '0.5rem' }}
                  onClick={handleExportJSON}
                >
                  <Download size={16} />
                  <span>Export Chat History JSON</span>
                </button>
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: '0.5rem 0' }} />

              <div className="setting-group">
                <label className="setting-label" style={{ color: 'var(--accent-rose)' }}>Danger Zone</label>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Clear all local storage conversation threads. This action cannot be undone.
                </p>
                <button
                  className="btn-primary-sm"
                  style={{ background: 'var(--accent-rose)', width: 'fit-content', marginTop: '0.5rem' }}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all conversation threads?')) {
                      clearAllSessions();
                      setIsSettingsOpen(false);
                    }
                  }}
                >
                  <Trash2 size={16} />
                  <span>Clear All Conversations</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
