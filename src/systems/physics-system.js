// src/systems/physics-system.js
import { PHYSICS } from "../config.js";
import { clamp, sign } from "../core/math.js";

export class PhysicsSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    // 處理所有具有物理組件的實體
    const entities = this.world.query(["Transform", "Velocity", "PhysicsBody"]);

    for (const entityId of entities) {
      this.updatePhysics(entityId, dt);
    }
  }

  updatePhysics(entityId, dt) {
    const transform = this.world.getComponent(entityId, "Transform");
    const velocity = this.world.getComponent(entityId, "Velocity");
    const physics = this.world.getComponent(entityId, "PhysicsBody");
    const input = this.world.getComponent(entityId, "Input");
    const characterState = this.world.getComponent(entityId, "CharacterState");
    const buff = this.world.getComponent(entityId, "BuffState");
    const speedMult = buff && buff.active ? buff.speedMultiplier : 1;

    // 重力
    velocity.vy += PHYSICS.GRAVITY_Y * physics.gravityScale * dt;

    // 水平移動 (如果有輸入組件)
    if (input) {
      let targetVx = 0;

      if (input.left) {
        targetVx = -PHYSICS.MAX_RUN_SPEED;
        if (characterState) characterState.facing = -1;
      } else if (input.right) {
        targetVx = PHYSICS.MAX_RUN_SPEED;
        if (characterState) characterState.facing = 1;
      }
      targetVx *= speedMult;

      // 檢查是否在地面上
      const isOnGround = this.world.collisionFlags?.onGround.get(entityId);

      // 空中控制：在空中時也能移動，使用相同的加速度
      const accel = targetVx === 0 ? PHYSICS.MOVE_DECEL : PHYSICS.MOVE_ACCEL;
      const diff = targetVx - velocity.vx;
      const change = sign(diff) * Math.min(Math.abs(diff), accel * dt);
      velocity.vx += change;

      // 跳躍 - 移除地面檢查以啟用無限跳躍 (debug模式)
      if (input.jump) {
        velocity.vy = PHYSICS.JUMP_VELOCITY * speedMult;
      }
    }

    // 速度限制
    velocity.vx = clamp(velocity.vx, -physics.maxSpeedX, physics.maxSpeedX);
    velocity.vy = clamp(velocity.vy, -physics.maxSpeedY, physics.maxSpeedY);

    // 更新角色動作狀態
    if (characterState) {
      this.updateCharacterState(characterState, velocity, entityId);
    }
  }

  updateCharacterState(state, velocity, entityId) {
    const isOnGround = this.world.collisionFlags?.onGround.get(entityId);
    const isMoving = Math.abs(velocity.vx) > 10;

    if (isOnGround) {
      state.action = isMoving ? "run" : "idle";
    } else {
      state.action = velocity.vy < 0 ? "jump" : "fall";
    }
  }
}
