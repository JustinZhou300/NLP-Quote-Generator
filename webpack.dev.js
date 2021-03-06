const path = require("path");
const common = require("./webpack.common");
const {merge} = require("webpack-merge");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
  mode: "development",
  output: {
    filename: "[name].bundle.js",
    sourceMapFilename: "[name].[contenthash].js.map",
    path: path.resolve(__dirname, "dist")
  },
  devServer: {
    port: 8080,
    host: '192.168.50.66'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html"
    })
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader", //3. Inject styles into DOM
          "css-loader", //2. Turns css into commonjs
          "sass-loader" //1. Turns sass into css
        ]
      },
      {
        test: /\.css$/,  
        use: [
          'style-loader',
          'css-loader'
        ],
      }
    ]
  }
});