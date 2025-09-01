// src/input.js
const keys = new Set();

// 鍵盤事件監聽
window.addEventListener("keydown", (e) => {
  keys.add(e.code);
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
      e.code
    )
  ) {
    e.preventDefault(); // 防止滾動
  }
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.code);
});

// 輸入快照 (每幀呼叫)
export function snapshot() {
  return {
    left: keys.has("ArrowLeft") || keys.has("KeyA"),
    right: keys.has("ArrowRight") || keys.has("KeyD"),
    up: keys.has("ArrowUp") || keys.has("KeyW"),
    down: keys.has("ArrowDown") || keys.has("KeyS"),
    jump: keys.has("Space"),
  };
}

// 檢查特定按鍵
export function isKeyPressed(code) {
  return keys.has(code);
}

// 重設輸入狀態 (用於測試)
export function clearInput() {
  keys.clear();
}
