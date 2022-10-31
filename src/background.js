chrome.action.onClicked.addListener(async () => {
  async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }
  let tab = await getCurrentTab();

  console.log("±±±", tab.url);
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["lib/mousetrap/1.6.1/mousetrap.min.js", "grab.js"],
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
        debugger;
        const canvas = new OffscreenCanvas(width, height);
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
