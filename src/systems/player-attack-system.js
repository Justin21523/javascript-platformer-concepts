// src/systems/player-attack-system.js
/**
 * PlayerAttackSystem - Handles player attack input
 * - Monitors attack button press (J key)
 * - Triggers attack through DamageSystem
 * - Respects attack cooldown
 */

export class PlayerAttackSystem {
  constructor(world, damageSystem) {
    this.world = world;
    this.damageSystem = damageSystem;
    this.lastAttackState = new Map(); // Track last attack input state per entity

    // Define multiple attack profiles
    this.attackProfiles = {
      light: {
        type: "melee",
        damage: 18,
        knockbackX: 140,
        knockbackY: -60,
        cooldown: 0.1,
        windup: 0.03,
        duration: 0.05,
        recovery: 0.04,
        hitbox: { offsetX: 60, offsetY: 30, width: 70, height: 90, hitOnce: true },
        vfxColor: "rgba(255,220,120,0.45)",
        vfxLifetime: 0.12,
      },
      heavy: {
        type: "melee",
        damage: 35,
        knockbackX: 260,
        knockbackY: -140,
        cooldown: 0.12,
        windup: 0.05,
        duration: 0.06,
        recovery: 0.06,
        hitbox: { offsetX: 70, offsetY: 20, width: 90, height: 120, hitOnce: true },
        vfxColor: "rgba(255,120,120,0.5)",
        vfxLifetime: 0.15,
      },
      projectile: {
        type: "projectile",
        damage: 14,
        cooldown: 0.1,
        projectile: { speed: 620, offsetX: 60, offsetY: 60, lifetime: 2.5, width: 24, height: 12, color: "#ff8844" },
      },
      upward: {
        type: "melee",
        damage: 22,
        knockbackX: 80,
        knockbackY: -220,
        cooldown: 0.1,
        windup: 0.04,
        duration: 0.06,
        recovery: 0.05,
        hitbox: { offsetX: 10, offsetY: -40, width: 80, height: 140, hitOnce: true },
        vfxColor: "rgba(180,220,255,0.5)",
        vfxLifetime: 0.14,
      },
      spin: {
        type: "melee",
        damage: 16,
        knockbackX: 120,
        knockbackY: -80,
        cooldown: 0.1,
        windup: 0.04,
        duration: 0.08,
        recovery: 0.06,
        hitbox: { offsetX: -30, offsetY: -20, width: 140, height: 140, hitOnce: false },
        vfxColor: "rgba(150,255,200,0.35)",
        vfxLifetime: 0.12,
      },
      wave: {
        type: "wave",
        damage: 12,
        knockbackX: 450,
        knockbackY: -150,
        cooldown: 0.1,
        wave: { maxRadius: 360, growthRate: 750, color: "rgba(90,230,255,0.85)" },
      },
      star: {
        type: "starburst",
        damage: 14,
        knockbackX: 180,
        knockbackY: -100,
        cooldown: 0.12,
        stars: 12,
        speed: 520,
        gravity: 0,
        growRate: 25,
        maxSize: 48,
        color: "rgba(255,245,120,0.95)",
        bypassCooldown: true,
      },
    };

    this.waveEmitters = new Map();
    this.waveProfile = this.attackProfiles.wave;
    this.starEmitters = new Map();
  }

  update(dt) {
    // Query entities with Input and Attack components (typically just the player)
    const entities = this.world.query(["Input", "Attack"]);

    for (const entity of entities) {
      if (entity !== this.world.player) continue;

      const input = this.world.getComponent(entity, "Input");
      const attack = this.world.getComponent(entity, "Attack");

      const attackInputs = [
        { key: "attack", profile: "light" },
        { key: "attackHeavy", profile: "heavy" },
        { key: "attackProjectile", profile: "projectile" },
        { key: "attackUp", profile: "upward" },
        { key: "attackSpin", profile: "spin" },
        { key: "attackWave", profile: "wave" },
        { key: "attackStar", profile: "star" },
      ];

      for (const mapping of attackInputs) {
        const pressed = input[mapping.key];
        const lastState = this.lastAttackState.get(`${entity}_${mapping.key}`) || false;

        if (pressed && !lastState) {
          const profile = this.attackProfiles[mapping.profile];
          let success = false;
          if (profile) {
            if (profile.type === "projectile") {
              success = this.damageSystem.fireProjectile(entity, profile);
            } else if (profile.type === "wave") {
              this.startWaveEmitter(entity);
              success = true;
            } else if (profile.type === "starburst") {
              this.startStarEmitter(entity);
              success = true;
            } else {
              success = this.damageSystem.triggerAttackWithProfile(entity, profile);
              this.spawnSlashVfx(entity, profile);
            }
          } else {
            success = this.damageSystem.triggerAttack(entity);
            if (success) {
              this.spawnSlashVfx(entity, this.attackProfiles.light);
            }
          }
          if (success) {
            console.log(`Player ${entity} performed ${mapping.profile} attack!`);
          }
        }

        this.lastAttackState.set(`${entity}_${mapping.key}`, pressed);
      }

      this.updateWaveEmitter(entity, dt);
      const isStarHeld = Boolean(input?.attackStar);
      this.updateStarEmitter(entity, dt, isStarHeld);
    }
  }

