// src/ecs/components.js
export const Transform = {
  name: "Transform",
  bit: 1 << 0,
  schema: {
    x: 0,
    y: 0,
    z: 0,
  },
};

// Velocity 組件
export const Velocity = {
  name: "Velocity",
  bit: 1 << 1,
  schema: {
    vx: 0,
    vy: 0,
  },
};

// AABB 碰撞盒
export const AABB = {
  name: "AABB",
  bit: 1 << 2,
  schema: {
    w: 16, // 寬度 (px)
    h: 24, // 高度 (px)
    ox: 0, // X 偏移
    oy: 0, // Y 偏移
  },
};

// 物理體擴充
export const PhysicsBody = {
  name: "PhysicsBody",
  bit: 1 << 3,
  schema: {
    gravityScale: 1.0, // 重力縮放
    frictionX: 0.8, // 水平摩擦
    maxSpeedX: 300, // 最大水平速度
    maxSpeedY: 800, // 最大垂直速度 (終端速度)
    bounceY: 0, // 垂直彈性 (可選)
  },
};

// 碰撞器屬性
export const Collider = {
  name: "Collider",
  bit: 1 << 4,
  schema: {
    solid: true, // 是否阻擋移動
    oneWay: false, // 單向平台 (Stage 9)
    group: "world", // 碰撞群組 (world/enemy/player)
  },
};

// 角色狀態
export const CharacterState = {
  name: "CharacterState",
  bit: 1 << 5,
  schema: {
    action: "idle", // idle/run/jump/fall
    facing: 1, // 1=right, -1=left
  },
};

// 渲染組件
export const Renderable = {
  name: "Renderable",
  bit: 1 << 6,
  schema: {
    color: "#FFFFFF",
    image: null,
    originX: 0,
    originY: 0,
    layer: "mid",
    opacity: 1,
    renderDuringVoid: false,
  },
};

// 輸入組件
export const Input = {
  name: "Input",
  bit: 1 << 7,
  schema: {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    attackHeavy: false,
    attackProjectile: false,
    attackUp: false,
    attackSpin: false,
    attackWave: false,
    attackStar: false,
    block: false,
    ability: false,
    hyperStyleNext: false,
    partyWallpaper: false,
    partyClone: false,
    partyExit: false,
    voidMode: false,
  },
};

// NEW: Camera follow component
export const CameraFollow = {
  name: "CameraFollow",
  bit: 1 << 8,
  schema: {
    deadZoneX: 100,
    deadZoneY: 80,
    smoothing: 0.1,
    priority: 1,
  },
};

// NEW: Sprite component for animated characters
export const Sprite = {
  name: "Sprite",
  bit: 1 << 9,
  schema: {
    currentAnimation: "idle", // Current animation name
    frameIndex: 0, // Current frame index
    frameTime: 0, // Time accumulated for current frame
    frameDuration: 0.1, // Duration per frame (seconds)
    animations: {}, // Animation data: { animName: { frames: [Image...], frameCount: N } }
    flipX: false, // Horizontal flip
    flipY: false, // Vertical flip
    width: 0, // Sprite width
    height: 0, // Sprite height
  },
};

// Health component - entity health and damage tracking
export const Health = {
  name: "Health",
  bit: 1 << 10,
  schema: {
    current: 100,
    max: 100,
    invulnerable: false, // Cannot take damage
  },
};

// Team component - faction for damage filtering
export const Team = {
  name: "Team",
  bit: 1 << 11,
  schema: {
    id: "neutral", // "player", "enemy", "neutral"
  },
};

// Hitbox component - attack collision box
export const Hitbox = {
  name: "Hitbox",
  bit: 1 << 12,
  schema: {
    active: false, // Is hitbox currently active
    damage: 10, // Damage dealt
    knockbackX: 0, // Horizontal knockback
    knockbackY: 0, // Vertical knockback
    hitOnce: false, // Can only hit each entity once per activation
    hitEntities: [], // Entities already hit (if hitOnce is true)
    offsetX: 0, // X offset from entity position
    offsetY: 0, // Y offset from entity position
    width: 32, // Hitbox width
    height: 32, // Hitbox height
    duration: 0, // How long the hitbox stays active (seconds)
    elapsed: 0, // Time elapsed since activation
  },
};

