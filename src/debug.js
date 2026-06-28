// src/debug.js
export const DEBUG = true;
export const SHOW_OVERLAY = true;
export const SHOW_HITBOX = false;
export const SHOW_TILE_GRID = false;
export const TIME_SCALE_DEFAULT = 1.0;

// Multi-speed time scaling options
export const TIME_SCALES = [0.1, 0.5, 1.0, 2.0];
const DEMO_MODE = new URLSearchParams(window.location.search).has("demo");

// Load saved settings from localStorage
function loadSettings() {
  try {
    const saved = localStorage.getItem("debugSettings");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load debug settings:", e);
  }
  return null;
}

// Save settings to localStorage
function saveSettings(state) {
  try {
    const toSave = {
      showOverlay: state.showOverlay,
      showHitbox: state.showHitbox,
      showTileGrid: state.showTileGrid,
      showVelocityVectors: state.showVelocityVectors,
      timeScaleIndex: state.timeScaleIndex,
      showPanel: state.showPanel,
    };
    localStorage.setItem("debugSettings", JSON.stringify(toSave));
  } catch (e) {
    console.warn("Failed to save debug settings:", e);
  }
}

// Initialize with saved settings or defaults
const savedSettings = loadSettings();

// Debug 狀態變數 (模組內部狀態)
let debugState = {
  showOverlay: DEMO_MODE ? true : savedSettings?.showOverlay ?? SHOW_OVERLAY,
  showHitbox: DEMO_MODE ? false : savedSettings?.showHitbox ?? SHOW_HITBOX,
  showTileGrid: DEMO_MODE ? false : savedSettings?.showTileGrid ?? SHOW_TILE_GRID,
  showVelocityVectors: savedSettings?.showVelocityVectors ?? false,
  timeScaleIndex: DEMO_MODE ? 2 : savedSettings?.timeScaleIndex ?? 2,
  timeScale: TIME_SCALES[DEMO_MODE ? 2 : savedSettings?.timeScaleIndex ?? 2],
  paused: false,
  showPanel: savedSettings?.showPanel ?? false,
};

// 熱鍵映射
export const DEBUG_KEYS = {
  OVERLAY: "F1",
  HITBOX: "F2",
  SLOW_MOTION: "F3",
  TILE_GRID: "F4",
  VELOCITY_VECTORS: "F5",
  LEVEL_MENU: "F7",
  PANEL: "F6",
  PAUSE: "Backquote", // ` 鍵
  STEP: "Period", // . 鍵
  SCREENSHOT: "F12",
  CONSOLE: "F9",
};

// 初始化熱鍵監聽
function initDebugKeys() {
  window.addEventListener("keydown", (e) => {
    // 防止按鍵重複觸發
    if (e.repeat) return;

    // 攔截瀏覽器功能鍵 (保留 F5 刷新)
    const fnKeys = new Set([
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
      "F9",
      "F10",
      "F11",
      "F12",
    ]);
    if (fnKeys.has(e.code) && e.code !== "F5") {
      e.preventDefault();
      e.stopPropagation();
    }

    switch (e.code) {
      case DEBUG_KEYS.OVERLAY:
        debugState.showOverlay = !debugState.showOverlay;
        console.log("🔧 Debug Overlay:", debugState.showOverlay);
        saveSettings(debugState);
        break;

      case DEBUG_KEYS.HITBOX:
        debugState.showHitbox = !debugState.showHitbox;
        console.log("🔧 Show Hitboxes:", debugState.showHitbox);
        saveSettings(debugState);
        break;

      case DEBUG_KEYS.SLOW_MOTION:
        // Multi-speed time scaling with Shift+F3 (cycle up) and Ctrl+F3 (cycle down)
        if (e.shiftKey) {
          // Cycle to next speed
          setTimeScaleIndex((debugState.timeScaleIndex + 1) % TIME_SCALES.length);
        } else if (e.ctrlKey || e.metaKey) {
          // Cycle to previous speed
          setTimeScaleIndex((debugState.timeScaleIndex - 1 + TIME_SCALES.length) % TIME_SCALES.length);
        } else {
          // F3 alone toggles between current and 1.0x
          if (debugState.timeScaleIndex === 2) {
            // Currently at 1.0x, go to slowest
            setTimeScaleIndex(0);
          } else {
            // Go back to 1.0x
            setTimeScaleIndex(2);
          }
        }
        break;

      case DEBUG_KEYS.TILE_GRID:
        debugState.showTileGrid = !debugState.showTileGrid;
        console.log("🔧 Show Tile Grid:", debugState.showTileGrid);
        saveSettings(debugState);
        break;

      case DEBUG_KEYS.VELOCITY_VECTORS:
        debugState.showVelocityVectors = !debugState.showVelocityVectors;
        console.log("🔧 Show Velocity Vectors:", debugState.showVelocityVectors);
        saveSettings(debugState);
        break;

      case DEBUG_KEYS.LEVEL_MENU:
        console.log("🔧 Level Menu toggle");
        window.dispatchEvent(new CustomEvent("debug-level-menu-toggle"));
        break;

      case DEBUG_KEYS.PANEL:
        debugState.showPanel = !debugState.showPanel;
        console.log("🔧 Debug Panel:", debugState.showPanel);
        window.dispatchEvent(new CustomEvent("debug-panel-toggle"));
        saveSettings(debugState);
        break;

      case DEBUG_KEYS.PAUSE:
        debugState.paused = !debugState.paused;
        console.log("🔧 Paused:", debugState.paused);
        break;

      case DEBUG_KEYS.STEP:
        if (debugState.paused) {
          // 逐幀步進 (由主迴圈處理)
          debugState.stepOnce = true;
          console.log("🔧 Step Frame");
        }
        break;

      case DEBUG_KEYS.SCREENSHOT:
        e.preventDefault();
        // Trigger screenshot event (handled in main.js)
        window.dispatchEvent(new CustomEvent("debug-screenshot"));
        console.log("📸 Screenshot captured");
        break;

      case DEBUG_KEYS.CONSOLE:
        debugState.showConsole = !debugState.showConsole;
        console.log("🔧 Debug Console:", debugState.showConsole);
        // Trigger console toggle event (handled in main.js)
        window.dispatchEvent(new CustomEvent("debug-console-toggle"));
        break;
    }
  });
}

