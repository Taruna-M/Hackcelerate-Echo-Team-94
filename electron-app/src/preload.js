// Preload script for Electron application
// This script runs in the renderer process but has access to Node.js APIs
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// specific Electron APIs without exposing the entire API
contextBridge.exposeInMainWorld('electronAPI', {
  // API calls
  sendApiRequest: (url, options) => ipcRenderer.invoke('api:send-request', url, options),
  // Settings
  getStoreValue: (key) => ipcRenderer.invoke('store:get', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('store:set', key, value),
  // File system operations
  getFileTree: () => ipcRenderer.invoke('file:getFileTree'),
  openFolder: () => ipcRenderer.invoke('file:openFolder'),
  readFile: (filePath) => ipcRenderer.invoke('file:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('file:writeFile', filePath, content),
  // App info
  appInfo: {
    name: 'Echo Code Editor',
    version: '1.0.0',
    isElectron: true
  }
});

// Log when preload script has executed
console.log('Preload script loaded');
