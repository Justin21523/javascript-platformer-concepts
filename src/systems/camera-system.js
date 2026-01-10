// src/systems/camera-system.js
import { CAMERA, RENDER } from "../config.js";
import { clamp } from "../core/math.js";

export class CameraSystem {
  constructor(world, tileMap) {
    this.world = world;
    this.tileMap = tileMap;

    // Camera state
    this.camera = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    // World bounds for clamping
    this.worldWidth = tileMap.width * tileMap.tileSize;
    this.worldHeight = tileMap.height * tileMap.tileSize;

    // Flag to force immediate snap on first update
    this.firstUpdate = true;

    this.shake = { time: 0, duration: 0, strength: 0 };

    if (typeof window !== "undefined") {
      window.addEventListener("camera-shake", (e) => {
        const detail = e.detail || {};
        this.triggerShake(detail.strength ?? 8, detail.duration ?? 0.25);
      });
    }
  }

  update(dt) {
    // Find primary follow target (highest priority)
    const followEntities = this.world.query(["Transform", "CameraFollow"]);
    let primaryTarget = null;
    let highestPriority = 0;

    for (const entity of followEntities) {
      const follow = this.world.getComponent(entity, "CameraFollow");
      if (follow.priority > highestPriority) {
        primaryTarget = entity;
        highestPriority = follow.priority;
      }
    }

    if (!primaryTarget) return;

    const transform = this.world.getComponent(primaryTarget, "Transform");
    const follow = this.world.getComponent(primaryTarget, "CameraFollow");
    const aabb = this.world.getComponent(primaryTarget, "AABB");

    // Calculate target position (center entity on screen)
    const targetCenterX = transform.x + (aabb ? aabb.w / 2 : 64);
    const targetCenterY = transform.y + (aabb ? aabb.h / 2 : 96);

    this.camera.targetX = targetCenterX - RENDER.CANVAS_WIDTH / 2;
    this.camera.targetY = targetCenterY - RENDER.CANVAS_HEIGHT / 2;

    // Apply dead zone logic
    this.applyDeadZone(follow, targetCenterX, targetCenterY);

    // On first update, snap camera immediately to player position
    if (this.firstUpdate) {
      this.camera.x = this.camera.targetX;
      this.camera.y = this.camera.targetY;
      this.firstUpdate = false;
    } else {
      // Smooth camera movement
      const lerpFactor = 1 - Math.pow(1 - CAMERA.SMOOTHING, dt * 60);
      this.camera.x += (this.camera.targetX - this.camera.x) * lerpFactor;
      this.camera.y += (this.camera.targetY - this.camera.y) * lerpFactor;
    }

    // Camera shake (adds a small random offset)
    if (this.shake.time > 0) {
      this.shake.time -= dt;
      const t = Math.max(0, this.shake.time / (this.shake.duration || 0.0001));
      const falloff = t * t; // quadratic decay
      const sx = (Math.random() * 2 - 1) * this.shake.strength * falloff;
      const sy = (Math.random() * 2 - 1) * this.shake.strength * falloff;
      this.camera.x += sx;
      this.camera.y += sy;
    }

    // Clamp camera Y to prevent showing below ground layer
    // Ground layer bottom should align with canvas bottom
    const maxY = this.worldHeight - RENDER.CANVAS_HEIGHT;

    // Clamp both target and actual camera position
    this.camera.targetY = Math.min(this.camera.targetY, maxY);
    this.camera.y = Math.min(this.camera.y, maxY);

    // Allow infinite horizontal movement (no X clamping)

    // Round to integer pixels (prevent tearing)
    this.camera.x = Math.round(this.camera.x);
    this.camera.y = Math.round(this.camera.y);
  }

  applyDeadZone(follow, targetCenterX, targetCenterY) {
    const screenCenterX = this.camera.x + RENDER.CANVAS_WIDTH / 2;
    const screenCenterY = this.camera.y + RENDER.CANVAS_HEIGHT / 2;

    const deltaX = targetCenterX - screenCenterX;
    const deltaY = targetCenterY - screenCenterY;

    // Only move camera if target is outside dead zone
    const halfDeadX = follow.deadZoneX / 2;
    const halfDeadY = follow.deadZoneY / 2;

    if (Math.abs(deltaX) > halfDeadX) {
      const moveX = deltaX > 0 ? deltaX - halfDeadX : deltaX + halfDeadX;
      this.camera.targetX = this.camera.x + moveX;
    } else {
      this.camera.targetX = this.camera.x; // no X movement
    }

    if (Math.abs(deltaY) > halfDeadY) {
      const moveY = deltaY > 0 ? deltaY - halfDeadY : deltaY + halfDeadY;
      this.camera.targetY = this.camera.y + moveY;
    } else {
      this.camera.targetY = this.camera.y; // no Y movement
    }
  }

  clampToWorldBounds() {
    const margin = CAMERA.CLAMP_MARGIN;

    // Horizontal clamping
    const minX = -margin;
    const maxX = Math.max(minX, this.worldWidth - RENDER.CANVAS_WIDTH + margin);
    this.camera.targetX = clamp(this.camera.targetX, minX, maxX);

    // Vertical clamping (optional - many platformers don't clamp Y)
    const minY = -margin;
    const maxY = Math.max(
      minY,
      this.worldHeight - RENDER.CANVAS_HEIGHT + margin
    );
    this.camera.targetY = clamp(this.camera.targetY, minY, maxY);
  }

  // Get camera position for rendering
  getCamera() {
    return { ...this.camera };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.camera.x,
      y: worldY - this.camera.y,
    };
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.camera.x,
      y: screenY + this.camera.y,
    };
  }

  // Check if a rectangle is visible on screen (for culling)
  isVisible(worldX, worldY, width, height) {
    const margin = 32; // small buffer for partially visible objects
    return (
      worldX + width >= this.camera.x - margin &&
      worldX <= this.camera.x + RENDER.CANVAS_WIDTH + margin &&
      worldY + height >= this.camera.y - margin &&
      worldY <= this.camera.y + RENDER.CANVAS_HEIGHT + margin
    );
  }

  // Update map reference when switching levels
  setTileMap(tileMap) {
    this.tileMap = tileMap;
    this.worldWidth = tileMap.width * tileMap.tileSize;
    this.worldHeight = tileMap.height * tileMap.tileSize;
    this.firstUpdate = true;
  }

  triggerShake(strength = 8, duration = 0.25) {
    this.shake.strength = strength;
    this.shake.duration = duration;
    this.shake.time = duration;
  }
}
