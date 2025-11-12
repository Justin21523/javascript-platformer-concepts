// src/render/overlay.js
import { getDebugState, profiler } from "../debug.js";

export function drawDebugOverlay(ctx, world, fps = 60, cameraSystem = null) {
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

  // Camera information
  if (cameraSystem) {
    const camera = cameraSystem.getCamera();
    lines.push("--- Camera ---");
    lines.push(`Cam: (${Math.round(camera.x)}, ${Math.round(camera.y)})`);
    lines.push(
      `Target: (${Math.round(camera.targetX)}, ${Math.round(camera.targetY)})`
    );
  }

  // Performance statistics
  const profilerResults = profiler.getAllResults();
  if (Object.keys(profilerResults).length > 0) {
    lines.push("--- Profiler (ms) ---");
    for (const [name, time] of Object.entries(profilerResults)) {
      lines.push(`${name}: ${time.toFixed(2)}`);
    }
  }

  // Add player state
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
    // Add outline effect for better readability
    ctx.strokeText(line, 10, y);
    ctx.fillText(line, 10, y);
    y += 16;
  }

  // Show hotkey hints
  ctx.font = "10px monospace";
  ctx.fillStyle = "#888888";
  const helpText = "F1=Overlay F2=Hitbox F3=SlowMo F4=Grid `=Pause .=Step";
  ctx.fillText(helpText, 10, ctx.canvas.height - 10);

  ctx.restore();
}

export function drawDebugHitboxes(ctx, world, tileMap, cameraSystem = null) {
  const debug = getDebugState();
  if (!debug.showHitbox) return;

  ctx.save();

  // Get camera offset
  const camera = cameraSystem ? cameraSystem.getCamera() : { x: 0, y: 0 };

  // Draw entity hitboxes (cyan frames)
  ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
  ctx.lineWidth = 1;

  const entities = world.query(["Transform", "AABB"]);
  for (const entity of entities) {
    const transform = world.getComponent(entity, "Transform");
    const aabb = world.getComponent(entity, "AABB");

    if (transform && aabb) {
      // Apply camera offset to hitbox position
      const screenX = transform.x + aabb.ox - camera.x;
      const screenY = transform.y + aabb.oy - camera.y;

      ctx.strokeRect(screenX, screenY, aabb.w, aabb.h);
    }
  }

  // Draw tile grid (if enabled)
  if (debug.showTileGrid) {
    ctx.strokeStyle = "rgba(255, 255, 0, 0.3)";
    ctx.lineWidth = 0.5;

    // Calculate visible tile range
    const startX = Math.max(0, Math.floor(camera.x / tileMap.tileSize));
    const endX = Math.min(
      tileMap.width,
      Math.ceil((camera.x + ctx.canvas.width) / tileMap.tileSize)
    );

    const startY = Math.max(0, Math.floor(camera.y / tileMap.tileSize));
    const endY = Math.min(
      tileMap.height,
      Math.ceil((camera.y + ctx.canvas.height) / tileMap.tileSize)
    );

    // Vertical lines
    for (let x = startX; x <= endX; x++) {
      const screenX = x * tileMap.tileSize - camera.x;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, ctx.canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y++) {
      const screenY = y * tileMap.tileSize - camera.y;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(ctx.canvas.width, screenY);
      ctx.stroke();
    }
  }

  // Draw camera dead zone (if camera exists)
  if (cameraSystem && world.player) {
    const follow = world.getComponent(world.player, "CameraFollow");
    if (follow) {
      ctx.strokeStyle = "rgba(255, 0, 255, 0.5)";
      ctx.lineWidth = 2;

      const centerX = ctx.canvas.width / 2;
      const centerY = ctx.canvas.height / 2;
      const deadZoneX = centerX - follow.deadZoneX / 2;
      const deadZoneY = centerY - follow.deadZoneY / 2;

      ctx.strokeRect(deadZoneX, deadZoneY, follow.deadZoneX, follow.deadZoneY);
    }
  }
  ctx.restore();
}
