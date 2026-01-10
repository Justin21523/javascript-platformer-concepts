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
    behavior: { attackRange: 140, chaseRange: 640, idleDuration: 0.5, dashAttack: true, dashSpeed: 780, sideBurst: true },
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
    behavior: {
      attackRange: 240,
      chaseRange: 0,
      beamAttack: true,
      beamColor: "rgba(180,140,255,0.8)",
      beamWidth: 260,
      beamHeight: 60,
      beamDuration: 0.45,
      beamSpeed: 900,
      beamCharge: 0.35,
    }, // rely on proximity via pattern
    combat: { attackRange: 240, attackCooldown: 1.4, damage: 12 },
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

export function createShieldBearer(world, opts = {}) {
  return createBasicEnemy(world, {
    color: "#ffaa33",
    physics: { gravityScale: 1, frictionX: 0.9, maxSpeedX: 320, maxSpeedY: 1400 },
    behavior: { attackRange: 90, chaseRange: 420, idleDuration: 0.4, shielded: true },
    combat: { attackRange: 90, attackCooldown: 1.1, damage: 16, knockbackX: 200, knockbackY: -120 },
    block: { active: true, angle: 170, reduction: 0.7, cooldown: 0.8 },
    ...opts,
  });
}

export function createBombThrower(world, opts = {}) {
  return createBasicEnemy(world, {
    color: "#ff88aa",
    physics: { gravityScale: 1, frictionX: 0.8, maxSpeedX: 280, maxSpeedY: 1400 },
    behavior: {
      attackRange: 520,
      chaseRange: 0,
      idleDuration: 0.6,
      rangedProfile: {
        damage: 12,
        projectile: { speed: 520, lifetime: 1.2, width: 18, height: 18, gravity: 980, color: "#ffbb66" },
      },
    },
    combat: { attackRange: 520, attackCooldown: 1.4, damage: 12 },
    ...opts,
  });
}

export function createSupportMage(world, opts = {}) {
  return createBasicEnemy(world, {
    color: "#88ddff",
    physics: { gravityScale: 0, frictionX: 0.9, maxSpeedX: 200, maxSpeedY: 400 },
    behavior: { behavior: "idle", attackRange: 0, chaseRange: 0, supportHeal: true, supportCooldown: 2.5, supportAmount: 10 },
    combat: { damage: 0 },
    ...opts,
  });
}

export function createBossBrute(world, opts = {}) {
  return createBasicEnemy(world, {
    color: "#ff4444",
    health: 240,
    physics: { gravityScale: 1, frictionX: 0.9, maxSpeedX: 420, maxSpeedY: 1400 },
    behavior: {
      attackRange: 180,
      chaseRange: 720,
      idleDuration: 0.3,
      dashAttack: true,
      dashSpeed: 980,
      sideBurst: true,
      beamAttack: true,
      beamColor: "rgba(255,160,120,0.8)",
      beamWidth: 340,
      beamHeight: 80,
      beamDuration: 0.5,
      beamSpeed: 1100,
      beamCharge: 0.4,
      phase2Threshold: 120,
      rage: true,
    },
    combat: { attackRange: 180, attackCooldown: 0.8, damage: 24, knockbackX: 220, knockbackY: -140 },
    ...opts,
  });
}
