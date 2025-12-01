// src/entities/enemy-variants.js
import { createBasicEnemy } from "./enemy-basic.js";

export function createGroundPatrol(world, opts = {}) {
  return createBasicEnemy(world, {
    color: "#ff5555",
    patrolPoints: opts.patrolPoints || [
      { x: opts.x - 60 || 0, y: opts.y || 0 },
      { x: opts.x + 60 || 0, y: opts.y || 0 },
    ],
    ...opts,
  });
}

export function createFlyingCharger(world, opts = {}) {
  return createBasicEnemy(world, {
    color: "#4fd1ff",
    physics: { gravityScale: 0, frictionX: 0.1, maxSpeedX: 500, maxSpeedY: 500 },
    movementPattern: {
      type: "horizontal",
      speed: opts.speed || 220,
      range: opts.range || 360,
    },
    behavior: { attackRange: 140, chaseRange: 640, idleDuration: 0.5 },
    combat: { attackRange: 140, attackCooldown: 0.7, damage: 12 },
    attack: {
      windup: 0.12,
      duration: 0.18,
      recovery: 0.12,
    },
    ...opts,
  });
}

export function createVerticalSentinel(world, opts = {}) {
  return createBasicEnemy(world, {
    color: "#b88cff",
    physics: { gravityScale: 0, frictionX: 1, maxSpeedX: 0, maxSpeedY: 300 },
    movementPattern: {
      type: "vertical",
      speed: opts.speed || 160,
      range: opts.range || 200,
    },
    behavior: { attackRange: 120, chaseRange: 0 }, // rely on proximity via pattern
    combat: { attackRange: 120, attackCooldown: 1.0, damage: 10 },
    ...opts,
  });
}

export function createFriendlyNpc(world, opts = {}) {
  return createBasicEnemy(world, {
    color: "#66dd66",
    team: "neutral",
    behavior: { behavior: "idle", attackRange: 0, chaseRange: 0 },
    combat: { damage: 0 },
    ...opts,
  });
}
