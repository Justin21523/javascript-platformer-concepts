// systems/PhysicsSystem.js
import { ColliderComponent } from "../components/ColliderComponent.js";
import { SpatialHashGrid } from '../utils/SpatialHashGrid.js';

export class PhysicsSystem {
  constructor(time) {
    this.time = time; // 注入時間系統
    this.broadPhase = new SpatialHashGrid(100); // 空間分割優化
  }

  update(entities) {
    const scaledDelta = this.time.scaledTime;
    this.broadPhase.clear();

    // 註冊可碰撞實體（使用時間縮放過濾）
    entities.forEach(entity => {
      const collider = entity.getComponent(ColliderComponent);
      if (collider?.enabled && entity.active) {
        this.broadPhase.insert(entity, collider);
      }
    });

    // 碰撞檢測與反應
    entities.forEach(entity => {
      const collider = entity.getComponent(ColliderComponent);
      if (!collider?.enabled) return;

      // 獲取潛在碰撞對象（空間分割優化）
      const candidates = this.broadPhase.retrieve(entity);

      candidates.forEach(other => {
        if (entity === other) return;

        const otherCollider = other.getComponent(ColliderComponent);
        if (collider.checkCollision(otherCollider)) {
          this.#resolveCollision(entity, other, collider, otherCollider, scaledDelta);
        }
      });
    });
  }

  // 碰撞解析核心方法（時間整合版）
  #resolveCollision(a, b, colliderA, colliderB, delta) {
    // 計算穿透向量
    const penetration = {
      x: Math.min(colliderA.right - colliderB.left, colliderB.right - colliderA.left),
      y: Math.min(colliderA.bottom - colliderB.top, colliderB.bottom - colliderA.top)
    };

    // 確定主穿透軸（基於時間縮放）
    const absPenX = Math.abs(penetration.x);
    const absPenY = Math.abs(penetration.y);
    const minPen = Math.min(absPenX, absPenY);

    // 物理反應
    const physicsA = a.getComponent(PhysicsComponent);
    const physicsB = b.getComponent(PhysicsComponent);

    if (absPenX < absPenY) {
      // X軸碰撞
      if (physicsA) physicsA.velocity.x = 0;
      if (physicsB) physicsB.velocity.x = 0;

      if (penetration.x > 0) {
        a.x -= minPen * 0.5 * delta;
        b.x += minPen * 0.5 * delta;
      } else {
        a.x += minPen * 0.5 * delta;
        b.x -= minPen * 0.5 * delta;
      }
    } else {
      // Y軸碰撞
      if (physicsA) {
        physicsA.velocity.y = 0;
        physicsA.isOnGround = penetration.y > 0;
      }
      if (physicsB) {
        physicsB.velocity.y = 0;
        physicsB.isOnGround = penetration.y < 0;
      }

      if (penetration.y > 0) {
        a.y -= minPen * delta;
        if (physicsA) physicsA.isOnGround = true;
      } else {
        a.y += minPen * 0.5 * delta;
        b.y -= minPen * 0.5 * delta;
      }
    }

    // 觸發事件（使用實際時間非縮放時間）
    a.onCollision?.(b, this.time.deltaTime);
    b.onCollision?.(a, this.time.deltaTime);
  }

}
