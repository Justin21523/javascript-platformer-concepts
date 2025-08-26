// utils/SpatialHashGrid.js
import { ColliderComponent } from "../components/ColliderComponent.js";

export class SpatialHashGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  insert(entity, collider) {
    const keys = this.#getCellKeys(collider);
    keys.forEach(key => {
      if (!this.grid.has(key)) this.grid.set(key, new Set());
      this.grid.get(key).add(entity);
    });
    entity._gridKeys = keys; // 快取用於清除
  }

  retrieve(entity) {
    const collider = entity.getComponent(ColliderComponent);
    if (!collider) return new Set();

    const candidates = new Set();
    this.#getCellKeys(collider).forEach(key => {
      const cell = this.grid.get(key);
      if (cell) cell.forEach(e => candidates.add(e));
    });
    return candidates;
  }

  clear() {
    this.grid.clear();
  }

  #getCellKeys(collider) {
    const minX = Math.floor(collider.left / this.cellSize);
    const maxX = Math.floor(collider.right / this.cellSize);
    const minY = Math.floor(collider.top / this.cellSize);
    const maxY = Math.floor(collider.bottom / this.cellSize);

    const keys = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        keys.push(`${x},${y}`);
      }
    }
    return keys;
  }
}
