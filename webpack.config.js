const developPath = {
  dev: `${__dirname}/develop/js/`,
  output: `${__dirname}/src/js/`
};

const webpack = require('webpack');
const path = require('path');
const glob = require('glob');

const scripts = glob.sync(`${developPath.dev}*.js`);

const entries = {};
scripts.forEach(value => {
  const re = new RegExp(`${developPath.dev.replace(/\\/g, '/')}`);
  const key = value.replace(re, '');
  entries[key] = value;
});

const config = {
  mode: 'development',
  entry: entries,
  output: {
    path: developPath.output,
    filename: '[name]'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
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