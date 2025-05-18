# Echo Code Editor

An advanced code editor built with Electron, React, and Monaco Editor, featuring AI assistance capabilities through both offline (CodeBERT) and online (OpenRouter) services.

## Features

### Core Editor
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting and IntelliSense
- **File Explorer**: Browse and manage your project files
- **Tab Management**: Work with multiple files simultaneously
- **AI Code Assistance**: Get intelligent code suggestions and completions

### Terminal & Development Tools
- **Integrated Terminal**: Full-featured terminal with command history and execution
  - Command history navigation with up/down arrows
  - Process status indicators showing when commands are running
  - Command execution status feedback (success/error indicators)
  - Loading animation for running processes
  - Kill process button for terminating running commands

### Bottom Panel Interface
- **Problems Tab**: View errors, warnings, and info messages in your code
- **Output Tab**: See build and execution output from your projects
- **Debug Console**: Monitor debugging information and logs
- **Terminal Tab**: Execute commands in an integrated terminal
- **Search Terminal Output**: Find specific text in terminal output
- **Comments**: Add and view comments for collaboration

### Status Bar
- Running process indicators
- Line and column position
- File encoding information
- Git branch indicator
- Current time display

### AI Integration
- **OpenRouter API Service**: Connect to various language models
  - DeepSeek V3 Base
  - Llama 4 Maverick
- **Formatted Code Display**: View AI-generated code with proper syntax highlighting
- **Fallback Responses**: Development mode support when API calls are blocked by CSP

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```
git clone https://github.com/your-username/echo-code-editor.git
cd echo-code-editor
```

2. Install dependencies:
```
npm install
```

3. Start the application:
```
npm start
```

## Development

### Project Structure
- `src/`: Source code
  - `components/`: React components
    - `CodeEditor.jsx`: Monaco editor component
    - `Terminal.jsx`: Integrated terminal component
    - `BottomPanel.jsx`: Panel with tabs for terminal, problems, etc.
    - `FileExplorer.jsx`: File browser component
    - `ChatInterface.jsx`: AI chat interface
  - `main/`: Electron main process code
    - `terminalHandler.js`: Terminal command execution
    - `fileSystemHandler.js`: File system operations
  - `services/`: API services and utilities
  - `main.js`: Electron main process entry point
  - `preload.js`: Preload script for IPC communication
  - `renderer.js`: Renderer process entry point
  - `App.jsx`: Main React component

### Building
```
npm run make
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Built during Hackcelerate Hackathon
- Uses Electron Forge for building and packaging
- Integrates Monaco Editor for code editing capabilities
- Connects to OpenRouter API for AI assistance
