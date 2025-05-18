import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Peer from 'peerjs';
import './CodeEditor.css';

// Helper function to detect language from file extension
const detectLanguage = (filename) => {
  if (!filename) return 'plaintext';
  
  const extension = filename.split('.').pop().toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'sh': 'shell',
    'yml': 'yaml',
    'yaml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
  };
  
  return languageMap[extension] || 'plaintext';
};

const CodeEditor = ({ 
  files = [],
  activeFile = null,
  theme = 'vs-dark', 
  onChange = () => {},
  onSave = () => {},
  readOnly = false,
  initialContent = null
}) => {
  const editorContainerRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const modelsRef = useRef({});
  const [editorMounted, setEditorMounted] = useState(false);
  
  // P2P state
  const [peerId, setPeerId] = useState('');
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isP2PPanelOpen, setIsP2PPanelOpen] = useState(false);
  const [sharedCode, setSharedCode] = useState(null);
  const peerRef = useRef(null);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize P2P connection
  useEffect(() => {
    if (!isOnline) return;

    const peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ]
      },
      mesh: true,
      direct: true,
      reconnect: false,
      maxRetries: 0,
      retryInterval: 0,
      debug: 2
    });
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('Connected to PeerJS with ID:', id);
      setPeerId(id);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    peer.on('connection', (conn) => {
      console.log('New connection from:', conn.peer);
      
      conn.on('open', () => {
        console.log('Connection opened with:', conn.peer);
        setConnectedPeers(prev => [...prev, conn.peer]);
        
        // Send current file content when new peer connects
        if (activeFile) {
          const currentContent = modelsRef.current[activeFile.path]?.getValue() || '';
          console.log('Sending current content:', currentContent);
          conn.send({
            type: 'code-update',
            filePath: activeFile.path,
            content: currentContent
          });
        }
      });

      conn.on('data', (data) => {
        console.log('Received data from:', conn.peer, data);
        if (data.type === 'code-update' && data.filePath === activeFile?.path) {
          // Update the model directly
          const model = modelsRef.current[data.filePath];
          if (model) {
            const currentContent = model.getValue();
            if (currentContent !== data.content) {
              model.setValue(data.content);
            }
          }
        }
      });

      conn.on('close', () => {
        console.log('Connection closed with:', conn.peer);
        setConnectedPeers(prev => prev.filter(p => p !== conn.peer));
      });

      conn.on('error', (err) => {
        console.error('Connection error with', conn.peer + ':', err);
      });
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [isOnline]);

  const connectToPeer = (peerId) => {
    if (!peerRef.current || !peerId) return;

    const conn = peerRef.current.connect(peerId);
    
    conn.on('open', () => {
      setConnectedPeers(prev => [...prev, peerId]);
      
      // Request current file content when connecting
      if (activeFile) {
        const currentContent = modelsRef.current[activeFile.path]?.getValue() || '';
        conn.send({
          type: 'code-update',
          filePath: activeFile.path,
          content: currentContent
        });
      }
    });

    conn.on('data', (data) => {
      if (data.type === 'code-update' && data.filePath === activeFile?.path) {
        // Update the model directly
        const model = modelsRef.current[data.filePath];
        if (model) {
          const currentContent = model.getValue();
          if (currentContent !== data.content) {
            model.setValue(data.content);
          }
        }
      }
    });

    conn.on('close', () => {
      setConnectedPeers(prev => prev.filter(p => p !== peerId));
    });
  };

  // Initialize Monaco editor
  useEffect(() => {
    if (editorContainerRef.current && !editorInstanceRef.current) {
      // Register Monaco editor commands
      monaco.editor.addEditorAction({
        id: 'save',
        label: 'Save',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: (editor) => {
          if (activeFile) {
            onSave(activeFile.path, editor.getValue());
          }
        }
      });
      
      // Create editor instance
      editorInstanceRef.current = monaco.editor.create(editorContainerRef.current, {
        theme,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        readOnly,
        fontSize: 14,
        fontFamily: '"Fira Code", Consolas, "Courier New", monospace',
        lineNumbers: 'on',
        roundedSelection: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        bracketPairColorization: { enabled: true },
        formatOnPaste: true,
        formatOnType: true,
        autoIndent: 'full',
        tabSize: 2,
        rulers: [80, 120],
        wordWrap: 'on',
        wrappingIndent: 'same',
        snippetSuggestions: 'top',
        suggestSelection: 'first',
        quickSuggestions: true,
        scrollbar: {
          verticalScrollbarSize: 12,
          horizontalScrollbarSize: 12
        }
      });

      // Set editor as mounted
      setEditorMounted(true);

      // Handle resize with debounce
      let resizeTimeout;
      const handleResize = () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(() => {
          if (editorInstanceRef.current) {
            editorInstanceRef.current.layout();
          }
        }, 100);
      };

      // Add resize observer
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(editorContainerRef.current);

      // Add window resize listener
      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
        
        // Dispose all models
        Object.values(modelsRef.current).forEach(model => {
          model.dispose();
        });
        
        // Dispose editor
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
        modelsRef.current = {};
      };
    }
    return undefined;
  }, []);

  // Create or update models for all files
  useEffect(() => {
    if (!editorInstanceRef.current || !editorMounted) return;
    
    // Create models for new files
    files.forEach(file => {
      if (!modelsRef.current[file.path]) {
        const language = detectLanguage(file.name);
        const model = monaco.editor.createModel(
          sharedCode || initialContent || file.content || '',
          language,
          monaco.Uri.parse(`file://${file.path.replace(/\\/g, '/').replace(/^\/+/, '')}`)
        );
        
        // Set up change event handler for this model
        model.onDidChangeContent(() => {
          const content = model.getValue();
          onChange(file.path, content);
          
          // Send code updates to all connected peers
          peerRef.current?.connections && Object.values(peerRef.current.connections).forEach(connections => {
            connections.forEach(conn => {
              conn.send({
                type: 'code-update',
                filePath: file.path,
                content
              });
            });
          });
        });
        
        modelsRef.current[file.path] = model;
      }
    });
    
    // Remove models for deleted files
    Object.keys(modelsRef.current).forEach(path => {
      if (!files.find(file => file.path === path)) {
        modelsRef.current[path].dispose();
        delete modelsRef.current[path];
      }
    });
    
  }, [files, editorMounted, onChange, initialContent, sharedCode]);

  // Switch to active file when it changes
  useEffect(() => {
    if (!editorInstanceRef.current || !editorMounted || !activeFile) return;
    
    const model = modelsRef.current[activeFile.path];
    if (model) {
      editorInstanceRef.current.setModel(model);
      
      // Focus editor after switching files
      setTimeout(() => {
        editorInstanceRef.current.focus();
      }, 100);
    }
  }, [activeFile, editorMounted]);

  // Update editor options when they change
  useEffect(() => {
    if (editorInstanceRef.current) {
      editorInstanceRef.current.updateOptions({ readOnly, theme });
    }
  }, [theme, readOnly]);

  return (
    <div className='monaco-editor-wrapper relative'>
      {!activeFile && (
        <div className='no-file-open'>
          <div className='no-file-message'>
            <h3>No file open</h3>
            <p>Open a file from the explorer to start editing</p>
          </div>
        </div>
      )}
      <div 
        className='monaco-editor-container' 
        ref={editorContainerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          visibility: activeFile ? 'visible' : 'hidden'
        }}
      />

      {/* P2P Toggle Button */}
      <button
        onClick={() => setIsP2PPanelOpen(!isP2PPanelOpen)}
        className="p2p-toggle-button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        P2P {isP2PPanelOpen ? 'Hide' : 'Show'}
      </button>

      {/* P2P Status Panel */}
      <div className={`p2p-panel ${isP2PPanelOpen ? '' : 'hidden'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="text-sm">
                Your ID: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{peerId}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Connect to Peer</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter peer ID"
                    className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        connectToPeer(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Connected Peers</h3>
                <div className="space-y-2">
                  {connectedPeers.length === 0 ? (
                    <p className="text-gray-400 text-sm">No peers connected</p>
                  ) : (
                    connectedPeers.map(peer => (
                      <div key={peer} className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
                        <span className="font-mono text-sm">{peer}</span>
                        <span className="text-green-500 text-sm">Connected</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
