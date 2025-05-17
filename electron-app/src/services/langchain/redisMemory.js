/**
 * Redis-based memory management for chat history and context
 * Integrates with LangChain for maintaining conversation history across sessions
 */

import { LANGCHAIN_CONFIG } from './config';

// Simulated Redis client for the hackathon
// In a production environment, you would use the actual Redis client
class SimulatedRedisClient {
  constructor() {
    this.store = {};
    this.expireTimers = {};
    console.log('Simulated Redis client initialized');
  }

  async set(key, value, options = {}) {
    this.store[key] = value;
    
    // Handle expiration if provided
    if (options.EX) {
      // Clear any existing expiration timer
      if (this.expireTimers[key]) {
        clearTimeout(this.expireTimers[key]);
      }
      
      // Set new expiration timer
      this.expireTimers[key] = setTimeout(() => {
        delete this.store[key];
        delete this.expireTimers[key];
      }, options.EX * 1000);
    }
    
    return 'OK';
  }

  async get(key) {
    return this.store[key] || null;
  }

  async del(key) {
    delete this.store[key];
    
    if (this.expireTimers[key]) {
      clearTimeout(this.expireTimers[key]);
      delete this.expireTimers[key];
    }
    
    return 1;
  }

  async exists(key) {
    return this.store[key] ? 1 : 0;
  }

  async keys(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Object.keys(this.store).filter(key => regex.test(key));
  }
}

/**
 * RedisMemoryManager - Handles chat memory using Redis
 * Uses a simulated Redis client for the hackathon
 */
export class RedisMemoryManager {
  constructor(options = {}) {
    const { sessionId, keyPrefix, chatHistoryTTL } = {
      sessionId: LANGCHAIN_CONFIG.redis.defaultSessionId,
      keyPrefix: LANGCHAIN_CONFIG.redis.keyPrefix,
      chatHistoryTTL: LANGCHAIN_CONFIG.redis.chatHistoryTTL,
      ...options
    };
    
    this.sessionId = sessionId;
    this.keyPrefix = keyPrefix;
    this.chatHistoryTTL = chatHistoryTTL;
    this.client = new SimulatedRedisClient();
    this.maxMessages = LANGCHAIN_CONFIG.memory.maxMessages;
  }

  /**
   * Get the full key for Redis storage
   * @param {string} key - The base key
   * @returns {string} - The full key with prefix and session ID
   */
  getKey(key) {
    return `${this.keyPrefix}${this.sessionId}:${key}`;
  }

  /**
   * Save a message to chat history
   * @param {Object} message - The message object with role and content
   */
  async saveMessage(message) {
    const historyKey = this.getKey('chat_history');
    
    // Get existing messages
    let messages = [];
    const existingData = await this.client.get(historyKey);
    
    if (existingData) {
      try {
        messages = JSON.parse(existingData);
      } catch (error) {
        console.error('Error parsing chat history:', error);
      }
    }
    
    // Add new message and trim to max size
    messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the most recent N messages
    if (messages.length > this.maxMessages) {
      messages = messages.slice(messages.length - this.maxMessages);
    }
    
    // Save back to Redis with expiration
    await this.client.set(
      historyKey, 
      JSON.stringify(messages), 
      { EX: this.chatHistoryTTL }
    );
    
    return messages;
  }

  /**
   * Get all messages from chat history
   * @returns {Array} - The array of message objects
   */
  async getMessages() {
    const historyKey = this.getKey('chat_history');
    const data = await this.client.get(historyKey);
    
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing chat history:', error);
      return [];
    }
  }

  /**
   * Save code context to Redis
   * @param {string} code - The code content
   * @param {string} language - The programming language
   */
  async saveCodeContext(code, language = 'javascript') {
    const contextKey = this.getKey('code_context');
    
    await this.client.set(
      contextKey,
      JSON.stringify({ code, language, timestamp: new Date().toISOString() }),
      { EX: this.chatHistoryTTL }
    );
  }

  /**
   * Get the current code context
   * @returns {Object|null} - The code context object or null
   */
  async getCodeContext() {
    const contextKey = this.getKey('code_context');
    const data = await this.client.get(contextKey);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing code context:', error);
      return null;
    }
  }

  /**
   * Clear the chat history
   */
  async clearChatHistory() {
    const historyKey = this.getKey('chat_history');
    await this.client.del(historyKey);
  }

  /**
   * Clear all data for this session
   */
  async clearSession() {
    const keys = await this.client.keys(`${this.keyPrefix}${this.sessionId}:*`);
    
    for (const key of keys) {
      await this.client.del(key);
    }
  }
}
