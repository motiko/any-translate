chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.executeScript({
    file: "lib/mousetrap/1.6.1/mousetrap.min.js",
  });
  chrome.tabs.executeScript({
    file: "grab.js",
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "grabRegion") {
    console.log(request);
    const { fromX, fromY, toX, toY } = request;
    const width = toX - fromX;
    const height = toY - fromY;
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
