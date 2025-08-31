// src/ecs/components.js

// Component bit masks
export const COMPONENT_TYPES = {
  TRANSFORM: 1 << 0,
  VELOCITY: 1 << 1,
  PHYSICS_BODY: 1 << 2,
  CHARACTER_STATE: 1 << 3,
  INPUT: 1 << 4,
  RENDERABLE: 1 << 5,
};

// Component storage (sparse arrays keyed by entity ID)
export const components = {
  Transform: {},
  Velocity: {},
  PhysicsBody: {},
  CharacterState: {},
  Input: {},
  Renderable: {},
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
