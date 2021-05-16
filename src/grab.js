{
  let iframe;
  addCanvas();
  insertIframe();

  function addCanvas() {
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
    canvas.id = "any_translate__canvas";
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
          "*"
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
      mousedown = true;
      fromX = e.clientX * devicePixelRatio;
      fromY = e.clientY * devicePixelRatio;
      clientFromX = e.clientX;
      clientFromY = e.clientY;
    }

    function mouseUp(e) {
      mousedown = false;
      let toX = e.clientX * devicePixelRatio;
      let toY = e.clientY * devicePixelRatio;
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
    iframe.style = `
      border: none;
      max-width: 80vw;
      width: 30vw;
      height: 20vh;
      background-color: rgb( 247, 249, 249 );
      position: fixed;
      right: 2em;
      bottom: 2em;
      z-index: 999999;
    `;
    iframe.src = chrome.runtime.getURL("/result.html");
    document.body.appendChild(iframe);
  }
}
