const googleLangs = [
  { language_name: "Automatic Detection", language_code: "auto" },
  { language_name: "Afrikaans", language_code: "af" },
  { language_name: "Albanian", language_code: "sq" },
  { language_name: "Arabic", language_code: "ar" },
  { language_name: "Azerbaijani", language_code: "az" },
  { language_name: "Basque", language_code: "eu" },
  { language_name: "Bengali", language_code: "bn" },
  { language_name: "Belarusian", language_code: "be" },
  { language_name: "Bulgarian", language_code: "bg" },
  { language_name: "Catalan", language_code: "ca" },
  { language_name: "Chinese Simplified", language_code: "zh-CN" },
  { language_name: "Chinese Traditional", language_code: "zh-TW" },
  { language_name: "Croatian", language_code: "hr" },
  { language_name: "Czech", language_code: "cs" },
  { language_name: "Danish", language_code: "da" },
  { language_name: "Dutch", language_code: "nl" },
  { language_name: "English", language_code: "en" },
  { language_name: "Esperanto", language_code: "eo" },
  { language_name: "Estonian", language_code: "et" },
  { language_name: "Filipino", language_code: "tl" },
  { language_name: "Finnish", language_code: "fi" },
  { language_name: "French", language_code: "fr" },
  { language_name: "Galician", language_code: "gl" },
  { language_name: "Georgian", language_code: "ka" },
  { language_name: "German", language_code: "de" },
  { language_name: "Greek", language_code: "el" },
  { language_name: "Gujarati", language_code: "gu" },
  { language_name: "Haitian Creole", language_code: "ht" },
  { language_name: "Hebrew", language_code: "iw" },
  { language_name: "Hindi", language_code: "hi" },
  { language_name: "Hungarian", language_code: "hu" },
  { language_name: "Icelandic", language_code: "is" },
  { language_name: "Indonesian", language_code: "id" },
  { language_name: "Irish", language_code: "ga" },
  { language_name: "Italian", language_code: "it" },
  { language_name: "Japanese", language_code: "ja" },
  { language_name: "Kannada", language_code: "kn" },
  { language_name: "Korean", language_code: "ko" },
  { language_name: "Latin", language_code: "la" },
  { language_name: "Latvian", language_code: "lv" },
  { language_name: "Lithuanian", language_code: "lt" },
  { language_name: "Macedonian", language_code: "mk" },
  { language_name: "Malay", language_code: "ms" },
  { language_name: "Maltese", language_code: "mt" },
  { language_name: "Norwegian", language_code: "no" },
  { language_name: "Persian", language_code: "fa" },
  { language_name: "Polish", language_code: "pl" },
  { language_name: "Portuguese", language_code: "pt" },
  { language_name: "Romanian", language_code: "ro" },
  { language_name: "Russian", language_code: "ru" },
  { language_name: "Serbian", language_code: "sr" },
  { language_name: "Slovak", language_code: "sk" },
  { language_name: "Slovenian", language_code: "sl" },
  { language_name: "Spanish", language_code: "es" },
  { language_name: "Swahili", language_code: "sw" },
  { language_name: "Swedish", language_code: "sv" },
  { language_name: "Tamil", language_code: "ta" },
  { language_name: "Telugu", language_code: "te" },
  { language_name: "Thai", language_code: "th" },
  { language_name: "Turkish", language_code: "tr" },
  { language_name: "Ukrainian", language_code: "uk" },
  { language_name: "Urdu", language_code: "ur" },
  { language_name: "Vietnamese", language_code: "vi" },
  { language_name: "Welsh", language_code: "cy" },
  { language_name: "Yiddish", language_code: "yi" },
];

