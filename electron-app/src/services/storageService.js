/**
 * Storage Service
 * Provides utilities for storing and retrieving sensitive data
 */

// Simple in-memory storage for development purposes
// In a production app, this should use electron-store with encryption
let memoryStorage = {};

/**
 * Save API key to storage
 * @param {string} key - Name of the key
 * @param {string} value - Value to store
 */
export const saveApiKey = (key, value) => {
  memoryStorage[key] = value;
  // In a real app, you would save it securely, e.g.:
  // const Store = require('electron-store');
  // const store = new Store({ encryptionKey: 'your-encryption-key' });
  // store.set(key, value);
};

/**
 * Get API key from storage
 * @param {string} key - Name of the key to retrieve
 * @returns {string} - The stored value or null if not found
 */
export const getApiKey = (key) => {
  return memoryStorage[key] || null;
  // In a real app:
  // return store.get(key, null);
};

/**
 * Check if API key exists
 * @param {string} key - Name of the key to check
 * @returns {boolean} - True if the key exists
 */
export const hasApiKey = (key) => {
  return !!memoryStorage[key];
  // In a real app:
  // return store.has(key);
};

/**
 * Delete API key from storage
 * @param {string} key - Name of the key to delete
 */
export const deleteApiKey = (key) => {
  delete memoryStorage[key];
  // In a real app:
  // store.delete(key);
};
