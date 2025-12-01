// src/entities/projectile.js
export function createProjectile(world, options = {}) {
  const {
    x = 0,
    y = 0,
    vx = 300,
    vy = 0,
    lifetime = 3,
    width = 20,
    height = 10,
    damage = 12,
    team = "enemy",
    color = "#ffaa00",
    gravity = 0,
    growRate = 0,
    maxSize = null,
    radialSpeed = null,
    angularSpeed = 0,
    angle = 0,
    originX = x,
    originY = y,
    knockbackX = 120,
    knockbackY = -60,
  } = options;

  const id = world.createEntity();
  world.addComponent(id, "Transform", { x, y, z: 0 });
  world.addComponent(id, "Velocity", { vx, vy });
  world.addComponent(id, "AABB", { w: width, h: height, ox: 0, oy: 0 });
  world.addComponent(id, "Renderable", { color });
  world.addComponent(id, "Projectile", {
    lifetime,
    gravity,
    growRate,
    maxSize,
    radialSpeed,
    angularSpeed,
    angle,
    originX,
    originY,
  });
  world.addComponent(id, "Team", { id: team });
  world.addComponent(id, "Hitbox", {
    active: true,
    damage,
    knockbackX,
    knockbackY,
    hitOnce: true,
    hitEntities: [],
    offsetX: 0,
    offsetY: 0,
    width,
    height,
    duration: lifetime,
    elapsed: 0,
  });
  // No hurtbox for projectile (one-way damage)
  return id;
}
