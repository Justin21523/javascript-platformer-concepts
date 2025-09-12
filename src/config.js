// src/config.js

export const PHYSICS = Object.freeze({
  GRAVITY_Y: 1800, // px/s²
  MOVE_ACCEL: 1500, // px/s²
  MOVE_DECEL: 2000, // px/s²
  MAX_RUN_SPEED: 180, // px/s
  JUMP_VELOCITY: -520, // px/s (negative = upward)
  FRICTION_X: 0.85, // ground friction
  COYOTE_TIME: 0.08,
  JUMP_BUFFER: 0.08,
});

export const RENDER = Object.freeze({
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  BACKGROUND_COLOR: "#222222",
  TILE_COLOR: "#666666",
  PLAYER_COLOR: "#FFFFFF",
});

export const COLLISION = {
  TILE_SIZE: 16,
  MTV_CLAMP: 8, // maximum correction distance
  EPSILON: 0.1, // collision tolerance error
  BROADPHASE_BUFFER: 1, // broadphase buffer tiles
};

// NEW: Camera configuration
export const CAMERA = Object.freeze({
  DEAD_ZONE_X: 100, // horizontal dead zone
  DEAD_ZONE_Y: 80, // vertical dead zone
  SMOOTHING: 0.1, // camera smoothing (0=instant, 1=no movement)
  CLAMP_MARGIN: 50, // margin from world edges
});
