const webpack = require('webpack');

const config = {
  mode: 'development',
  entry: './develop/js/common.js',
  output: {
    path: `${__dirname}/src/js`,
    filename: 'common.js',
    libraryTarget: 'umd'
  },
  // Configuration for dev server
  devServer: {
    contentBase: __dirname + '/src/',
    port: 3000,
    inline: true,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', "react"]
              ]
            }
          }
        ],
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};

module.exports = config;