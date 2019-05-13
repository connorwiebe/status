const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js.js'
  },
  mode: 'production',
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
  optimization: {
    minimizer: [
      new UglifyJsPlugin(),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css?$/,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
          autoprefixer: false,
          safe: true,
          discardComments: { removeAll: true }
        },
        canPrint: true
      })
    ]
  },
  plugins: [
    new ExtractTextPlugin({ filename: 'css.css' }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  devtool: 'cheap-module-source-map'
}
