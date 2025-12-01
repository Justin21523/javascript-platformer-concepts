// src/entities/collectible.js
// Simple collectible factory (energy or health pickup)
export function createCollectible(world, options = {}) {
  const { x = 0, y = 0, kind = "energy", value = 10, color = "#ffd700" } = options;
  const id = world.createEntity();
  world.addComponent(id, "Transform", { x, y, z: 0 });
  world.addComponent(id, "Velocity", { vx: 0, vy: 0 });
  world.addComponent(id, "AABB", { w: 32, h: 32, ox: 0, oy: 0 });
  world.addComponent(id, "Renderable", { color });
  world.addComponent(id, "Collectible", { kind, value });
  world.addComponent(id, "Collider", { solid: false, group: "pickup" });
  world.addComponent(id, "PhysicsBody", {
    gravityScale: 0,
    frictionX: 1,
    maxSpeedX: 0,
    maxSpeedY: 0,
  });
  return id;
}
