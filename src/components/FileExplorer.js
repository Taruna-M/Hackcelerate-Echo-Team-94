import React, { useState, useEffect } from 'react';

const FileExplorer = ({ onFileOpen }) => {
  const [fileTree, setFileTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [currentPath, setCurrentPath] = useState(null);

  useEffect(() => {
    if (currentPath) {
      loadDirectory(currentPath);
    }
  }, [currentPath]);

  const handleSelectFolder = async () => {
    try {
      const { ipcRenderer } = window.require('electron');
      const selectedPath = await ipcRenderer.invoke('select-folder');
      if (selectedPath) {
        setCurrentPath(selectedPath);
        setExpandedFolders(new Set());
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const loadDirectory = async (dirPath) => {
    try {
      const { ipcRenderer } = window.require('electron');
      const items = await ipcRenderer.invoke('list-directory', dirPath);
      setFileTree(items);
    } catch (error) {
      console.error('Error loading directory:', error);
    }
  };

  const toggleFolder = async (folderPath) => {
    try {
      const { ipcRenderer } = window.require('electron');
      const newExpandedFolders = new Set(expandedFolders);
      
      if (expandedFolders.has(folderPath)) {
        newExpandedFolders.delete(folderPath);
      } else {
        newExpandedFolders.add(folderPath);
        const items = await ipcRenderer.invoke('list-directory', folderPath);
        setFileTree(prevTree => {
          const newTree = [...prevTree];
          const folderIndex = newTree.findIndex(item => item.path === folderPath);
          if (folderIndex !== -1) {
            newTree.splice(folderIndex + 1, 0, ...items);
          }
          return newTree;
        });
      }
      
      setExpandedFolders(newExpandedFolders);
    } catch (error) {
      console.error('Error toggling folder:', error);
    }
  };

  const renderFileTree = (items, level = 0) => {
    return items.map((item) => (
      <div
        key={item.path}
        style={{ marginLeft: `${level * 20}px` }}
        className="file-item"
      >
        {item.isDirectory ? (
          <div onClick={() => toggleFolder(item.path)}>
            {expandedFolders.has(item.path) ? '📂' : '📁'} {item.name}
          </div>
        ) : (
          <div onClick={() => onFileOpen(item.path)}>
            📄 {item.name}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <button 
          className="select-folder-button"
          onClick={handleSelectFolder}
        >
          Select Folder
        </button>
        {currentPath && (
          <div className="current-path">
            {currentPath}
          </div>
        )}
      </div>
      {currentPath ? (
        renderFileTree(fileTree)
      ) : (
        <div className="no-folder-selected">
          Please select a folder to view its contents
        </div>
      )}
    </div>
  );
};

export default FileExplorer; 