// Hurtbox component - damageable collision box
export const Hurtbox = {
  name: "Hurtbox",
  bit: 1 << 13,
  schema: {
    active: true, // Is hurtbox active (can be disabled during dodge, etc.)
    width: 32, // Hurtbox width
    height: 32, // Hurtbox height
    offsetX: 0, // X offset from entity position
    offsetY: 0, // Y offset from entity position
  },
};

// Attack component - attack state and cooldown
export const Attack = {
  name: "Attack",
  bit: 1 << 14,
  schema: {
    isAttacking: false, // Currently in attack animation
    cooldown: 0, // Time until next attack (seconds)
    cooldownMax: 0.5, // Cooldown duration
    damage: 10, // Attack damage
    range: 40, // Attack range
    knockbackX: 100, // Horizontal knockback
    knockbackY: -50, // Vertical knockback (negative = upward)
    windup: 0.15, // pre-attack time before hitbox activates
    recovery: 0.1, // time after active before returning to idle
    phase: "idle", // idle/windup/active/recovery
    phaseTimer: 0,
    duration: 0.2, // active duration fallback
  },
};

// IFrame component - invulnerability frames after taking damage
export const IFrame = {
  name: "IFrame",
  bit: 1 << 15,
  schema: {
    active: false, // Currently invulnerable
    duration: 0.5, // IFrame duration (seconds)
    elapsed: 0, // Time elapsed
    flashInterval: 0.1, // Flash interval for visual feedback
    flashTimer: 0, // Flash timer
    visible: true, // Current visibility for flashing effect
  },
};

// Temporary buff state (speed/attack/invuln)
export const BuffState = {
  name: "BuffState",
  bit: 1 << 25,
  schema: {
    active: false,
    speedMultiplier: 1,
    attackSpeedMultiplier: 1,
    invulnerable: false,
    duration: 0,
    elapsed: 0,
  },
};

// Ability skill config and runtime
export const AbilitySkill = {
  name: "AbilitySkill",
  bit: 1 << 26,
  schema: {
    active: false,
    duration: 5,
    elapsed: 0,
    speedMultiplier: 1.5,
    attackSpeedMultiplier: 0.7,
    invulnerable: true,
    style: "inferno",
    styleIndex: 0,
    styleToastTimer: 0,
    styleToastLabel: "",
  },
};

// Projectile component
export const Projectile = {
  name: "Projectile",
  bit: 1 << 27,
  schema: {
    lifetime: 3,
    elapsed: 0,
    gravity: 0,
    growRate: 0,
    maxSize: null,
    radialSpeed: null, // if set, use polar expansion
    angularSpeed: 0, // radians per second
    angle: 0, // current angle
    originX: null,
    originY: null,
    bypassCooldown: false,
  },
};

// Visual effect component (auto fades/despawns)
export const Vfx = {
  name: "Vfx",
  bit: 1 << 28,
  schema: {
    lifetime: 0.25,
    elapsed: 0,
    fade: true,
    initial: 0.25,
  },
};

// Expanding wave (ring) component
export const Wave = {
  name: "Wave",
  bit: 1 << 29,
  schema: {
    radius: 10,
    maxRadius: 300,
    growthRate: 900, // units per second
  },
};

// Hyperdrive runtime state
export const Hyperdrive = {
  name: "Hyperdrive",
  bit: 1 << 30,
  schema: {
    active: false,
    duration: 0,
    elapsed: 0,
    speed: 0,
    jumpSpeed: 0,
    obstacleLookahead: 32,
    flameInterval: 0.1,
    ghostInterval: 0.14,
    flameTimer: 0,
    ghostTimer: 0,
    plowInterval: 0.08,
    plowTimer: 0,
    plowDamage: 10,
    plowKnockbackX: 400,
    plowKnockbackY: -60,
    style: "inferno",
    backOffset: 40,
    verticalNudge: 100,
  },
};

// AI state component - tracks current behavior and timers
export const AIState = {
  name: "AIState",
  bit: 1 << 16,
  schema: {
    state: "idle", // idle/patrol/investigate/chase/attack/retreat/stunned
    target: null, // target entity id
    stateTime: 0, // time spent in current state
    lastSeenPos: null, // {x,y} of last known target
    alertLevel: 0, // 0-1 alert meter for detection smoothing
    debugLabel: "", // optional debug text
  },
};

