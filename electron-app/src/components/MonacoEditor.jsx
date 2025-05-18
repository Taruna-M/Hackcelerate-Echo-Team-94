// src/components/MonacoEditor.jsx
// import React, { useEffect, useRef } from "react";
// import * as monaco from "monaco-editor";
// import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";
// import { MonacoBinding } from "y-monaco";

// const MonacoEditor = () => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);

//   useEffect(() => {
//     // Create Yjs document
//     const ydoc = new Y.Doc();
//     console.log("rendered")
//     // WebSocket provider (change URL if needed)
//     //wss://demos.yjs.dev This is a public demo Yjs WebSocket server provided by the Yjs team. It hosts a WebSocket server that facilitates syncing Yjs documents in real time. Using it, your app can connect to the "my-room-name" room, and everyone connected to this room shares the same Yjs document state.

//     //const provider = new WebsocketProvider("wss://demos.yjs.dev", "my-room-name", ydoc);
//     const provider = new WebsocketProvider("ws://localhost:1234", "my-room-name", ydoc);
//     console.log(provider)
//     // Creates a new Yjs document (ydoc), the shared CRDT data structure representing the collaborative state.
//     const yText = ydoc.getText("monaco");
//     window.MonacoEnvironment = {
//     getWorkerUrl: function (moduleId, label) {
//         return `/monaco-editor-workers/${label}.worker.js`;
//     },
//     };
//     const editor = monaco.editor.create(editorContainerRef.current, {
//       value: "",
//       language: "javascript",
//       theme: "vs-dark",
//       automaticLayout: true,
//     });
//     editor.onDidChangeCursorPosition((e) => {
//         const index = editor.getModel().getOffsetAt(e.position);
//         provider.awareness.setLocalStateField("cursor", { index });
//     });

//     const decorations = new Map();

//     provider.awareness.on("change", () => {
//     const states = Array.from(provider.awareness.getStates().entries());
//     const myClientId = provider.awareness.clientID;

//     for (const [clientId, state] of states) {
//         if (clientId === myClientId) continue; // Skip self

//         const model = editor.getModel();
//         const oldDecorations = decorations.get(clientId) || [];

//         if (state.cursor && model) {
//         const { index } = state.cursor;
//         const position = model.getPositionAt(index);

//         const newDecorations = editor.deltaDecorations(oldDecorations, [
//             {
//             range: new monaco.Range(
//                 position.lineNumber,
//                 position.column,
//                 position.lineNumber,
//                 position.column
//             ),
//             options: {
//                 className: "remote-cursor",
//                 hoverMessage: { value: `User ${clientId}` },
//             },
//             },
//         ]);

//         decorations.set(clientId, newDecorations);
//         }
//     }
//     });

// //     self.MonacoEnvironment = {
// //   getWorkerUrl: function (moduleId, label) {
// //     return URL.createObjectURL(
// //       new Blob([`
// //         self.MonacoEnvironment = {
// //           baseUrl: 'https://unpkg.com/monaco-editor@0.44.0/min/'
// //         };
// //         importScripts('https://unpkg.com/monaco-editor@0.44.0/min/vs/base/worker/workerMain.js');
// //       `], { type: 'application/javascript' })
// //     );
// //   }
// // };
//     console.log("hi")
//     // Monaco <-> Yjs binding
//     const monacoBinding = new MonacoBinding(yText, editor.getModel(), new Set([editor]), provider.awareness);

//     editorRef.current = monacoBinding;

//     return () => {
//       editor.dispose();
//       provider.destroy();
//     };
//   }, []);

//   return (
//     <div
//       ref={editorContainerRef}
//       style={{ width: "100%", height: "100vh", border: "1px solid #ccc" }}
//     />
//   );
// };

// export default MonacoEditor;

// import React, { useEffect, useRef, useState } from "react";
// import * as monaco from "monaco-editor";
// import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";
// import { MonacoBinding } from "y-monaco";

// const MonacoEditor = () => {
//   const editorRef = useRef(null);
//   const editorContainerRef = useRef(null);
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [activeUsers, setActiveUsers] = useState(0);

//   useEffect(() => {
//     // Create Yjs document
//     const ydoc = new Y.Doc();
    
