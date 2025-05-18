/**
 * Security policy configuration for Electron app
 * Sets up CSP and other security features
 */

// Check if we're in development mode (webpack-dev-server)
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const setupSecurityPolicy = (mainWindow) => {
  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
    'Content-Security-Policy': [
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
  "worker-src 'self' blob:; " +
  "style-src 'self' 'unsafe-inline'; " +
  "connect-src 'self' ws://localhost:1234 wss://localhost:1234 wss://demos.yjs.dev https://unpkg.com; " +
  "img-src 'self' data:; " +
  "font-src 'self';"
]
    }
  });
});


  // Log any unhandled CSP errors in development mode
  if (isDev) {
    mainWindow.webContents.on('console-message', (event, level, message) => {
      if (message.includes('Content Security Policy')) {
        console.log('CSP Issue:', message);
      }
    });
  }
};

module.exports = {
  setupSecurityPolicy
};
