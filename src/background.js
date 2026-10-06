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