// Perception component - senses for AI
export const Perception = {
  name: "Perception",
  bit: 1 << 17,
  schema: {
    sightRange: 450, // max distance to see targets
    fov: Math.PI * 0.75, // field of view in radians
    peripheralRange: 250, // 360deg detection range
    hearingRange: 280, // radius for noise detection
    loseSightTime: 1.5, // seconds to forget target after line of sight lost
    checkInterval: 0.1, // how often to run perception checks
    checkTimer: 0, // accumulator
  },
};

// Behavior tuning for AI
export const BehaviorProfile = {
  name: "BehaviorProfile",
  bit: 1 << 18,
  schema: {
    behavior: "patrol", // patrol/camper/rusher
    patrolPoints: [], // [{x,y}, ...]
    patrolIndex: 0,
    idleDuration: 1.5,
    chaseRange: 520,
    attackRange: 140,
    retreatHealthPct: 0.15,
    reengageDelay: 2.0,
    jumpGap: true, // allow jumping across gaps
    jumpCooldown: 0.6,
    jumpTimer: 0,
    maxAggroDistance: 700, // do not aggro beyond this world distance
    disengageRange: 700, // drop target when farther than this
  },
};

// Combat tuning shared by player/enemies
export const CombatStats = {
  name: "CombatStats",
  bit: 1 << 19,
  schema: {
    moveSpeed: 360,
    runSpeed: 520,
    attackCooldown: 0.8,
    attackWindup: 0.18,
    attackDuration: 0.2,
    attackRange: 140,
    damage: 14,
    knockbackX: 140,
    knockbackY: -90,
    staggerThreshold: 10,
    staggerDuration: 0.3,
  },
};

// Blocking/guard component
export const Block = {
  name: "Block",
  bit: 1 << 20,
  schema: {
    active: false, // currently blocking
    angle: 140, // degrees of effective block cone
    reduction: 0.6, // percent damage reduced
    cooldown: 1.2, // seconds until next block
    cooldownTimer: 0,
    window: 0.0, // optional timed window
    windowTimer: 0,
  },
};

// Stun/status component
export const Stun = {
  name: "Stun",
  bit: 1 << 21,
  schema: {
    stunned: false,
    duration: 0,
    elapsed: 0,
  },
};

// Collectible item component
export const Collectible = {
  name: "Collectible",
  bit: 1 << 22,
  schema: {
    kind: "energy", // energy/health/haste/fury
    value: 10,
    respawns: false,
  },
};

// Player ability meter component
export const AbilityMeter = {
  name: "AbilityMeter",
  bit: 1 << 23,
  schema: {
    current: 0,
    max: 100,
    chargeRate: 1,
    ready: false,
  },
};

// Movement pattern for simple movers (flyers, vertical sentinels)
export const MovementPattern = {
  name: "MovementPattern",
  bit: 1 << 24,
  schema: {
    type: "horizontal", // horizontal | vertical
    speed: 180,
    range: 240,
    originX: null,
    originY: null,
    direction: 1,
  },
};

// 組件位元遮罩對應表
export const ComponentBits = {
  Transform: Transform.bit,
  Velocity: Velocity.bit,
  AABB: AABB.bit,
  PhysicsBody: PhysicsBody.bit,
  Collider: Collider.bit,
  CharacterState: CharacterState.bit,
  Renderable: Renderable.bit,
  Input: Input.bit,
  CameraFollow: CameraFollow.bit,
  Sprite: Sprite.bit,
  Health: Health.bit,
  Team: Team.bit,
  Hitbox: Hitbox.bit,
  Hurtbox: Hurtbox.bit,
  Attack: Attack.bit,
  IFrame: IFrame.bit,
  AIState: AIState.bit,
  Perception: Perception.bit,
  BehaviorProfile: BehaviorProfile.bit,
  CombatStats: CombatStats.bit,
  Block: Block.bit,
  Stun: Stun.bit,
  BuffState: BuffState.bit,
  AbilitySkill: AbilitySkill.bit,
  Projectile: Projectile.bit,
  Vfx: Vfx.bit,
  Wave: Wave.bit,
  Collectible: Collectible.bit,
  AbilityMeter: AbilityMeter.bit,
  MovementPattern: MovementPattern.bit,
  Hyperdrive: Hyperdrive.bit,
};

