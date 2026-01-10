// src/systems/movement-pattern-system.js
// Drives simple oscillating movement for flyers/sentinels without player input.
export class MovementPatternSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const entities = this.world.query(["Transform", "MovementPattern", "Velocity"]);

    for (const entity of entities) {
      const pattern = this.world.getComponent(entity, "MovementPattern");
      const transform = this.world.getComponent(entity, "Transform");
      const velocity = this.world.getComponent(entity, "Velocity");
      const characterState = this.world.getComponent(entity, "CharacterState");

      if (pattern.originX === null) pattern.originX = transform.x;
      if (pattern.originY === null) pattern.originY = transform.y;

      if (pattern.type === "horizontal") {
        const left = pattern.originX - pattern.range * 0.5;
        const right = pattern.originX + pattern.range * 0.5;
        if (transform.x <= left) pattern.direction = 1;
        if (transform.x >= right) pattern.direction = -1;
        velocity.vx = pattern.speed * pattern.direction;
        if (characterState) characterState.facing = pattern.direction;
      } else if (pattern.type === "vertical") {
        const top = pattern.originY - pattern.range * 0.5;
        const bottom = pattern.originY + pattern.range * 0.5;
        if (transform.y <= top) pattern.direction = 1;
        if (transform.y >= bottom) pattern.direction = -1;
        velocity.vy = pattern.speed * pattern.direction;
      }
    }
  }
}
