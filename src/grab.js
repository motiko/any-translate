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
          setTimeout(() => (iframe.style.display = "none"), 750);
          if (e.data.text) {
            console.info("Detected text:", e.data.text);
            window.open(
              `${translateUrl}${encodeURIComponent(e.data.text)}`,
              "AnyTranslate",
              "height=400,width=776,location=0,menubar=0,scrollbars=1,toolbar=0"
            );
          }
        });
        Mousetrap.bind(hotkey, () => {
          startGrab();
        });
      }
    );
  }

  function removeCanvases() {
    const canvases = document.querySelectorAll(
      ".__any_translate_extension_canvas"
    );
    canvases.forEach((canvas) => canvas.parentNode.removeChild(canvas));
  }

  function startGrab() {
    removeCanvases();
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.id = "anyCanvas";
    canvas.style = `
      cursor: crosshair;
      top: 0;
      right: 0;
      position: fixed;
      z-index: 2147483647;
    `;
    initCanvas(canvas);
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

  function initCanvas(canvas) {
    var ctx = canvas.getContext("2d");
    let mousedown = false;
    canvas.className = "__any_translate_extension_canvas";
    let clientFromX;
    let clientFromY;
    let fromX;
    let fromY;
    chrome.storage.sync.get(
      {
        hotkey: "shift+a",
      },
      function ({ hotkey }) {
        ctx.font = "30px Helvetica";
        ctx.fillText("Select Text to Translate", canvas.width - 400, 50);
        ctx.fillStyle = "rgba(200, 200, 201,0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    );

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
      console.info("removed canvas");
    }

    function mouseMove(e) {
      e.stopPropagation();
      e.preventDefault();
      if (!mousedown) return;
      ctx.beginPath();
      var width = e.clientX - clientFromX;
      var height = e.clientY - clientFromY;
      ctx.clearRect(clientFromX, clientFromY, width, height);
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
      width: 12vw;
      height: 5vh;
      background-color: transparent;
      position: fixed;
      right: 1em;
      bottom: 1em;
      z-index: 2147483647;
    `;
    iframe.src = chrome.runtime.getURL("/ocr.html");
    document.body.appendChild(iframe);
  }
}
