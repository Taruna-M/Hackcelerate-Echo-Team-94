import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
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
  readOnly = false 
}) => {
  const editorContainerRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const modelsRef = useRef({});
  const [editorMounted, setEditorMounted] = useState(false);

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

      // Cleanup on unmount
      return () => {
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
          file.content || '',
          language,
          monaco.Uri.parse(`file:///${file.path.replace(/\\/g, '/')}`)
        );
        
        // Set up change event handler for this model
        model.onDidChangeContent(() => {
          onChange(file.path, model.getValue());
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
    
  }, [files, editorMounted, onChange]);

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
    <div className='monaco-editor-wrapper'>
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
    </div>
  );
};

export default CodeEditor;
