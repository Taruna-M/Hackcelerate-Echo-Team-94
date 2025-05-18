import React, { useState, useEffect } from 'react';
import './StatusBar.css';

const StatusBar = () => {
  const [runningProcesses, setRunningProcesses] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Listen for process status updates
  useEffect(() => {
    const handleProcessUpdate = (event, data) => {
      if (data.type === 'process-start') {
        setRunningProcesses(prev => [...prev, data.process]);
      } else if (data.type === 'process-end') {
        setRunningProcesses(prev => prev.filter(p => p.id !== data.processId));
      }
    };
    
    if (window.electronAPI && window.electronAPI.onTerminalOutput) {
      window.electronAPI.onTerminalOutput(handleProcessUpdate);
    }
    
    return () => {
      if (window.electronAPI && window.electronAPI.removeTerminalListeners) {
        window.electronAPI.removeTerminalListeners();
      }
    };
  }, []);
  
  return (
    <div className="status-bar">
      <div className="status-left">
        {runningProcesses.length > 0 ? (
          <div className="running-process">
            <span className="process-icon">⚙️</span>
            <span>Running: {runningProcesses.map(p => p.name).join(', ')}</span>
          </div>
        ) : (
          <div className="status-item">
            <span className="status-icon">✓</span>
            <span>Ready</span>
          </div>
        )}
      </div>
      
      <div className="status-right">
        <div className="status-item">
          <span className="git-branch">main</span>
        </div>
        <div className="status-item">
          <span>Ln {1}, Col {1}</span>
        </div>
        <div className="status-item">
          <span>UTF-8</span>
        </div>
        <div className="status-item">
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
