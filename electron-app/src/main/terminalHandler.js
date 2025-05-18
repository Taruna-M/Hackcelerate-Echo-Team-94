const { spawn } = require('child_process');
const os = require('os');

// Store active terminal processes
const activeProcesses = new Map();

// Get appropriate shell based on OS
function getDefaultShell() {
  if (process.platform === 'win32') {
    return 'powershell.exe';
  } else if (process.platform === 'darwin') {
    return '/bin/zsh';
  } else {
    return '/bin/bash';
  }
}

// Execute a command in a shell
function executeCommand(window, command) {
  const shell = getDefaultShell();
  const args = [];
  
  // Prepare shell-specific arguments
  if (shell.includes('powershell')) {
    args.push('-Command', command);
  } else {
    args.push('-c', command);
  }
  
  // Spawn the process
  const proc = spawn(shell, args, {
    cwd: os.homedir(),
    env: process.env,
    shell: true
  });
  
  const processId = Date.now().toString();
  const processInfo = {
    id: processId,
    name: command.split(' ')[0],
    command: command,
    startTime: new Date()
  };
  
  activeProcesses.set(processId, proc);
  
  // Notify about process start
  if (window && !window.isDestroyed()) {
    window.webContents.send('terminal:output', {
      type: 'process-start',
      process: processInfo
    });
  }
  
  // Handle stdout
  proc.stdout.on('data', (data) => {
    const output = data.toString();
    if (window && !window.isDestroyed()) {
      window.webContents.send('terminal:output', {
        type: 'output',
        content: output
      });
    }
  });
  
  // Handle stderr
  proc.stderr.on('data', (data) => {
    const output = data.toString();
    if (window && !window.isDestroyed()) {
      window.webContents.send('terminal:output', {
        type: 'error',
        content: output
      });
    }
  });
  
  // Handle process exit
  proc.on('close', (code) => {
    if (window && !window.isDestroyed()) {
      window.webContents.send('terminal:output', {
        type: 'info',
        content: `Process exited with code ${code}`
      });
      
      // Send process end notification
      window.webContents.send('terminal:output', {
        type: 'process-end',
        processId: processId,
        exitCode: code,
        duration: (new Date() - processInfo.startTime) / 1000 // Duration in seconds
      });
    }
    activeProcesses.delete(processId);
  });
  
  // Handle errors
  proc.on('error', (error) => {
    if (window && !window.isDestroyed()) {
      window.webContents.send('terminal:output', {
        type: 'error',
        content: `Error: ${error.message}`
      });
      
      // Send process end notification with error
      window.webContents.send('terminal:output', {
        type: 'process-end',
        processId: processId,
        exitCode: 1, // Error exit code
        error: error.message,
        duration: (new Date() - processInfo.startTime) / 1000 // Duration in seconds
      });
    }
    activeProcesses.delete(processId);
  });
  
  return { success: true, processId };
}

// Kill a specific process
function killProcess(processId) {
  if (activeProcesses.has(processId)) {
    const proc = activeProcesses.get(processId);
    proc.kill();
    activeProcesses.delete(processId);
    return { success: true };
  }
  return { success: false, error: 'Process not found' };
}

// Kill all active processes
function killAllProcesses() {
  for (const proc of activeProcesses.values()) {
    proc.kill();
  }
  activeProcesses.clear();
  return { success: true };
}

module.exports = {
  executeCommand,
  killProcess,
  killAllProcesses
};
