// src/systems/projectile-system.js
// Updates projectiles (linear movement, lifetime cleanup)
export class ProjectileSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const projectiles = this.world.query(["Transform", "Velocity", "Projectile"]);
    for (const entity of projectiles) {
      const t = this.world.getComponent(entity, "Transform");
      const v = this.world.getComponent(entity, "Velocity");
      const proj = this.world.getComponent(entity, "Projectile");
      const aabb = this.world.getComponent(entity, "AABB");
      const hitbox = this.world.getComponent(entity, "Hitbox");
      const renderable = this.world.getComponent(entity, "Renderable");
      if (!t || !v || !proj) continue;

      if (proj.radialSpeed !== null) {
        // Polar/spiral motion
        if (proj.originX === null) proj.originX = t.x;
        if (proj.originY === null) proj.originY = t.y;
        proj.angle += proj.angularSpeed * dt;
        const radius = proj.radialSpeed * proj.elapsed;
        const halfW = (aabb?.w || 0) * 0.5;
        const halfH = (aabb?.h || 0) * 0.5;
        t.x = proj.originX + Math.cos(proj.angle) * radius - halfW;
        t.y = proj.originY + Math.sin(proj.angle) * radius - halfH;
      } else {
        if (proj.gravity) {
          v.vy += proj.gravity * dt;
        }
        t.x += v.vx * dt;
        t.y += v.vy * dt;
      }

      proj.elapsed += dt;

      if (proj.growRate && aabb) {
        const dw = proj.growRate * dt;
        const dh = proj.growRate * dt;
        aabb.w += dw;
        aabb.h += dh;
        if (proj.maxSize) {
          aabb.w = Math.min(aabb.w, proj.maxSize);
          aabb.h = Math.min(aabb.h, proj.maxSize);
        }
        if (hitbox) {
          hitbox.width = aabb.w;
          hitbox.height = aabb.h;
          hitbox.offsetX = 0;
          hitbox.offsetY = 0;
        }
      }

      if (renderable && proj.maxSize) {
        const sizeRatio = Math.min(1, Math.max(aabb?.w || 0, aabb?.h || 0) / proj.maxSize);
        renderable.opacity = Math.max(0, 1 - sizeRatio * 0.7);
      }

      if (proj.elapsed >= proj.lifetime) {
        this.world.destroyEntity(entity);
      }
    }
  }
}
