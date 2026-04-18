const DEFAULT_SETTINGS = {
  apiUrl: "http://127.0.0.1:3000/coordinate",
  coordinateBasis: "auto",
  pollMs: 80,
  spotlightRadius: 180,
  showDebugBox: true,
  showDebugPanel: false
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(DEFAULT_SETTINGS, (stored) => {
    chrome.storage.local.set({ ...DEFAULT_SETTINGS, ...stored });
  });
});
