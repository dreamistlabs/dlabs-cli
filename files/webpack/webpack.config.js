const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/placeholder.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'placeholder.min.js',
    libraryTarget: 'umd',
    library: throw new Error("Action Required! Don't forget to set your library name in the webpack.config.js file!")
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
}