// src/debug.js
export const DEBUG = true;
export const SHOW_OVERLAY = true;
export const SHOW_HITBOX = false;
export const SHOW_TILE_GRID = false;
export const TIME_SCALE_DEFAULT = 1.0;

// Debug 狀態變數 (模組內部狀態)
let debugState = {
  showOverlay: SHOW_OVERLAY,
  showHitbox: SHOW_HITBOX,
  showTileGrid: SHOW_TILE_GRID,
  timeScale: TIME_SCALE_DEFAULT,
  paused: false,
};

// 熱鍵映射
export const DEBUG_KEYS = {
  OVERLAY: "F1",
  HITBOX: "F2",
  SLOW_MOTION: "F3",
  TILE_GRID: "F4",
  PAUSE: "Backquote", // ` 鍵
  STEP: "Period", // . 鍵
};

// 初始化熱鍵監聽
function initDebugKeys() {
  window.addEventListener("keydown", (e) => {
    // 防止按鍵重複觸發
    if (e.repeat) return;

    switch (e.code) {
      case DEBUG_KEYS.OVERLAY:
        debugState.showOverlay = !debugState.showOverlay;
        console.log("🔧 Debug Overlay:", debugState.showOverlay);
        break;

      case DEBUG_KEYS.HITBOX:
        debugState.showHitbox = !debugState.showHitbox;
        console.log("🔧 Show Hitboxes:", debugState.showHitbox);
        break;

      case DEBUG_KEYS.SLOW_MOTION:
        debugState.timeScale = debugState.timeScale === 1 ? 0.25 : 1;
        console.log("🔧 Time Scale:", debugState.timeScale);
        break;

      case DEBUG_KEYS.TILE_GRID:
        debugState.showTileGrid = !debugState.showTileGrid;
        console.log("🔧 Show Tile Grid:", debugState.showTileGrid);
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

// 重設 debug 狀態
export function resetDebugState() {
  debugState = {
    showOverlay: SHOW_OVERLAY,
    showHitbox: SHOW_HITBOX,
    showTileGrid: SHOW_TILE_GRID,
    timeScale: TIME_SCALE_DEFAULT,
    paused: false,
    stepOnce: false,
  };
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
