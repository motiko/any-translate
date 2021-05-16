function notification(e) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "assets/icon-48.png",
    title: chrome.runtime.getManifest().name,
    message: e.message || e,
  });
}

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.executeScript({
    runAt: "document_start",
    file: "grab.js",
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "grabRegion") {
    console.log(request);
    const { fromX, fromY, toX, toY } = request;
    const width = toX - fromX;
    const height = toY - fromY;
    if (!width || !height) {
      return notification("Please select a region to translate");
    }
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      {
        format: "png",
      },
      (dataUrl) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, fromX, fromY, width, height, 0, 0, width, height);
          const regionDataUrl = canvas.toDataURL();
          sendResponse({ regionDataUrl });
        };
        img.src = dataUrl;
      }
    );
  }
  return true;
});
