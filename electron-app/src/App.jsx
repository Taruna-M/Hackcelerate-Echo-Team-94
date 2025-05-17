// src/App.jsx
import React, { useState, useCallback } from 'react';
import CodeEditor from './components/CodeEditor';
import ChatInterface from './components/ChatInterface';
import './App.css';

export default function App() {
  const [code, setCode] = useState('// Start coding here...');

  // Handle code changes from the editor
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Echo Code Editor</h1>
      </header>
      
      <div className="main-container">
        <div className="editor-section">
          <CodeEditor 
            value={code}
            onChange={handleCodeChange}
            language="javascript"
            theme="vs-dark"
          />
        </div>
        
        <div className="chat-section">
          <ChatInterface codeValue={code} />
        </div>
      </div>
    </div>
  );
}
