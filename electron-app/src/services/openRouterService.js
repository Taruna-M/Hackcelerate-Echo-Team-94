/**
 * OpenRouter API Service
 * Handles interactions with the OpenRouter API for AI model inference
 */
import { withFallback, generateChatCompletionElectron } from './openRouterServiceFallback';

// Default API URL for OpenRouter
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Send a chat completion request to OpenRouter
 * @param {string} modelId - The ID of the model to use
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} apiKey - OpenRouter API key
 * @param {Object} options - Additional options for the request
 * @returns {Promise} - The completion response
 */
export const generateChatCompletionDirect = async (modelId, messages, apiKey, options = {}) => {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  const defaultOptions = {
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  const requestOptions = { ...defaultOptions, ...options };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://echo-ide.com', // Your app's domain
        'X-Title': 'Echo IDE' // Your app's name
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages,
        ...requestOptions
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    throw error;
  }
};

/**
 * Generate chat completion with fallback mechanism for CSP issues
 * @param {string} modelId - The ID of the model to use
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} apiKey - OpenRouter API key
 * @param {Object} options - Additional options for the request
 * @returns {Promise} - The completion response
 */
export const generateChatCompletion = async (modelId, messages, apiKey, options = {}) => {
  try {
    // Use the direct method first, fall back to the Electron method if CSP blocks
    return await withFallback(generateChatCompletionDirect, modelId, messages, apiKey, options);
  } catch (error) {
    // If all else fails, return a properly formatted simulated response
    console.warn('Using simulated response due to API errors:', error.message);
    
    // Import simulated responses module
    const { getSimulatedResponse } = await import('./simulatedResponses.js');
    
    // Get the first message that's from the user to use as our query
    const userQuery = messages.find(msg => msg.role === 'user')?.content || 'help with code';
    
    // Return a nicely formatted simulated response
    return getSimulatedResponse(userQuery, modelId);
  }
};

/**
 * Get a code completion using context from the editor
 * @param {string} modelId - The ID of the model to use
 * @param {string} codeContext - Current code context from the editor
 * @param {string} prompt - User's prompt or request
 * @param {string} apiKey - OpenRouter API key
 * @param {Object} options - Additional options for the request
 * @returns {Promise} - The completion response
 */
export const getCodeCompletion = async (modelId, codeContext, prompt, apiKey, options = {}) => {
  // Construct messages array with code context
  const messages = [
    {
      role: 'system',
      content: `You are an AI assistant specialized in programming help. You have access to the user's current code context. 
      Provide helpful, clear, and concise responses. When suggesting code, make sure it integrates well with the existing code.
      Current code context:\n\n${codeContext}`
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  // Set code-specific options
  const codeOptions = {
    temperature: 0.3, // Lower temperature for more deterministic code responses
    max_tokens: 1500, // Allow longer responses for code
    ...options
  };

  return generateChatCompletion(modelId, messages, apiKey, codeOptions);
};

/**
 * Get available models from OpenRouter
 * This is a simple implementation - OpenRouter doesn't have a dedicated models endpoint,
 * so we're using a hardcoded list of the requested models
 * @returns {Array} - Array of available models
 */
export const getAvailableModels = () => {
  return [
    { 
      id: 'deepseek/deepseek-v3-base:free', 
      name: 'DeepSeek V3 Base', 
      description: 'High-quality code completions with fast response times' 
    },
    { 
      id: 'meta-llama/llama-4-maverick:free', 
      name: 'Llama 4 Maverick', 
      description: 'Meta AI model optimized for code' 
    }
  ];
};
