import React, { useState } from 'react';
import Editor from './Editor';
import FileExplorer from './FileExplorer';
import BottomPanel from './BottomPanel';

const App = () => {
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [activePanel, setActivePanel] = useState('terminal');

  const handleFileOpen = async (filePath) => {
    try {
      const { ipcRenderer } = window.require('electron');
      const content = await ipcRenderer.invoke('read-file', filePath);
      if (!openFiles.find(file => file.path === filePath)) {
        setOpenFiles([...openFiles, { path: filePath, content }]);
      }
      setActiveFile(filePath);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleFileSave = async (filePath, content) => {
    try {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('write-file', { filePath, content });
      setOpenFiles(openFiles.map(file => 
        file.path === filePath ? { ...file, content } : file
      ));
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleFileClose = (filePath) => {
    setOpenFiles(openFiles.filter(file => file.path !== filePath));
    if (activeFile === filePath) {
      setActiveFile(openFiles[0]?.path || null);
    }
  };

  const renderFileTabs = () => {
    return (
      <div className="editor-tabs">
        {openFiles.map(file => (
          <div
            key={file.path}
            className={`editor-tab ${activeFile === file.path ? 'active' : ''}`}
            onClick={() => setActiveFile(file.path)}
          >
            <span className="editor-tab-title">{file.path.split('/').pop()}</span>
            <button
              className="editor-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                handleFileClose(file.path);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app">
      <div className="sidebar">
        <FileExplorer onFileOpen={handleFileOpen} />
      </div>
      <div className="main-content">
        <div className="editor-container">
          {renderFileTabs()}
          {openFiles.map(file => (
            <Editor
              key={file.path}
              filePath={file.path}
              content={file.content}
              isActive={activeFile === file.path}
              onSave={handleFileSave}
              onClose={() => handleFileClose(file.path)}
            />
          ))}
        </div>
        <div className="panel-tabs">
          <button
            className={`tab-button ${activePanel === 'terminal' ? 'active' : ''}`}
            onClick={() => setActivePanel('terminal')}
          >
            Terminal
          </button>
          <button
            className={`tab-button ${activePanel === 'problems' ? 'active' : ''}`}
            onClick={() => setActivePanel('problems')}
          >
            Problems
          </button>
          <button
            className={`tab-button ${activePanel === 'output' ? 'active' : ''}`}
            onClick={() => setActivePanel('output')}
          >
            Output
          </button>
          <button
            className={`tab-button ${activePanel === 'debug-console' ? 'active' : ''}`}
            onClick={() => setActivePanel('debug-console')}
          >
            Debug Console
          </button>
          <button
            className={`tab-button ${activePanel === 'ports' ? 'active' : ''}`}
            onClick={() => setActivePanel('ports')}
          >
            Ports
          </button>
        </div>
        <BottomPanel activePanel={activePanel} />
      </div>
    </div>
  );
};

export default App; 