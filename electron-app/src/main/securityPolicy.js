/**
 * Security policy configuration for Electron app
 * Sets up CSP and other security features
 */

// Check if we're in development mode (webpack-dev-server)
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const setupSecurityPolicy = (mainWindow) => {
  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const cspDirectives = [
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval'; " +
      "connect-src 'self' https://openrouter.ai/api/ https://api.openrouter.ai/ https://*.gcp.cloud.qdrant.io:* https://*.upstash.io https://0.peerjs.com/peerjs/id wss://0.peerjs.com https://*.supabase.co wss://*.supabase.co; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "font-src 'self' data:; " +
      "worker-src 'self' blob:; " +
      "frame-src 'self'"
    ];
    
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': cspDirectives
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
