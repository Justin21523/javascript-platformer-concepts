// src/systems/collision-system.js
import { debugLog } from "../debug.js";
import { COLLISION } from "../config.js";

export class CollisionSystem {
  constructor(world, tileMapOrWorld) {
    this.world = world;
    // Support both old TileMap and new InfiniteWorld
    this.tileMap = tileMapOrWorld;
    this.infiniteWorld = tileMapOrWorld.groundMap ? tileMapOrWorld : null;

    // Collision flag storage
    this.flags = {
      onGround: new Map(),
      hitWall: new Map(),
      hitCeil: new Map(),
    };

    // Expose flags to world for other systems
    world.collisionFlags = this.flags;
  }

  /**
   * Get tile size (compatible with both old and new system)
   */
  getTileSize() {
    if (this.infiniteWorld) {
      return this.infiniteWorld.tileSize;
    }
    return this.tileMap.tileSize;
  }

  /**
   * Check if position has solid tile (compatible with both systems)
   */
  isSolidAt(x, y) {
    if (this.infiniteWorld) {
      return this.infiniteWorld.isSolid(x, y);
    }
    const tileX = Math.floor(x / this.tileMap.tileSize);
    const tileY = Math.floor(y / this.tileMap.tileSize);
    return this.tileMap.isSolid(tileX, tileY);
  }

  /**
   * Get tile info at position (compatible with both systems)
   */
  getTileInfoAt(x, y) {
    if (this.infiniteWorld) {
      return this.infiniteWorld.getTileInfo(x, y);
    }
    const tileX = Math.floor(x / this.tileMap.tileSize);
    const tileY = Math.floor(y / this.tileMap.tileSize);
    return this.tileMap.getTileInfo(tileX, tileY);
  }

  update(dt) {
    // Clear previous frame flags
    this.flags.onGround.clear();
    this.flags.hitWall.clear();
    this.flags.hitCeil.clear();

    const entities = this.world.query([
      "Transform",
      "Velocity",
      "AABB",
      "Collider",
    ]);

    for (const entity of entities) {
      this.resolveCollisions(entity, dt);
    }
  }

  resolveCollisions(entity, dt) {
    const transform = this.world.getComponent(entity, "Transform");
    const velocity = this.world.getComponent(entity, "Velocity");
    const aabb = this.world.getComponent(entity, "AABB");
    const collider = this.world.getComponent(entity, "Collider");

    if (!transform || !velocity || !aabb) return;

    const tileSize = this.getTileSize();
    const oldX = transform.x;
    const oldY = transform.y;

    // --- X-axis movement and collision ---
    if (velocity.vx !== 0) {
      const moveX = velocity.vx * dt;
      transform.x += moveX;

      // Check collision at new X position (check middle vertical section only, excluding feet)
      // Sample 3 points along the moving edge
      const marginTop = 10; // Avoid checking head
      const marginBottom = 10; // Avoid checking feet
      const checkPoints = [];

      for (let i = 0; i < 3; i++) {
        const y = transform.y + marginTop + ((aabb.h - marginTop - marginBottom) * i / 2);
        const x = velocity.vx > 0 ? transform.x + aabb.w - 1 : transform.x;
        checkPoints.push({ x, y });
      }

      let hasCollision = false;
      for (const pt of checkPoints) {
        if (this.isSolidAt(pt.x, pt.y)) {
          hasCollision = true;
          break;
        }
      }

      if (hasCollision) {
        // Revert X movement
        transform.x = oldX;
        velocity.vx = 0;
        this.flags.hitWall.set(entity, true);
      }
    }

    // --- Y-axis movement and collision ---
    if (velocity.vy !== 0) {
      const moveY = velocity.vy * dt;
      transform.y += moveY;

      // Check collision with different logic for one-way platforms
      const collisionResult = this.checkYCollisionWithOneWay(
        transform.x,
        transform.y,
        aabb,
        velocity.vy,
        collider
      );

      if (collisionResult.hasCollision) {
        // Hit floor or ceiling
        transform.y = collisionResult.correctedY;
        velocity.vy = 0;

        if (moveY > 0) {
          // Moving down - hit ground
          this.flags.onGround.set(entity, true);
        } else {
          // Moving up - hit ceiling
          this.flags.hitCeil.set(entity, true);
        }
      } else {
        // Safe to move
        this.flags.onGround.set(entity, false);
      }
    } else {
      // Not moving vertically - check if still on ground
      const checkY = transform.y + 1; // Check 1px below
      const checkResult = this.checkYCollisionWithOneWay(
        transform.x,
        checkY,
        aabb,
        1,
        collider
      );
      if (checkResult.hasCollision) {
        this.flags.onGround.set(entity, true);
      } else {
        this.flags.onGround.set(entity, false);
      }
    }
  }

