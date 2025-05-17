/**
 * LangChain Configuration
 * Contains configuration settings for LangChain, Redis, and Qdrant integration
 */

export const LANGCHAIN_CONFIG = {
  // LLM Configuration
  llm: {
    // Default model to use with OpenRouter
    defaultModelId: 'deepseek/deepseek-v3-base:free',
    // Temperature for code-related completions
    codeTemperature: 0.2,
    // Max tokens for typical responses
    maxTokens: 1500,
  },
  
  // Redis Configuration
  redis: {
    // Redis connection settings (should be env variables in production)
    url: 'redis://localhost:6379',
    // Key prefix for Redis storage
    keyPrefix: 'echo-ide:',
    // TTL for chat history (24 hours in seconds)
    chatHistoryTTL: 86400,
    // Default session ID if none provided
    defaultSessionId: 'default-session',
  },
  
  // Qdrant Configuration
  qdrant: {
    // Qdrant connection settings (should be env variables in production)
    url: 'http://localhost:6333',
    // Collection name for code context embeddings
    codeContextCollection: 'echo-code-contexts',
    // Collection name for AI memory
    aiMemoryCollection: 'echo-ai-memory',
  },
  
  // Memory Configuration
  memory: {
    // Maximum number of messages to keep in context window
    maxMessages: 50,
    // Whether to include code snippets in memory
    includeCodeSnippets: true,
  },
  
  // Prompt Configuration
  prompts: {
    // System message for code assistance
    codeAssistance: 'You are an AI assistant specialized in programming help. You provide clear, concise code suggestions based on the user\'s context. When suggesting code, follow these guidelines:\n\n- Write clean, efficient, and well-commented code\n- Follow standard conventions for the language being used\n- Provide explanations for complex logic\n- Consider error handling and edge cases\n\nYou have access to the user\'s current code context and chat history.'
  }
};
