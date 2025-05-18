import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
const { ipcRenderer } = window.require('electron');

const BottomPanel = () => {
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      const term = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff'
        },
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        lineHeight: 1.2
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      // Handle terminal input
      term.onData((data) => {
        ipcRenderer.send('terminal-input', data);
      });

      // Handle terminal output
      ipcRenderer.on('terminal-data', (event, data) => {
        term.write(data);
      });

      // Handle window resize
      const handleResize = () => {
        fitAddon.fit();
      };
      window.addEventListener('resize', handleResize);

      // Write welcome message
      term.writeln('Welcome to the terminal!');
      term.writeln('Type your commands below:');
      term.write('\r\n$ ');

      termRef.current = term;

      return () => {
        window.removeEventListener('resize', handleResize);
        ipcRenderer.removeAllListeners('terminal-data');
        term.dispose();
      };
    }
  }, []);

  return (
    <div className="bottom-panel">
      <div className="terminal-container" ref={terminalRef}></div>
    </div>
  );
};

export default BottomPanel; 