/**
 * Security policy configuration for Electron app
 * Sets up CSP and other security features
 */

// Check if we're in development mode (webpack-dev-server)
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const setupSecurityPolicy = (mainWindow) => {
  // Set Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    // For development mode, we need to allow unsafe-eval for webpack hot-reload
    const cspDirectives = isDev ? [
      // Development CSP - more permissive for hot reloading
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: ws: http: https:;",
      "connect-src 'self' ws: http: https: https://openrouter.ai https://*.openrouter.ai https://*.openai.com https://*.anthropic.com"
    ] : [
      // Production CSP - more restrictive
      "default-src 'self' 'unsafe-inline' data:;", 
      "connect-src 'self' https://openrouter.ai https://*.openrouter.ai https://*.openai.com https://*.anthropic.com;"
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
