const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack')

module.exports = {
  entry: './src/background.js',
  output: {
    filename: 'background.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
  resolve: {
    fallback: {
      fs: require.resolve("browserify-fs"),
      net: false,
      tls: false,
      process: require.resolve('process/browser'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      string_decoder: require.resolve('string_decoder'),
      timers: require.resolve('timers-browserify'),
      querystring: require.resolve('querystring-browser'),
      vm: require.resolve('vm-browserify'),
    },
  },
  plugins: [new NodePolyfillPlugin(), new webpack.ProvidePlugin({process: 'process/browser',}),],
};
