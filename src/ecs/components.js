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
