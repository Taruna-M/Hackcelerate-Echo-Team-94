// const { app, BrowserWindow } = require('electron');
// const path = require('node:path');
// const { setupSecurityPolicy } = require('./main/SecurityPolicy');

// // Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

// const createWindow = () => {
//   const mainWindow = new BrowserWindow({
//   width: 800,
//   height: 600,
//   webPreferences: {
//     contextIsolation: true,
//     preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
//     nodeIntegration: false,
//   },
// });


//   setupSecurityPolicy(mainWindow);
//   // and load the index.html of the app.
//   mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

//   // Open the DevTools.
//   mainWindow.webContents.openDevTools();
//   mainWindow.webContents.openDevTools();
//   // Set Content Security Policy to allow WebSocket connections AND Monaco workers
//   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
//     callback({
//       responseHeaders: {
//         ...details.responseHeaders,
//         'Content-Security-Policy': [
//           "default-src 'self'; " +
//           "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; " +
//           "style-src 'self' 'unsafe-inline'; " +
//           "connect-src 'self' ws://localhost:1234 wss://localhost:1234 https://unpkg.com; " +
//           "worker-src 'self' blob:; " +
//           "img-src 'self' blob: data:;"
//         ]
//       }
//     });
//   });
// };

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//   createWindow();

//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow();
//     }
//   });
// });

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and import them here.

// // const { app, BrowserWindow, session } = require('electron');
// // const path = require('path');
// // const fs = require('fs');

// // // Function to find the correct preload path
// // function findPreloadPath() {
// //   // Define possible preload script locations
// //   const possiblePaths = [
// //     // Standard webpack output location
// //     path.join(__dirname, '.webpack', 'renderer', 'main_window', 'preload.js'),
// //     // Direct path from project root
// //     path.join(__dirname, 'preload.js'),
// //     // Common webpack output locations
// //     path.join(__dirname, 'dist', 'preload.js'),
// //     path.join(__dirname, '.webpack', 'main', 'preload.js'),
// //     path.join(__dirname, 'build', 'preload.js')
// //   ];

// //   // Check which path exists
// //   for (const preloadPath of possiblePaths) {
// //     if (fs.existsSync(preloadPath)) {
// //       console.log(`Found preload script at: ${preloadPath}`);
// //       return preloadPath;
// //     }
// //   }

// //   // If no path is found, use a default and log a warning
// //   console.warn('Could not find preload script! Check your webpack configuration.');
// //   return path.join(__dirname, 'preload.js');
// // }

// // function createWindow() {
// //   // Get the correct preload path
// //   const preloadPath = findPreloadPath();
  
// //   const mainWindow = new BrowserWindow({
// //   width: 800,
// //   height: 600,
// //   webPreferences: {
// //     contextIsolation: true, // ✅ REQUIRED
// //     preload: path.join(__dirname, 'preload.js'),
// //     nodeIntegration: false, // ✅ recommended with contextIsolation
// //   },
// // });
// //   mainWindow.webContents.openDevTools();
// //   // Set Content Security Policy to allow WebSocket connections AND Monaco workers
// //   session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
// //     callback({
// //       responseHeaders: {
// //         ...details.responseHeaders,
// //         'Content-Security-Policy': [
// //           "default-src 'self'; " +
// //           "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; " +
// //           "style-src 'self' 'unsafe-inline'; " +
// //           "connect-src 'self' ws://localhost:1234 wss://localhost:1234 https://unpkg.com; " +
// //           "worker-src 'self' blob:; " +
// //           "img-src 'self' blob: data:;"
// //         ]
// //       }
// //     });
// //   });

// //   // Load your app
// //   // For development with a dev server
// //   if (process.env.NODE_ENV === 'development') {
// //     mainWindow.loadURL('http://localhost:3000');
// //     // Open DevTools
// //     mainWindow.webContents.openDevTools();
// //   } else {
// //     // For production build
// //     mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
// //   }

// //   // Log any errors when loading the page
// //   mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
// //     console.error('Failed to load:', errorCode, errorDescription);
// //   });
// // }

// // app.whenReady().then(() => {
// //   createWindow();

// //   app.on('activate', function () {
// //     if (BrowserWindow.getAllWindows().length === 0) createWindow();
// //   });
// // });

// // app.on('window-all-closed', function () {
// //   if (process.platform !== 'darwin') app.quit();
// // });

const { app, BrowserWindow, session } = require('electron');
const path = require('node:path');
const { setupSecurityPolicy } = require('./main/SecurityPolicy');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      //preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
    },
  });

  setupSecurityPolicy(mainWindow);
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.webContents.openDevTools();

  // Development-only CSP (for Monaco, Yjs, WebSocket)
  if (process.env.NODE_ENV === 'development') {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // 'Content-Security-Policy': [
          //   "default-src 'self'; " +
          //   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; " +
          //   "style-src 'self' 'unsafe-inline'; " +
          //   "connect-src 'self' ws://localhost:1234 wss://localhost:1234 https://unpkg.com; " +
          //   "worker-src 'self' blob:; " +
          //   "img-src 'self' blob: data:;"
          // ]
          'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:1234 wss://localhost:1234 wss://demos.yjs.dev https://unpkg.com; img-src 'self' data:; font-src 'self';"
        ]
        }
      });
    });
  }
};

app.whenReady().then(() => {
  createWindow(0, 0);       // First window
  createWindow(810, 0);     // Second window

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
