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

    // Calculate target position (center entity on screen)
    const targetCenterX = transform.x + 8; // assuming 16px wide entity
    const targetCenterY = transform.y + 12; // assuming 24px tall entity

    this.camera.targetX = targetCenterX - RENDER.CANVAS_WIDTH / 2;
    this.camera.targetY = targetCenterY - RENDER.CANVAS_HEIGHT / 2;

    // Apply dead zone logic
    this.applyDeadZone(follow, targetCenterX, targetCenterY);

    // Smooth camera movement
    const lerpFactor = 1 - Math.pow(1 - CAMERA.SMOOTHING, dt * 60);
    this.camera.x += (this.camera.targetX - this.camera.x) * lerpFactor;
    this.camera.y += (this.camera.targetY - this.camera.y) * lerpFactor;

    // Clamp to world bounds
    this.clampToWorldBounds();

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
}
