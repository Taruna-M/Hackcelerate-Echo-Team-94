import React, { useState, useEffect } from 'react';
import FileReferenceSelector from './FileReferenceSelector';
import './FileReferencePanel.css';

const FileReferencePanel = ({ files, onFileReferencesChange }) => {
  // Start with panel open by default for better visibility
  const [isOpen, setIsOpen] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Notify parent component when selected files change
  useEffect(() => {
    onFileReferencesChange(selectedFiles);
  }, [selectedFiles, onFileReferencesChange]);

  // Toggle file selection
  const handleFileSelect = (file) => {
    setSelectedFiles(prev => {
      const isAlreadySelected = prev.some(f => f.path === file.path);
      
      if (isAlreadySelected) {
        // Remove file if already selected
        return prev.filter(f => f.path !== file.path);
      } else {
        // Add file if not selected
        return [...prev, file];
      }
    });
  };

  // Remove a file from the selected files
  const handleRemoveFile = (file) => {
    setSelectedFiles(prev => prev.filter(f => f.path !== file.path));
  };

  // Clear all selected files
  const handleClearAll = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="file-reference-panel">
      <div className="reference-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="reference-title">
          <span className="reference-icon"></span>
          File References
        </span>
        <span className="reference-count">{selectedFiles.length}</span>
        <span className={`toggle-icon ${isOpen ? 'open' : ''}`}></span>
      </div>
      
      {isOpen && (
        <div className="reference-content">
          <div className="reference-selector">
            <FileReferenceSelector 
              files={files} 
              selectedFiles={selectedFiles} 
              onFileSelect={handleFileSelect} 
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <div className="selected-header">
                <span>Selected Files</span>
                <button className="clear-all-btn" onClick={handleClearAll}>Clear All</button>
              </div>
              <div className="selected-list">
                {selectedFiles.map(file => (
                  <div key={file.path} className="selected-file-item">
                    <span className="selected-file-name">{file.name}</span>
                    <button 
                      className="remove-file-btn" 
                      onClick={() => handleRemoveFile(file)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileReferencePanel;
