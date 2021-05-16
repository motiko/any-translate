/* globals Tesseract */

const doOCR = async (base64) => {
  const worker = new Tesseract.TesseractWorker({
    workerPath: chrome.runtime.getURL("lib/tesseract/worker.min.js"),
    // langPath: chrome.runtime.getURL("traineddata"),
    corePath: chrome.runtime.getURL("lib/tesseract/tesseract-core.wasm.js"),
  });

  worker
    .recognize(base64)
    .progress((report) => {
      if (report.status === "recognizing text") {
        console.log(report.progress);
      } else if (report.status === "loaded language traineddata") {
        console.log(report.progress);
      }
    })
    .then(
      (data) => {
        console.log(data);
        console.log(data.text);

        if (data.text.trim() === "") {
          console.warn("No text was detected");
        } else {
          window.open(
            `https://translate.google.com/?hl=en#auto/en/${data.text}`,
            'GT',
            "height=400,width=776,location=0,menubar=0,scrollbars=1,toolbar=0"
          );
        }
      },
      (e) => {
        console.errror(e);
      }
    );
};

window.addEventListener("message", (e) => {
  const image = document.getElementById("image");
  image.src = e.data.dataUrl;
  doOCR(e.data.dataUrl);
});
