const { contextBridge, ipcRenderer } = require('electron');

// Expose only necessary methods for Monaco Editor and Yjs
contextBridge.exposeInMainWorld('electronAPI', {
  // Send data to the main process (e.g., Yjs changes or Monaco state)
  send: (channel, data) => {
    const validChannels = ['updateEditor', 'syncYjs']; // Add channels related to Yjs and Monaco
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Receive data from the main process (e.g., initial data, Yjs state)
  receive: (channel, func) => {
    const validChannels = ['editorState', 'yjsSync']; // Channels for receiving editor state and Yjs data
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

// Let main process know that preload script has loaded successfully
console.log('Preload script for Monaco Editor with Yjs loaded');

// You can add additional logic to expose platform information or other details as needed
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  // You can modify DOM or inject scripts if needed
});
