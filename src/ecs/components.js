// src/ecs/components.js

export const Transform = {
  name: "Transform",
  schema: {
    x: 0,
    y: 0,
    z: 0,
  },
};

// Velocity 組件
export const Velocity = {
  name: "Velocity",
  schema: {
    vx: 0,
    vy: 0,
  },
};

// AABB 碰撞盒
export const AABB = {
  name: "AABB",
  schema: {
    w: 16, // 寬度 (px)
    h: 24, // 高度 (px)
    ox: 0, // X 偏移
    oy: 0, // Y 偏移
  },
};

// 碰撞器屬性
export const Collider = {
  name: "Collider",
  schema: {
    solid: true, // 是否阻擋移動
    oneWay: false, // 單向平台 (Stage 9)
    group: "world", // 碰撞群組 (world/enemy/player)
  },
};

// 物理體擴充
export const PhysicsBody = {
  name: "PhysicsBody",
  schema: {
    gravityScale: 1.0, // 重力縮放
    frictionX: 0.8, // 水平摩擦
    maxSpeedX: 300, // 最大水平速度
    maxSpeedY: 800, // 最大垂直速度 (終端速度)
    bounceY: 0, // 垂直彈性 (可選)
  },
};
// 角色狀態
export const CharacterState = {
  name: "CharacterState",
  schema: {
    action: "idle", // idle/run/jump/fall
    facing: 1, // 1=right, -1=left
  },
};

// 渲染組件
export const Renderable = {
  name: "Renderable",
  schema: {
    color: "#FFFFFF",
    image: null,
    originX: 0,
    originY: 0,
    layer: "mid",
  },
};

// 輸入組件
export const Input = {
  name: "Input",
  schema: {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
  },
};

// 更新 bitmask
export const ComponentBits = {
  Transform: 1 << 0,
  Velocity: 1 << 1,
  AABB: 1 << 2,
  PhysicsBody: 1 << 3,
  Collider: 1 << 4,
  CharacterState: 1 << 5,
  Renderable: 1 << 6,
  Input: 1 << 7,
};

export const ALL_COMPONENTS = {
  Transform,
  Velocity,
  AABB,
  PhysicsBody,
  Collider,
  CharacterState,
  Renderable,
  Input,
};

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
  return { left: false, right: false, up: false, down: false, jump: false };
}

export function createRenderable(options = {}) {
  return {
    image: options.image || null,
    originX: options.originX ?? 0,
    originY: options.originY ?? 0,
    layer: options.layer ?? "mid",
    visible: options.visible ?? true,
  };
}
