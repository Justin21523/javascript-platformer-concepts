// src/systems/character-system.js
import { PHYSICS } from "../config.js";
import { COMPONENT_TYPES, components } from "../ecs/components.js";

export class CharacterSystem {
  update(dt) {
    // 查詢玩家角色 (有Input的實體)
    const entities = this.world.query(
      COMPONENT_TYPES.INPUT,
      COMPONENT_TYPES.VELOCITY,
      COMPONENT_TYPES.CHARACTER_STATE,
      COMPONENT_TYPES.PHYSICS_BODY
    );

    for (const entityId of entities) {
      const input = components.Input[entityId];
      const velocity = components.Velocity[entityId];
      const state = components.CharacterState[entityId];
      const body = components.PhysicsBody[entityId];

      // 水平移動處理
      let targetVx = 0;
      if (input.left) targetVx = -PHYSICS.MAX_RUN_SPEED;
      if (input.right) targetVx = PHYSICS.MAX_RUN_SPEED;

      // 加速/減速
      const accel = targetVx !== 0 ? PHYSICS.MOVE_ACCEL : PHYSICS.MOVE_DECEL;
      velocity.vx = this.approach(velocity.vx, targetVx, accel, dt);

      // 跳躍 (簡單版，後續會加 onGround 檢查)
      if (input.jump && Math.abs(velocity.vy) < 10) {
        velocity.vy = PHYSICS.JUMP_VELOCITY;
      }

      // 更新朝向
      if (velocity.vx > 10) state.facing = 1;
      else if (velocity.vx < -10) state.facing = -1;

      // 更新動作狀態
      if (Math.abs(velocity.vy) > 10) {
        state.action = velocity.vy < 0 ? "jump" : "fall";
      } else if (Math.abs(velocity.vx) > 10) {
        state.action = "run";
      } else {
        state.action = "idle";
      }
    }
  }

  approach(current, target, accel, dt) {
    const diff = target - current;
    const maxChange = accel * dt;

    if (Math.abs(diff) <= maxChange) {
      return target;
    }

    return current + Math.sign(diff) * maxChange;
  }
}
