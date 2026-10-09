// Replaces tesseract.js/src/worker/browser/spawnWorker.js (see webpack.config.js)
// to drop the blob-URL path, which wraps workerPath in importScripts(). The
// Chrome Web Store flags importScripts with a computed URL as remote code.
module.exports = ({ workerPath }) => new Worker(workerPath);
