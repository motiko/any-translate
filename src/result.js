window.addEventListener("message", (e) => {
  const image = document.getElementById("image");
  image.src = e.data.dataUrl;
  // doOCR(e.data.data);
});
