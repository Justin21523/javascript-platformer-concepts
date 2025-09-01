// src/config.js

export const PHYSICS = Object.freeze({
  GRAVITY_Y: 1800, // px/s²
  MOVE_ACCEL: 1500, // px/s²
  MOVE_DECEL: 2000, // px/s²
  MAX_RUN_SPEED: 180, // px/s
  JUMP_VELOCITY: -520, // px/s (負數 = 向上)
  FRICTION_X: 0.85, // 地面摩擦
});

export const RENDER = Object.freeze({
  TILE_SIZE: 16,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
});

// src/config.js (添加)
export const COLLISION = {
  TILE_SIZE: 16,
  MTV_CLAMP: 8, // 最大修正距離
  EPSILON: 0.1, // 碰撞容忍誤差
  BROADPHASE_BUFFER: 1, // Broadphase 緩衝 tiles
};
