/**
 * LangChain Services Index
 * Exports all LangChain services for use throughout the application
 */

export { LANGCHAIN_CONFIG } from './config';
export { RedisMemoryManager } from './redisMemory';
export { QdrantVectorStore } from './qdrantVectorStore';
export { LangChainService } from './langchainService';

/**
 * Creates a new LangChain service instance
 * @param {Object} options - Configuration options
 * @returns {LangChainService} A new LangChain service instance
 */
export const createLangChainService = (options = {}) => {
  const { LangChainService } = require('./langchainService');
  return new LangChainService(options);
};
