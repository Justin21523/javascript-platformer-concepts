// src/entities/enemy-basic.js
// Simple melee enemy factory with AI + combat components

export function createBasicEnemy(world, options = {}) {
  const {
    x = 0,
    y = 0,
    patrolPoints = [],
    color = "#ff0000",
    facing = -1,
    health = 50,
    perception = {},
    behavior = {},
    combat = {},
    movementPattern = null,
    team = "enemy",
  } = options;

  const enemy = world.createEntity();

  world.addComponent(enemy, "Transform", { x, y, z: 0 });
  world.addComponent(enemy, "Velocity", { vx: 0, vy: 0 });
  world.addComponent(enemy, "AABB", { w: 80, h: 120, ox: 0, oy: 0 });
  world.addComponent(enemy, "Collider", { solid: true, group: team });
  world.addComponent(enemy, "PhysicsBody", {
    gravityScale: options.physics?.gravityScale ?? 1,
    frictionX: options.physics?.frictionX ?? 0.8,
    maxSpeedX: options.physics?.maxSpeedX ?? 400,
    maxSpeedY: options.physics?.maxSpeedY ?? 1600,
  });
  world.addComponent(enemy, "CharacterState", { action: "idle", facing });
  world.addComponent(enemy, "Renderable", { color });
  world.addComponent(enemy, "Input", {});

  world.addComponent(enemy, "Health", {
    current: health,
    max: health,
    invulnerable: false,
  });

  world.addComponent(enemy, "Team", { id: team });

  world.addComponent(enemy, "Hurtbox", {
    active: true,
    width: 70,
    height: 100,
    offsetX: 5,
    offsetY: 10,
  });

  world.addComponent(enemy, "IFrame", {
    active: false,
    duration: 0.5,
    elapsed: 0,
    flashInterval: 0.1,
    flashTimer: 0,
    visible: true,
  });

  if (team !== "neutral") {
    world.addComponent(enemy, "Attack", {
      isAttacking: false,
      cooldown: 0,
      cooldownMax: 0.9,
      damage: 14,
      range: 110,
      knockbackX: 160,
      knockbackY: -90,
    });

    world.addComponent(enemy, "Hitbox", {
      active: false,
      damage: 14,
      knockbackX: 160,
      knockbackY: -90,
      hitOnce: true,
      hitEntities: [],
      offsetX: 50,
      offsetY: 30,
      width: 60,
      height: 80,
      duration: 0.18,
      elapsed: 0,
    });
  }

  world.addComponent(enemy, "AIState", {
    state: "idle",
    target: null,
    stateTime: 0,
    alertLevel: 0,
  });

  world.addComponent(enemy, "Perception", {
    sightRange: 520,
    peripheralRange: 260,
    hearingRange: 220,
    fov: Math.PI * 0.7,
    loseSightTime: 1.5,
    ...perception,
  });

  world.addComponent(enemy, "BehaviorProfile", {
    behavior: "patrol",
    patrolPoints,
    attackRange: 110,
    chaseRange: 560,
    idleDuration: 1.0,
    jumpGap: true,
    jumpCooldown: 0.6,
    ...behavior,
  });

  world.addComponent(enemy, "CombatStats", {
    moveSpeed: 320,
    runSpeed: 420,
    attackCooldown: 0.9,
    attackWindup: 0.2,
    attackDuration: 0.18,
    attackRange: 110,
    damage: 14,
    knockbackX: 160,
    knockbackY: -90,
    staggerThreshold: 8,
    staggerDuration: 0.25,
    ...combat,
  });

  world.addComponent(enemy, "Block", {
    active: false,
    angle: 150,
    reduction: 0.5,
    cooldown: 1.2,
  });

  world.addComponent(enemy, "Stun", {
    stunned: false,
    duration: 0,
    elapsed: 0,
  });

  if (movementPattern) {
    world.addComponent(enemy, "MovementPattern", movementPattern);
  }

  if (options.attack) {
    const attackComp = world.getComponent(enemy, "Attack");
    if (attackComp) {
      Object.assign(attackComp, options.attack);
    }
  }

  return enemy;
}
