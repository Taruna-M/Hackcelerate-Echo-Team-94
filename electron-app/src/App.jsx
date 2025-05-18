// // src/App.jsx
// import React from 'react';

// export default function App() {
//   return (
//     <div className="app">
//       <h1 className="text-xl font-bold">Echooo</h1>
//       {/* You'll mount CodeEditor and P2PPanel here later */}
//     </div>
//   );
// }

// import React from "react";
// import MonacoEditor from "./components/MonacoEditor";

// const App = () => {
//   return <MonacoEditor />;
// };

// export default App;

// App.jsx
import React, { useEffect } from 'react';
import { setupCollaborativeEditor } from './components/MonacoEditor';

const App = () => {
  useEffect(() => {
    // Configure Monaco's web worker environment
    // window.MonacoEnvironment = {
    //   getWorkerUrl: (_moduleId, label) => {
    //     const workerName = label === 'json' ? 'json.worker.js' : 'editor.worker.js';
    //     return `./monaco-editor/${workerName}`;
    //   }
    // };
    window.MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        return `./static/${label}.worker.js`;
      }
    };


    const editorInstance = setupCollaborativeEditor({
      editorContainerId: 'monaco-editor',
      buttonId: 'y-connect-btn',
      roomName: 'my-shared-room',
      wsServer: 'wss://demos.yjs.dev',
      language: 'javascript'
    });

    window.example = editorInstance;
  }, []);

  return (
    <div>
      <h1>Hello from App</h1>
      <button id="y-connect-btn">Connect</button>
      <div id="monaco-editor" style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
};

export default App;
