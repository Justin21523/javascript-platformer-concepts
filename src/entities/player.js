// src/entities/player.js
import {
  COMPONENT_TYPES,
  components,
  createTransform,
  createVelocity,
  createPhysicsBody,
  createCharacterState,
  createInput,
  createRenderable,
} from "../ecs/components.js";
import { PHYSICS, RENDER } from "../config.js";

export function createPlayer(world, x, y) {
  const entityId = world.createEntity();

  // Transform
  world.addComponent(
    entityId,
    COMPONENT_TYPES.TRANSFORM,
    createTransform(x, y, 0)
  );

  // Velocity
  world.addComponent(entityId, COMPONENT_TYPES.VELOCITY, createVelocity(0, 0));

  // PhysicsBody
  world.addComponent(
    entityId,
    COMPONENT_TYPES.PHYSICS_BODY,
    createPhysicsBody({
      gravityScale: 1,
      maxSpeedX: PHYSICS.MAX_RUN_SPEED,
      maxSpeedY: 1000, // 防止無限下墜
    })
  );

  // CharacterState
  world.addComponent(
    entityId,
    COMPONENT_TYPES.CHARACTER_STATE,
    createCharacterState("idle", 1)
  );

  // Input
  world.addComponent(entityId, COMPONENT_TYPES.INPUT, createInput());

  // Renderable (placeholder)
  world.addComponent(
    entityId,
    COMPONENT_TYPES.RENDERABLE,
    createRenderable({
      image: null, // 暫時無圖片
      originX: 8,
      originY: 24,
      layer: "mid",
    })
  );

  return entityId;
}
