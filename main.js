const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const pty = require('node-pty');

let mainWindow;
let shell;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();

  // Initialize shell
  const shellType = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  shell = pty.spawn(shellType, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env
  });

  // Handle shell data
  shell.onData((data) => {
    mainWindow.webContents.send('terminal-data', data);
  });

  // Handle shell exit
  shell.onExit(({ exitCode, signal }) => {
    console.log(`Shell exited with code ${exitCode} and signal ${signal}`);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Terminal IPC handlers
ipcMain.on('terminal-input', (event, data) => {
  shell.write(data);
});

ipcMain.on('terminal-resize', (event, { cols, rows }) => {
  shell.resize(cols, rows);
});

// Dialog handler for folder selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// File system IPC handlers
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const fs = require('fs');
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

ipcMain.handle('write-file', async (event, { filePath, content }) => {
  try {
    const fs = require('fs');
    await fs.promises.writeFile(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
});

ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const fs = require('fs');
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.join(dirPath, item.name)
    }));
  } catch (error) {
    console.error('Error listing directory:', error);
    throw error;
  }
}); 