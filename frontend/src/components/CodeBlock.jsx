import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span>{language || 'code'}</span>
        <button className="copy-code-btn" onClick={handleCopy} title="Copy code">
          {copied ? (
            <>
              <Check size={14} color="#10b981" />
              <span style={{ color: '#10b981' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre>
        <code className={language ? `language-${language}` : ''}>{code}</code>
      </pre>
    </div>
  );
}
