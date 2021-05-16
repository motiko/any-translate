{
  let iframe;
  const extUrl = chrome.runtime.getURL("");
  const extOrigin = extUrl.substring(0, extUrl.length - 1);
  startGrab();
  insertIframe();
  attachEvents();

  function attachEvents() {
    chrome.storage.sync.get(
      {
        translateUrl: "https://translate.google.com/#auto/en/",
        hotkey: "shift+a",
      },
      function ({ translateUrl, hotkey }) {
        window.addEventListener("message", (e) => {
          if (!extUrl.match(e.orign)) return;
          console.info("Detected text:", e.data.text);
          iframe.style.display = "none";
          window.open(
            `${translateUrl}${encodeURIComponent(e.data.text)}`,
            "AnyTranslate",
            "height=400,width=776,location=0,menubar=0,scrollbars=1,toolbar=0"
          );
        });
        Mousetrap.bind(hotkey, () => {
          startGrab();
        });
      }
    );
  }

  function startGrab() {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style = `
      cursor: crosshair;
      top: 0;
      right: 0;
      position: fixed;
      z-index: 999999;
    `;
    attachDrawEvents(canvas);
    document.body.appendChild(canvas);
  }

  function sendRegionCoordinates(coordinates) {
    chrome.runtime.sendMessage(
      { command: "grabRegion", ...coordinates },
      (response) => {
        iframe.contentWindow.postMessage(
          {
            dataUrl: response.regionDataUrl,
            command: "parseImage",
          },
          extOrigin
        );
      }
    );
  }

  function attachDrawEvents(canvas) {
    var ctx = canvas.getContext("2d");
    let mousedown = false;
    let clientFromX;
    let clientFromY;
    let fromX;
    let fromY;

    function mouseDown(e) {
      e.stopPropagation();
      e.preventDefault();
      mousedown = true;
      fromX = e.clientX * devicePixelRatio;
      fromY = e.clientY * devicePixelRatio;
      clientFromX = e.clientX;
      clientFromY = e.clientY;
    }

    function mouseUp(e) {
      e.stopPropagation();
      e.preventDefault();
      mousedown = false;
      let toX = e.clientX * devicePixelRatio;
      let toY = e.clientY * devicePixelRatio;
      iframe.style.display = "block";
      sendRegionCoordinates({
        fromX: Math.min(fromX, toX),
        fromY: Math.min(fromY, toY),
        toX: Math.max(fromX, toX),
        toY: Math.max(fromY, toY),
      });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mouseup", mouseUp);
      canvas.removeEventListener("mousemove", mouseMove);

      canvas.parentNode.removeChild(canvas);
    }

    function mouseMove(e) {
      e.stopPropagation();
      e.preventDefault();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!mousedown) return;
      ctx.beginPath();
      var width = e.clientX - clientFromX;
      var height = e.clientY - clientFromY;
      ctx.rect(clientFromX, clientFromY, width, height);
      ctx.strokeStyle = "darkblue";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mousemove", mouseMove);
  }

  function insertIframe() {
    iframe = document.createElement("iframe");
    iframe.allowtransparency = "true";
    iframe.style = `
      border: none;
      width: 10vw;
      height: 2vh;
      background-color: rgb( 247, 249, 249 );
      position: fixed;
      right: 1em;
      bottom: 1em;
      z-index: 999999;
    `;
    iframe.src = chrome.runtime.getURL("/ocr.html");
    document.body.appendChild(iframe);
  }
}
