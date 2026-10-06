const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackExtensionManifestPlugin = require("webpack-extension-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const inputDir = path.join(__dirname, "src");
const outputDir = path.join(__dirname, "dist");

module.exports = {
  mode: "production",
  entry: {
    background: path.join(inputDir, "background.js"),
    options: path.join(inputDir, "options.js"),
    ocr: path.join(inputDir, "ocr.js"),
    grab: path.join(inputDir, "grab.js"),
  },
  output: {
    path: outputDir,
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new WebpackExtensionManifestPlugin({
      config: {
        base: path.join(inputDir, "manifest.json"),
      },
      pkgJsonProps: ["version", "description"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(inputDir, "assets"),
          to: path.join(outputDir, "assets"),
        },
        {
          from: path.join(inputDir, "lib"),
          to: path.join(outputDir, "lib"),
        },
        {
          from: path.join(__dirname, "node_modules", "tesseract.js", "dist", "worker.min.js"),
          to: path.join(outputDir, "lib", "tesseract"),
        },
        {
          from: path.join(__dirname, "node_modules", "tesseract.js-core", "tesseract-core*-lstm.wasm.js"),
          to: path.join(outputDir, "lib", "tesseract-core", "[name][ext]"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(inputDir, "options.html"),
      filename: "options.html",
      chunks: ["options"],
    }),
    new HtmlWebpackPlugin({
      template: path.join(inputDir, "ocr.html"),
      filename: "ocr.html",
      chunks: ["ocr"],
    }),
  ],
  performance: {
    assetFilter: (asset) => !asset.startsWith("lib/"),
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        exclude: /^lib\//,
      }),
    ],
  },
};
