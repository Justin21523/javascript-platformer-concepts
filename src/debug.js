// src/debug.js
export const DEBUG = true;
export const SHOW_OVERLAY = true;
export const SHOW_HITBOX = false;
export const TIME_SCALE_DEFAULT = 1.0;

let showOverlay = SHOW_OVERLAY;
let timeScale = TIME_SCALE_DEFAULT;

// 熱鍵處理
window.addEventListener("keydown", (e) => {
  if (e.code === "F1") {
    showOverlay = !showOverlay;
    e.preventDefault();
  }
  if (e.code === "F3") {
    timeScale = timeScale === 1.0 ? 0.25 : 1.0;
    e.preventDefault();
  }
});

export function getTimeScale() {
  return timeScale;
}
export function shouldShowOverlay() {
  return DEBUG && showOverlay;
}

export function drawOverlay(ctx, world, stats) {
  if (!shouldShowOverlay()) return;

  ctx.save();
  ctx.font = "12px monospace";
  ctx.fillStyle = "#00ff00";

  const lines = [
    `FPS: ${stats.fps}  dt: ${stats.dt.toFixed(
      1
    )}ms  timeScale: ${timeScale.toFixed(2)}`,
    `Entities: ${world.entities.size}`,
    `Systems: input | physics | character | render`,
  ];

  let y = 16;
  for (const line of lines) {
    ctx.fillText(line, 8, y);
    y += 16;
  }

  ctx.restore();
}
