// src/render/overlay.js
import { getDebugState, profiler } from "../debug.js";

export function drawDebugOverlay(ctx, world, fps = 60) {
  const debug = getDebugState();
  if (!debug.showOverlay) return;

  ctx.save();
  ctx.font = "12px monospace";
  ctx.fillStyle = "#00ff00";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;

  const lines = [
    `FPS: ${fps}`,
    `TimeScale: ${debug.timeScale.toFixed(2)}`,
    `Entities: ${world.entityCount || 0}`,
    `Paused: ${debug.paused ? "YES" : "NO"}`,
  ];

  // 效能統計
  const profilerResults = profiler.getAllResults();
  if (Object.keys(profilerResults).length > 0) {
    lines.push("--- Profiler (ms) ---");
    for (const [name, time] of Object.entries(profilerResults)) {
      lines.push(`${name}: ${time.toFixed(2)}`);
    }
  }

  // 添加玩家狀態
  if (world.player && world.collisionFlags) {
    const transform = world.getComponent(world.player, "Transform");
    const velocity = world.getComponent(world.player, "Velocity");
    const onGround = world.collisionFlags.onGround.get(world.player);
    const hitWall = world.collisionFlags.hitWall.get(world.player);

    if (transform && velocity) {
      lines.push("--- Player ---");
      lines.push(
        `Pos: (${Math.round(transform.x)}, ${Math.round(transform.y)})`
      );
      lines.push(
        `Vel: (${Math.round(velocity.vx)}, ${Math.round(velocity.vy)})`
      );
      lines.push(`Ground: ${onGround || false} Wall: ${hitWall || false}`);
    }
  }

  let y = 16;
  for (const line of lines) {
    // 描邊效果提高可讀性
    ctx.strokeText(line, 10, y);
    ctx.fillText(line, 10, y);
    y += 16;
  }

  // 顯示熱鍵提示
  ctx.font = "10px monospace";
  ctx.fillStyle = "#888888";
  const helpText = "F1=Overlay F2=Hitbox F3=SlowMo F4=Grid `=Pause .=Step";
  ctx.fillText(helpText, 10, ctx.canvas.height - 10);

  ctx.restore();
}

export function drawDebugHitboxes(ctx, world, tileMap) {
  const debug = getDebugState();
  if (!debug.showHitbox) return;

  ctx.save();

  // 繪製實體 hitboxes (青色框)
  ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
  ctx.lineWidth = 1;

  const entities = world.query(["Transform", "AABB"]);
  for (const entity of entities) {
    const transform = world.getComponent(entity, "Transform");
    const aabb = world.getComponent(entity, "AABB");

    if (transform && aabb) {
      ctx.strokeRect(
        transform.x + aabb.ox,
        transform.y + aabb.oy,
        aabb.w,
        aabb.h
      );
    }
  }

  // 繪製 tile grid (如果啟用)
  if (debug.showTileGrid) {
    ctx.strokeStyle = "rgba(255, 255, 0, 0.3)";
    ctx.lineWidth = 0.5;

    // 垂直線
    for (let x = 0; x <= tileMap.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tileMap.tileSize, 0);
      ctx.lineTo(x * tileMap.tileSize, tileMap.height * tileMap.tileSize);
      ctx.stroke();
    }

    // 水平線
    for (let y = 0; y <= tileMap.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * tileMap.tileSize);
      ctx.lineTo(tileMap.width * tileMap.tileSize, y * tileMap.tileSize);
      ctx.stroke();
    }
  }

  ctx.restore();
}
