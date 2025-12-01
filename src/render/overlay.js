// src/render/overlay.js
import { getDebugState, profiler } from "../debug.js";
import { HYPERDRIVE } from "../config.js";

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
    const health = world.getComponent(world.player, "Health");
    const attack = world.getComponent(world.player, "Attack");
    const iframe = world.getComponent(world.player, "IFrame");
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

      // Combat stats
      if (health) {
        lines.push(`HP: ${health.current}/${health.max}`);
      }
      if (attack) {
        lines.push(`Attack CD: ${attack.cooldown.toFixed(2)}s`);
      }
      const meter = world.getComponent(world.player, "AbilityMeter");
      const abilitySkill = world.getComponent(world.player, "AbilitySkill");
      const hyperdrive = world.getComponent(world.player, "Hyperdrive");
      if (meter) {
        lines.push(`Ability: ${Math.round(meter.current)}/${meter.max} ${meter.ready ? "[READY]" : ""}`);
        if (abilitySkill?.active) {
          lines.push(`Ability ACTIVE ${(abilitySkill.duration - abilitySkill.elapsed).toFixed(1)}s`);
        }
      }
      if (hyperdrive) {
        lines.push(
          `Hyperdrive: ${hyperdrive.active ? "ON" : "OFF"} ${
            hyperdrive.active
              ? (hyperdrive.duration - hyperdrive.elapsed).toFixed(2) + "s"
              : ""
          }`
        );
        lines.push(`Style: ${hyperdrive.style || "?"}`);
        if (hyperdrive.active) {
          lines.push(
            `Front:${hyperdrive._frontBlocked ? "阻擋" : "通"} Gap:${hyperdrive._gapAhead ? "有" : "無"} Top:${hyperdrive._lowCeil ? "低頂" : "OK"}`
          );
        }
      }
      if (iframe && iframe.active) {
        lines.push(`IFrame: ${(iframe.duration - iframe.elapsed).toFixed(2)}s`);
      }

      // Height layer info (if infiniteWorld is available via world)
      if (world.infiniteWorld) {
        const layerType = world.infiniteWorld.getLayerType(transform.y);
        const skyLayer = world.infiniteWorld.getSkyLayerIndex(transform.y);
        const bgLayerType = world.infiniteWorld.getBackgroundLayerType
          ? world.infiniteWorld.getBackgroundLayerType(transform.y)
          : "N/A";
        const bgSwitchHeight = world.infiniteWorld.backgroundSwitchHeight || 0;
        lines.push(`Layer: ${layerType.toUpperCase()}`);
        lines.push(`BG Layer: ${bgLayerType.toUpperCase()}`);
        lines.push(`BG Switch: ${bgSwitchHeight}`);
        if (layerType === "sky") {
          lines.push(`Sky Layer: ${skyLayer}`);
        }
      }

      // Show parallax system info
      if (world.parallaxSystem) {
        const ps = world.parallaxSystem;
        lines.push(`Cam Mid Y: ${(ps._cameraMiddleY || 0).toFixed(0)}`);
        lines.push(`Sky α: ${((ps._skyAlpha || 0) * 100).toFixed(0)}% | Ground α: ${((ps._groundAlpha || 0) * 100).toFixed(0)}%`);
        if (ps._currentLayerSet) {
          lines.push(`BG Mode: ${ps._currentLayerSet.toUpperCase()}`);
        }
      }
    }
  }

  // Show available layer sets
  if (world.parallaxSystem) {
    const ps = world.parallaxSystem;
    lines.push("--- Parallax Layers ---");
    lines.push(`Ground: ${ps.layerSets.ground ? ps.layerSets.ground.length : 0} layers`);
    lines.push(`Sky: ${ps.layerSets.sky ? ps.layerSets.sky.length : 0} layers`);
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
  const helpText = "F1=Overlay F2=Hitbox F3=SlowMo F4=Grid F5=Vectors F6=Panel F7=Levels F9=Console F12=Screenshot J=Attack";
  ctx.fillText(helpText, 10, ctx.canvas.height - 10);
  const helpText2 = "`=Pause .=Step Shift+F3=SpeedUp Ctrl+F3=SpeedDown";
  ctx.fillText(helpText2, 10, ctx.canvas.height - 22);

  ctx.restore();
}

