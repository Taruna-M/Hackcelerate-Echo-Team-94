const { app, BrowserWindow, protocol, ipcMain } = require('electron');
const path = require('node:path');
const { setupSecurityPolicy } = require('./main/securityPolicy');
const { readFile, writeFile, openFolder, getFileTree } = require('./main/fileSystemHandler');
const { executeCommand, killProcess, killAllProcesses } = require('./main/terminalHandler');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,   // Increased window size for better viewing experience
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      enableRemoteModule: false,
    },
  });

  // Apply security policy
  setupSecurityPolicy(mainWindow);

  // Load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// Set up IPC handlers for file system operations and terminal
function setupIpcHandlers() {
  // Get file tree
  ipcMain.handle('file:getFileTree', async () => {
    try {
      return getFileTree();
    } catch (error) {
      return { error: error.message };
    }
  });

  // Open folder dialog
  ipcMain.handle('file:openFolder', async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      return await openFolder(window);
    } catch (error) {
      return { error: error.message };
    }
  });

  // Read file
  ipcMain.handle('file:readFile', async (event, filePath) => {
    try {
      return readFile(filePath);
    } catch (error) {
      return { error: error.message };
    }
  });

  // Write file
  ipcMain.handle('file:writeFile', async (event, filePath, content) => {
    try {
      return writeFile(filePath, content);
    } catch (error) {
      return { error: error.message };
    }
  });
  
  // Terminal command execution
  ipcMain.handle('terminal:executeCommand', async (event, command) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      return executeCommand(window, command);
    } catch (error) {
      return { error: error.message };
    }
  });
  
  // Kill terminal process
  ipcMain.handle('terminal:killProcess', async (event, processId) => {
    try {
      return killProcess(processId);
    } catch (error) {
      return { error: error.message };
    }
  });
  
  // Kill all terminal processes
  ipcMain.handle('terminal:killAllProcesses', async () => {
    try {
      return killAllProcesses();
    } catch (error) {
      return { error: error.message };
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();
  setTimeout(() => {
    createWindow(); // Second peer window
  }, 1000); // Small delay to avoid race conditions
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
