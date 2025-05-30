import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
// Import LangChain service
import { createLangChainService } from '../services/langchain';
// Import file reference components
import FileReferencePanel from './FileReferencePanel';
// We still need these for API key management and available models
import { getAvailableModels } from '../services/openRouterService';
import { saveApiKey, getApiKey } from '../services/storageService';
// Import modal for code application
import CodeApplyModal from './CodeApplyModal';

// Component to render message content with markdown and code highlighting
const MessageContent = ({ content, files, onApplyCode }) => {
  // Detect if content is just a simple string without markdown
  const hasMarkdown = /[*#`\[\]_>-]/.test(content) || content.includes('\n');
  
  if (!hasMarkdown) {
    return <div className="message-content">{content}</div>;
  }

  return (
    <div className="message-content markdown-content">
      <ReactMarkdown
        components={{
          // Override paragraph rendering to prevent nesting issues
          p: ({ children }) => <span className="markdown-paragraph">{children}</span>,
          
          // Custom code renderer with proper HTML structure
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'javascript'; // Default to javascript for code blocks
            
            // For code blocks (not inline)
            if (!inline) {
              const codeContent = String(children).replace(/\n$/, '');
              
              // Check if this is actual code that can be applied to a file
              // Don't show APPLY button for simple file extensions or very short snippets
              const isActualCode = (() => {
                // If it's just a file extension like .docx, .pdf, etc.
                if (/^\.[a-z0-9]+$/i.test(codeContent.trim())) {
                  return false;
                }
                
                // If it's too short and doesn't contain any programming constructs
                if (codeContent.trim().length < 10 && 
                    !/(function|var|let|const|if|for|while|class|import|export|return|=>)/i.test(codeContent)) {
                  return false;
                }
                
                return true;
              })();
              
              return (
                <div className="code-block-wrapper">
                  <div className="code-block-container">
                    <div className="code-block-header">
                      <span className="code-language">{language}</span>
                      <div className="code-block-actions">
                        {isActualCode && (
                          <button
                            className="apply-button"
                            onClick={() => onApplyCode(codeContent, language)}
                            title="Apply this code to a file"
                          >
                            APPLY
                          </button>
                        )}
                        <button
                          className="copy-button"
                          onClick={() => {
                            navigator.clipboard.writeText(codeContent);
                          }}
                          title="Copy to clipboard"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={language}
                      PreTag="div"
                      {...props}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            } 
            
            // For inline code
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const ChatInterface = ({ codeValue = '', files = [] }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek/deepseek-v3-base:free');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(getApiKey('openrouter') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!getApiKey('openrouter'));
  const [fileReferences, setFileReferences] = useState([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [codeToApply, setCodeToApply] = useState({ code: '', language: '' });
  const messagesEndRef = useRef(null);
  
  // Create and store LangChain service instance
  const langChainServiceRef = useRef(null);
  
  // Get available models from service
  const availableModels = getAvailableModels();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize LangChain service
  useEffect(() => {
    // Create a unique session ID if not already stored
    const sessionId = localStorage.getItem('echo-session-id') || `session_${Date.now()}`;
    localStorage.setItem('echo-session-id', sessionId);
    
    // Create a unique user ID if not already stored
    const userId = localStorage.getItem('echo-user-id') || `user_${Date.now()}`;
    localStorage.setItem('echo-user-id', userId);
    
    // Initialize the LangChain service
    langChainServiceRef.current = createLangChainService({
      sessionId,
      userId
    });
    
    // Set initial model
    langChainServiceRef.current.setModel(selectedModel);
    
    // Load existing chat history from Redis
    const loadChatHistory = async () => {
      try {
        const history = await langChainServiceRef.current.memoryManager.getMessages();
        if (history && history.length > 0) {
          setMessages(history);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    
    loadChatHistory();
    
    // Cleanup on unmount
    return () => {
      // Nothing to clean up for now
    };
  }, []);

  // Update LangChain when model changes
  useEffect(() => {
    if (langChainServiceRef.current) {
      langChainServiceRef.current.setModel(selectedModel);
    }
  }, [selectedModel]);

  // Update code context when code editor content changes
  useEffect(() => {
    const updateCodeContext = async () => {
      if (langChainServiceRef.current && codeValue) {
        try {
          // Detect language from file extension or default to javascript
          const language = 'javascript'; // In a real app, would detect from file extension
          await langChainServiceRef.current.setCodeContext(codeValue, language);
        } catch (error) {
          console.error('Error updating code context:', error);
        }
      }
    };
    
    updateCodeContext();
  }, [codeValue]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save API key
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveApiKey('openrouter', apiKey.trim());
      setShowApiKeyInput(false);
      setError(null);
    }
  };

  // Clear chat history
  const handleClearChat = async () => {
    try {
      if (langChainServiceRef.current) {
        await langChainServiceRef.current.clearChatHistory();
      }
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Error clearing chat history:', err);
      setError('Failed to clear chat history');
    }
  };

  // Handle file reference changes
  const handleFileReferencesChange = useCallback((selectedFiles) => {
    setFileReferences(selectedFiles);
  }, []);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      setError('Please enter an OpenRouter API key first');
      setShowApiKeyInput(true);
      return;
    }

    // Add user message to UI immediately for better UX
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Use LangChain service to handle the message with context awareness
      if (!langChainServiceRef.current) {
        throw new Error('LangChain service not initialized');
      }
      
      // Prepare file references content if any files are selected
      let fileReferencesContent = '';
      if (fileReferences.length > 0) {
        fileReferencesContent = '\n\nReference Files:\n';
        for (const file of fileReferences) {
          try {
            // In a real implementation, this would get the file content from the file system
            // For now, we'll use the file.content property if it exists or try to load it
            let content = file.content;
            
            if (!content && window.electronAPI && window.electronAPI.readFile) {
              try {
                const result = await window.electronAPI.readFile(file.path);
                content = result.content;
              } catch (err) {
                console.error(`Error reading file ${file.path}:`, err);
                content = `// Error loading file: ${err.message}`;
              }
            }
            
            // Add file content to references
            const extension = file.name.split('.').pop().toLowerCase();
            fileReferencesContent += `\n\n--- ${file.name} ---\n\`\`\`${extension}\n${content || 'File content not available'}\n\`\`\``;
          } catch (err) {
            console.error(`Error processing file reference ${file.path}:`, err);
          }
        }
      }
      
      // Send message through LangChain service with file references
      const response = await langChainServiceRef.current.sendMessage(
        fileReferencesContent ? `${input}\n${fileReferencesContent}` : input,
        apiKey
      );

      // Response already saved to memory by LangChain service,
      // but update UI state as well for immediate feedback
      if (response.choices && response.choices.length > 0) {
        const assistantMessage = response.choices[0].message;
        
        // Update local messages state for immediate UI update
        setMessages(prev => {
          // Avoid duplicates if message was already added by history sync
          const exists = prev.some(msg => 
            msg.role === assistantMessage.role && 
            msg.content === assistantMessage.content && 
            msg.timestamp === assistantMessage.timestamp
          );
          
          return exists ? prev : [...prev, assistantMessage];
        });
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (err) {
      console.error('Error getting AI response:', err);
      setError(err.message || 'Failed to get a response from the AI');
      
      // If the error is related to the API key, show the API key input
      if (err.message.includes('API key')) {
        setShowApiKeyInput(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle model change
  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  // Handle code application
  const handleApplyCode = (code, language) => {
    setCodeToApply({ code, language });
    setIsApplyModalOpen(true);
  };

  // Handle code application result
  const handleCodeApplied = (result) => {
    // Add a system message about the code application
    const message = result.success
      ? `✅ Code successfully ${result.operation === 'create' ? 'created in' : result.operation === 'replace' ? 'replaced in' : result.operation === 'append' ? 'appended to' : 'prepended to'} ${result.path}`
      : `❌ Failed to apply code to ${result.path}: ${result.error}`;
    
    setMessages(prev => [...prev, { role: 'system', content: message }]);
    scrollToBottom();
    
    // If successful and we have content, notify parent component about the file change
    if (result.success && result.content) {
      // Find the CustomEvent constructor
      const event = new CustomEvent('fileContentChanged', {
        detail: {
          filePath: result.path,
          content: result.content,
          operation: result.operation
        }
      });
      
      // Dispatch the event
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-header-title">
          <h2>Code Assistant</h2>
          <span className="shared-memory-badge" title="Using shared AI memory across team members">Shared Memory</span>
        </div>
        <div className="chat-header-controls">
          <select 
            value={selectedModel} 
            onChange={handleModelChange}
            className="model-selector"
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleClearChat}
            className="clear-chat-button"
            title="Clear chat history"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {showApiKeyInput ? (
        <div className="api-key-container">
          <p>Enter your OpenRouter API key to continue:</p>
          <div className="api-key-input-group">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_or_..."
              className="api-key-input"
            />
            <button onClick={handleSaveApiKey} className="api-key-button">
              Save Key
            </button>
          </div>
          <p className="api-key-note">
            Get your key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">openrouter.ai/keys</a>
          </p>
        </div>
      ) : (
        <div className="messages-container">
          {error && <div className="error-message">{error}</div>}
          
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>Start a conversation with your code assistant.</p>
              <p className="model-info">Using: {availableModels.find(m => m.id === selectedModel)?.name}</p>
              <p className="model-description">
                {availableModels.find(m => m.id === selectedModel)?.description}
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : message.role === 'system' ? 'system-message' : 'assistant-message'}`}
              >
                <MessageContent 
                  content={message.content} 
                  files={files}
                  onApplyCode={handleApplyCode}
                />
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="message assistant-message">
              <div className="message-content loading">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* File Reference Panel */}
      {!showApiKeyInput && (
        <FileReferencePanel
          files={files}
          onFileReferencesChange={handleFileReferencesChange}
        />
      )}

      <div className="input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={fileReferences.length > 0 
            ? `Ask about your code with ${fileReferences.length} file reference${fileReferences.length > 1 ? 's' : ''}...` 
            : "Ask about your code..."}
          disabled={showApiKeyInput || isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim() || showApiKeyInput}
        >
          Send
        </button>
      </div>
      
      {/* API key management link */}
      <div className="settings-footer">
        <button 
          onClick={() => setShowApiKeyInput(!showApiKeyInput)} 
          className="settings-link"
        >
          {showApiKeyInput ? 'Cancel' : 'Change API Key'}
        </button>
      </div>

      {/* Code Apply Modal */}
      <CodeApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        code={codeToApply.code}
        language={codeToApply.language}
        files={files}
        onApply={handleCodeApplied}
      />
    </div>
  );
};

export default ChatInterface;