// Ability meter + style HUD (always on-screen)
export function drawAbilityHud(ctx, world) {
  if (!world || !world.player) return;
  const meter = world.getComponent(world.player, "AbilityMeter");
  const ability = world.getComponent(world.player, "AbilitySkill");
  const hyper = world.getComponent(world.player, "Hyperdrive");
  if (!meter || !ability) return;

  const style = HYPERDRIVE.styles[ability.style] || HYPERDRIVE.styles.inferno;
  const ratio = meter.max ? Math.max(0, Math.min(1, meter.current / meter.max)) : 0;
  const ready = meter.ready;
   const now = performance.now ? performance.now() * 0.001 : Date.now() * 0.001;

  ctx.save();
  const hudX = 14;
  const hudY = 14;
  const hudW = 240;
  const hudH = 14;

  // Bar background
  ctx.fillStyle = "rgba(20,20,30,0.8)";
  ctx.fillRect(hudX - 4, hudY - 6, hudW + 8, hudH + 18);
  ctx.fillStyle = "rgba(50,50,60,0.9)";
  ctx.fillRect(hudX, hudY, hudW, hudH);

  // Bar fill
  const pulse = ready ? 0.5 + Math.sin(now * 6) * 0.2 : 1;
  ctx.fillStyle = ready ? `rgba(255,210,80,${0.75 + pulse * 0.25})` : "rgba(140,200,255,0.9)";
  ctx.fillRect(hudX, hudY, hudW * ratio, hudH);

  // Text
  ctx.font = "12px monospace";
  ctx.fillStyle = "#ffffff";
  const styleLabel = style?.label || ability.style || "???";
  ctx.fillText(`能量 ${Math.round(meter.current)}/${meter.max}`, hudX + 32, hudY + hudH + 12);
  ctx.fillText(`風格: ${styleLabel}  (H 切換)`, hudX + 32, hudY + hudH + 26);
  ctx.fillText(`K 啟動`, hudX + hudW - 52, hudY + hudH + 12);
  if (hyper?.active) {
    const remain = Math.max(0, (hyper.duration || 0) - (hyper.elapsed || 0));
    ctx.fillText(`Hyperdrive ${remain.toFixed(1)}s`, hudX + hudW - 120, hudY - 4);
  } else if (ready) {
    ctx.fillText(`READY`, hudX + hudW - 56, hudY - 4);
  }

  // Style icon
  ctx.fillStyle = style?.flameColor || "#ffaa00";
  ctx.fillRect(hudX - 2, hudY + hudH + 4, 20, 20);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.strokeRect(hudX - 2, hudY + hudH + 4, 20, 20);

  if (world.celebration?.active) {
    ctx.fillStyle = "#ffeeaa";
    ctx.fillText("慶祝模式：V 壁紙(按住) / C 分身 / N 離開", hudX, hudY + hudH + 42);
    if (world.celebration.wallpaperHeld) {
      ctx.fillText("壁紙 ON", hudX + hudW - 80, hudY - 4);
    }
  }
  if (world.voidMode?.active) {
    ctx.fillStyle = "#a0e3ff";
    ctx.fillText("無敵桌布：X 按住 / J/L/U 放煙火", hudX, hudY + hudH + 58);
  }

  // Style toast
  if (ability.styleToastTimer > 0 && ability.styleToastLabel) {
    const alpha = Math.min(1, ability.styleToastTimer / 1.2);
    const toastW = 200;
    const toastH = 26;
    const tx = ctx.canvas.width * 0.5 - toastW * 0.5;
    const ty = hudY;
    ctx.fillStyle = `rgba(30, 20, 40, ${0.7 * alpha})`;
    ctx.fillRect(tx, ty, toastW, toastH);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * alpha})`;
    ctx.strokeRect(tx, ty, toastW, toastH);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillText(`風格：${ability.styleToastLabel}`, tx + 10, ty + 16);
  }

  ctx.restore();
}

export function drawDebugHitboxes(ctx, world, tileMapOrInfiniteWorld, cameraSystem = null) {
  const debug = getDebugState();
  if (!debug.showHitbox) return;

  ctx.save();

  // Get camera offset
  const camera = cameraSystem ? cameraSystem.getCamera() : { x: 0, y: 0 };

  // Support both old TileMap and new InfiniteWorld
  const tileMap = tileMapOrInfiniteWorld.groundMap ? tileMapOrInfiniteWorld.groundMap : tileMapOrInfiniteWorld;

  // Draw entity AABB hitboxes (cyan frames)
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

  // Draw combat hitboxes (red frames, only when active)
  ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";
  ctx.lineWidth = 2;

  const attackers = world.query(["Transform", "Hitbox"]);
  for (const entity of attackers) {
    const transform = world.getComponent(entity, "Transform");
    const hitbox = world.getComponent(entity, "Hitbox");
    const characterState = world.getComponent(entity, "CharacterState");
    const attack = world.getComponent(entity, "Attack");

    if (transform && hitbox && hitbox.active) {
      // Adjust hitbox position based on facing direction
      const facing = characterState ? characterState.facing : 1;
      const offsetX = facing === -1 ? -hitbox.offsetX - hitbox.width : hitbox.offsetX;

      const screenX = transform.x + offsetX - camera.x;
      const screenY = transform.y + hitbox.offsetY - camera.y;

      ctx.strokeRect(screenX, screenY, hitbox.width, hitbox.height);

      // Draw label
      ctx.fillStyle = "rgba(255, 0, 0, 0.9)";
      ctx.font = "10px monospace";
      ctx.fillText(`DMG:${hitbox.damage}`, screenX, screenY - 2);
    } else if (transform && attack && attack.isAttacking && attack.phase === "windup") {
      // Telegraph ring during windup
      const screenX = transform.x - camera.x;
      const screenY = transform.y - camera.y;
      ctx.strokeStyle = "rgba(255, 200, 0, 0.8)";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 40, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw hurtboxes (yellow frames)
  ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
  ctx.lineWidth = 1;

  const victims = world.query(["Transform", "Hurtbox"]);
  for (const entity of victims) {
    const transform = world.getComponent(entity, "Transform");
    const hurtbox = world.getComponent(entity, "Hurtbox");

    if (transform && hurtbox && hurtbox.active) {
      const screenX = transform.x + hurtbox.offsetX - camera.x;
      const screenY = transform.y + hurtbox.offsetY - camera.y;

      ctx.strokeRect(screenX, screenY, hurtbox.width, hurtbox.height);
    }
  }

  // Draw AI perception ranges and state labels
  const aiEntities = world.query(["Transform", "AIState", "Perception"]);
  ctx.lineWidth = 1;
  for (const entity of aiEntities) {
    const transform = world.getComponent(entity, "Transform");
    const ai = world.getComponent(entity, "AIState");
    const perception = world.getComponent(entity, "Perception");
    const combat = world.getComponent(entity, "CombatStats");

    if (!transform || !ai || !perception) continue;

    const screenX = transform.x - camera.x;
    const screenY = transform.y - camera.y;

    // Sight range
    ctx.strokeStyle = "rgba(0, 200, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(screenX, screenY, perception.sightRange, 0, Math.PI * 2);
    ctx.stroke();

    // Attack range
    const attackRange =
      (combat && combat.attackRange) || perception.peripheralRange || 80;
    ctx.strokeStyle = "rgba(255, 120, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(screenX, screenY, attackRange, 0, Math.PI * 2);
    ctx.stroke();

    // State label
    ctx.fillStyle = "rgba(0, 255, 200, 0.9)";
    ctx.font = "10px monospace";
    ctx.fillText(ai.debugLabel || ai.state, screenX - 12, screenY - 8);
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

/**
 * Draw velocity vectors for entities
 */
export function drawVelocityVectors(ctx, world, cameraSystem = null) {
  const debug = getDebugState();
  if (!debug.showVelocityVectors) return;

  ctx.save();

  // Get camera offset
  const camera = cameraSystem ? cameraSystem.getCamera() : { x: 0, y: 0 };

  // Draw velocity vectors for all entities with velocity
  const entities = world.query(["Transform", "Velocity", "AABB"]);
  for (const entity of entities) {
    const transform = world.getComponent(entity, "Transform");
    const velocity = world.getComponent(entity, "Velocity");
    const aabb = world.getComponent(entity, "AABB");

    if (transform && velocity && aabb) {
      // Calculate entity center in screen space
      const centerX = transform.x + aabb.w / 2 - camera.x;
      const centerY = transform.y + aabb.h / 2 - camera.y;

      // Scale velocity for better visibility (1 unit = 10 pixels)
      const scale = 0.1;
      const endX = centerX + velocity.vx * scale;
      const endY = centerY + velocity.vy * scale;

      // Draw arrow
      ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
      ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
      ctx.lineWidth = 2;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw arrowhead
      const angle = Math.atan2(endY - centerY, endX - centerX);
      const arrowSize = 8;

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Draw velocity magnitude text
      const speed = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2);
      if (speed > 0.1) {
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(Math.round(speed).toString(), centerX + 10, centerY - 10);
      }
    }
  }

  ctx.restore();
}
