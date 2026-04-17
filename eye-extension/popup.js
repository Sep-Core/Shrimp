const DEFAULT_SETTINGS = {
  apiUrl: "http://127.0.0.1:3000/coordinate",
  coordinateBasis: "auto",
  pollMs: 80,
  spotlightRadius: 180,
  showDebugBox: true
};

const apiUrlEl = document.getElementById("api-url");
const basisEl = document.getElementById("basis");
const pollMsEl = document.getElementById("poll-ms");
const radiusEl = document.getElementById("radius");
const debugBoxEl = document.getElementById("show-debug-box");
const statusEl = document.getElementById("status");
const saveBtn = document.getElementById("save-btn");

chrome.storage.local.get(DEFAULT_SETTINGS, (stored) => {
  const settings = { ...DEFAULT_SETTINGS, ...stored };
  apiUrlEl.value = settings.apiUrl;
  basisEl.value = settings.coordinateBasis;
  pollMsEl.value = String(settings.pollMs);
  radiusEl.value = String(settings.spotlightRadius);
  debugBoxEl.checked = Boolean(settings.showDebugBox);
});

saveBtn.addEventListener("click", () => {
  const data = {
    apiUrl: apiUrlEl.value.trim(),
    coordinateBasis: basisEl.value,
    pollMs: Math.max(30, Number(pollMsEl.value) || DEFAULT_SETTINGS.pollMs),
    spotlightRadius: Math.max(60, Number(radiusEl.value) || DEFAULT_SETTINGS.spotlightRadius),
    showDebugBox: debugBoxEl.checked
  };

  chrome.storage.local.set(data, () => {
    statusEl.textContent = "Saved. Refresh target page if needed.";
  });
});
