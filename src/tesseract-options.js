// Replaces tesseract.js/src/worker/browser/defaultOptions.js (see webpack.config.js)
// so the bundle doesn't contain the jsDelivr workerPath fallback. The Chrome Web
// Store rejects MV3 packages that reference remotely hosted code.
module.exports = {
  workerBlobURL: false,
  logger: () => {},
  workerPath: chrome.runtime.getURL("lib/tesseract/worker.min.js"),
};
