/* globals Tesseract */
{
  let worker, workerReady;
  const initWorker = async () => {
    worker = Tesseract.createWorker({
      workerPath: chrome.runtime.getURL("lib/tesseract/worker.min.js"),
      // langPath: chrome.runtime.getURL("traineddata"),
      corePath: chrome.runtime.getURL("lib/tesseract/tesseract-core.wasm.js"),
      logger: (m) => console.log("~~~", m),
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
      window.open(
        `https://translate.google.com/?hl=en#auto/en/${data.text}`,
        "Google Translate",
        "height=400,width=776,location=0,menubar=0,scrollbars=1,toolbar=0"
      );
    }
  };

  const initPage = async () => {
    initWorker();
    window.addEventListener("message", (e) => {
      doOCR(e.data.dataUrl);
    });
  };

  initPage();
}
