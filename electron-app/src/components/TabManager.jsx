import React from 'react';
import './TabManager.css';

const TabManager = ({ tabs, activeTab, onTabSelect, onTabClose }) => {
  if (!tabs || tabs.length === 0) {
    return <div className="empty-tabs">No files open</div>;
  }

  return (
    <div className="tab-container">
      <div className="tabs">
        {tabs.map((tab) => (
          <div 
            key={tab.path} 
            className={`tab ${tab.path === activeTab?.path ? 'active' : ''}`}
            onClick={() => onTabSelect(tab)}
          >
            <div className="tab-content">
              <span className="tab-icon">
                {/* Icon based on file extension */}
                {getFileIcon(tab.name)}
              </span>
              <span className="tab-name">{tab.name}</span>
              <button 
                className="tab-close" 
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab);
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get icon based on file extension
const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  
  switch (extension) {
    case 'js':
      return '𝐉𝐒';
    case 'jsx':
      return '𝐉𝐗';
    case 'css':
      return '𝐂𝐒';
    case 'html':
      return '𝐇𝐓';
    case 'json':
      return '{ }';
    case 'md':
      return '𝐌𝐃';
    default:
      return '📄';
  }
};

export default TabManager;
