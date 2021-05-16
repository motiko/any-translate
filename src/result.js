/* globals Tesseract */
{
  let worker, workerReady;
  let origin;
  const initWorker = async () => {
    worker = Tesseract.createWorker({
      workerPath: chrome.runtime.getURL("lib/tesseract/worker.min.js"),
      corePath: chrome.runtime.getURL("lib/tesseract/tesseract-core.wasm.js"),
      logger: (m) => console.info("tesseract progress:", m),
    });
    const lang = "eng+heb";
    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
    workerReady = true;
  };

  const doOCR = async (base64) => {
    if (!workerReady) await initWorker();
    const { data } = await worker.recognize(base64);
    console.log(data);
    if (data.text?.trim?.() === "") {
      console.warn("No text was detected");
    } else {
      parent.postMessage({ text: data.text }, origin);
    }
  };

  const initPage = async () => {
    initWorker();
    window.addEventListener("message", (e) => {
      origin = e.origin;
      doOCR(e.data.dataUrl);
    });
  };

  initPage();
}
