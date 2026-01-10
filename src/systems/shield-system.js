// src/systems/shield-system.js
// Activates block windows from player input, with simple cooldown and VFX.
export class ShieldSystem {
  constructor(world) {
    this.world = world;
    this.activeShields = new Set();
  }

  update(dt) {
    if (!this.world.player) return;
    const player = this.world.player;
    const input = this.world.getComponent(player, "Input");
    const block = this.world.getComponent(player, "Block");
    if (!input || !block) return;

    // Cooldown tick handled in DamageSystem.updateBlockCooldowns
    if (input.block && block.cooldownTimer <= 0 && !block.active) {
      block.active = true;
      block.windowTimer = block.window > 0 ? block.window : 0.6;
      block.cooldownTimer = block.cooldown;
      this.spawnShieldVfx(player, block.windowTimer);
    }

    if (block.active) {
      block.windowTimer -= dt;
      if (block.windowTimer <= 0) {
        block.active = false;
      }
    }
  }

  spawnShieldVfx(player, duration) {
    const t = this.world.getComponent(player, "Transform");
    const aabb = this.world.getComponent(player, "AABB");
    if (!t || !aabb) return;
    const id = this.world.createEntity();
    this.world.addComponent(id, "Transform", { x: t.x - 20, y: t.y - 20, z: 0 });
    this.world.addComponent(id, "AABB", { w: aabb.w + 40, h: aabb.h + 40, ox: 0, oy: 0 });
    this.world.addComponent(id, "Renderable", { color: "rgba(80,160,255,0.45)", opacity: 0.9 });
    this.world.addComponent(id, "Vfx", { lifetime: duration, fade: true, initial: duration });
  }
}
