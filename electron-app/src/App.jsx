// src/App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import ChatInterface from './components/ChatInterface';
import FileExplorer from './components/FileExplorer';
import TabManager from './components/TabManager';
import './App.css';

export default function App() {
  // State for files and editor
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContents, setFileContents] = useState({});
  
  // State for the chat interface
  const [currentCode, setCurrentCode] = useState('');

  // Effect to initialize the app and load file tree
  useEffect(() => {
    // Try to get file tree from electron backend
    const loadInitialFiles = async () => {
      try {
        if (window.electronAPI && window.electronAPI.getFileTree) {
          const result = await window.electronAPI.getFileTree();
          if (result.success && result.tree && result.tree.length > 0) {
            setFiles(result.tree);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading file tree:', err);
      }
      
      // Fallback to welcome file if no files loaded
      const welcomeFile = {
        name: 'welcome.js',
        path: 'welcome.js',
        type: 'file',
        content: '// Welcome to Echo Code Editor!\n\n// This is a collaborative coding environment with AI assistance.\n// Open a project folder using the explorer on the left to get started.\n\nfunction greet() {\n  console.log("Hello, world!");\n}\n\ngreet();'
      };
      
      setFiles([welcomeFile]);
      setOpenFiles([welcomeFile]);
      setActiveFile(welcomeFile);
      setFileContents({
        [welcomeFile.path]: welcomeFile.content
      });
      setCurrentCode(welcomeFile.content);
    };
    
    loadInitialFiles();
  }, []);

  // Handle file selection from explorer
  const handleFileSelect = useCallback(async (file) => {
    if (file.type !== 'file') return;
    
    // Check if file is already open
    if (!openFiles.find(f => f.path === file.path)) {
      try {
        // In a real implementation, this would load the file content from disk
        // For now, we'll use the content property if it exists or simulate loading
        let content = file.content;
        
        if (!content) {
          // Try to get content from electron backend
          try {
            const result = await window.electronAPI.readFile(file.path);
            content = result.content;
          } catch (err) {
            console.error('Error reading file:', err);
            content = `// Error loading ${file.name}\n// ${err.message}`;
          }
        }
        
        // Update file contents
        setFileContents(prev => ({
          ...prev,
          [file.path]: content
        }));
        
        // Add to open files
        setOpenFiles(prev => [...prev, { ...file, content }]);
      } catch (err) {
        console.error('Error opening file:', err);
        return;
      }
    }
    
    // Set as active file
    setActiveFile(file);
  }, [openFiles]);

  // Handle code changes from the editor
  const handleCodeChange = useCallback((filePath, newCode) => {
    if (!filePath) return;
    
    // Update file contents
    setFileContents(prev => ({
      ...prev,
      [filePath]: newCode
    }));
    
    // If this is the active file, update current code for the chat interface
    if (activeFile && activeFile.path === filePath) {
      setCurrentCode(newCode);
    }
  }, [activeFile]);

  // Handle saving files
  const handleSaveFile = useCallback(async (filePath, content) => {
    if (!filePath) return;
    
    try {
      // In a real implementation, this would save to disk via Electron IPC
      // For now, we'll just log it
      console.log(`Saving file ${filePath}...`);
      
      // Try to save via electron API if available
      if (window.electronAPI && window.electronAPI.writeFile) {
        await window.electronAPI.writeFile(filePath, content);
        console.log(`File ${filePath} saved successfully`);
      }
      
      // Update file contents state
      setFileContents(prev => ({
        ...prev,
        [filePath]: content
      }));
    } catch (err) {
      console.error('Error saving file:', err);
    }
  }, []);

  // Handle tab selection
  const handleTabSelect = useCallback((file) => {
    setActiveFile(file);
  }, []);

  // Handle tab close
  const handleTabClose = useCallback((fileToClose) => {
    // Remove from open files
    setOpenFiles(prev => prev.filter(file => file.path !== fileToClose.path));
    
    // If this was the active file, set a new active file
    if (activeFile && activeFile.path === fileToClose.path) {
      // Set the last open file as active, or null if none left
      setActiveFile(openFiles.length > 1 ? 
        openFiles.find(file => file.path !== fileToClose.path) : 
        null
      );
    }
  }, [activeFile, openFiles]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Echo Code Editor</h1>
      </header>
      
      <div className="main-container">
        <div className="sidebar">
          <FileExplorer 
            onFileSelect={handleFileSelect} 
          />
        </div>
        
        <div className="editor-section">
          <TabManager 
            tabs={openFiles}
            activeTab={activeFile}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
          />
          
          <CodeEditor 
            files={openFiles.map(file => ({
              ...file,
              content: fileContents[file.path] || ''
            }))}
            activeFile={activeFile}
            onChange={handleCodeChange}
            onSave={handleSaveFile}
            theme="vs-dark"
          />
        </div>
        
        <div className="chat-section">
          <ChatInterface 
            codeValue={currentCode} 
            files={openFiles}
          />
        </div>
      </div>
    </div>
  );
}
