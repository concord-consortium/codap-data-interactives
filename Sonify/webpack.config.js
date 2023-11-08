const path = require('path');

module.exports = {
  resolve: {
    alias: {
      'vue$':  'vue/dist/vue.common.js' /* 'vue/dist/vue.esm.js' for webpack 2*/
    }
  },
  entry: [
    './src/app.js',
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: "production",
  devtool: "source-map",
};
