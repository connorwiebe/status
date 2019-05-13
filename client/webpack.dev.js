const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js.js'
  },
  mode: 'development',
  module: {
    rules: [{
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        resolve: { extensions: ['.js', '.jsx'] }
      }, {
        test: /\.sass?$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
    }]
  },
  plugins: [ new ExtractTextPlugin({ filename: 'css.css' }) ],
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    proxy: { '/api': 'http://localhost:2222' },
    open: false
  },
  devtool: 'inline-source-map'
}
