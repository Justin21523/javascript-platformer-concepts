// src/systems/wave-system.js
// Expands ring hitboxes over time for ripple-style attacks
export class WaveSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const waves = this.world.query(["Wave", "Hitbox", "Transform", "Renderable"]);
    for (const entity of waves) {
      const wave = this.world.getComponent(entity, "Wave");
      const hitbox = this.world.getComponent(entity, "Hitbox");
      const t = this.world.getComponent(entity, "Transform");
      const renderable = this.world.getComponent(entity, "Renderable");
      if (!wave || !hitbox || !t || !renderable) continue;

      wave.radius += wave.growthRate * dt;
      const radius = Math.min(wave.radius, wave.maxRadius);
      hitbox.width = radius * 2;
      hitbox.height = radius * 2;
      hitbox.offsetX = -radius;
      hitbox.offsetY = -radius;
      hitbox.active = true;

      // Visual fade as it grows
      renderable.opacity = Math.max(0, 1 - (wave.radius / wave.maxRadius) * 0.7);
      renderable.color = renderable.color || "rgba(90,230,255,0.85)";

      if (wave.radius >= wave.maxRadius) {
        this.world.destroyEntity(entity);
      }
    }
  }
}
