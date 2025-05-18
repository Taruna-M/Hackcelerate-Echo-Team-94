const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'html', 'css', 'json']
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "path": false,
      "fs": false,
      "crypto": false
    }
  },
  target: 'electron-renderer'
};