// src/systems/render-system.js
import { ComponentBits, components } from "../ecs/components.js";
import { RENDER } from "../config.js";
import { assetLoader } from "../core/asset-loader.js";

export class RenderSystem {
  constructor(ctx, tileMapOrInfiniteWorld) {
    this.ctx = ctx;
    // Support both old TileMap and new InfiniteWorld
    this.tileMap = tileMapOrInfiniteWorld.groundMap ? tileMapOrInfiniteWorld.groundMap : tileMapOrInfiniteWorld;
    this.infiniteWorld = tileMapOrInfiniteWorld.groundMap ? tileMapOrInfiniteWorld : null;
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

    // Calculate visible tile range for performance
    // In infinite mode, don't clamp to map boundaries
    const startX = Math.floor(camera.x / tileMap.tileSize);
    const endX = Math.ceil((camera.x + RENDER.CANVAS_WIDTH) / tileMap.tileSize);

    const startY = Math.floor(camera.y / tileMap.tileSize);
    const endY = Math.ceil((camera.y + RENDER.CANVAS_HEIGHT) / tileMap.tileSize);

    // Check if we have tileset
    const hasImages = tileMap.tileset;

    // Draw background layer first
    this.drawTileLayer(tileMap.layers.background, startX, endX, startY, endY, camera, hasImages);
  }

  // NEW: Draw middleground layer (called separately for entity ordering)
  drawMiddleground(camera) {
    const { tileMap } = this;

    // In infinite mode, don't clamp to map boundaries
    const startX = Math.floor(camera.x / tileMap.tileSize);
    const endX = Math.ceil((camera.x + RENDER.CANVAS_WIDTH) / tileMap.tileSize);

    const startY = Math.floor(camera.y / tileMap.tileSize);
    const endY = Math.ceil((camera.y + RENDER.CANVAS_HEIGHT) / tileMap.tileSize);

    const hasImages = tileMap.tileset;
    this.drawTileLayer(tileMap.layers.middleground, startX, endX, startY, endY, camera, hasImages);
  }

  // NEW: Draw foreground layer (called after entities)
  drawForeground(camera) {
    const { tileMap } = this;

    // In infinite mode, don't clamp to map boundaries
    const startX = Math.floor(camera.x / tileMap.tileSize);
    const endX = Math.ceil((camera.x + RENDER.CANVAS_WIDTH) / tileMap.tileSize);

    const startY = Math.floor(camera.y / tileMap.tileSize);
    const endY = Math.ceil((camera.y + RENDER.CANVAS_HEIGHT) / tileMap.tileSize);

    const hasImages = tileMap.tileset;
    this.drawTileLayer(tileMap.layers.foreground, startX, endX, startY, endY, camera, hasImages);
  }

  // NEW: Helper method to draw a specific tile layer (with infinite wrapping support)
  drawTileLayer(layer, startX, endX, startY, endY, camera, hasImages) {
    if (!layer || !layer.visible) return;

    const { ctx, infiniteWorld } = this;

    // If using InfiniteWorld, use its method to get visible tiles
    if (infiniteWorld) {
      const tiles = infiniteWorld.getVisibleTiles(
        camera.x,
        camera.y,
        RENDER.CANVAS_WIDTH,
        RENDER.CANVAS_HEIGHT
      );

      for (const tile of tiles) {
        const screenX = tile.worldX - camera.x;
        const screenY = tile.worldY - camera.y;

        if (tile.tileInfo && tile.tileInfo.path) {
          const img = assetLoader.getImage(tile.tileInfo.path);
          if (img) {
            ctx.drawImage(
              img,
              screenX,
              screenY,
              infiniteWorld.tileSize,
              infiniteWorld.tileSize
            );
          }
        }
      }
    } else {
      // Legacy rendering for old TileMap
      const tileMap = this.tileMap;
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const normalized = tileMap.normalizeCoords ? tileMap.normalizeCoords(x, y) : { x, y };
          const tileGID = layer.tiles[normalized.y][normalized.x];
          if (tileGID === 0) continue;

          const worldX = x * tileMap.tileSize;
          const worldY = y * tileMap.tileSize;

          const screenX = worldX - camera.x;
          const screenY = worldY - camera.y;

          if (hasImages) {
            const tileInfo = tileMap.tileset.tiles[String(tileGID)];
            if (tileInfo) {
              const img = assetLoader.getImage(tileInfo.path);
              if (img) {
                ctx.drawImage(img, screenX, screenY, tileMap.tileSize, tileMap.tileSize);
              }
            }
          }
        }
      }
    }
  }

  // UPDATED: Add camera parameter and optional culling
  drawEntity(entity, camera) {
    const transform = this.world.getComponent(entity, "Transform");
    const renderable = this.world.getComponent(entity, "Renderable");
    const sprite = this.world.getComponent(entity, "Sprite");
    const wave = this.world.getComponent(entity, "Wave");
    const projectile = this.world.getComponent(entity, "Projectile");

    if (!transform || !renderable) return;

    if (this.world.voidMode?.active) {
      // 只渲染玩家與標記 renderDuringVoid 的特效
      if (entity !== this.world.player && !renderable.renderDuringVoid) return;
    }

    // Check IFrame visibility (for flash effect)
    const iframe = this.world.getComponent(entity, "IFrame");
    if (iframe && iframe.active && !iframe.visible) {
      return; // Skip rendering during flash
    }

    // NEW: Skip if not visible (optional culling for performance)
    const aabb = this.world.getComponent(entity, "AABB");
    const w = aabb ? aabb.w : sprite ? sprite.width : 16;
    const h = aabb ? aabb.h : sprite ? sprite.height : 24;

    if (
      this.cameraSystem &&
      !projectile &&
      !this.cameraSystem.isVisible(transform.x, transform.y, w, h)
    ) {
      return; // skip invisible entities
    }

    const { ctx } = this;

    const originalAlpha = ctx.globalAlpha;
    ctx.globalAlpha = (renderable.opacity ?? 1) * originalAlpha;

    // NEW: Apply camera offset to entity position
    const screenX = Math.round(transform.x - camera.x);
    const screenY = Math.round(transform.y - camera.y);

    // NEW: Render sprite if available
    if (wave) {
      // Draw expanding ring for wave attacks
      const radius = wave.radius;
      ctx.strokeStyle = renderable.color || "rgba(90,230,255,0.85)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (sprite && sprite.animations[sprite.currentAnimation]) {
      this.drawSprite(sprite, screenX, screenY);
    } else {
      // Fallback: render colored rectangle
      ctx.fillStyle = renderable.color || RENDER.PLAYER_COLOR;
      ctx.fillRect(screenX, screenY, w, h);
    }

    ctx.globalAlpha = originalAlpha;
  }

  // NEW: Draw animated sprite
  drawSprite(sprite, x, y) {
    const { ctx } = this;
    const anim = sprite.animations[sprite.currentAnimation];
    if (!anim || !anim.frames || anim.frames.length === 0) return;

    const frame = anim.frames[sprite.frameIndex];
    if (!frame) return;

    ctx.save();

    // Apply horizontal flip if needed
    if (sprite.flipX) {
      ctx.translate(x + sprite.width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(frame, 0, 0, sprite.width, sprite.height);
    } else {
      ctx.drawImage(frame, x, y, sprite.width, sprite.height);
    }

    ctx.restore();
  }
}