// 所有組件的統一導出 (供系統使用)
export const components = {
  Transform,
  Velocity,
  AABB,
  PhysicsBody,
  Collider,
  CharacterState,
  Renderable,
  Input,
  CameraFollow,
  Sprite,
  Health,
  Team,
  Hitbox,
  Hurtbox,
  Attack,
  IFrame,
  AIState,
  Perception,
  BehaviorProfile,
  CombatStats,
  Block,
  Stun,
  BuffState,
  AbilitySkill,
  Projectile,
  Vfx,
  Wave,
  Collectible,
  AbilityMeter,
  MovementPattern,
  Hyperdrive,
};

// 組件名稱到位元的映射
export const COMPONENT_NAMES = Object.keys(components);

// Component factories
export function createTransform(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

export function createVelocity(vx = 0, vy = 0) {
  return { vx, vy };
}

export function createPhysicsBody(options = {}) {
  return {
    gravityScale: options.gravityScale ?? 1,
    maxSpeedX: options.maxSpeedX ?? Infinity,
    maxSpeedY: options.maxSpeedY ?? Infinity,
    frictionX: options.frictionX ?? 0,
    ...options,
  };
}

export function createCharacterState(action = "idle", facing = 1) {
  return { action, facing }; // facing: 1=right, -1=left
}

export function createInput() {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    attackHeavy: false,
    attackProjectile: false,
    attackUp: false,
    attackSpin: false,
    attackWave: false,
    attackStar: false,
    block: false,
    ability: false,
    hyperStyleNext: false,
    partyWallpaper: false,
    partyClone: false,
    partyExit: false,
    voidMode: false,
  };
}

export function createRenderable(options = {}) {
  return {
    image: options.image || null,
    originX: options.originX ?? 0,
    originY: options.originY ?? 0,
    layer: options.layer ?? "mid",
    visible: options.visible ?? true,
    opacity: options.opacity ?? 1,
    renderDuringVoid: options.renderDuringVoid ?? false,
  };
}

// NEW: Camera follow factory
export function createCameraFollow(options = {}) {
  return {
    deadZoneX: options.deadZoneX ?? 100,
    deadZoneY: options.deadZoneY ?? 80,
    smoothing: options.smoothing ?? 0.1,
    priority: options.priority ?? 1,
  };
}

export function createAIState(options = {}) {
  return {
    state: options.state ?? "idle",
    target: options.target ?? null,
    stateTime: options.stateTime ?? 0,
    lastSeenPos: options.lastSeenPos ?? null,
    alertLevel: options.alertLevel ?? 0,
    debugLabel: options.debugLabel ?? "",
  };
}

export function createPerception(options = {}) {
  return {
    sightRange: options.sightRange ?? 450,
    fov: options.fov ?? Math.PI * 0.75,
    peripheralRange: options.peripheralRange ?? 250,
    hearingRange: options.hearingRange ?? 280,
    loseSightTime: options.loseSightTime ?? 1.5,
    checkInterval: options.checkInterval ?? 0.1,
    checkTimer: options.checkTimer ?? 0,
  };
}

export function createBehaviorProfile(options = {}) {
  return {
    behavior: options.behavior ?? "patrol",
    patrolPoints: options.patrolPoints ?? [],
    patrolIndex: options.patrolIndex ?? 0,
    idleDuration: options.idleDuration ?? 1.5,
    chaseRange: options.chaseRange ?? 520,
    attackRange: options.attackRange ?? 140,
    retreatHealthPct: options.retreatHealthPct ?? 0.15,
    reengageDelay: options.reengageDelay ?? 2.0,
    jumpGap: options.jumpGap ?? true,
    jumpCooldown: options.jumpCooldown ?? 0.6,
    jumpTimer: options.jumpTimer ?? 0,
    maxAggroDistance: options.maxAggroDistance ?? 700,
    disengageRange: options.disengageRange ?? 700,
  };
}

