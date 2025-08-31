// src/systems/physics-system.js
import { PHYSICS } from "../config.js";
import { COMPONENT_TYPES, components } from "../ecs/components.js";

export class PhysicsSystem {
  update(dt) {
    // 查詢有 Transform + Velocity + PhysicsBody 的實體
    const entities = this.world.query(
      COMPONENT_TYPES.TRANSFORM,
      COMPONENT_TYPES.VELOCITY,
      COMPONENT_TYPES.PHYSICS_BODY
    );

    for (const entityId of entities) {
      const transform = components.Transform[entityId];
      const velocity = components.Velocity[entityId];
      const body = components.PhysicsBody[entityId];

      // 重力
      velocity.vy += PHYSICS.GRAVITY_Y * body.gravityScale * dt;

      // 速度限制
      velocity.vx = Math.max(
        -body.maxSpeedX,
        Math.min(body.maxSpeedX, velocity.vx)
      );
      velocity.vy = Math.max(
        -body.maxSpeedY,
        Math.min(body.maxSpeedY, velocity.vy)
      );

      // 半隱式歐拉積分: v += a*dt; x += v*dt
      transform.x += velocity.vx * dt;
      transform.y += velocity.vy * dt;
    }
  }

  // 工具方法：逼近目標速度
  approach(current, target, accel, dt) {
    const diff = target - current;
    const maxChange = accel * dt;

    if (Math.abs(diff) <= maxChange) {
      return target;
    }

    return current + Math.sign(diff) * maxChange;
  }
}
