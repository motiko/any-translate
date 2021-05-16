attachEvents();

function attachEvents() {
  document.addEventListener("DOMContentLoaded", loadOptions);
  document.getElementById("restore").addEventListener("click", restoreDefaults);
  document.getElementById("save").addEventListener("click", saveOptions);
}

const defaultOptions = {
  translateUrl: "https://translate.google.com/#auto/en/",
  hotkey: "shift+a",
};

function restoreDefaults() {
  chrome.storage.sync.set(defaultOptions, () => {
    showMessage("success");
    loadOptions();
  });
}

function showMessage(id) {
  const elem = document.getElementById(id);
  elem.style.display = "block";
  setTimeout(function () {
    elem.style.display = "none";
  }, 850);
}

function saveOptions() {
  const hotkey = document.getElementById("hotkey").value;
  const translateUrl = document.getElementById("translateUrl").value;
  if (!hotkey || !translateUrl) {
    showMessage("error");
    return;
  }
  chrome.storage.sync.set({ hotkey, translateUrl }, () => {
    showMessage("success");
  });
}

function loadOptions() {
  chrome.storage.sync.get(
    {
      translateUrl: "https://translate.google.com/?hl=en#auto/en/",
      hotkey: "shift+a",
    },
    function ({ translateUrl, hotkey }) {
      document.getElementById("hotkey").value = hotkey;
      document.getElementById("translateUrl").value = translateUrl;
    }
  );
}