export function createCombatStats(options = {}) {
  return {
    moveSpeed: options.moveSpeed ?? 360,
    runSpeed: options.runSpeed ?? 520,
    attackCooldown: options.attackCooldown ?? 0.8,
    attackWindup: options.attackWindup ?? 0.18,
    attackDuration: options.attackDuration ?? 0.2,
    attackRange: options.attackRange ?? 140,
    damage: options.damage ?? 14,
    knockbackX: options.knockbackX ?? 140,
    knockbackY: options.knockbackY ?? -90,
    staggerThreshold: options.staggerThreshold ?? 10,
    staggerDuration: options.staggerDuration ?? 0.3,
  };
}

export function createBlock(options = {}) {
  return {
    active: options.active ?? false,
    angle: options.angle ?? 140,
    reduction: options.reduction ?? 0.6,
    cooldown: options.cooldown ?? 1.2,
    cooldownTimer: options.cooldownTimer ?? 0,
    window: options.window ?? 0,
    windowTimer: options.windowTimer ?? 0,
  };
}

export function createStun(options = {}) {
  return {
    stunned: options.stunned ?? false,
    duration: options.duration ?? 0,
    elapsed: options.elapsed ?? 0,
  };
}

export function createCollectible(options = {}) {
  return {
    kind: options.kind ?? "energy",
    value: options.value ?? 10,
    respawns: options.respawns ?? false,
  };
}

export function createBuffState(options = {}) {
  return {
    active: options.active ?? false,
    speedMultiplier: options.speedMultiplier ?? 1,
    attackSpeedMultiplier: options.attackSpeedMultiplier ?? 1,
    invulnerable: options.invulnerable ?? false,
    duration: options.duration ?? 0,
    elapsed: options.elapsed ?? 0,
  };
}

export function createAbilitySkill(options = {}) {
  return {
    active: options.active ?? false,
    duration: options.duration ?? 5,
    elapsed: options.elapsed ?? 0,
    speedMultiplier: options.speedMultiplier ?? 1.5,
    attackSpeedMultiplier: options.attackSpeedMultiplier ?? 0.7,
    invulnerable: options.invulnerable ?? true,
    style: options.style ?? "inferno",
    styleIndex: options.styleIndex ?? 0,
    styleToastTimer: options.styleToastTimer ?? 0,
    styleToastLabel: options.styleToastLabel ?? "",
  };
}

export function createProjectile(options = {}) {
  return {
    lifetime: options.lifetime ?? 3,
    elapsed: options.elapsed ?? 0,
  };
}

export function createVfx(options = {}) {
  const lifetime = options.lifetime ?? 0.25;
  return {
    lifetime,
    elapsed: options.elapsed ?? 0,
    fade: options.fade ?? true,
    initial: lifetime,
  };
}

export function createWave(options = {}) {
  return {
    radius: options.radius ?? 10,
    maxRadius: options.maxRadius ?? 300,
    growthRate: options.growthRate ?? 900,
  };
}

export function createAbilityMeter(options = {}) {
  return {
    current: options.current ?? 0,
    max: options.max ?? 100,
    chargeRate: options.chargeRate ?? 1,
    ready: options.ready ?? false,
  };
}

export function createMovementPattern(options = {}) {
  return {
    type: options.type ?? "horizontal",
    speed: options.speed ?? 180,
    range: options.range ?? 240,
    originX: options.originX ?? null,
    originY: options.originY ?? null,
    direction: options.direction ?? 1,
  };
}

export function createHyperdrive(options = {}) {
  return {
    active: options.active ?? false,
    duration: options.duration ?? 0,
    elapsed: options.elapsed ?? 0,
    speed: options.speed ?? 0,
    jumpSpeed: options.jumpSpeed ?? 0,
    obstacleLookahead: options.obstacleLookahead ?? 32,
    flameInterval: options.flameInterval ?? 0.1,
    ghostInterval: options.ghostInterval ?? 0.14,
    flameTimer: options.flameTimer ?? 0,
    ghostTimer: options.ghostTimer ?? 0,
    plowInterval: options.plowInterval ?? 0.08,
    plowTimer: options.plowTimer ?? 0,
    plowDamage: options.plowDamage ?? 10,
    plowKnockbackX: options.plowKnockbackX ?? 400,
    plowKnockbackY: options.plowKnockbackY ?? -60,
    style: options.style ?? "inferno",
    backOffset: options.backOffset ?? 40,
    verticalNudge: options.verticalNudge ?? 100,
  };
}