  /**
   * Check horizontal collision (only left/right sides)
   * @param {number} x - New X position to check
   * @param {number} y - Current Y position
   * @param {Object} aabb - AABB dimensions
   * @param {number} velocityX - Horizontal velocity
   * @returns {boolean} True if collision detected
   */
  checkHorizontalCollision(x, y, aabb, velocityX) {
    const tileSize = this.getTileSize();

    // Sample points along the left or right edge only (not top/bottom)
    // Add small margin to avoid corner checks
    const margin = 2;
    const points = [];

    if (velocityX > 0) {
      // Moving right - check right edge
      const rightX = x + aabb.w - 1;
      // Sample 5 points along right edge from top to bottom (avoiding corners)
      for (let i = 0; i < 5; i++) {
        const testY = y + margin + (aabb.h - margin * 2) * (i / 4);
        points.push({ x: rightX, y: testY });
      }
    } else if (velocityX < 0) {
      // Moving left - check left edge
      const leftX = x;
      // Sample 5 points along left edge from top to bottom (avoiding corners)
      for (let i = 0; i < 5; i++) {
        const testY = y + margin + (aabb.h - margin * 2) * (i / 4);
        points.push({ x: leftX, y: testY });
      }
    }

    // Check if any point hits a solid tile
    for (const point of points) {
      if (this.isSolidAt(point.x, point.y)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if AABB at given position collides with any solid tiles
   */
  hasCollisionAt(x, y, aabb) {
    const tileSize = this.getTileSize();

    // Sample multiple points around the AABB
    const points = [
      { x: x, y: y },                          // Top-left
      { x: x + aabb.w - 1, y: y },             // Top-right
      { x: x, y: y + aabb.h - 1 },             // Bottom-left
      { x: x + aabb.w - 1, y: y + aabb.h - 1 },// Bottom-right
      { x: x + aabb.w / 2, y: y },             // Top-center
      { x: x + aabb.w / 2, y: y + aabb.h - 1 },// Bottom-center
    ];

    for (const point of points) {
      if (this.isSolidAt(point.x, point.y)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check Y-axis collision with one-way platform support
   * @returns {Object} { hasCollision: boolean, correctedY: number }
   */
  checkYCollisionWithOneWay(x, y, aabb, velocityY, collider) {
    const tileSize = this.getTileSize();

    // Only check bottom or top edge based on movement direction
    let hasCollision = false;
    let correctedY = y;

    if (velocityY > 0) {
      // Moving down - check bottom edge only
      const bottomY = y + aabb.h;
      const checkTileY = Math.floor(bottomY / tileSize);

      // Check horizontal span
      const leftTileX = Math.floor((x + 2) / tileSize); // Small margin
      const rightTileX = Math.floor((x + aabb.w - 3) / tileSize);

      for (let tx = leftTileX; tx <= rightTileX; tx++) {
        const worldX = tx * tileSize;
        const worldY = checkTileY * tileSize;
        const tileInfo = this.getTileInfoAt(worldX, worldY);

        if (!tileInfo || !tileInfo.solid) continue;

        // Check one-way platform
        if (tileInfo.oneWay) {
          // Only collide if coming from above
          const platformTop = checkTileY * tileSize;
          if (bottomY <= platformTop + tileSize * 0.5) {
            correctedY = platformTop - aabb.h - 0.5;
            hasCollision = true;
            break;
          }
        } else {
          // Regular solid tile - always collide when moving down
          correctedY = checkTileY * tileSize - aabb.h - 0.5;
          hasCollision = true;
          break;
        }
      }
    } else if (velocityY < 0) {
      // Moving up - check top edge only
      const topY = y;
      const checkTileY = Math.floor(topY / tileSize);

      // Check horizontal span
      const leftTileX = Math.floor((x + 2) / tileSize);
      const rightTileX = Math.floor((x + aabb.w - 3) / tileSize);

      for (let tx = leftTileX; tx <= rightTileX; tx++) {
        const worldX = tx * tileSize;
        const worldY = checkTileY * tileSize;
        const tileInfo = this.getTileInfoAt(worldX, worldY);

        if (!tileInfo || !tileInfo.solid) continue;

        // All solid tiles (including one-way platforms) block upward movement
        correctedY = (checkTileY + 1) * tileSize + 0.5;
        hasCollision = true;
        break;
      }
    }

    return { hasCollision, correctedY };
  }

  // Flag query API
  isOnGround(entity) {
    return this.flags.onGround.get(entity) || false;
  }
  hasHitWall(entity) {
    return this.flags.hitWall.get(entity) || false;
  }
  hasHitCeil(entity) {
    return this.flags.hitCeil.get(entity) || false;
  }
}