// 導出當前 debug 狀態 (只讀)
export function getDebugState() {
  return { ...debugState };
}

// 設定 debug 狀態 (供外部系統使用)
export function setDebugState(key, value) {
  if (debugState.hasOwnProperty(key)) {
    debugState[key] = value;
  }
}

// Update a debug setting and persist it
export function updateDebugSetting(key, value) {
  if (debugState.hasOwnProperty(key)) {
    debugState[key] = value;
    saveSettings(debugState);
  }
}

// Set time scale by index and persist
export function setTimeScaleIndex(index) {
  const clamped = Math.max(0, Math.min(TIME_SCALES.length - 1, index));
  debugState.timeScaleIndex = clamped;
  debugState.timeScale = TIME_SCALES[clamped];
  console.log(`🔧 Time Scale: ${debugState.timeScale}x (${clamped + 1}/${TIME_SCALES.length})`);
  saveSettings(debugState);
}

// 重設 debug 狀態
export function resetDebugState() {
  debugState = {
  showOverlay: SHOW_OVERLAY,
  showHitbox: SHOW_HITBOX,
  showTileGrid: SHOW_TILE_GRID,
  showVelocityVectors: false,
  timeScaleIndex: 2,
  timeScale: TIME_SCALE_DEFAULT,
  paused: false,
  stepOnce: false,
  showConsole: false,
  showPanel: false,
  };
  saveSettings(debugState);
}

// Screenshot utility
export function takeScreenshot(canvas, filename = "screenshot") {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const link = document.createElement("a");
    link.download = `${filename}_${timestamp}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    console.log("📸 Screenshot saved:", link.download);
  } catch (e) {
    console.error("Failed to take screenshot:", e);
  }
}

// 檢查是否應該暫停更新 (供主迴圈使用)
export function shouldPauseUpdate() {
  if (!debugState.paused) return false;

  // 如果有步進請求，允許執行一次然後清除
  if (debugState.stepOnce) {
    debugState.stepOnce = false;
    return false;
  }

  return true;
}

// 獲取縮放後的 dt (供主迴圈使用)
export function getScaledDeltaTime(dt) {
  return dt * debugState.timeScale;
}

// 日誌工具 (結構化輸出)
export function debugLog(system, message, data = null) {
  if (!DEBUG) return;

  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] [${system}]`;

  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

// 斷言工具
export function debugAssert(condition, message) {
  if (!DEBUG) return;

  if (!condition) {
    console.error("🚨 Debug Assert Failed:", message);
    debugger; // 觸發斷點 (開發環境)
  }
}

// 效能測量工具
export class DebugProfiler {
  constructor() {
    this.timers = new Map();
    this.results = new Map();
  }

  start(name) {
    if (!DEBUG) return;
    this.timers.set(name, performance.now());
  }

  end(name) {
    if (!DEBUG) return;

    const startTime = this.timers.get(name);
    if (startTime === undefined) {
      console.warn(`Profiler: Timer '${name}' was not started`);
      return;
    }

    const duration = performance.now() - startTime;
    this.results.set(name, duration);
    this.timers.delete(name);

    return duration;
  }

  getResult(name) {
    return this.results.get(name) || 0;
  }

  getAllResults() {
    return Object.fromEntries(this.results);
  }

  reset() {
    this.timers.clear();
    this.results.clear();
  }
}

// 創建全域 profiler 實例
export const profiler = new DebugProfiler();

// 在模組載入時初始化熱鍵
if (typeof window !== "undefined") {
  initDebugKeys();
  debugLog("debug", "Debug system initialized with hotkeys:", DEBUG_KEYS);
}
