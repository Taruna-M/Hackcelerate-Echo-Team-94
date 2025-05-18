import React, { useState, useEffect } from 'react';
import Terminal from './Terminal';
import './BottomPanel.css';

// Problems panel component
const ProblemsPanel = () => {
  const [problems, setProblems] = useState([]);
  
  // Simulate some problems for demonstration
  useEffect(() => {
    const demoProblems = [
      { id: 1, type: 'error', message: 'Cannot find module "react-syntax-highlighter"', file: 'ChatInterface.jsx', line: 42 },
      { id: 2, type: 'warning', message: 'Variable "result" is defined but never used', file: 'App.jsx', line: 87 },
      { id: 3, type: 'info', message: 'Consider using const instead of let here', file: 'Terminal.jsx', line: 15 }
    ];
    setProblems(demoProblems);
  }, []);
  
  return (
    <div className="problems-panel">
      <div className="problems-header">
        <span className="problems-count">{problems.length} problems found</span>
        <div className="problems-actions">
          <button className="problem-action-button" title="Refresh">↻</button>
          <button className="problem-action-button" title="Clear">🗑</button>
        </div>
      </div>
      <div className="problems-list">
        {problems.map(problem => (
          <div key={problem.id} className={`problem-item ${problem.type}`}>
            <span className="problem-icon">
              {problem.type === 'error' ? '❌' : problem.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="problem-message">{problem.message}</span>
            <span className="problem-location">{problem.file}:{problem.line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Output panel component
const OutputPanel = () => {
  const [outputLines, setOutputLines] = useState([]);
  
  // Listen for output messages
  useEffect(() => {
    // Simulate some output for demonstration
    const demoOutput = [
      { id: 1, content: '> echo_1@1.0.0 start', type: 'info' },
      { id: 2, content: '> electron-forge start', type: 'info' },
      { id: 3, content: '✔ Checking your system', type: 'success' },
      { id: 4, content: '✔ Locating application', type: 'success' },
      { id: 5, content: '✔ Loading configuration', type: 'success' },
      { id: 6, content: '✔ Preparing native dependencies', type: 'success' },
      { id: 7, content: '✔ Running generateAssets hook', type: 'success' },
      { id: 8, content: '✔ Running preStart hook', type: 'success' },
      { id: 9, content: 'Application started successfully!', type: 'success' }
    ];
    setOutputLines(demoOutput);
    
    // In a real implementation, we would listen for output events
    const handleOutput = (event, data) => {
      if (data && data.content) {
        setOutputLines(prev => [...prev, { 
          id: Date.now(), 
          content: data.content,
          type: data.type || 'info'
        }]);
      }
    };
    
    // Set up listener if available
    if (window.electronAPI && window.electronAPI.onOutput) {
      window.electronAPI.onOutput(handleOutput);
    }
    
    return () => {
      // Clean up listener
      if (window.electronAPI && window.electronAPI.removeOutputListener) {
        window.electronAPI.removeOutputListener();
      }
    };
  }, []);
  
  return (
    <div className="output-panel">
      <div className="output-content">
        {outputLines.map(line => (
          <div key={line.id} className={`output-line ${line.type}`}>
            {line.content}
          </div>
        ))}
      </div>
    </div>
  );
};

// Debug Console panel component
const DebugConsolePanel = () => {
  return (
    <div className="debug-console-panel">
      <div className="debug-console-content">
        <div className="debug-line info">Debug session started.</div>
        <div className="debug-line">Listening on port 9229...</div>
        <div className="debug-line success">Debugger attached.</div>
      </div>
    </div>
  );
};

const BottomPanel = () => {
  const [activeTab, setActiveTab] = useState('terminal');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const tabs = [
    { id: 'problems', label: 'Problems' },
    { id: 'output', label: 'Output' },
    { id: 'debug', label: 'Debug Console' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'search', label: 'SEARCH TERMINAL OUTPUT' },
    { id: 'comments', label: 'Comments' }
  ];

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'terminal':
        return <Terminal visible={true} />;
      case 'problems':
        return <ProblemsPanel />;
      case 'output':
        return <OutputPanel />;
      case 'debug':
        return <DebugConsolePanel />;
      case 'search':
        return <div className="panel-content">
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search terminal output..."
            />
            <button className="search-button">Search</button>
          </div>
          <div className="search-results">
            <div className="search-placeholder">Type a search term and press Enter</div>
          </div>
        </div>;
      case 'comments':
        return <div className="panel-content">
          <div className="comments-container">
            <div className="comment-list">
              <div className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">User</span>
                  <span className="comment-time">Today at 8:15 AM</span>
                </div>
                <div className="comment-content">
                  Added terminal functionality to match the VS Code interface.
                </div>
              </div>
            </div>
            <div className="comment-input-container">
              <textarea 
                className="comment-input" 
                placeholder="Type a comment..."
              ></textarea>
              <button className="comment-submit">Add Comment</button>
            </div>
          </div>
        </div>;
      default:
        return null;
    }
  };

  return (
    <div className={`bottom-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="bottom-panel-tabs">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`bottom-panel-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </div>
        ))}
        <div className="bottom-panel-actions">
          <button className="panel-action-button" onClick={togglePanel}>
            {isExpanded ? '▼' : '▲'}
          </button>
          <button className="panel-action-button">⊗</button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="bottom-panel-content">
          {renderTabContent()}
        </div>
      )}
    </div>
  );
};

export default BottomPanel;
