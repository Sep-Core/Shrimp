const BOX_SIZE = 140;
const SETTINGS_DEFAULTS = {
  apiUrl: "http://127.0.0.1:3000/coordinate",
  coordinateBasis: "auto",
  pollMs: 80,
  spotlightRadius: 180,
  showDebugBox: true
};

let settings = { ...SETTINGS_DEFAULTS };
let overlay = null;
let debugBox = null;
let statusTag = null;
let pollTimer = null;
let lastMouseViewport = null;

function ensureOverlay() {
  if (overlay && document.contains(overlay)) return;

  overlay = document.createElement("div");
  overlay.id = "__shrimp_spotlight_overlay";
  overlay.style.position = "fixed";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "2147483646";
  overlay.style.background = "rgba(20, 20, 20, 0.22)";
  overlay.style.backdropFilter = "brightness(0.9) contrast(0.92) saturate(0.88)";
  overlay.style.webkitBackdropFilter = "brightness(0.9) contrast(0.92) saturate(0.88)";

  debugBox = document.createElement("div");
  debugBox.id = "__shrimp_debug_box";
  debugBox.style.position = "fixed";
  debugBox.style.left = "0";
  debugBox.style.top = "0";
  debugBox.style.width = `${BOX_SIZE}px`;
  debugBox.style.height = `${BOX_SIZE}px`;
  debugBox.style.border = "3px solid #ff2d2d";
  debugBox.style.background = "rgba(255, 0, 0, 0.06)";
  debugBox.style.borderRadius = "8px";
  debugBox.style.boxSizing = "border-box";
  debugBox.style.pointerEvents = "none";
  debugBox.style.zIndex = "2147483647";
  debugBox.style.transform = "translate(-9999px, -9999px)";
  debugBox.style.display = settings.showDebugBox ? "block" : "none";

  statusTag = document.createElement("div");
  statusTag.style.position = "fixed";
  statusTag.style.right = "12px";
  statusTag.style.top = "12px";
  statusTag.style.padding = "4px 8px";
  statusTag.style.background = "rgba(0, 0, 0, 0.65)";
  statusTag.style.color = "#fff";
  statusTag.style.font = "12px/1.2 sans-serif";
  statusTag.style.borderRadius = "4px";
  statusTag.style.pointerEvents = "none";
  statusTag.style.zIndex = "2147483647";
  statusTag.textContent = "Shrimp: ready";

  document.documentElement.appendChild(overlay);
  document.documentElement.appendChild(debugBox);
  document.documentElement.appendChild(statusTag);
}

function setStatus(text) {
  ensureOverlay();
  statusTag.textContent = text;
}

function applySpotlight(x, y) {
  ensureOverlay();
  const radius = Math.max(60, Number(settings.spotlightRadius) || 180);
  const cx = Math.max(0, Math.min(window.innerWidth, x));
  const cy = Math.max(0, Math.min(window.innerHeight, y));

  overlay.style.webkitMaskImage = `radial-gradient(circle ${radius}px at ${cx}px ${cy}px, transparent 0 ${radius}px, black ${radius + 1}px)`;
  overlay.style.maskImage = `radial-gradient(circle ${radius}px at ${cx}px ${cy}px, transparent 0 ${radius}px, black ${radius + 1}px)`;

  if (settings.showDebugBox) {
    debugBox.style.display = "block";
    debugBox.style.transform = `translate(${Math.round(cx - BOX_SIZE / 2)}px, ${Math.round(cy - BOX_SIZE / 2)}px)`;
  } else {
    debugBox.style.display = "none";
  }
}

function parseCoordinateFromText(text) {
  const match = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(text);
  if (!match) return null;
  return { x: Number(match[1]), y: Number(match[2]) };
}

function parseCoordinate(payload) {
  if (Array.isArray(payload) && payload.length >= 2) {
    return { x: Number(payload[0]), y: Number(payload[1]) };
  }
  if (payload && typeof payload === "object") {
    if (typeof payload.x === "number" && typeof payload.y === "number") {
      return { x: payload.x, y: payload.y };
    }
    if (
      payload.coordinate &&
      typeof payload.coordinate.x === "number" &&
      typeof payload.coordinate.y === "number"
    ) {
      return { x: payload.coordinate.x, y: payload.coordinate.y };
    }
  }
  return null;
}

function toViewportCoordinate(coord) {
  const basis = settings.coordinateBasis;
  if (basis === "viewport") return coord;
  if (basis === "document") {
    return { x: coord.x - window.scrollX, y: coord.y - window.scrollY };
  }

  const viewTry = { x: coord.x, y: coord.y };
  if (
    viewTry.x >= -40 &&
    viewTry.x <= window.innerWidth + 40 &&
    viewTry.y >= -40 &&
    viewTry.y <= window.innerHeight + 40
  ) {
    return viewTry;
  }
  return { x: coord.x - window.scrollX, y: coord.y - window.scrollY };
}

function fallbackFocusPoint() {
  if (lastMouseViewport) return lastMouseViewport;
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

async function fetchCoordinate() {
  if (!settings.apiUrl) {
    setStatus("Shrimp: set API URL in popup");
    applySpotlight(window.innerWidth / 2, window.innerHeight / 2);
    return;
  }

  try {
    const response = await fetch(settings.apiUrl, { cache: "no-store" });
    const text = await response.text();
    let coord = null;

    try {
      const jsonPayload = JSON.parse(text);
      coord = parseCoordinate(jsonPayload);
    } catch (_err) {
      coord = parseCoordinateFromText(text);
    }

    if (!coord || !Number.isFinite(coord.x) || !Number.isFinite(coord.y)) {
      const fallback = fallbackFocusPoint();
      setStatus("Shrimp: fallback mouse/center");
      applySpotlight(fallback.x, fallback.y);
      return;
    }

    const viewportCoord = toViewportCoordinate(coord);
    applySpotlight(viewportCoord.x, viewportCoord.y);
    setStatus("Shrimp: tracking");
  } catch (_err) {
    const fallback = fallbackFocusPoint();
    setStatus("Shrimp: request failed, fallback");
    applySpotlight(fallback.x, fallback.y);
  }
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  const interval = Math.max(30, Number(settings.pollMs) || 80);
  pollTimer = setInterval(() => {
    void fetchCoordinate();
  }, interval);
  void fetchCoordinate();
}

function loadSettingsAndStart() {
  chrome.storage.local.get(SETTINGS_DEFAULTS, (stored) => {
    settings = { ...SETTINGS_DEFAULTS, ...stored };
    if (debugBox) {
      debugBox.style.display = settings.showDebugBox ? "block" : "none";
    }
    startPolling();
  });
}

window.addEventListener("mousemove", (event) => {
  lastMouseViewport = { x: event.clientX, y: event.clientY };
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  let changed = false;
  for (const [key, value] of Object.entries(changes)) {
    if (key in settings) {
      settings[key] = value.newValue;
      changed = true;
    }
  }
  if (changed) startPolling();
});

ensureOverlay();
loadSettingsAndStart();
