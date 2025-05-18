import React, { useState, useEffect } from 'react';
import './FileReferenceSelector.css';

const FileReferenceSelector = ({ files, selectedFiles, onFileSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [filteredFiles, setFilteredFiles] = useState([]);

  // Initialize expanded folders state based on file tree
  useEffect(() => {
    if (files && files.length > 0) {
      // Auto-expand the first level of folders
      const initialExpandedState = {};
      files.forEach(file => {
        if (file.type === 'directory') {
          initialExpandedState[file.path] = true;
        }
      });
      setExpandedFolders(initialExpandedState);
    }
  }, [files]);

  // Filter files based on search term
  useEffect(() => {
    if (!files || files.length === 0) {
      setFilteredFiles([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredFiles(files);
      return;
    }

    // Flatten file tree for searching
    const flattenFileTree = (items, result = []) => {
      if (!items) return result;
      
      items.forEach(item => {
        if (!item) return;
        
        result.push(item);
        if (item.type === 'directory' && item.children) {
          flattenFileTree(item.children, result);
        }
      });
      return result;
    };

    const allFiles = flattenFileTree(files, []);
    const filtered = allFiles.filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // When searching, auto-expand all folders that contain matching files
    if (filtered.length > 0) {
      const newExpandedFolders = { ...expandedFolders };
      filtered.forEach(file => {
        // If it's a file, expand its parent folders
        if (file.type === 'file' && file.path) {
          const pathParts = file.path.split(/[\\/]/);
          let currentPath = '';
          
          // Build up the path and expand each parent folder
          for (let i = 0; i < pathParts.length - 1; i++) {
            currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
            newExpandedFolders[currentPath] = true;
          }
        }
      });
      setExpandedFolders(newExpandedFolders);
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm]);

  // Toggle folder expansion
  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Check if a file is selected
  const isFileSelected = (path) => {
    return selectedFiles.some(file => file.path === path);
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file.type === 'directory') {
      toggleFolder(file.path);
      return;
    }
    onFileSelect(file);
  };

  // Render file icon based on file type/extension
  const renderFileIcon = (filename) => {
    if (!filename) return <span className="file-icon default-icon"></span>;
    
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

  // Render a file item
  const renderFileItem = (file, level = 0) => {
    const isSelected = isFileSelected(file.path);
    const isExpanded = expandedFolders[file.path];
    const isFolder = file.type === 'directory';
    
    return (
      <div key={file.path}>
        <div 
          className={`file-item ${isSelected ? 'selected' : ''} ${isFolder ? 'folder' : ''}`}
          onClick={() => handleFileSelect(file)}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {isFolder ? (
            <span className={`folder-icon ${isExpanded ? 'expanded' : ''}`}></span>
          ) : (
            renderFileIcon(file.name)
          )}
          <span className="file-name">{file.name}</span>
          {!isFolder && (
            <span 
              className={`file-checkbox ${isSelected ? 'checked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleFileSelect(file);
              }}
            ></span>
          )}
        </div>
        
        {isFolder && isExpanded && file.children && (
          <div className="folder-contents">
            {file.children.map(child => renderFileItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-reference-selector">
      <div className="selector-header">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="file-search-input"
        />
      </div>
      
      <div className="file-list">
        {filteredFiles.length === 0 ? (
          <div className="no-files">No files found</div>
        ) : (
          filteredFiles.map(file => renderFileItem(file))
        )}
      </div>
    </div>
  );
};

export default FileReferenceSelector;
