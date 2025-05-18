import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

const Editor = ({ filePath, content, isActive, onSave, onClose }) => {
  const editorRef = useRef(null);
  const monacoEditorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      // Initialize Monaco Editor
      const editor = monaco.editor.create(editorRef.current, {
        value: content,
        language: getLanguageFromPath(filePath),
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        tabSize: 2,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        wordWrap: 'on',
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: false,
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10
        }
      });

      // Disable TypeScript/JavaScript diagnostics
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true
      });

      monacoEditorRef.current = editor;

      // Handle save
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave(filePath, editor.getValue());
      });

      // Force layout update
      setTimeout(() => {
        editor.layout();
      }, 0);

      return () => {
        editor.dispose();
        monacoEditorRef.current = null;
      };
    }
  }, [filePath, content, onSave]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.setValue(content);
      // Force layout update when content changes
      setTimeout(() => {
        monacoEditorRef.current.layout();
      }, 0);
    }
  }, [content]);

  const getLanguageFromPath = (path) => {
    const extension = path.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json'
    };
    return languageMap[extension] || 'plaintext';
  };

  return (
    <div className={`editor ${isActive ? 'active' : ''}`} style={{ display: isActive ? 'flex' : 'none' }}>
      <div ref={editorRef} className="monaco-editor" style={{ flex: 1, width: '100%', height: '100%' }} />
    </div>
  );
};

export default Editor;