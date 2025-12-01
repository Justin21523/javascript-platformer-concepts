// src/systems/damage-system.js
/**
 * DamageSystem - Processes damage, knockback, and invulnerability frames
 * - Applies damage from hit events
 * - Applies knockback to velocity
 * - Activates invulnerability frames (IFrame)
 * - Handles IFrame timing and flash effect
 * - Manages attack cooldowns
 */
import { createProjectile } from "../entities/projectile.js";

export class DamageSystem {
  constructor(world, hitboxSystem) {
    this.world = world;
    this.hitboxSystem = hitboxSystem;
    this.emitSfx = (type, detail = {}) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sfx", { detail: { type, ...detail } }));
      }
    };
  }

  update(dt) {
    if (this.world.voidMode?.active) return;
    // Process hit events from HitboxSystem
    const hitEvents = this.hitboxSystem.getHitEvents();

    for (const event of hitEvents) {
      this.applyDamage(event);
    }

    // Update invulnerability frames
    this.updateIFrames(dt);

    // Update attack cooldowns
    this.updateAttackCooldowns(dt);

    // Update block cooldowns
    this.updateBlockCooldowns(dt);

    // Update attack phases (windup/active/recovery)
    this.updateAttackPhases(dt);
  }

  /**
   * Apply damage and knockback from a hit event
   */
  applyDamage(event) {
    const { victim, damage, knockbackX, knockbackY } = event;

    const block = this.world.getComponent(victim, "Block");
    const characterState = this.world.getComponent(victim, "CharacterState");
    const victimTransform = this.world.getComponent(victim, "Transform");
    const attackerTransform = this.world.getComponent(event.attacker, "Transform");

    let finalDamage = damage;
    let blocked = false;

    if (block && block.cooldownTimer <= 0 && block.active && victimTransform && attackerTransform) {
      const facingDir = characterState ? characterState.facing : 1;
      const fx = facingDir;
      const fy = 0;
      const dx = attackerTransform.x - victimTransform.x;
      const dy = attackerTransform.y - victimTransform.y;
      const len = Math.hypot(dx, dy) || 1;
      const dot = (dx / len) * fx + (dy / len) * fy;
      const angleToAttacker = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;

      if (angleToAttacker <= block.angle * 0.5) {
        blocked = true;
        block.cooldownTimer = block.cooldown;
        finalDamage = Math.max(0, damage * (1 - block.reduction));
        this.emitSfx("block", { victim, attacker: event.attacker });
      }
    }

    // Apply damage
    const health = this.world.getComponent(victim, "Health");
    if (health) {
      health.current -= finalDamage;

      // Clamp health to 0
      if (health.current < 0) {
        health.current = 0;
      }

      console.log(`Entity ${victim} took ${damage} damage, HP: ${health.current}/${health.max}`);
      this.emitSfx("hit", { victim, attacker: event.attacker, blocked, damage: finalDamage });
    }

    // Apply knockback
    const velocity = this.world.getComponent(victim, "Velocity");
    if (velocity && (knockbackX !== 0 || knockbackY !== 0)) {
      if (victimTransform && attackerTransform) {
        // Wave-type radial knockback
        const isWave = this.world.hasComponent && this.world.hasComponent(event.attacker, "Wave");
        if (isWave) {
          const dx = victimTransform.x - attackerTransform.x;
          const dy = victimTransform.y - attackerTransform.y;
          const len = Math.hypot(dx, dy) || 1;
          const dirX = dx / len;
          const dirY = dy / len;
          const mag = knockbackX * (blocked ? 0.3 : 1);
          velocity.vx = dirX * mag;
          velocity.vy = dirY * (mag * 0.6) + knockbackY * 0.2;
        } else {
          // Calculate direction: victim is left or right of attacker
          const direction = victimTransform.x < attackerTransform.x ? -1 : 1;
          velocity.vx = knockbackX * direction * (blocked ? 0.35 : 1);
          velocity.vy = knockbackY * (blocked ? 0.5 : 1);
        }
      }
    }

    // Activate invulnerability frames
    const iframe = this.world.getComponent(victim, "IFrame");
    if (iframe) {
      this.activateIFrame(victim);
    }

    // Apply stun if damage passes threshold
    const stun = this.world.getComponent(victim, "Stun");
    const stats = this.world.getComponent(victim, "CombatStats");
    const threshold = stats?.staggerThreshold ?? null;
    if (stun && threshold !== null && finalDamage >= threshold && health && health.current > 0) {
      stun.stunned = true;
      stun.duration = stats?.staggerDuration ?? 0.25;
      stun.elapsed = 0;
    }

    // Handle death flags
    if (health && health.current <= 0) {
      const cs = this.world.getComponent(victim, "CharacterState");
      if (cs) {
        cs.action = "dead";
      }
      const hurtbox = this.world.getComponent(victim, "Hurtbox");
      if (hurtbox) hurtbox.active = false;
      const collider = this.world.getComponent(victim, "Collider");
      if (collider) collider.solid = false;
      this.emitSfx("death", { entity: victim });
    }
  }

  /**
   * Activate invulnerability frames for an entity
   */
  activateIFrame(entity) {
    const iframe = this.world.getComponent(entity, "IFrame");
    if (!iframe) return;

    iframe.active = true;
    iframe.elapsed = 0;
    iframe.flashTimer = 0;
    iframe.visible = true;

    // Set invulnerable flag on health
    const health = this.world.getComponent(entity, "Health");
    if (health) {
      health.invulnerable = true;
    }
  }

  /**
   * Update invulnerability frames for all entities
   */
  updateIFrames(dt) {
    const entities = this.world.query(["IFrame"]);

    for (const entity of entities) {
      const iframe = this.world.getComponent(entity, "IFrame");

      if (!iframe.active) continue;

      // Update elapsed time
      iframe.elapsed += dt;

      // Check if IFrame duration has expired
      if (iframe.elapsed >= iframe.duration) {
        iframe.active = false;
        iframe.visible = true; // Ensure entity is visible when IFrame ends

        // Remove invulnerable flag
        const health = this.world.getComponent(entity, "Health");
        if (health) {
          health.invulnerable = false;
        }

        continue;
      }

      // Update flash effect
      iframe.flashTimer += dt;
      if (iframe.flashTimer >= iframe.flashInterval) {
        iframe.flashTimer = 0;
        iframe.visible = !iframe.visible; // Toggle visibility
      }
    }
  }

  /**
   * Update attack cooldowns for all entities
   */
  updateAttackCooldowns(dt) {
    const entities = this.world.query(["Attack"]);

    for (const entity of entities) {
      const attack = this.world.getComponent(entity, "Attack");

      if (attack.cooldown > 0) {
        attack.cooldown -= dt;

        if (attack.cooldown < 0) {
          attack.cooldown = 0;
        }
      }
    }
  }

  /**
   * Update block cooldown timers
   */
  updateBlockCooldowns(dt) {
    const entities = this.world.query(["Block"]);
    for (const entity of entities) {
      const block = this.world.getComponent(entity, "Block");
      if (!block) continue;
      if (block.cooldownTimer > 0) {
        block.cooldownTimer = Math.max(0, block.cooldownTimer - dt);
      }
      if (block.windowTimer > 0) {
        block.windowTimer = Math.max(0, block.windowTimer - dt);
      }
    }
  }

  /**
   * Check if entity can attack (cooldown is ready)
   */
  canAttack(entity) {
    const attack = this.world.getComponent(entity, "Attack");
    if (!attack) return false;

    return attack.cooldown <= 0 && !attack.isAttacking;
  }

  /**
   * Trigger an attack for an entity
   */
  triggerAttack(entity) {
    const attack = this.world.getComponent(entity, "Attack");
    if (!attack || !this.canAttack(entity)) return false;

    // Sync attack parameters from combat stats when present
    const stats = this.world.getComponent(entity, "CombatStats");
    if (stats) {
      attack.cooldownMax = stats.attackCooldown ?? attack.cooldownMax;
      attack.damage = stats.damage ?? attack.damage;
      attack.knockbackX = stats.knockbackX ?? attack.knockbackX;
      attack.knockbackY = stats.knockbackY ?? attack.knockbackY;
      attack.range = stats.attackRange ?? attack.range;
      attack.windup = stats.attackWindup ?? attack.windup;
      attack.duration = stats.attackDuration ?? attack.duration;
    }

    const buff = this.world.getComponent(entity, "BuffState");
    const ability = this.world.getComponent(entity, "AbilitySkill");
    const attackSpeedMult =
      (buff && buff.active ? buff.attackSpeedMultiplier : 1) *
      (ability && ability.active ? ability.attackSpeedMultiplier : 1);

    // Set attack state
    attack.isAttacking = true;
    attack.phase = "windup";
    attack.phaseTimer = attack.windup * attackSpeedMult;
    attack.cooldown = attack.cooldownMax * attackSpeedMult;

    // Hitbox will activate during phase update
    const hitbox = this.world.getComponent(entity, "Hitbox");
    if (hitbox) {
      hitbox.damage = attack.damage;
      hitbox.knockbackX = attack.knockbackX;
      hitbox.knockbackY = attack.knockbackY;
    }

    console.log(`Entity ${entity} attacked!`);
    return true;
  }

  /**
   * Trigger attack using a profile (supports projectile type)
   */
  triggerAttackWithProfile(entity, profile) {
    const attack = this.world.getComponent(entity, "Attack");
    const hitbox = this.world.getComponent(entity, "Hitbox");
    if (!attack) return false;

    if (profile.type === "projectile") {
      return this.fireProjectile(entity, profile);
    }

    attack.damage = profile.damage ?? attack.damage;
    attack.knockbackX = profile.knockbackX ?? attack.knockbackX;
    attack.knockbackY = profile.knockbackY ?? attack.knockbackY;
    attack.cooldownMax = profile.cooldown ?? attack.cooldownMax;
    attack.windup = profile.windup ?? attack.windup;
    attack.duration = profile.duration ?? attack.duration;
    attack.recovery = profile.recovery ?? attack.recovery;

    if (hitbox) {
      hitbox.offsetX = profile.hitbox?.offsetX ?? hitbox.offsetX;
      hitbox.offsetY = profile.hitbox?.offsetY ?? hitbox.offsetY;
      hitbox.width = profile.hitbox?.width ?? hitbox.width;
      hitbox.height = profile.hitbox?.height ?? hitbox.height;
      hitbox.hitOnce = profile.hitbox?.hitOnce ?? true;
    }

    return this.triggerAttack(entity);
  }

  /**
   * Fire a projectile attack (no melee hitbox)
   */
  fireProjectile(entity, profile) {
    const attack = this.world.getComponent(entity, "Attack");
    const bypass = profile.projectile?.bypassCooldown || profile.bypassCooldown;
    if (!attack) return false;
    if (!bypass && !this.canAttack(entity)) return false;

    const transform = this.world.getComponent(entity, "Transform");
    const characterState = this.world.getComponent(entity, "CharacterState");
    const team = this.world.getComponent(entity, "Team");
    if (!transform) return false;

    const facing = characterState ? characterState.facing : 1;
    const speed = profile.projectile?.speed ?? 500;
    const aabb = this.world.getComponent(entity, "AABB");
    const centerX = aabb ? transform.x + aabb.w * 0.5 : transform.x;
    const centerY = aabb ? transform.y + aabb.h * 0.5 : transform.y;
    const useRadial = profile.projectile?.radialSpeed !== undefined && profile.projectile?.radialSpeed !== null;
    const spawnX = useRadial ? centerX : transform.x + (profile.projectile?.offsetX ?? 40) * facing;
    const spawnY = useRadial ? centerY : transform.y + (profile.projectile?.offsetY ?? 40);
    const vxOverride = profile.projectile?.vx;
    const vyOverride = profile.projectile?.vy;
    const radialSpeed = profile.projectile?.radialSpeed ?? null;
    const angularSpeed = profile.projectile?.angularSpeed ?? 0;
    const angle = profile.projectile?.angle ?? 0;
    const originX = profile.projectile?.originX ?? spawnX;
    const originY = profile.projectile?.originY ?? spawnY;
    const knockbackX = profile.knockbackX ?? attack.knockbackX;
    const knockbackY = profile.knockbackY ?? attack.knockbackY;

    createProjectile(this.world, {
      x: spawnX,
      y: spawnY,
      vx: vxOverride !== undefined ? vxOverride : speed * facing,
      vy: vyOverride !== undefined ? vyOverride : profile.projectile?.vy ?? 0,
      damage: profile.damage ?? attack.damage,
      lifetime: profile.projectile?.lifetime ?? 2.5,
      width: profile.projectile?.width ?? 20,
      height: profile.projectile?.height ?? 10,
      color: profile.projectile?.color ?? "#ffaa00",
      team: team ? team.id : "enemy",
      gravity: profile.projectile?.gravity ?? 0,
      growRate: profile.projectile?.growRate ?? 0,
      maxSize: profile.projectile?.maxSize ?? null,
      radialSpeed,
      angularSpeed,
      angle,
      originX,
      originY,
      knockbackX,
      knockbackY,
    });

    attack.cooldown = profile.cooldown ?? attack.cooldownMax;
    attack.isAttacking = false;
    attack.phase = "idle";
    attack.phaseTimer = 0;
    attack.cooldownMax = profile.cooldown ?? attack.cooldownMax;
    if (bypass) {
      attack.cooldown = 0;
    }
    return true;
  }

  updateAttackPhases(dt) {
    const attackers = this.world.query(["Attack"]);
    for (const entity of attackers) {
      const attack = this.world.getComponent(entity, "Attack");
      if (!attack || !attack.isAttacking) continue;

      const buff = this.world.getComponent(entity, "BuffState");
      const ability = this.world.getComponent(entity, "AbilitySkill");
      const speedMult =
        (buff && buff.active ? buff.attackSpeedMultiplier : 1) *
        (ability && ability.active ? ability.attackSpeedMultiplier : 1);

      attack.phaseTimer -= dt;

      if (attack.phase === "windup" && attack.phaseTimer <= 0) {
        // Activate hitbox
        const hitbox = this.world.getComponent(entity, "Hitbox");
        if (hitbox) {
          hitbox.damage = attack.damage;
          hitbox.knockbackX = attack.knockbackX;
          hitbox.knockbackY = attack.knockbackY;
          this.hitboxSystem.activateHitbox(entity, (attack.duration || hitbox.duration || 0.2) * speedMult);
        }
        attack.phase = "active";
        attack.phaseTimer = (attack.duration || 0.2) * speedMult;
      } else if (attack.phase === "active" && attack.phaseTimer <= 0) {
        this.hitboxSystem.deactivateHitbox(entity);
        attack.phase = "recovery";
        attack.phaseTimer = (attack.recovery || 0.1) * speedMult;
      } else if (attack.phase === "recovery" && attack.phaseTimer <= 0) {
        attack.isAttacking = false;
        attack.phase = "idle";
        attack.phaseTimer = 0;
      }
    }
  }
}
