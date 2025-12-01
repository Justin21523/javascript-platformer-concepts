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
    attack: keys.has("KeyJ"), // J key for quick slash
    attackHeavy: keys.has("KeyL"), // L key for heavy strike
    attackProjectile: keys.has("KeyU"), // U key for projectile
    attackUp: keys.has("KeyI"), // I key for upward slash
    attackSpin: keys.has("KeyO"), // O key for spin/aoe
    attackWave: keys.has("KeyP"), // P key for ripple wave
    attackStar: keys.has("KeyG"), // G key for starburst spiral
    block: keys.has("KeyB"), // B key for shield
    ability: keys.has("KeyK"), // K key for ability
    hyperStyleNext: keys.has("KeyH"), // H key to cycle hyperdrive style (Halloween variants)
    partyWallpaper: keys.has("KeyV"), // hold V to切換派對桌布
    partyClone: keys.has("KeyC"), // C 生成派對分身
    partyExit: keys.has("KeyN"), // N 離開慶祝、進入下一關
    voidMode: keys.has("KeyX"), // 按住 X 進入無敵桌布模式
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
