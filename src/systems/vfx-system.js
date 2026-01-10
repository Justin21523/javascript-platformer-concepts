// src/systems/vfx-system.js
// Handles fading and cleanup for visual effect entities
export class VfxSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const vfxEntities = this.world.query(["Vfx", "Renderable"]);
    for (const entity of vfxEntities) {
      const vfx = this.world.getComponent(entity, "Vfx");
      const renderable = this.world.getComponent(entity, "Renderable");
      if (!vfx || !renderable) continue;

      vfx.elapsed += dt;
      if (vfx.fade && vfx.initial > 0) {
        const remaining = Math.max(0, vfx.lifetime - vfx.elapsed);
        renderable.opacity = Math.max(0, remaining / vfx.initial);
      }

      if (vfx.elapsed >= vfx.lifetime) {
        this.world.destroyEntity(entity);
      }
    }
  }
}
