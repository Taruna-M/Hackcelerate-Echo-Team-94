const path = require('path');
const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  entry: {
    main: './src/main.js',
    preload: './src/preload.js',
  },
  output: {
    filename: '[name].js', 
    path: path.resolve(__dirname, '.webpack/main'),
    publicPath: '',
  },
  // plugins: [
  //   new MonacoEditorWebpackPlugin({
  //     languages: ['javascript', 'typescript', 'json', 'css', 'html']
  //   }),
  //   // other plugins
  // ],
  plugins: [new MonacoEditorWebpackPlugin()],
  target: 'electron-main',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: require('./webpack.rules.js'),
  },
};

// const path = require('path');

// module.exports = {
//   entry: {
//     main: './src/main.js',
//     preload: './src/preload.js',
//   },
//   output: {
//     filename: '[name].js', 
//     path: path.resolve(__dirname, '.webpack/main'),
//     publicPath: '',
//   },
//   target: 'electron-main',
//   resolve: {
//     extensions: ['.js', '.jsx'],
//   },
//   module: {
//     rules: require('./webpack.rules.js'),
//   },
//   plugins: [
//     // No MonacoEditorWebpackPlugin here in main process config
//   ],
// };
