chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["lib/mousetrap/1.6.1/mousetrap.min.js", "grab.js"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command !== "grabRegion") return false;
  chrome.tabs.captureVisibleTab(
    sender.tab.windowId,
    { format: "png" },
    (dataUrl) => sendResponse({ dataUrl })
  );
  return true;
});

// Tesseract renamed these languages and the old data no longer exists.
const RENAMED_OCR_LANGS = { tgl: "fil", kur: "kmr" };

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "update") return;
  const { ocrLang } = await chrome.storage.sync.get("ocrLang");
  if (RENAMED_OCR_LANGS[ocrLang]) {
    await chrome.storage.sync.set({ ocrLang: RENAMED_OCR_LANGS[ocrLang] });
  }
});