  spawnSlashVfx(entity, profile) {
    const t = this.world.getComponent(entity, "Transform");
    const cs = this.world.getComponent(entity, "CharacterState");
    if (!t || !cs || !profile?.hitbox) return;
    const facing = cs.facing || 1;
    const hb = profile.hitbox;
    const x = t.x + (facing === -1 ? -hb.offsetX - hb.width : hb.offsetX);
    const y = t.y + hb.offsetY;
    const color = profile.vfxColor || "rgba(255,200,0,0.4)";

    const id = this.world.createEntity();
    this.world.addComponent(id, "Transform", { x, y, z: 0 });
    this.world.addComponent(id, "AABB", { w: hb.width, h: hb.height, ox: 0, oy: 0 });
    this.world.addComponent(id, "Renderable", { color, opacity: 0.9 });
    this.world.addComponent(id, "Vfx", { lifetime: profile.vfxLifetime || 0.2, fade: true, initial: profile.vfxLifetime || 0.2 });
  }

  startWaveEmitter(entity) {
    this.waveEmitters.set(entity, { timer: 0, interval: 0.07, pulses: 12 });
  }

  updateWaveEmitter(entity, dt) {
    const emitter = this.waveEmitters.get(entity);
    if (!emitter) return;
    emitter.timer -= dt;
    while (emitter.timer <= 0 && emitter.pulses > 0) {
      emitter.timer += emitter.interval;
      emitter.pulses -= 1;
      this.spawnWave(entity);
    }
    if (emitter.pulses <= 0) {
      this.waveEmitters.delete(entity);
    }
  }

  startStarEmitter(entity) {
    // Continuous emitter until key released (-1 pulses = infinite)
    this.starEmitters.set(entity, { timer: 0, interval: 0.14, pulses: -1, angle: 0 });
  }

  updateStarEmitter(entity, dt, isHeld = false) {
    if (!isHeld) {
      this.starEmitters.delete(entity);
      return;
    }

    if (!this.starEmitters.has(entity)) {
      this.startStarEmitter(entity);
    }
    const emitter = this.starEmitters.get(entity);
    emitter.timer -= dt;
    while (emitter.timer <= 0 && (emitter.pulses === -1 || emitter.pulses > 0)) {
      emitter.timer += emitter.interval;
      if (emitter.pulses > 0) emitter.pulses -= 1;
      emitter.angle += Math.PI / 6;
      this.spawnStarburst(entity, emitter.angle);
    }
  }

  spawnStarburst(entity, baseAngle = 0) {
    const profile = this.attackProfiles.star;
    const t = this.world.getComponent(entity, "Transform");
    const aabb = this.world.getComponent(entity, "AABB");
    const team = this.world.getComponent(entity, "Team");
    if (!t || !aabb) return;
    const cx = t.x + aabb.w * 0.5;
    const cy = t.y + aabb.h * 0.5;
    const startW = 22;
    const startH = 22;
    const n = profile.stars || 10;
    for (let i = 0; i < n; i++) {
      const angle = baseAngle + (Math.PI * 2 * i) / n;
      const vx = Math.cos(angle) * profile.speed;
      const vy = Math.sin(angle) * profile.speed;
      const startX = cx - startW * 0.5;
      const startY = cy - startH * 0.5;
      this.damageSystem.fireProjectile(entity, {
        type: "projectile",
        damage: profile.damage,
        cooldown: profile.cooldown,
        bypassCooldown: profile.bypassCooldown,
        knockbackX: profile.knockbackX,
        knockbackY: profile.knockbackY,
        projectile: {
          speed: profile.speed,
          offsetX: 0,
          offsetY: 0,
          vx,
          vy,
          lifetime: 2.2,
          width: startW,
          height: startH,
          gravity: 0,
          growRate: profile.growRate,
          maxSize: profile.maxSize,
          color: profile.color,
          radialSpeed: profile.speed * 0.6,
          angularSpeed: (this.world.getComponent(entity, "CharacterState")?.facing === -1 ? -1 : 1) * 2.5,
          angle,
          originX: cx,
          originY: cy,
        },
      });
    }
  }
  spawnWave(entity) {
    const waveProfile = this.waveProfile.wave;
    const t = this.world.getComponent(entity, "Transform");
    const aabb = this.world.getComponent(entity, "AABB");
    const team = this.world.getComponent(entity, "Team");
    if (!t || !aabb) return;
    const cx = t.x + aabb.w * 0.5;
    const cy = t.y + aabb.h * 0.5;
    const id = this.world.createEntity();
    this.world.addComponent(id, "Transform", { x: cx, y: cy, z: 0 });
    this.world.addComponent(id, "Hitbox", {
      active: true,
      damage: this.attackProfiles.wave.damage,
      knockbackX: this.attackProfiles.wave.knockbackX,
      knockbackY: this.attackProfiles.wave.knockbackY,
      hitOnce: true,
      hitEntities: [],
      offsetX: -10,
      offsetY: -10,
      width: 20,
      height: 20,
      duration: 0.4,
      elapsed: 0,
    });
    this.world.addComponent(id, "Team", { id: team ? team.id : "player" });
    this.world.addComponent(id, "Renderable", { color: waveProfile.color || "rgba(120,200,255,0.4)", opacity: 0.8 });
    this.world.addComponent(id, "Wave", {
      radius: 10,
      maxRadius: waveProfile.maxRadius || 320,
      growthRate: waveProfile.growthRate || 900,
    });
  }
}
