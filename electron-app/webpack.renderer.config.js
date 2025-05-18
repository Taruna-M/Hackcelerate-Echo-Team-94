// const rules = require('./webpack.rules');

// rules.push({
//   test: /\.css$/,
//   use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
// });

// module.exports = {
//   // Put your normal webpack config below here
//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//         }
//       },
//       {
//         test: /\.css$/i,
//         use: ['style-loader', 'css-loader'],
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
//   },
// };

// webpack.renderer.config.js
const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-source-map',
  mode: 'development',
  entry: {
    renderer: './src/renderer.js',
  },
  output: {
    path: path.resolve(__dirname, '.webpack/renderer'),
    filename: '[name].js',
    globalObject: 'self',
    publicPath: './'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin({
      languages: ['javascript', 'typescript', 'css', 'html', 'json'],
      filename: '[name].worker.js'
    })
  ]
};
