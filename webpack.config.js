const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = function (options) {
  return {
    entry: {
      main: path.resolve("src/ApplicationKickoff.ts")
    },

    output: {
      path: path.join(__dirname, "dist"),
      filename: "bundle.js"
    },

    devtool: "source-map",

    module: {
      rules: [{
          test: /\.ts$/,
          loader: "ts-loader"
        },
        {
          test: /^(.(?!\.test))*\.ts$/,
          loader: "istanbul-instrumenter-loader",
          enforce: "post"
        }
      ]
    },

    plugins: [
        new HtmlWebpackPlugin(),
        new CopyWebpackPlugin([{ from: path.resolve("./assets"), to: path.resolve("./dist/assets") }])
    ],

    resolve: {
      extensions: [".ts", ".js", ".json"]
    }

  }
};
