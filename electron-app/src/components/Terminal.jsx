import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';

// Terminal process status indicator component
const ProcessIndicator = ({ running }) => {
  return (
    <div className={`process-indicator ${running ? 'running' : ''}`}>
      {running ? 'Running' : 'Ready'}
    </div>
  );
};

const Terminal = ({ visible }) => {
  const [output, setOutput] = useState([]);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [runningProcess, setRunningProcess] = useState(false);
  const [lastCommandStatus, setLastCommandStatus] = useState(null);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initialize terminal with welcome message
    setOutput([{ 
      type: 'info', 
      content: `Terminal initialized at ${new Date().toLocaleTimeString()}. Type "help" for available commands.` 
    }]);
    
    // Set up listeners for terminal output from main process
    if (window.electronAPI && window.electronAPI.onTerminalOutput) {
      window.electronAPI.onTerminalOutput((event, data) => {
        if (data.type === 'output') {
          setOutput(prev => [...prev, { type: 'output', content: data.content }]);
        } else if (data.type === 'error') {
          setOutput(prev => [...prev, { type: 'error', content: data.content }]);
        } else if (data.type === 'process-start') {
          setRunningProcess(true);
        } else if (data.type === 'process-end') {
          setRunningProcess(false);
          setLastCommandStatus(data.exitCode === 0 ? 'success' : 'error');
          setTimeout(() => setLastCommandStatus(null), 3000); // Clear status after 3 seconds
        }
      });
    }
    
    return () => {
      // Clean up listeners
      if (window.electronAPI && window.electronAPI.removeTerminalListeners) {
        window.electronAPI.removeTerminalListeners();
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when output changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    // Focus input when terminal becomes visible
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    
    if (!command.trim()) return;
    
    // Add command to output
    setOutput(prev => [...prev, { type: 'command', content: `$ ${command}` }]);
    
    // Add to history
    setCommandHistory(prev => [command, ...prev.slice(0, 49)]); // Keep last 50 commands
    setHistoryIndex(-1);
    
    // Process command
    if (command === 'clear' || command === 'cls') {
      setOutput([]);
    } else if (command === 'help') {
      setOutput(prev => [...prev, { 
        type: 'info', 
        content: 'Available commands:\n- clear/cls: Clear terminal\n- help: Show this help message\n- Other commands will be executed in the system shell' 
      }]);
    } else {
      try {
        // Send command to main process
        if (window.electronAPI && window.electronAPI.executeCommand) {
          await window.electronAPI.executeCommand(command);
        } else {
          // Fallback for development mode
          setOutput(prev => [...prev, { 
            type: 'error', 
            content: 'Command execution is not available in development mode' 
          }]);
        }
      } catch (error) {
        setOutput(prev => [...prev, { type: 'error', content: error.message }]);
      }
    }
    
    // Clear input
    setCommand('');
  };

  const handleKeyDown = (e) => {
    // Handle up/down arrows for command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  return (
    <div className={`terminal-container ${visible ? 'visible' : 'hidden'}`}>
      <div className="terminal-header">
        <div className="terminal-title-section">
          <span className="terminal-title">Terminal</span>
          <ProcessIndicator running={runningProcess} />
          {lastCommandStatus && (
            <span className={`command-status ${lastCommandStatus}`}>
              {lastCommandStatus === 'success' ? '✓' : '✗'}
            </span>
          )}
        </div>
        <div className="terminal-actions">
          <button 
            className="terminal-action-button" 
            title="Kill Running Process"
            onClick={() => window.electronAPI?.killAllProcesses()}
            disabled={!runningProcess}
          >
            ⊗
          </button>
          <button 
            className="terminal-action-button clear-button" 
            title="Clear Terminal"
            onClick={() => setOutput([])}
          >
            🗑
          </button>
        </div>
      </div>
      <div className="terminal-output" ref={terminalRef}>
        {output.map((line, index) => (
          <div key={index} className={`terminal-line ${line.type}`}>
            {line.content.split('\n').map((text, i) => (
              <div key={i}>{text}</div>
            ))}
          </div>
        ))}
        {runningProcess && (
          <div className="terminal-line process-running">
            <div className="loading-indicator"></div>
          </div>
        )}
      </div>
      <form onSubmit={handleCommandSubmit} className="terminal-input-container">
        <span className="terminal-prompt">{runningProcess ? '>' : '$'}</span>
        <input
          type="text"
          className="terminal-input"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          autoComplete="off"
          spellCheck="false"
          disabled={runningProcess}
          placeholder={runningProcess ? 'Process running...' : 'Type command here...'}
        />
      </form>
    </div>
  );
};

export default Terminal;
