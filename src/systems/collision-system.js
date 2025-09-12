// src/systems/collision-system.js
import { debugLog, debugAssert } from "../debug.js";
import { aabbOverlap } from "../core/math.js";
import { COLLISION } from "../config.js";

export class CollisionSystem {
  constructor(world, tileMap) {
    this.world = world;
    this.tileMap = tileMap;
    // Collision flag storage
    this.flags = {
      onGround: new Map(),
      hitWall: new Map(),
      hitCeil: new Map(),
    };

    // Expose flags to world for other systems
    world.collisionFlags = this.flags;
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

    // Detailed component checks
    if (!transform) {
      debugLog("collision", `Entity ${entity} missing Transform component`);
      return;
    }
    if (!velocity) {
      debugLog("collision", `Entity ${entity} missing Velocity component`);
      return;
    }
    if (!aabb) {
      debugLog("collision", `Entity ${entity} missing AABB component`);
      return;
    }

    // Validate numerical sanity
    debugAssert(
      Number.isFinite(transform.x),
      `Invalid transform.x for entity ${entity}`
    );
    debugAssert(
      Number.isFinite(transform.y),
      `Invalid transform.y for entity ${entity}`
    );
    debugAssert(
      Number.isFinite(velocity.vx),
      `Invalid velocity.vx for entity ${entity}`
    );
    debugAssert(
      Number.isFinite(velocity.vy),
      `Invalid velocity.vy for entity ${entity}`
    );

    // X-axis collision resolution (handle horizontal movement first)
    const nextX = transform.x + velocity.vx * dt;
    if (this.checkXCollision(entity, nextX, transform.y, aabb)) {
      this.flags.hitWall.set(entity, true);
      velocity.vx = 0; // stop horizontal velocity
    } else {
      transform.x = nextX;
    }

    // Y-axis collision resolution (then handle vertical movement)
    const nextY = transform.y + velocity.vy * dt;
    if (this.checkYCollision(entity, transform.x, nextY, aabb)) {
      // Determine collision direction
      if (velocity.vy > 0) {
        // Downward collision = landing
        this.flags.onGround.set(entity, true);
      } else {
        // Upward collision = hit ceiling
        this.flags.hitCeil.set(entity, true);
      }
      velocity.vy = 0; // stop vertical velocity
    } else {
      transform.y = nextY;
      // No Y-axis collision means not on ground
      this.flags.onGround.set(entity, false);
    }
  }

  checkXCollision(entity, x, y, aabb) {
    const tiles = this.tileMap.getTilesInAABB(
      x + aabb.ox,
      y + aabb.oy,
      aabb.w,
      aabb.h
    );

    for (const tile of tiles) {
      if (
        aabbOverlap(
          x + aabb.ox,
          y + aabb.oy,
          aabb.w,
          aabb.h,
          tile.x,
          tile.y,
          tile.w,
          tile.h
        )
      ) {
        // Calculate minimum translation vector (MTV) for position correction
        const transform = this.world.getComponent(entity, "Transform");
        const entityCenterX = x + aabb.ox + aabb.w / 2;
        const tileCenterX = tile.x + tile.w / 2;

        if (entityCenterX < tileCenterX) {
          // Hit right wall, push back left
          transform.x = tile.x - aabb.w - aabb.ox - COLLISION.EPSILON;
        } else {
          // Hit left wall, push back right
          transform.x = tile.x + tile.w - aabb.ox + COLLISION.EPSILON;
        }

        return true;
      }
    }
    return false;
  }

  checkYCollision(entity, x, y, aabb) {
    const tiles = this.tileMap.getTilesInAABB(
      x + aabb.ox,
      y + aabb.oy,
      aabb.w,
      aabb.h
    );

    for (const tile of tiles) {
      if (
        aabbOverlap(
          x + aabb.ox,
          y + aabb.oy,
          aabb.w,
          aabb.h,
          tile.x,
          tile.y,
          tile.w,
          tile.h
        )
      ) {
        // Calculate MTV for position correction
        const transform = this.world.getComponent(entity, "Transform");
        const entityCenterY = y + aabb.oy + aabb.h / 2;
        const tileCenterY = tile.y + tile.h / 2;

        if (entityCenterY < tileCenterY) {
          // Hit ground, push to top
          transform.y = tile.y - aabb.h - aabb.oy - COLLISION.EPSILON;
        } else {
          // Hit ceiling, push to bottom
          transform.y = tile.y + tile.h - aabb.oy + COLLISION.EPSILON;
        }

        return true;
      }
    }
    return false;
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
