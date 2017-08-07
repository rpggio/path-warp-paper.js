const path = require('path');

module.exports = {
  entry: './demo/demo.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'demo')
  },
  module: {
    rules: [
        { 
          test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" 
        }
    ]
  },
  devServer: { 
    inline: true,
    "contentBase": './demo'
  }
};
