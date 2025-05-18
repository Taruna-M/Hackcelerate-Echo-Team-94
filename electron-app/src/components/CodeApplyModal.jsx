import React, { useState, useEffect } from 'react';
import './CodeApplyModal.css';

const CodeApplyModal = ({ isOpen, onClose, code, language, files, onApply }) => {
  const [selectedFile, setSelectedFile] = useState('');
  const [position, setPosition] = useState('replace'); // 'replace', 'append', 'prepend'
  const [customFile, setCustomFile] = useState('');
  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  // Reset state when modal opens with new code
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(files.length > 0 ? files[0].path : '');
      setPosition('replace');
      setCustomFile('');
      setIsCreatingNewFile(false);
      setError('');
      loadPreview(files.length > 0 ? files[0].path : '', 'replace');
    }
  }, [isOpen, code, files]);

  // Load file preview when selection changes
  const loadPreview = async (filePath, insertPosition) => {
    if (!filePath) {
      setPreview('');
      return;
    }

    try {
      // For existing files, load content
      if (!isCreatingNewFile) {
        const result = await window.electronAPI.readFile(filePath);
        if (result.error) {
          throw new Error(result.error);
        }

        const fileContent = result.content;
        let newContent = '';

        switch (insertPosition) {
          case 'replace':
            newContent = code;
            break;
          case 'append':
            newContent = fileContent + '\n\n' + code;
            break;
          case 'prepend':
            newContent = code + '\n\n' + fileContent;
            break;
          default:
            newContent = code;
        }

        setPreview(newContent);
      } else {
        // For new files, just show the code
        setPreview(code);
      }
    } catch (err) {
      setError(`Error loading file: ${err.message}`);
      setPreview('');
    }
  };

  const handleFileChange = (e) => {
    const path = e.target.value;
    setSelectedFile(path);
    loadPreview(path, position);
  };

  const handlePositionChange = (e) => {
    const pos = e.target.value;
    setPosition(pos);
    loadPreview(selectedFile, pos);
  };

  const handleCustomFileChange = (e) => {
    setCustomFile(e.target.value);
  };

  const toggleNewFile = () => {
    setIsCreatingNewFile(!isCreatingNewFile);
    if (!isCreatingNewFile) {
      setSelectedFile('');
      setPreview(code);
    } else if (files.length > 0) {
      setSelectedFile(files[0].path);
      loadPreview(files[0].path, position);
    }
  };

  const handleApply = async () => {
    try {
      const targetPath = isCreatingNewFile ? customFile : selectedFile;
      
      if (!targetPath) {
        setError('Please select or enter a file path');
        return;
      }

      // Normalize path separators
      const normalizedPath = targetPath.replace(/\\/g, '/');
      let newContent = code;
      
      if (isCreatingNewFile) {
        // Ensure parent directories exist
        const dirPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'));
        if (dirPath) {
          await window.electronAPI.executeCommand(`mkdir -p "${dirPath}"`);
        }
        
        // Create new file
        const result = await window.electronAPI.writeFile(normalizedPath, code);
        if (result && result.error) {
          throw new Error(result.error);
        }
      } else {
        // Update existing file
        const result = await window.electronAPI.readFile(selectedFile);
        if (result.error) {
          throw new Error(result.error);
        }

        const fileContent = result.content;

        switch (position) {
          case 'replace':
            newContent = code;
            break;
          case 'append':
            newContent = fileContent + '\n\n' + code;
            break;
          case 'prepend':
            newContent = code + '\n\n' + fileContent;
            break;
          default:
            newContent = code;
        }

        const writeResult = await window.electronAPI.writeFile(selectedFile, newContent);
        if (writeResult && writeResult.error) {
          throw new Error(writeResult.error);
        }
      }

      // Call the onApply callback with the path, operation, and new content
      onApply({
        path: normalizedPath,
        content: newContent,
        operation: isCreatingNewFile ? 'create' : position,
        success: true
      });

      onClose();
    } catch (err) {
      console.error('Error applying code:', err);
      setError(`Error applying code: ${err.message}`);
      onApply({
        path: isCreatingNewFile ? customFile : selectedFile,
        operation: isCreatingNewFile ? 'create' : position,
        success: false,
        error: err.message
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="code-apply-modal-overlay">
      <div className="code-apply-modal">
        <div className="code-apply-modal-header">
          <h2>Apply Code</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="code-apply-modal-body">
          <div className="code-apply-options">
            <div className="option-group">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={isCreatingNewFile}
                  onChange={toggleNewFile}
                />
                Create new file
              </label>
            </div>

            {isCreatingNewFile ? (
              <div className="option-group">
                <label htmlFor="custom-file">File path:</label>
                <input
                  type="text"
                  id="custom-file"
                  value={customFile}
                  onChange={handleCustomFileChange}
                  placeholder="Enter file path (e.g., src/utils/helper.js)"
                  className="file-input"
                />
              </div>
            ) : (
              <>
                <div className="option-group">
                  <label htmlFor="file-select">Target file:</label>
                  <select
                    id="file-select"
                    value={selectedFile}
                    onChange={handleFileChange}
                    className="file-select"
                  >
                    {files.map((file) => (
                      <option key={file.path} value={file.path}>
                        {file.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="option-group">
                  <label htmlFor="position-select">Insert position:</label>
                  <select
                    id="position-select"
                    value={position}
                    onChange={handlePositionChange}
                    className="position-select"
                  >
                    <option value="replace">Replace file content</option>
                    <option value="append">Append to end</option>
                    <option value="prepend">Prepend to beginning</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="preview-section">
            <h3>Preview</h3>
            {error && <div className="error-message">{error}</div>}
            <pre className="code-preview">
              <code>{preview}</code>
            </pre>
          </div>
        </div>

        <div className="code-apply-modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="apply-button" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default CodeApplyModal;
