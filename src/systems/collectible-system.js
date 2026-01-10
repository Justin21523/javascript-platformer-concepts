// src/systems/collectible-system.js
// Handles pickup of collectibles and feeds the player's ability meter
export class CollectibleSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    if (!this.world.player) return;
    const player = this.world.player;
    const playerTransform = this.world.getComponent(player, "Transform");
    const playerAabb = this.world.getComponent(player, "AABB");
    const meter = this.world.getComponent(player, "AbilityMeter");

    if (!playerTransform || !playerAabb) return;

    const items = this.world.query(["Transform", "AABB", "Collectible"]);
    for (const item of items) {
      const itTransform = this.world.getComponent(item, "Transform");
      const itAabb = this.world.getComponent(item, "AABB");
      const collectible = this.world.getComponent(item, "Collectible");
      if (!itTransform || !itAabb || !collectible) continue;

      const overlap =
        playerTransform.x < itTransform.x + itAabb.w &&
        playerTransform.x + playerAabb.w > itTransform.x &&
        playerTransform.y < itTransform.y + itAabb.h &&
        playerTransform.y + playerAabb.h > itTransform.y;

      if (overlap) {
        this.applyCollectible(collectible, meter);
        if (!collectible.respawns) {
          this.world.destroyEntity(item);
        }
      }
    }
  }

  applyCollectible(collectible, meter) {
    switch (collectible.kind) {
      case "energy":
      default:
        if (!meter) break;
        meter.current = Math.min(meter.max, meter.current + collectible.value);
        meter.ready = meter.current >= meter.max;
        break;
      case "health":
        // heal player health if present
        const health = this.world.getComponent(this.world.player, "Health");
        if (health) {
          health.current = Math.min(health.max, health.current + collectible.value);
        }
        break;
      case "haste":
        this.applyBuff({ speedMultiplier: 1.3, attackSpeedMultiplier: 0.85, duration: 5 });
        break;
      case "fury":
        this.applyBuff({ speedMultiplier: 1.0, attackSpeedMultiplier: 0.7, duration: 4 });
        break;
    }
  }

  applyBuff(buffValues) {
    let buff = this.world.getComponent(this.world.player, "BuffState");
    if (!buff) {
      this.world.addComponent(this.world.player, "BuffState", {});
      buff = this.world.getComponent(this.world.player, "BuffState");
    }
    Object.assign(buff, {
      active: true,
      elapsed: 0,
      speedMultiplier: buffValues.speedMultiplier ?? 1,
      attackSpeedMultiplier: buffValues.attackSpeedMultiplier ?? 1,
      invulnerable: buffValues.invulnerable ?? false,
      duration: buffValues.duration ?? 5,
    });

    if (buff.invulnerable) {
      const health = this.world.getComponent(this.world.player, "Health");
      if (health) health.invulnerable = true;
    }
  }
}