//     // Configure Monaco editor environment
//     window.MonacoEnvironment = {
//       getWorkerUrl: function (moduleId, label) {
//         return `/monaco-editor-workers/${label}.worker.js`;
//       },
//     };

//     // Create Monaco editor
//     const editor = monaco.editor.create(editorContainerRef.current, {
//       value: "",
//       language: "javascript",
//       theme: "vs-dark",
//       automaticLayout: true,
//     });

//     // WebSocket provider (change URL if needed)
//     // Using the public demo WebSocket server by default
//     // For production, you should run your own WebSocket server
//     const provider = new WebsocketProvider("ws://localhost:1234", "my-room-name", ydoc);

//     // Get the shared text from Yjs document
//     const yText = ydoc.getText("monaco");
    
//     // Create Monaco <-> Yjs binding
//     const monacoBinding = new MonacoBinding(
//       yText, 
//       editor.getModel(), 
//       new Set([editor]), 
//       provider.awareness
//     );
    
//     // Set up awareness (cursor tracking)
//     const awareness = provider.awareness;
    
//     // Update local user state
//     awareness.setLocalStateField("user", {
//       name: "User " + Math.floor(Math.random() * 100),
//       color: '#' + Math.floor(Math.random() * 16777215).toString(16),
//       colorLight: '#' + Math.floor(Math.random() * 16777215).toString(16) + '33'
//     });

//     // Track connection status
//     provider.on("status", ({ status }) => {
//       setConnectionStatus(status);
//     });

//     // Track active users
//     awareness.on("change", () => {
//       setActiveUsers(awareness.getStates().size);
//     });

//     // Log connection status
//     provider.on("status", event => {
//       console.log('Connection status:', event.status);
//     });

//     // Log errors if they occur
//     provider.on("connection-error", event => {
//       console.error('Connection error:', event);
//     });

//     // Store references
//     editorRef.current = editor;

//     // Clean up on unmount
//     return () => {
//       editor.dispose();
//       provider.destroy();
//       ydoc.destroy();
//     };
//   }, []);

//   return (
//     <div className="monaco-editor-container">
//       <div className="status-bar">
//         <div className="connection-status">
//           Status: <span className={connectionStatus}>{connectionStatus}</span>
//         </div>
//         <div className="active-users">
//           Active Users: {activeUsers}
//         </div>
//       </div>
//       <div 
//         ref={editorContainerRef} 
//         style={{ width: "100%", height: "calc(100vh - 30px)", border: "1px solid #ccc" }} 
//       />
//       <style>{`
//         .monaco-editor-container {
//           display: flex;
//           flex-direction: column;
//           height: 100vh;
//         }
//         .status-bar {
//           display: flex;
//           justify-content: space-between;
//           padding: 5px 10px;
//           background-color: #1e1e1e;
//           color: #ffffff;
//           height: 30px;
//         }
//         .connection-status .connected {
//           color: #4caf50;
//         }
//         .connection-status .disconnected {
//           color: #f44336;
//         }
//         .connection-status .connecting {
//           color: #ff9800;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MonacoEditor;

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
// @ts-ignore
import { MonacoBinding } from 'y-monaco'
import * as monaco from 'monaco-editor'

export function setupCollaborativeEditor({
  editorContainerId = 'monaco-editor',
  buttonId = 'y-connect-btn',
  roomName = 'codeeditor-room',
  wsServer = 'ws://localhost:1234',
  language = 'javascript',
  theme = 'vs-dark'
}) {

  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider("ws://localhost:1234", roomName, ydoc)
  const yText = ydoc.getText('monaco')

  const editor = monaco.editor.create(document.getElementById(editorContainerId), {
    value: '',
    language,
    theme
  })

  const monacoBinding = new MonacoBinding(yText, editor.getModel(), new Set([editor]), provider.awareness)

  // Setup toggle connect button
  const connectBtn = document.getElementById(buttonId)
  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      if (provider.shouldConnect) {
        provider.disconnect()
        connectBtn.textContent = 'Connect'
      } else {
        provider.connect()
        connectBtn.textContent = 'Disconnect'
      }
    })
  }

  // Expose for debugging or dev purposes
  return {
    ydoc,
    provider,
    yText,
    editor,
    monacoBinding
  }
}
