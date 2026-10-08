# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AnyTranslate is a Chrome extension (Manifest V3). The user drags a box over any part of the page; the extension OCRs that screenshot region in the browser with Tesseract.js v5 and opens the recognized text in a Google Translate popup window. There is no backend.

## Commands

Uses yarn (`yarn.lock`). There are no tests or linter. Formatting follows `src/.prettierrc` (2 spaces, no tabs).

- `yarn build`: production build into `dist/` (cleaned first)
- `yarn dev`: development build in watch mode with `webpack-ext-reloader` (≥1.1.13, needed for MV3 service workers) on port 9090. Load `dist/` as an unpacked extension in `chrome://extensions`.
- `yarn build:css`: regenerates `src/assets/tailwind.css` from root `tailwind.css` through PostCSS (Tailwind v2 + PurgeCSS, which scans only `src/options.html`). Rerun it after adding Tailwind classes to the options page.
- `yarn zip`: packs the contents of `dist/` into `pack.zip` (manifest at the zip root) for store upload. Run `yarn build` first so the zip holds a production build.

CI: `.github/workflows/build.yml` builds every PR and push to `main`, checks that the built manifest is MV3 and that its version matches `package.json`, and uploads the zip as an artifact.

## Releasing

The user-facing process and the Chrome Web Store setup are in the "Releasing" section of `README.md`. Summary:

- `yarn version --patch|--minor|--major` bumps `package.json`, commits and tags `vX.Y.Z`. `git push --follow-tags` triggers `.github/workflows/release.yml`: tag/version check, `build`, `yarn zip`, then a GitHub release with `any-translate-vX.Y.Z.zip` attached.
- `release.yml` then calls `.github/workflows/publish-chrome-web-store.yml`, which uploads that zip with the Chrome Web Store API v2 and submits it for review (`DEFAULT_PUBLISH`, so it goes live when approved). Auth is keyless (GitHub OIDC → Workload Identity Federation → service account), configured through repository variables `CWS_PUBLISHER_ID`, `CWS_EXTENSION_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT`. Without them the publish job is skipped with a warning.
- The store rejects an upload while the previous version is in review. Retry with `gh workflow run publish-chrome-web-store.yml -f tag=vX.Y.Z`. `-f check_only=true` tests auth and uploads nothing.
- `src/manifest.json` has no `version`. The build takes it from `package.json`, so don't add one.

For agents: a pushed tag publishes to real users after review, so never run `yarn version`, push a tag or dispatch the publish workflow (except with `check_only=true`) unless the user explicitly asks for a release.

## Architecture

Flow across the four webpack entry points in `src/`. Each entry is bundled, so they can `import` shared modules such as `src/defaults.js`.

1. **`background.js`** (MV3 service worker, so there's no DOM): when the toolbar button is clicked, it injects `lib/mousetrap/.../mousetrap.min.js` and `grab.js` with `chrome.scripting.executeScript`. On a `grabRegion` message it returns the full `captureVisibleTab` screenshot as `dataUrl`; it doesn't crop.
2. **`grab.js`** (injected content script): it draws a full-viewport overlay canvas for selecting a region and embeds a hidden iframe pointing at `ocr.html`. It's injected again on every icon click; `window.__anyTranslateLoaded` makes the repeat injections only start a new grab. On mouseup it asks the background for the screenshot and posts `{command: "parseImage", dataUrl, rectangle, viewportWidth}` to the iframe. `rectangle` is in CSS pixels. When the iframe (checked by `e.origin`) posts `{text}` back, it opens `translate.google.com/#auto/<translateTo>/<text>`. It also binds the configured hotkey with Mousetrap so the user can grab again.
3. **`ocr.js` / `ocr.html`** (extension page in the iframe, `web_accessible_resources`): this creates one Tesseract worker at load time (`createWorker(ocrLang, 1, {workerPath, corePath, workerBlobURL: false})`). It scales the rectangle by `image.naturalWidth / viewportWidth`, which gives device pixels without relying on `devicePixelRatio`. It then calls `recognize(dataUrl, { rectangle })` and posts `{text}` or `{error}` to the parent. A result with confidence below 60 is treated as "no text". Language data is downloaded from Tesseract's default CDN.
4. **`options.js` / `options.html`**: the options page. Settings live in `chrome.storage.sync`: `hotkey`, `ocrLang` (a Tesseract code such as `eng` or `deu`) and `translateTo` (a Google Translate code). Defaults for all of them are in `src/defaults.js`.

Build and MV3 constraints:
- The CSP is `script-src 'self' 'wasm-unsafe-eval'`. There's no remote code, `eval` or `blob:` workers, so any new library has to be bundled or copied into `dist/lib/`.
- Webpack copies `tesseract.js/dist/worker.min.js` to `dist/lib/tesseract/`, and only the `tesseract-core*-lstm.wasm.js` cores to `dist/lib/tesseract-core/`. OEM 1 (LSTM) is hardcoded, so the other cores are never loaded. If you change the OEM, change the copy pattern too.
- The Chrome Web Store rejects a package if the code even mentions a remote script URL, including unused fallbacks. So `NormalModuleReplacementPlugin` swaps tesseract.js's browser `defaultOptions.js` for `src/tesseract-options.js`, which has no jsDelivr `workerPath`, and the copy `transform` strips the jsDelivr `corePath` fallback from `worker.min.js`. `NoRemoteCodePlugin` fails the build if a `tesseract.js@`/`tesseract.js-core@` CDN URL appears in any emitted file. The `@tesseract.js-data` URL for language data is allowed because it isn't code.
- `WebpackExtensionManifestPlugin` builds `dist/manifest.json` from `src/manifest.json`, taking `version` and `description` from `package.json`.
- `HtmlWebpackPlugin` injects the `<script>` tags. Don't add them to the HTML templates by hand.
