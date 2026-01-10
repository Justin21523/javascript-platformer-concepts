// src/world/tiles.js
import { COLLISION } from "../config.js";

export class TileMap {
  constructor(width, height, tileSize = COLLISION.TILE_SIZE) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;

    // NEW: Infinite looping settings
    this.infiniteHorizontal = true; // Water平方向無限循環
    this.infiniteVertical = true; // 垂直方向無限循環

    // Legacy collision grid (for backwards compatibility)
    this.solids = Array.from({ length: height }, () =>
      Array(width).fill(false)
    );

    // Legacy single-layer tiles (for backwards compatibility)
    this.tiles = Array.from({ length: height }, () => Array(width).fill(0));

    // NEW: Multi-layer tile storage
    this.layers = {
      background: {
        tiles: Array.from({ length: height }, () => Array(width).fill(0)),
        name: "Background",
        visible: true,
      },
      middleground: {
        tiles: Array.from({ length: height }, () => Array(width).fill(0)),
        name: "Middleground",
        visible: true,
      },
      foreground: {
        tiles: Array.from({ length: height }, () => Array(width).fill(0)),
        name: "Foreground",
        visible: true,
      },
    };

    // Reference to tileset for rendering
    this.tileset = null;

    // Height tracking for infinite vertical
    this.groundLevel = height - 1; // 地面層（最底部）
  }

  /**
   * Normalize tile coordinates for infinite looping
   * @param {number} tileX - Tile X coordinate
   * @param {number} tileY - Tile Y coordinate
   * @returns {Object} { x, y, layerOffset } - Normalized coordinates and layer offset
   */
  normalizeCoords(tileX, tileY) {
    let normalizedX = tileX;
    let normalizedY = tileY;
    let layerOffsetY = 0; // 垂直方向的層數偏移

    // Horizontal wrapping
    if (this.infiniteHorizontal) {
      normalizedX = ((tileX % this.width) + this.width) % this.width;
    }

    // Vertical wrapping with layer tracking
    if (this.infiniteVertical) {
      layerOffsetY = Math.floor(tileY / this.height);
      normalizedY = ((tileY % this.height) + this.height) % this.height;
    }

    return { x: normalizedX, y: normalizedY, layerOffsetY };
  }

  // 設定 tile 為實體
  setSolid(tileX, tileY, solid = true) {
    if (this.isValidTile(tileX, tileY)) {
      this.solids[tileY][tileX] = solid;
    }
  }

  // 檢查 tile 是否實體
  isSolid(tileX, tileY) {
    // In infinite mode, use normalized coordinates
    if (this.infiniteHorizontal || this.infiniteVertical) {
      const normalized = this.normalizeCoords(tileX, tileY);
      return this.solids[normalized.y][normalized.x];
    }

    // Legacy mode: boundary is wall
    if (!this.isValidTile(tileX, tileY)) return true;
    return this.solids[tileY][tileX];
  }

  isValidTile(tileX, tileY) {
    // In infinite mode, all tiles are valid
    if (this.infiniteHorizontal && this.infiniteVertical) return true;
    if (this.infiniteHorizontal && tileY >= 0 && tileY < this.height) return true;
    if (this.infiniteVertical && tileX >= 0 && tileX < this.width) return true;

    // Legacy mode: check boundaries
    return (
      tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height
    );
  }

  // 取得 AABB 範圍內的實體 tiles
  getTilesInAABB(x, y, w, h) {
    const left = Math.floor(x / this.tileSize);
    const right = Math.floor((x + w - 1) / this.tileSize);
    const top = Math.floor(y / this.tileSize);
    // FIXED: Removed -1 to properly detect tiles at exact boundaries
    const bottom = Math.floor((y + h) / this.tileSize);
    const tiles = [];

    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (this.isSolid(tx, ty)) {
          tiles.push({
            x: tx * this.tileSize,
            y: ty * this.tileSize,
            w: this.tileSize,
            h: this.tileSize,
            tileX: tx,
            tileY: ty,
          });
        }
      }
    }
    return tiles;
  }

  // 世界座標轉 tile 座標
  worldToTile(x, y) {
    return {
      x: Math.floor(x / this.tileSize),
      y: Math.floor(y / this.tileSize),
    };
  }

  // Tile 座標轉世界座標
  tileToWorld(tileX, tileY) {
    return {
      x: tileX * this.tileSize,
      y: tileY * this.tileSize,
    };
  }

  // Get tile information including properties
  getTileInfo(tileX, tileY) {
    // Use normalized coordinates for infinite mode
    const normalized = this.normalizeCoords(tileX, tileY);
    const actualX = normalized.x;
    const actualY = normalized.y;

    if (!this.infiniteHorizontal && !this.infiniteVertical) {
      if (!this.isValidTile(tileX, tileY)) return null;
    }

    const tileGID = this.tiles[actualY][actualX];
    if (tileGID === 0) return null;

    // Get tile properties from tileset
    if (this.tileset && this.tileset.tiles[String(tileGID)]) {
      return this.tileset.tiles[String(tileGID)];
    }

    // Fallback: just check if solid
    return {
      solid: this.solids[actualY][actualX],
      oneWay: false,
    };
  }

  /**
   * Get height layer offset for given world Y coordinate
   * Used to track how many "screens" the player has traveled up/down
   */
  getHeightLayer(worldY) {
    const tileY = Math.floor(worldY / this.tileSize);
    return Math.floor(tileY / this.height);
  }

  /**
   * Get relative height from ground level
   * Positive = above ground, Negative = below ground
   */
  getHeightFromGround(worldY) {
    const groundY = this.groundLevel * this.tileSize;
    return groundY - worldY;
  }
}
