import { createWorker } from "tesseract.js";
import { DEFAULTS } from "./defaults";

let origin;

const updateProgress = (m) => {
  if (m.status !== "recognizing text") return;
  const progress = m.progress === 0 ? 30 : Math.round(m.progress * 100);
  const progressElem = document.querySelector("progress");
  progressElem.value = progress;
  progressElem.innerText = progress;
  if (m.progress === 1) {
    requestAnimationFrame(() => {
      progressElem.value = 0;
      progressElem.innerText = 0;
    });
  }
};

const workerPromise = chrome.storage.sync
  .get({ ocrLang: DEFAULTS.ocrLang })
  .then(({ ocrLang }) =>
    createWorker(ocrLang, 1, {
      workerPath: chrome.runtime.getURL("lib/tesseract/worker.min.js"),
      corePath: chrome.runtime.getURL("lib/tesseract-core/"),
      workerBlobURL: false,
      logger: updateProgress,
    })
  );

const showError = () => {
  document.getElementById("error").style.display = "block";
  document.getElementById("progress").style.display = "none";
  setTimeout(() => {
    document.getElementById("error").style.display = "none";
    document.getElementById("progress").style.display = "block";
  }, 950);
  parent.postMessage({ error: "No text was detected" }, origin);
};

// Scale the CSS-pixel selection to the screenshot, which is in device pixels.
const toImageRect = async (dataUrl, viewportWidth, rect) => {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = img.naturalWidth / viewportWidth;
  return {
    left: Math.round(rect.left * scale),
    top: Math.round(rect.top * scale),
    width: Math.round(rect.width * scale),
    height: Math.round(rect.height * scale),
  };
};

const doOCR = async ({ dataUrl, viewportWidth, rectangle }) => {
  if (rectangle.width < 1 || rectangle.height < 1) return showError();
  const [worker, rect] = await Promise.all([
    workerPromise,
    toImageRect(dataUrl, viewportWidth, rectangle),
  ]);
  const { data } = await worker.recognize(dataUrl, { rectangle: rect });
  if (data.text?.trim?.() === "" || data.confidence < 60) {
    showError();
  } else {
    parent.postMessage({ text: data.text }, origin);
  }
};

window.addEventListener("message", (e) => {
  if (e.data?.command !== "parseImage") return;
  origin = e.origin;
  doOCR(e.data);
});