const ocrLangs = {
  afr: "Afrikaans",
  amh: "Amharic",
  ara: "Arabic",
  asm: "Assamese",
  aze: "Azerbaijani",
  aze_cyrl: "Azerbaijani - Cyrillic",
  bel: "Belarusian",
  ben: "Bengali",
  bod: "Tibetan",
  bos: "Bosnian",
  bul: "Bulgarian",
  cat: "Catalan; Valencian",
  ceb: "Cebuano",
  ces: "Czech",
  chi_sim: "Chinese - Simplified",
  chi_tra: "Chinese - Traditional",
  chr: "Cherokee",
  cym: "Welsh",
  dan: "Danish",
  deu: "German",
  dzo: "Dzongkha",
  ell: "Greek, Modern (1453-)",
  eng: "English",
  enm: "English, Middle (1100-1500)",
  epo: "Esperanto",
  est: "Estonian",
  eus: "Basque",
  fas: "Persian",
  fin: "Finnish",
  fra: "French",
  frk: "German Fraktur",
  frm: "French, Middle (ca. 1400-1600)",
  gle: "Irish",
  glg: "Galician",
  grc: "Greek, Ancient (-1453)",
  guj: "Gujarati",
  hat: "Haitian; Haitian Creole",
  heb: "Hebrew",
  hin: "Hindi",
  hrv: "Croatian",
  hun: "Hungarian",
  iku: "Inuktitut",
  ind: "Indonesian",
  isl: "Icelandic",
  ita: "Italian",
  ita_old: "Italian - Old",
  jav: "Javanese",
  jpn: "Japanese",
  kan: "Kannada",
  kat: "Georgian",
  kat_old: "Georgian - Old",
  kaz: "Kazakh",
  khm: "Central Khmer",
  kir: "Kirghiz; Kyrgyz",
  kor: "Korean",
  kur: "Kurdish",
  lao: "Lao",
  lat: "Latin",
  lav: "Latvian",
  lit: "Lithuanian",
  mal: "Malayalam",
  mar: "Marathi",
  mkd: "Macedonian",
  mlt: "Maltese",
  msa: "Malay",
  mya: "Burmese",
  nep: "Nepali",
  nld: "Dutch; Flemish",
  nor: "Norwegian",
  ori: "Oriya",
  pan: "Panjabi; Punjabi",
  pol: "Polish",
  por: "Portuguese",
  pus: "Pushto; Pashto",
  ron: "Romanian; Moldavian; Moldovan",
  rus: "Russian",
  san: "Sanskrit",
  sin: "Sinhala; Sinhalese",
  slk: "Slovak",
  slv: "Slovenian",
  spa: "Spanish; Castilian",
  spa_old: "Spanish; Castilian - Old",
  sqi: "Albanian",
  srp: "Serbian",
  srp_latn: "Serbian - Latin",
  swa: "Swahili",
  swe: "Swedish",
  syr: "Syriac",
  tam: "Tamil",
  tel: "Telugu",
  tgk: "Tajik",
  tgl: "Tagalog",
  tha: "Thai",
  tir: "Tigrinya",
  tur: "Turkish",
  uig: "Uighur; Uyghur",
  ukr: "Ukrainian",
  urd: "Urdu",
  uzb: "Uzbek",
  uzb_cyrL: "Uzbek - Cyrillic",
  vie: "Vietnamese",
  yid: "Yiddish",
};

attachEvents();
populateSelects();

function attachEvents() {
  document.addEventListener("DOMContentLoaded", loadOptions);
  document.getElementById("restore").addEventListener("click", restoreDefaults);
  document.getElementById("save").addEventListener("click", saveOptions);
}

function populateSelects() {
  const ocrLangsSelect = document.getElementById("ocrLang");
  const googleLangsSelect = document.getElementById("googleLang");
  ocrLangsSelect.innerHTML = Object.entries(ocrLangs)
    .map(([key, value]) => `<option value="${key}">${value}</option>`)
    .join("");
  googleLangsSelect.innerHTML = googleLangs
    .map(
      ({ language_name, language_code }) =>
        `<option value="${language_code}">${language_name}</option>`
    )
    .join("");
}

const defaultOptions = {
  translateUrl: "https://translate.google.com/#auto/en/",
  hotkey: "shift+a",
  ocrLang: "deu",
  translateTo: "en",
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
  const translateTo = document.getElementById("googleLang").value;
  const ocrLang = document.getElementById("ocrLang").value;
  if (!hotkey) {
    showMessage("error");
    return;
  }
  chrome.storage.sync.set({ hotkey, translateTo, ocrLang }, () => {
    showMessage("success");
  });
}

function loadOptions() {
  chrome.storage.sync.get(
    defaultOptions,
    function ({ hotkey, ocrLang, translateTo }) {
      document.getElementById("hotkey").value = hotkey;
      document.getElementById("ocrLang").value = ocrLang;
      document.getElementById("googleLang").value = translateTo;
    }
  );
}
