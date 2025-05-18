import React, { useState, useEffect } from 'react';
import './FileExplorer.css';

// Icons for different file types
const FileIcon = ({ filename }) => {
  const extension = filename.split('.').pop().toLowerCase();
  let iconClass = 'file-icon';
  
  switch (extension) {
    case 'js':
    case 'jsx':
      iconClass += ' javascript-icon';
      break;
    case 'css':
      iconClass += ' css-icon';
      break;
    case 'html':
      iconClass += ' html-icon';
      break;
    case 'json':
      iconClass += ' json-icon';
      break;
    case 'md':
      iconClass += ' markdown-icon';
      break;
    default:
      iconClass += ' default-icon';
  }
  
  return <span className={iconClass}></span>;
};

// Folder component with collapsible structure
const Folder = ({ name, path, items, onFileSelect, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="folder">
      <div 
        className={`folder-name ${expanded ? 'expanded' : ''}`} 
        onClick={toggleExpand}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        <span className={`folder-icon ${expanded ? 'open' : ''}`}></span>
        {name}
      </div>
      
      {expanded && (
        <div className="folder-contents">
          {items.map((item) => (
            item.type === 'directory' ? (
              <Folder 
                key={item.path} 
                name={item.name} 
                path={item.path}
                items={item.children || []}
                onFileSelect={onFileSelect}
                level={level + 1}
              />
            ) : (
              <div 
                key={item.path} 
                className="file" 
                onClick={() => onFileSelect(item)}
                style={{ paddingLeft: `${(level + 1) * 12}px` }}
              >
                <FileIcon filename={item.name} />
                {item.name}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ onFileSelect }) => {
  const [fileTree, setFileTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectRoot, setProjectRoot] = useState('');
  
  // Function to load the file tree from the electron backend
  const loadFileTree = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call an IPC method to get the file tree
      // For now, we'll simulate with a timeout and mock data
      const response = await window.electronAPI.getFileTree();
      setFileTree(response.tree || []);
      setProjectRoot(response.root || '');
      setLoading(false);
    } catch (err) {
      console.error('Error loading file tree:', err);
      setError('Failed to load project files');
      setLoading(false);
    }
  };
  
  // Load file tree on component mount
  useEffect(() => {
    loadFileTree();
  }, []);
  
  // Function to open a folder (project)
  const handleOpenFolder = async () => {
    try {
      const result = await window.electronAPI.openFolder();
      if (result.success) {
        setFileTree(result.tree || []);
        setProjectRoot(result.root || '');
      }
    } catch (err) {
      console.error('Error opening folder:', err);
      setError('Failed to open folder');
    }
  };
  
  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Explorer</h3>
        <button className="open-folder-btn" onClick={handleOpenFolder}>
          Open Folder
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading project files...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : fileTree.length === 0 ? (
        <div className="empty-state">
          <p>No folder open</p>
          <button onClick={handleOpenFolder}>Open Folder</button>
        </div>
      ) : (
        <div className="file-tree">
          <div className="project-root">
            <span className="folder-icon open"></span>
            {projectRoot.split('/').pop() || projectRoot.split('\\').pop() || 'Project'}
          </div>
          {fileTree.map((item) => (
            item.type === 'directory' ? (
              <Folder 
                key={item.path} 
                name={item.name} 
                path={item.path}
                items={item.children || []}
                onFileSelect={onFileSelect}
              />
            ) : (
              <div 
                key={item.path} 
                className="file" 
                onClick={() => onFileSelect(item)}
                style={{ paddingLeft: '12px' }}
              >
                <FileIcon filename={item.name} />
                {item.name}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
