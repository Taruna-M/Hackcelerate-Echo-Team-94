/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

// src/renderer.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress ResizeObserver loop limit exceeded error
// This is a common error with Monaco Editor and doesn't affect functionality
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('ResizeObserver loop')) {
    return;
  }
  originalConsoleError(...args);
};

// Add global error handler for uncaught errors
window.addEventListener('error', (event) => {
  // Log the error but prevent it from showing in the UI if it's a ResizeObserver error
  if (event.message && event.message.includes('ResizeObserver loop')) {
    event.preventDefault();
    return;
  }
});

// Initialize the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Log application start
console.log('Echo Code Editor renderer started');


