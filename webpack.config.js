const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackExtensionManifestPlugin = require("webpack-extension-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const inputDir = path.join(__dirname, "src");
const outputDir = path.join(__dirname, "dist");

module.exports = {
  mode: "production",
  entry: {
    background: path.join(inputDir,"background.js"),
    options: path.join(inputDir,"options.js"),
    ocr: path.join(inputDir,"ocr.js"),
    grab: path.join(inputDir,"grab.js"),
  },
  output: {
    path: outputDir,
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        type: "asset/resource",
        generator: {
          filename: "img/[name][ext]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
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
          from: path.join(
            __dirname,
            "node_modules",
            "tesseract.js",
            "dist",
            "/"
          ),
          to: path.join(outputDir, "lib", "tesseract"),
        },
        {
          from: path.join(
            __dirname,
            "node_modules",
            "tesseract.js-core",
            "tesseract-core.asm.js"
          ),
          to: path.join(outputDir, "lib", "tesseract"),
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        exclude: /\.asm.js$/,
      }),
    ],
  },
};
