// src/config.js

export const PHYSICS = Object.freeze({
  GRAVITY_Y: 2200, // px/s² (increased for faster falling)
  MOVE_ACCEL: 3500, // px/s² (much faster acceleration)
  MOVE_DECEL: 3000, // px/s²
  MAX_RUN_SPEED: 600, // px/s (nearly doubled)
  JUMP_VELOCITY: -800, // px/s (much higher jumps)
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
  TILE_SIZE: 32, // Much smaller tiles (player appears much bigger)
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

export const GOAL = Object.freeze({
  distanceFromSpawn: 2600,
  heightOffset: -60,
});

export const ABILITY = Object.freeze({
  meterMax: 100,
  meterChargeRate: 18, // units per second
});

export const HYPERDRIVE = Object.freeze({
  duration: 4.5,
  speed: 1400,
  jumpSpeed: 1100,
  obstacleLookahead: 42,
  plowInterval: 0.08,
  plowDamage: 14,
  plowKnockbackX: 520,
  plowKnockbackY: -80,
  flameDamage: 16,
  flameKnockbackX: -420,
  flameKnockbackY: -40,
  flameInterval: 0.08,
  ghostInterval: 0.12,
  backOffset: 40,
  verticalNudge: 120,
  styles: {
    inferno: {
      label: "Inferno",
      flameColor: "rgba(255,140,60,0.85)",
      flameSecondary: "rgba(255,90,50,0.45)",
      ghostColor: "rgba(255,255,255,0.65)",
      ghostLifetime: 0.8,
      emberColor: "rgba(255,180,120,0.9)",
      flameSize: { w: 230, h: 170 },
      flameSpeed: -920,
      ghostSpeed: -520,
    },
    shadowSkull: {
      label: "Shadow Skull",
      flameColor: "rgba(20,20,20,0.92)",
      flameSecondary: "rgba(80,80,80,0.4)",
      ghostColor: "rgba(50,50,50,0.55)",
      ghostLifetime: 0.9,
      emberColor: "rgba(140,140,140,0.9)",
      flameSize: { w: 240, h: 180 },
      flameSpeed: -860,
      ghostSpeed: -520,
    },
    voidFlame: {
      label: "Void Flame",
      flameColor: "rgba(110,40,160,0.88)",
      flameSecondary: "rgba(40,10,80,0.45)",
      ghostColor: "rgba(160,120,220,0.6)",
      ghostLifetime: 0.95,
      emberColor: "rgba(220,180,255,0.85)",
      flameSize: { w: 220, h: 170 },
      flameSpeed: -900,
      ghostSpeed: -540,
    },
  },
  styleOrder: ["inferno", "shadowSkull", "voidFlame"],
});

export const CELEBRATION = Object.freeze({
  wallpaperColorA: "rgba(40,10,60,0.85)",
  wallpaperColorB: "rgba(10,10,20,0.9)",
  cloneLifetime: [1.4, 2.4],
  fireworkInterval: 1.1,
  cloneBurst: 3,
  groundWidth: 48,
  groundHeight: 14,
  groundTile: 1,
});
