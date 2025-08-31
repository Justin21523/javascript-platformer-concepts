// src/input.js
const keys = new Set();

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

export function snapshot() {
  return {
    left: keys.has("ArrowLeft") || keys.has("KeyA"),
    right: keys.has("ArrowRight") || keys.has("KeyD"),
    up: keys.has("ArrowUp") || keys.has("KeyW"),
    down: keys.has("ArrowDown") || keys.has("KeyS"),
    jump: keys.has("Space"),
  };
}
