process.env.TEST = true;
process.env.NODE_ENV = "test";

const webpack = require("webpack");
const path = require("path");
const webpackConfig = require("./webpack.config.js")();

delete webpackConfig.entry;

module.exports = function (config) {

  var configuration = {
    basePath: "",
    frameworks: [
      "mocha",
      "chai",
      "sinon"
    ],
    files: [  
	  { pattern: './node_modules/babel-polyfill/browser.js', instrument: false}, 
      "./node_modules/promise-polyfill/dist/promise.js",
      "./node_modules/string.prototype.startswith/startswith.js",
      "./test/**/**/**.test.ts",
      {
        pattern: "**/*.map",
        served: true,
        included: false,
        watched: true
      }
    ],
    preprocessors: {
      "./**/**/**/**.ts": ["sourcemap", "webpack"],
      "./test/**/**/**.test.ts": ["webpack"]
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    plugins: [
      "karma-webpack",
      "karma-sourcemap-writer",
      "karma-sourcemap-loader",
      "karma-remap-istanbul",
      "karma-mocha-reporter",
      "karma-mocha",
      "karma-chai",
      "karma-sinon",
      "karma-es6-shim",
      "karma-coverage-istanbul-reporter",
      "karma-phantomjs-launcher"
    ],
    reporters: (
      config.singleRun ? ["mocha", "coverage-istanbul"] : ["dots"]
    ),
    coverageIstanbulReporter: {
      reports: ["html", "text", "text-summary"],
      dir: "coverage",
      fixWebpackSourcePaths: true,
      "report-config": {
        html: {
          subdir: "html-report"
        }
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    browsers: ["PhantomJS"]
  };

  config.set(configuration);
};