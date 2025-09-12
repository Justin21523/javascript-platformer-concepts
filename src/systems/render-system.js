// src/systems/render-system.js
import { ComponentBits, components } from "../ecs/components.js";
import { RENDER } from "../config.js";

export class RenderSystem {
  constructor(ctx, tileMap) {
    this.ctx = ctx;
    this.tileMap = tileMap;
    this.world = null; // will be set by main.js
    this.cameraSystem = null; // NEW: camera system reference
  }

  setWorld(world) {
    this.world = world;
  }

  // NEW: Set camera system reference
  setCameraSystem(cameraSystem) {
    this.cameraSystem = cameraSystem;
  }

  draw() {
    const { ctx } = this;
    // Clear screen
    ctx.fillStyle = RENDER.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // NEW: Get camera for offset calculations
    const camera = this.cameraSystem
      ? this.cameraSystem.getCamera()
      : { x: 0, y: 0 };

    // Draw tiles with camera offset
    this.drawTiles(camera); // UPDATED: pass camera

    // Draw entities with camera offset
    if (this.world) {
      const entities = this.world.query(["Transform", "Renderable"]);
      for (const entity of entities) {
        this.drawEntity(entity, camera); // UPDATED: pass camera
      }
    }
  }

  drawTiles(camera) {
    const { ctx, tileMap } = this;
    ctx.fillStyle = RENDER.TILE_COLOR;

    // NEW: Calculate visible tile range for performance (only draw what's visible)
    const startX = Math.max(0, Math.floor(camera.x / tileMap.tileSize));
    const endX = Math.min(
      tileMap.width,
      Math.ceil((camera.x + RENDER.CANVAS_WIDTH) / tileMap.tileSize)
    );

    const startY = Math.max(0, Math.floor(camera.y / tileMap.tileSize));
    const endY = Math.min(
      tileMap.height,
      Math.ceil((camera.y + RENDER.CANVAS_HEIGHT) / tileMap.tileSize)
    );

    // UPDATED: Only draw visible tiles instead of all tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (tileMap.isSolid(x, y)) {
          const worldX = x * tileMap.tileSize;
          const worldY = y * tileMap.tileSize;

          // NEW: Apply camera offset
          const screenX = worldX - camera.x;
          const screenY = worldY - camera.y;

          ctx.fillRect(screenX, screenY, tileMap.tileSize, tileMap.tileSize);
        }
      }
    }
  }

  // UPDATED: Add camera parameter and optional culling
  drawEntity(entity, camera) {
    const transform = this.world.getComponent(entity, "Transform");
    const renderable = this.world.getComponent(entity, "Renderable");

    if (!transform || !renderable) return;

    // NEW: Skip if not visible (optional culling for performance)
    const aabb = this.world.getComponent(entity, "AABB");
    const w = aabb ? aabb.w : 16;
    const h = aabb ? aabb.h : 24;

    if (
      this.cameraSystem &&
      !this.cameraSystem.isVisible(transform.x, transform.y, w, h)
    ) {
      return; // skip invisible entities
    }

    const { ctx } = this;
    ctx.fillStyle = renderable.color || RENDER.PLAYER_COLOR;

    // NEW: Apply camera offset to entity position
    const screenX = Math.round(transform.x - camera.x);
    const screenY = Math.round(transform.y - camera.y);

    ctx.fillRect(screenX, screenY, w, h);
  }
}
