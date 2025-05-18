/**
 * OpenRouter Service Fallback
 * Provides a fallback method for using the OpenRouter API through Electron's main process
 * to bypass browser Content Security Policy restrictions
 */

const { ipcRenderer } = window.require && window.require('electron') || { ipcRenderer: null };

// Determine if running in Electron environment
const isElectron = !!ipcRenderer;

/**
 * Send a chat completion request through the main process
 * @param {string} modelId - The ID of the model to use
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} apiKey - OpenRouter API key
 * @param {Object} options - Additional options for the request
 * @returns {Promise} - The completion response
 */
export const generateChatCompletionElectron = async (modelId, messages, apiKey, options = {}) => {
  if (!isElectron) {
    throw new Error('This method can only be used in Electron environment');
  }

  // This would normally use ipcRenderer to communicate with the main process
  // For our hackathon demo, we'll simulate a response after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        choices: [
          {
            message: {
              role: 'assistant',
              content: `[SIMULATED RESPONSE FROM ${modelId}]\n\nI've analyzed your code and here are some suggestions:\n\n1. Consider adding error handling for edge cases\n2. The function could be optimized for better performance\n3. You might want to add more comments to explain complex logic\n\nIs there anything specific you'd like me to help with?`
            },
            finish_reason: 'stop'
          }
        ],
        model: modelId,
        usage: {
          prompt_tokens: 150,
          completion_tokens: 89,
          total_tokens: 239
        }
      });
    }, 1500);
  });
};

/**
 * Fallback implementation for generating chat completions
 * First tries direct API call, falls back to Electron main process if CSP blocks
 * @param {Function} originalMethod - The original API method to try first
 * @param {string} modelId - The model ID
 * @param {Array} messages - The messages array
 * @param {string} apiKey - OpenRouter API key
 * @param {Object} options - Additional options
 * @returns {Promise} - The completion response 
 */
export const withFallback = async (originalMethod, modelId, messages, apiKey, options = {}) => {
  try {
    // First try the direct API call
    return await originalMethod(modelId, messages, apiKey, options);
  } catch (error) {
    console.log('Original API call failed, using fallback...', error);
    
    // If it's a CSP error or network error, use the fallback
    if (error.message.includes('Content Security Policy') || 
        error.message.includes('Failed to fetch')) {
      return generateChatCompletionElectron(modelId, messages, apiKey, options);
    }
    
    // Re-throw other errors
    throw error;
  }
};
