// src/systems/render-system.js
import { COMPONENT_TYPES, components } from "../ecs/components.js";
import { RENDER } from "../config.js";

export class RenderSystem {
  constructor(ctx, tileMap) {
    this.ctx = ctx;
    this.tileMap = tileMap;
    this.world = null; // 將由 main.js 設定
  }

  setWorld(world) {
    this.world = world;
  }

  draw() {
    // 清除畫面
    ctx.fillStyle = RENDER.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 繪製 tiles
    this.drawTiles();

    // 繪製實體
    if (this.world) {
      const entities = this.world.query(["Transform", "Renderable"]);
      for (const entity of entities) {
        this.drawEntity(entity);
      }
    }
  }

  drawTiles() {
    const { ctx, tileMap } = this;
    ctx.fillStyle = RENDER.TILE_COLOR;

    for (let y = 0; y < tileMap.height; y++) {
      for (let x = 0; x < tileMap.width; x++) {
        if (tileMap.isSolid(x, y)) {
          ctx.fillRect(
            x * tileMap.tileSize,
            y * tileMap.tileSize,
            tileMap.tileSize,
            tileMap.tileSize
          );
        }
      }
    }
  }

  drawEntity(entity) {
    const transform = this.world.getComponent(entity, "Transform");
    const renderable = this.world.getComponent(entity, "Renderable");

    if (!transform || !renderable) return;

    const { ctx } = this;
    ctx.fillStyle = renderable.color || RENDER.PLAYER_COLOR;

    // 繪製實體 (假設玩家是 16x24)
    const aabb = this.world.getComponent(entity, "AABB");
    const w = aabb ? aabb.w : 16;
    const h = aabb ? aabb.h : 24;

    ctx.fillRect(Math.round(transform.x), Math.round(transform.y), w, h);
  }
}
