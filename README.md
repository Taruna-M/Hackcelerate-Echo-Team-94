# Electron IDE

A VS Code-like IDE built with Electron and Monaco Editor.

## Features

- File Explorer with tree view
- Monaco Editor for code editing
- Integrated terminal using xterm.js
- Multiple editor tabs
- Bottom panel with various tools (Terminal, Problems, Output, Debug Console, Ports)
- Dark theme
- Support for multiple programming languages

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd electron-ide
```

2. Install dependencies:
```bash
npm install
```

## Development

To run the application in development mode:

```bash
npm run dev
```

This will start the application with developer tools enabled.

## Building

To build the application for production:

```bash
npm run build
```

The built application will be available in the `dist` directory.

## Project Structure

```
electron-ide/
├── src/
│   ├── components/
│   │   ├── App.js
│   │   ├── Editor.js
│   │   ├── FileExplorer.js
│   │   └── BottomPanel.js
│   ├── styles/
│   │   └── main.css
│   └── index.js
├── main.js
├── index.html
├── package.json
└── webpack.config.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 