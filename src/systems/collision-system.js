// src/systems/collision-system.js
import { aabbOverlap } from "../core/math.js";
import { COLLISION } from "../config.js";

export class CollisionSystem {
  constructor(world, tileMap) {
    this.world = world;
    this.tileMap = tileMap;
    // 碰撞旗標儲存
    this.flags = {
      onGround: new Map(),
      hitWall: new Map(),
      hitCeil: new Map(),
    };
  }

  update(dt) {
    // 清除上一幀旗標
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

    // X 軸碰撞解算 (先處理水平移動)
    const nextX = transform.x + velocity.vx * dt;
    if (this.checkXCollision(entity, nextX, transform.y, aabb, velocity)) {
      this.flags.hitWall.set(entity, true);
    } else {
      transform.x = nextX;
    }

    // Y 軸碰撞解算 (再處理垂直移動)
    const nextY = transform.y + velocity.vy * dt;
    if (this.checkYCollision(entity, transform.x, nextY, aabb, velocity)) {
      // 判斷碰撞方向
      if (velocity.vy > 0) {
        // 向下碰撞 = 落地
        this.flags.onGround.set(entity, true);
      } else {
        // 向上碰撞 = 撞天花板
        this.flags.hitCeil.set(entity, true);
      }
    } else {
      transform.y = nextY;
      // 沒有 Y 軸碰撞表示不在地面
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
        // 計算最小平移向量 (MTV) 進行位置修正
        const transform = this.world.getComponent(entity, "Transform");
        const entityCenterX = x + aabb.ox + aabb.w / 2;
        const tileCenterX = tile.x + tile.w / 2;

        if (entityCenterX < tileCenterX) {
          // 撞到右牆，推回左邊
          transform.x = tile.x - aabb.w - aabb.ox - COLLISION.EPSILON;
        } else {
          // 撞到左牆，推回右邊
          transform.x = tile.x + tile.w - aabb.ox + COLLISION.EPSILON;
        }

        // 停止水平速度
        velocity.vx = 0;
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
        // 計算 MTV 進行位置修正
        const transform = this.world.getComponent(entity, "Transform");
        const entityCenterY = y + aabb.oy + aabb.h / 2;
        const tileCenterY = tile.y + tile.h / 2;

        if (entityCenterY < tileCenterY) {
          // 撞到地面，推到上方
          transform.y = tile.y - aabb.h - aabb.oy - COLLISION.EPSILON;
        } else {
          // 撞到天花板，推到下方
          transform.y = tile.y + tile.h - aabb.oy + COLLISION.EPSILON;
        }

        // 停止垂直速度
        velocity.vy = 0;
        return true;
      }
    }
    return false;
  }

  // 旗標查詢 API
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
