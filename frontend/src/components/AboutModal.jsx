import React from 'react';
import { X, Sparkles, Server, Layout, Cpu, ShieldCheck, BookOpen } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export function AboutModal() {
  const { isAboutOpen, setIsAboutOpen } = useChat();

  if (!isAboutOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsAboutOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo" style={{ width: '34px', height: '34px' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', lineHeight: '1.2' }}>ARIYAAN</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Final-Year Project Architecture & Brand Identity</span>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setIsAboutOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>ARIYAAN</h3>
            <p style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.975rem' }}>
              Your Intelligent Personal AI Assistant
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
              "From Knowledge to Understanding" &bull; "அறிவிலிருந்து புரிதலுக்கு"
            </p>
          </div>

          {/* Name Etymology & Rationale Card */}
          <div className="suggestion-card" style={{ padding: '1rem 1.25rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: '700', color: 'var(--accent-primary)', fontSize: '0.95rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} />
              <span>Name Etymology & Identity: Arivudayaan (அறிவுடையான்)</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.4rem', background: 'var(--bg-tertiary)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
              Arivu + Udayaan = Arivudayaan &bull; அறிவு + உடையான் = அறிவுடையான்
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.55' }}>
              Inspired by the Tamil concept of <strong>Arivudayaan</strong> ("one who possesses knowledge"). <strong>Arivu (அறிவு)</strong> represents knowledge, intelligence & wisdom, while <strong>Udayaan (உடையான்)</strong> refers to one who possesses a trait. ARIYAAN is designed to guide users along the journey: <em>Knowledge &rarr; Understanding &rarr; Assistance</em>.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Implemented Technologies
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="suggestion-card" style={{ padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                  <Cpu size={18} />
                  <strong>AI Engine</strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Google Gemini API (Official <code>@google/generative-ai</code> SDK)
                </span>
              </div>

              <div className="suggestion-card" style={{ padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
                  <Layout size={18} />
                  <strong>Frontend</strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  React 18 + Vite + Glassmorphism Design System
                </span>
              </div>

              <div className="suggestion-card" style={{ padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
                  <Server size={18} />
                  <strong>Backend</strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Node.js + Express REST API Proxy Server
                </span>
              </div>

              <div className="suggestion-card" style={{ padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                  <ShieldCheck size={18} />
                  <strong>Security</strong>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Server-side API Key Isolation (<code>.env</code> configuration)
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Demonstrated Academic Concepts
            </h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              <li>Generative AI & Large Language Model (LLM) Integration</li>
              <li>Multi-turn Conversational Context Management</li>
              <li>Client-Server Security & Environment Secret Isolation</li>
              <li>Markdown & Code Syntax Highlighting Engine</li>
              <li>Responsive Web UI Design & State Architecture</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
