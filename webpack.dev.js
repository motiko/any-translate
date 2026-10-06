const productionConfig = require("./webpack.config.js");
const ExtReloader = require("webpack-ext-reloader");

module.exports = {
  ...productionConfig,
  mode: "development",
  devtool: "inline-cheap-module-source-map",
  watch: true,
  plugins: [
    ...productionConfig.plugins,
    new ExtReloader({
      port: 9090,
      reloadPage: true,
      entries: {
        contentScript: ["grab"],
        background: "background",
        extensionPage: ["options", "ocr"],
      },
    }),
  ],
};
