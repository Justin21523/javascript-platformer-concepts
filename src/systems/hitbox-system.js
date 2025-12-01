// src/systems/hitbox-system.js
/**
 * HitboxSystem - Handles attack hitbox collision detection
 * - Detects hitbox vs hurtbox collisions
 * - Filters by team (no friendly fire)
 * - Respects invulnerability frames
 * - Manages hitbox duration and lifetime
 */

export class HitboxSystem {
  constructor(world) {
    this.world = world;
    this.hitEvents = []; // Store hit events for this frame
  }

  update(dt) {
    this.hitEvents = [];

    // Get all entities with active hitboxes
    const attackers = this.world.query(["Transform", "Hitbox", "Team"]);

    // Get all entities with active hurtboxes
    const victims = this.world.query(["Transform", "Hurtbox", "Health", "Team"]);

    // Update hitbox timers and check collisions
    for (const attacker of attackers) {
      const hitbox = this.world.getComponent(attacker, "Hitbox");
      const attackerTransform = this.world.getComponent(attacker, "Transform");
      const attackerTeam = this.world.getComponent(attacker, "Team");

      // Skip inactive hitboxes
      if (!hitbox.active) continue;

      // Update hitbox duration
      hitbox.elapsed += dt;
      if (hitbox.elapsed >= hitbox.duration) {
        // Deactivate hitbox when duration expires
        this.deactivateHitbox(attacker);
        continue;
      }

      // Calculate hitbox world position (adjust for facing direction)
      const characterState = this.world.getComponent(attacker, "CharacterState");
      const facing = characterState ? characterState.facing : 1;

      // Flip hitbox offset horizontally based on facing direction
      const offsetX = facing === -1 ? -hitbox.offsetX - hitbox.width : hitbox.offsetX;

      const hitboxLeft = attackerTransform.x + offsetX;
      const hitboxTop = attackerTransform.y + hitbox.offsetY;
      const hitboxRight = hitboxLeft + hitbox.width;
      const hitboxBottom = hitboxTop + hitbox.height;

      // Check collision with all potential victims
      for (const victim of victims) {
        // Skip self-collision
        if (attacker === victim) continue;

        const victimTeam = this.world.getComponent(victim, "Team");
        const victimHealth = this.world.getComponent(victim, "Health");
        const hurtbox = this.world.getComponent(victim, "Hurtbox");
        const victimTransform = this.world.getComponent(victim, "Transform");

        // Skip if victim is on same team (no friendly fire)
        if (attackerTeam.id === victimTeam.id) continue;

        // Skip if hurtbox is inactive
        if (!hurtbox.active) continue;

        // Skip if victim is invulnerable
        if (victimHealth.invulnerable) continue;

        // Skip if already hit this victim (for hitOnce mode)
        if (hitbox.hitOnce && hitbox.hitEntities.includes(victim)) continue;

        // Check if victim has IFrame active
        const iframe = this.world.getComponent(victim, "IFrame");
        if (iframe && iframe.active) continue;

        // Calculate hurtbox world position
        const hurtboxLeft = victimTransform.x + hurtbox.offsetX;
        const hurtboxTop = victimTransform.y + hurtbox.offsetY;
        const hurtboxRight = hurtboxLeft + hurtbox.width;
        const hurtboxBottom = hurtboxTop + hurtbox.height;

        // AABB collision detection
        const collision = !(
          hitboxRight < hurtboxLeft ||
          hitboxLeft > hurtboxRight ||
          hitboxBottom < hurtboxTop ||
          hitboxTop > hurtboxBottom
        );

        if (collision) {
          // Record hit event
          this.hitEvents.push({
            attacker,
            victim,
            damage: hitbox.damage,
            knockbackX: hitbox.knockbackX,
            knockbackY: hitbox.knockbackY,
            hitboxCenter: {
              x: hitboxLeft + hitbox.width / 2,
              y: hitboxTop + hitbox.height / 2,
            },
          });

          // Mark victim as hit if hitOnce is enabled
          if (hitbox.hitOnce) {
            hitbox.hitEntities.push(victim);
          }
        }
      }
    }
  }

  /**
   * Activate a hitbox
   */
  activateHitbox(entity, duration = 0.2) {
    const hitbox = this.world.getComponent(entity, "Hitbox");
    if (!hitbox) return;

    hitbox.active = true;
    hitbox.elapsed = 0;
    hitbox.duration = duration;
    hitbox.hitEntities = [];
  }

  /**
   * Deactivate a hitbox
   */
  deactivateHitbox(entity) {
    const hitbox = this.world.getComponent(entity, "Hitbox");
    if (!hitbox) return;

    hitbox.active = false;
    hitbox.elapsed = 0;
    hitbox.hitEntities = [];
  }

  /**
   * Get all hit events from this frame
   */
  getHitEvents() {
    return this.hitEvents;
  }
}
