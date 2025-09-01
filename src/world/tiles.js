// src/world/tiles.js
import { COLLISION } from "../config.js";

export class TileMap {
  constructor(width, height, tileSize = COLLISION.TILE_SIZE) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.solids = Array.from({ length: height }, () =>
      Array(width).fill(false)
    );
  }

  // 設定 tile 為實體
  setSolid(tileX, tileY, solid = true) {
    if (this.isValidTile(tileX, tileY)) {
      this.solids[tileY][tileX] = solid;
    }
  }

  // 檢查 tile 是否實體
  isSolid(tileX, tileY) {
    if (!this.isValidTile(tileX, tileY)) return true; // 邊界視為牆
    return this.solids[tileY][tileX];
  }

  isValidTile(tileX, tileY) {
    return (
      tileX >= 0 && tileX < this.width && tileY >= 0 && tileY < this.height
    );
  }

  // 取得 AABB 範圍內的實體 tiles
  getTilesInAABB(x, y, w, h) {
    const left = Math.floor(x / this.tileSize);
    const right = Math.floor((x + w - 1) / this.tileSize);
    const top = Math.floor(y / this.tileSize);
    const bottom = Math.floor((y + h - 1) / this.tileSize);

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
}
