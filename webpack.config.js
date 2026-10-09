const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WebpackExtensionManifestPlugin = require("webpack-extension-manifest-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const inputDir = path.join(__dirname, "src");
const outputDir = path.join(__dirname, "dist");

// The Chrome Web Store rejects MV3 packages that mention remotely hosted code,
// even as unused fallbacks. Language data (@tesseract.js-data) is not code.
// importScripts with a computed URL is also flagged, so ban the call entirely.
const REMOTE_CODE = /cdn\.jsdelivr\.net\/npm\/tesseract\.js(-core)?@|importScripts\s*\(/;
const CORE_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js-core@v";
const CORE_IMPORT = "r.g.importScripts(h),";
// OEM 1 (LSTM) is hardcoded and every MV3 Chrome supports wasm SIMD.
const CORE_PATH = path.join(__dirname, "node_modules", "tesseract.js-core", "tesseract-core-simd-lstm.wasm.js");

class NoRemoteCodePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("NoRemoteCodePlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "NoRemoteCodePlugin", stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT },
        (assets) => {
          for (const [name, asset] of Object.entries(assets)) {
            const source = asset.source().toString();
            if (REMOTE_CODE.test(source)) {
              compilation.errors.push(new Error(`${name} references remotely hosted code: ${source.match(REMOTE_CODE)[0]}`));
            }
          }
        }
      );
    });
  }
}

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
    new webpack.NormalModuleReplacementPlugin(
      /\/worker\/browser\/defaultOptions(\.js)?$/,
      path.join(inputDir, "tesseract-options.js")
    ),
    new webpack.NormalModuleReplacementPlugin(
      /\/worker\/browser\/spawnWorker(\.js)?$/,
      path.join(inputDir, "tesseract-spawn-worker.js")
    ),
    new NoRemoteCodePlugin(),
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
          // Prepend the core so it defines self.TesseractCore before the worker
          // runs, and drop the worker's importScripts(corePath) and jsDelivr
          // fallback: the store rejects importScripts with a computed URL.
          transform: (content) => {
            let source = content.toString();
            for (const needle of [CORE_CDN, CORE_IMPORT]) {
              if (!source.includes(needle)) throw new Error(`${needle} not found in worker.min.js`);
              source = source.replaceAll(needle, "");
            }
            return fs.readFileSync(CORE_PATH, "utf8") + "\n" + source;
          },
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
