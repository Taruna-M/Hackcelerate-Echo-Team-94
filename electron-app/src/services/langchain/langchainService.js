/**
 * LangChain Service
 * Main integration service for connecting LangChain with Redis, Qdrant, and OpenRouter
 */

import { LANGCHAIN_CONFIG } from './config';
import { RedisMemoryManager } from './redisMemory';
import { QdrantVectorStore } from './qdrantVectorStore';
import { generateChatCompletion } from '../openRouterService';

/**
 * LangChainService - Main service for AI integration with LangChain
 * Manages memory, context, and communication with AI models
 */
export class LangChainService {
  constructor(options = {}) {
    const { sessionId, userId } = options;
    
    this.sessionId = sessionId || `session_${Date.now()}`;
    this.userId = userId || `user_${Date.now()}`;
    
    // Initialize Redis memory manager
    this.memoryManager = new RedisMemoryManager({
      sessionId: this.sessionId,
    });
    
    // Initialize Qdrant vector store
    this.vectorStore = new QdrantVectorStore();
    
    // Model settings
    this.modelId = LANGCHAIN_CONFIG.llm.defaultModelId;
    this.systemPrompt = LANGCHAIN_CONFIG.prompts.codeAssistance;
    
    console.log('LangChain service initialized with session:', this.sessionId);
  }

  /**
   * Set the current code context
   * @param {string} code - The code content
   * @param {string} language - The programming language
   */
  async setCodeContext(code, language = 'javascript') {
    // Save context to Redis for quick access
    await this.memoryManager.saveCodeContext(code, language);
    
    // Store in vector database for similarity search
    await this.vectorStore.storeCodeContext(
      code,
      language,
      this.sessionId,
      this.userId
    );
    
    return true;
  }

  /**
   * Get relevant memory and context for a query
   * @param {string} query - The user's query
   * @returns {Object} Context object with chat history and code context
   */
  async getRelevantContext(query) {
    // Fetch chat history from Redis
    const chatHistory = await this.memoryManager.getMessages();
    
    // Fetch current code context
    const codeContext = await this.memoryManager.getCodeContext();
    
    // Find similar code contexts from vector store
    const similarCode = await this.vectorStore.searchSimilarCode(
      query,
      3,
      { userId: this.userId }
    );
    
    // Find similar AI memories
    const similarMemories = await this.vectorStore.searchSimilarMemories(
      query,
      3,
      { userId: this.userId }
    );
    
    return {
      chatHistory,
      currentCode: codeContext,
      similarCode,
      similarMemories,
    };
  }

  /**
   * Generate messages array for OpenRouter API
   * @param {string} userQuery - The user's query
   * @param {Object} context - The context object
   * @returns {Array} Array of message objects
   */
  _generateMessagesWithContext(userQuery, context) {
    const { chatHistory, currentCode, similarCode, similarMemories } = context;
    
    // Start with system message
    let systemContent = this.systemPrompt;
    
    // Add current code context if available
    if (currentCode && currentCode.code) {
      systemContent += `\n\nCurrent code (${currentCode.language}):\n\`\`\`${currentCode.language}\n${currentCode.code}\n\`\`\``;
    }
    
    // Add similar code examples if available and relevant
    if (similarCode && similarCode.length > 0) {
      systemContent += '\n\nSimilar code examples from your codebase:';
      similarCode.forEach((item, i) => {
        // Only include if different from current code
        if (!currentCode || item.code !== currentCode.code) {
          systemContent += `\n\nExample ${i+1} (${item.language}):\n\`\`\`${item.language}\n${item.code.substring(0, 500)}${item.code.length > 500 ? '...' : ''}\n\`\`\``;
        }
      });
    }
    
    // Add similar previous interactions if available
    if (similarMemories && similarMemories.length > 0) {
      systemContent += '\n\nRelevant previous interactions:';
      similarMemories.forEach((item, i) => {
        systemContent += `\n\nUser: ${item.prompt}\nYou: ${item.response.substring(0, 200)}${item.response.length > 200 ? '...' : ''}`;
      });
    }
    
    // Create messages array starting with system message
    const messages = [
      { role: 'system', content: systemContent }
    ];
    
    // Add recent chat history (last 10 messages)
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(msg => {
      // Skip system messages from history
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });
    
    // Add current user query
    messages.push({ role: 'user', content: userQuery });
    
    return messages;
  }

  /**
   * Send a message to the AI and get a response
   * @param {string} message - User's message
   * @param {string} apiKey - OpenRouter API key
   * @returns {Object} The response object
   */
  async sendMessage(message, apiKey) {
    if (!message || !apiKey) {
      throw new Error('Message and API key are required');
    }
    
    try {
      // Save user message to memory
      await this.memoryManager.saveMessage({
        role: 'user',
        content: message
      });
      
      // Get relevant context
      const context = await this.getRelevantContext(message);
      
      // Generate messages with context
      const messages = this._generateMessagesWithContext(message, context);
      
      // Call OpenRouter API
      const response = await generateChatCompletion(
        this.modelId,
        messages,
        apiKey,
        {
          temperature: LANGCHAIN_CONFIG.llm.codeTemperature,
          max_tokens: LANGCHAIN_CONFIG.llm.maxTokens
        }
      );
      
      // Extract assistant message from response
      const assistantMessage = response.choices[0].message;
      
      // Save assistant message to memory
      await this.memoryManager.saveMessage(assistantMessage);
      
      // Store in vector memory
      await this.vectorStore.storeAIMemory(
        message,
        assistantMessage.content,
        this.sessionId,
        this.userId,
        { modelId: this.modelId }
      );
      
      return {
        ...response,
        sessionId: this.sessionId,
      };
    } catch (error) {
      console.error('Error in LangChain service:', error);
      throw error;
    }
  }

  /**
   * Change the AI model
   * @param {string} modelId - The new model ID
   */
  setModel(modelId) {
    this.modelId = modelId;
  }

  /**
   * Clear chat history
   */
  async clearChatHistory() {
    await this.memoryManager.clearChatHistory();
  }

  /**
   * Clear entire session (chat history and context)
   */
  async clearSession() {
    await this.memoryManager.clearSession();
  }
}
