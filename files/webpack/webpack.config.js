const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/placeholder.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'placeholder.min.js',
    libraryTarget: 'umd',
    library: throw new Error("Don't forget to set your library name!")
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