import React from 'react';
import { Sparkles, Code, BookOpen, Calculator, FileText, Lightbulb, Rocket, Info, Compass } from 'lucide-react';
import { useChat } from '../context/ChatContext';

export function WelcomeScreen() {
  const { sendMessage } = useChat();

  const suggestions = [
    {
      category: 'Identity',
      icon: <Info size={18} />,
      title: 'What does ARIYAAN mean?',
      desc: 'Learn about the name origin (Arivu + Udayaan = Arivudayaan) and identity of ARIYAAN.',
      prompt: 'What does ARIYAAN mean and why was it chosen?'
    },
    {
      category: 'Learn',
      icon: <BookOpen size={18} />,
      title: 'Explain Quantum Computing',
      desc: 'Understand complex physics & computer science concepts step by step.',
      prompt: 'Explain Quantum Computing simply with key principles and real-world applications.'
    },
    {
      category: 'Build',
      icon: <Code size={18} />,
      title: 'Create Python Script',
      desc: 'Write clean, working code for data processing and algorithms.',
      prompt: 'Write a Python program to check whether a number is prime and explain how it works.'
    },
    {
      category: 'Solve',
      icon: <Calculator size={18} />,
      title: 'Solve Math & Logic',
      desc: 'Break down complex mathematical problems step by step.',
      prompt: 'Solve 25 × 48 and explain the calculation step by step.'
    },
    {
      category: 'Create',
      icon: <FileText size={18} />,
      title: 'Summarize Concepts',
      desc: 'Compare architectures, technologies, and system designs.',
      prompt: 'Summarize the core differences between SQL and NoSQL databases with pros and cons.'
    },
    {
      category: 'Explore',
      icon: <Rocket size={18} />,
      title: 'Final-Year Project Architecture',
      desc: 'System design guidance for React, Node.js, and Google Gemini API.',
      prompt: 'Suggest system architecture best practices for a final-year college project using React, Node.js, and Google Gemini API.'
    }
  ];

  return (
    <div className="welcome-container">
      {/* ARIYAAN Intelligence Core Orb */}
      <div className="ariyaan-orb-container">
        <div className="ariyaan-orb-ring-1" />
        <div className="ariyaan-orb-ring-2" />
        <div className="ariyaan-orb-core">
          <Sparkles size={32} />
        </div>
      </div>

      <div className="welcome-badge">
        <Sparkles size={16} />
        <span>ARIYAAN Intelligence v1.0</span>
      </div>

      <div>
        <h1 className="welcome-title">
          Hello! I'm <span className="welcome-gradient">ARIYAAN</span>.
        </h1>
        <p className="welcome-subtitle">
          Your Intelligent Personal AI Assistant
        </p>
        <p className="welcome-motto">
          "From Knowledge to Understanding" &bull; "அறிவிலிருந்து புரிதலுக்கு"
        </p>
      </div>

      <div style={{ width: '100%', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          <Compass size={16} />
          <span>Select a capability or ask ARIYAAN anything below</span>
        </div>

        <div className="suggestions-grid">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="suggestion-card"
              onClick={() => sendMessage(item.prompt)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="suggestion-icon">{item.icon}</div>
                <span className="suggestion-category">{item.category}</span>
              </div>
              <div className="suggestion-title">{item.title}</div>
              <div className="suggestion-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
