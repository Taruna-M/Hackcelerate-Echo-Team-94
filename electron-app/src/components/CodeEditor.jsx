import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

const CodeEditor = ({ 
  language = 'javascript', 
  theme = 'vs-dark', 
  value = '// Start coding here...', 
  onChange = () => {},
  readOnly = false 
}) => {
  const editorContainerRef = useRef(null);
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    if (editorContainerRef.current && !editorInstanceRef.current) {
      // Initialize Monaco editor
      editorInstanceRef.current = monaco.editor.create(editorContainerRef.current, {
        value,
        language,
        theme,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        readOnly,
        fontSize: 14,
        fontFamily: 'monospace',
        lineNumbers: 'on',
        roundedSelection: true,
      });

      // Set up change event handler
      const disposable = editorInstanceRef.current.onDidChangeModelContent(() => {
        onChange(editorInstanceRef.current.getValue());
      });

      // Cleanup on unmount
      return () => {
        disposable.dispose();
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
      };
    }
    return undefined;
  }, [editorContainerRef.current]); // Only re-run if the container ref changes

  // Update settings when they change
  useEffect(() => {
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      monaco.editor.setModelLanguage(model, language);
      editorInstanceRef.current.updateOptions({ readOnly, theme });
    }
  }, [language, theme, readOnly]);

  // Update value when prop changes
  useEffect(() => {
    if (editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.getValue();
      if (value !== currentValue) {
        editorInstanceRef.current.setValue(value);
      }
    }
  }, [value]);

  return (
    <div 
      className='monaco-editor-container' 
      ref={editorContainerRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '500px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}
    />
  );
};

export default CodeEditor;
