// src/systems/buff-system.js
// Updates BuffState timers and handles auto-expiration/invuln cleanup
export class BuffSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const entities = this.world.query(["BuffState"]);
    for (const entity of entities) {
      const buff = this.world.getComponent(entity, "BuffState");
      if (!buff || !buff.active) continue;

      buff.elapsed += dt;
      if (buff.elapsed >= buff.duration) {
        buff.active = false;
        buff.elapsed = 0;
        buff.speedMultiplier = 1;
        buff.attackSpeedMultiplier = 1;
        buff.invulnerable = false;

        const health = this.world.getComponent(entity, "Health");
        if (health) {
          health.invulnerable = false;
        }
      } else if (buff.invulnerable) {
        const health = this.world.getComponent(entity, "Health");
        if (health) health.invulnerable = true;
      }
    }
  }
}
