// src/systems/hyperdrive-system.js
// Drives the hyper-speed auto-move, obstacle dodging, and dramatic trail VFX
import { HYPERDRIVE } from "../config.js";

export class HyperdriveSystem {
  constructor(world, collisionSystem) {
    this.world = world;
    this.collision = collisionSystem;
  }

  update(dt) {
    const player = this.world.player;
    if (!player) return;

    const hyper = this.world.getComponent(player, "Hyperdrive");
    if (!hyper || !hyper.active) return;

    const t = this.world.getComponent(player, "Transform");
    const v = this.world.getComponent(player, "Velocity");
    const aabb = this.world.getComponent(player, "AABB");
    const cs = this.world.getComponent(player, "CharacterState");
    const input = this.world.getComponent(player, "Input");
    if (!t || !v || !aabb) return;

    hyper.elapsed += dt;
    if (hyper.elapsed >= hyper.duration) {
      hyper.active = false;
      return;
    }

    // Face right and lock-in movement
    if (cs) cs.facing = 1;
    v.vx = hyper.speed;

    // Simple obstacle logic: hop when front is blocked or a gap is ahead
    const onGround = this.world.collisionFlags?.onGround.get(player);
    const frontBlocked = this.hasFrontObstacle(t, aabb, hyper);
    const gapAhead = this.isApproachingGap(t, aabb, hyper);
    const lowCeil = this.hasLowCeiling(t, aabb, hyper);
    hyper._frontBlocked = frontBlocked;
    hyper._gapAhead = gapAhead;
    hyper._lowCeil = lowCeil;

    if (frontBlocked) {
      if (this.hasLowCeiling(t, aabb, hyper)) {
        v.vy = Math.max(v.vy, 120); // duck and slip instead of bonking
      } else if (onGround || v.vy > -hyper.jumpSpeed * 0.3) {
        v.vy = -hyper.jumpSpeed;
      }
    } else if (onGround && gapAhead) {
      v.vy = -hyper.jumpSpeed * 0.6;
    } else if (!onGround && hyper.verticalNudge) {
      v.vy += hyper.verticalNudge * dt;
    }

    // Player steer (reduced authority) for vertical correction
    if (input) {
      const steer = (input.up ? -1 : 0) + (input.down ? 1 : 0);
      if (steer !== 0) {
        v.vy += steer * hyper.verticalNudge * 1.6 * dt;
      }
    }

    // Trail emitters
    hyper.flameTimer -= dt;
    if (hyper.flameTimer <= 0) {
      hyper.flameTimer = hyper.flameInterval;
      this.spawnFlame(player, hyper, t, aabb);
    }

    hyper.ghostTimer -= dt;
    if (hyper.ghostTimer <= 0) {
      hyper.ghostTimer = hyper.ghostInterval;
      this.spawnGhost(player, hyper, t);
    }

    // Front plow damage
    hyper.plowTimer -= dt;
    if (hyper.plowTimer <= 0) {
      hyper.plowTimer = hyper.plowInterval;
      this.spawnPlow(player, hyper, t, aabb);
    }
  }

  getStyle(hyper) {
    return HYPERDRIVE.styles[hyper.style] || HYPERDRIVE.styles.inferno;
  }

  hasFrontObstacle(t, aabb, hyper) {
    if (!this.collision) return false;
    const frontX = t.x + aabb.w + hyper.obstacleLookahead;
    const samples = 5;
    for (let i = 0; i < samples; i++) {
      const y = t.y + 4 + (aabb.h - 8) * (i / (samples - 1));
      if (this.collision.isSolidAt(frontX, y)) return true;
    }
    return false;
  }

  spawnPlow(player, hyper, t, aabb) {
    const plow = this.world.createEntity();
    const width = 120;
    const height = aabb.h * 0.8;
    const px = t.x + aabb.w - 10;
    const py = t.y + (aabb.h - height) * 0.5;
    this.world.addComponent(plow, "Transform", { x: px, y: py, z: 0 });
    this.world.addComponent(plow, "AABB", { w: width, h: height, ox: 0, oy: 0 });
    this.world.addComponent(plow, "Renderable", {
      color: "rgba(255,255,255,0.08)",
      opacity: 0.6,
    });
    this.world.addComponent(plow, "Team", { id: "player" });
    this.world.addComponent(plow, "Hitbox", {
      active: true,
      damage: hyper.plowDamage || 10,
      knockbackX: hyper.plowKnockbackX || 400,
      knockbackY: hyper.plowKnockbackY || -60,
      hitOnce: false,
      hitEntities: [],
      offsetX: 0,
      offsetY: 0,
      width,
      height,
      duration: 0.12,
      elapsed: 0,
    });
    // Auto-clean via VFX timer
    this.world.addComponent(plow, "Vfx", { lifetime: 0.12, fade: true, initial: 0.12 });
  }

  hasLowCeiling(t, aabb, hyper) {
    if (!this.collision) return false;
    const checkX = t.x + aabb.w * 0.6;
    const topY = t.y - 8;
    const headRoom = hyper.verticalNudge * 0.6;
    const steps = 3;
    for (let i = 0; i < steps; i++) {
      const y = topY - headRoom * (i / (steps - 1));
      if (this.collision.isSolidAt(checkX, y)) return true;
    }
    return false;
  }

  isApproachingGap(t, aabb, hyper) {
    if (!this.collision) return false;
    const aheadX = t.x + aabb.w + hyper.obstacleLookahead * 0.5;
    const footY = t.y + aabb.h + 4;
    return !this.collision.isSolidAt(aheadX, footY);
  }

  spawnFlame(player, hyper, t, aabb) {
    const style = this.getStyle(hyper);
    const size = style.flameSize || { w: 220, h: 170 };
    const x = t.x - (hyper.backOffset || 0) - size.w * 0.35;
    const y = t.y + (aabb.h - size.h) * 0.5;
    const flame = this.world.createEntity();
    this.world.addComponent(flame, "Transform", { x, y, z: 0 });
    this.world.addComponent(flame, "AABB", { w: size.w, h: size.h, ox: 0, oy: 0 });
    this.world.addComponent(flame, "Renderable", {
      color: style.flameColor,
      opacity: 0.95,
    });
    this.world.addComponent(flame, "Velocity", { vx: style.flameSpeed ?? -900, vy: 0 });
    this.world.addComponent(flame, "Team", { id: "player" });
    this.world.addComponent(flame, "Hitbox", {
      active: true,
      damage: HYPERDRIVE.flameDamage,
      knockbackX: HYPERDRIVE.flameKnockbackX,
      knockbackY: HYPERDRIVE.flameKnockbackY,
      hitOnce: false,
      hitEntities: [],
      offsetX: 0,
      offsetY: 0,
      width: size.w,
      height: size.h,
      duration: 0.6,
      elapsed: 0,
    });
    this.world.addComponent(flame, "Projectile", {
      lifetime: 0.6,
      gravity: 0,
      growRate: 90,
      maxSize: size.w * 1.25,
      radialSpeed: null,
      angularSpeed: 0,
      angle: 0,
      originX: x,
      originY: y,
    });
    this.world.addComponent(flame, "Vfx", { lifetime: 0.6, fade: true, initial: 0.6 });

    // Secondary glow for a thicker plume
    const glow = this.world.createEntity();
    this.world.addComponent(glow, "Transform", {
      x: x + size.w * 0.1,
      y: y + size.h * 0.1,
      z: 0,
    });
    this.world.addComponent(glow, "AABB", {
      w: size.w * 0.75,
      h: size.h * 0.75,
      ox: 0,
      oy: 0,
    });
    this.world.addComponent(glow, "Renderable", {
      color: style.flameSecondary || style.flameColor,
      opacity: 0.7,
    });
    this.world.addComponent(glow, "Velocity", { vx: (style.flameSpeed ?? -900) * 0.8, vy: 0 });
    this.world.addComponent(glow, "Team", { id: "player" });
    this.world.addComponent(glow, "Hitbox", {
      active: true,
      damage: (HYPERDRIVE.flameDamage || 12) * 0.6,
      knockbackX: HYPERDRIVE.flameKnockbackX * 0.8,
      knockbackY: HYPERDRIVE.flameKnockbackY * 0.8,
      hitOnce: false,
      hitEntities: [],
      offsetX: 0,
      offsetY: 0,
      width: size.w * 0.75,
      height: size.h * 0.75,
      duration: 0.55,
      elapsed: 0,
    });
    this.world.addComponent(glow, "Projectile", {
      lifetime: 0.55,
      gravity: 0,
      growRate: 60,
      maxSize: size.w,
      radialSpeed: null,
      angularSpeed: 0,
      angle: 0,
      originX: x,
      originY: y,
    });
    this.world.addComponent(glow, "Vfx", { lifetime: 0.55, fade: true, initial: 0.55 });

    // Ember particles (small, fast fade)
    const emberCount = 6;
    for (let i = 0; i < emberCount; i++) {
      const ember = this.world.createEntity();
      const jitterX = (Math.random() - 0.5) * size.w * 0.3;
      const jitterY = (Math.random() - 0.5) * size.h * 0.5;
      const ex = x + size.w * 0.3 + jitterX;
      const ey = y + size.h * 0.5 + jitterY;
      const evx = (style.flameSpeed ?? -900) * (0.9 + Math.random() * 0.3);
      const evy = (Math.random() - 0.5) * 120;
      this.world.addComponent(ember, "Transform", { x: ex, y: ey, z: 0 });
      this.world.addComponent(ember, "AABB", { w: 14, h: 14, ox: 0, oy: 0 });
      this.world.addComponent(ember, "Renderable", {
        color: style.emberColor || style.flameColor,
        opacity: 0.9,
      });
      this.world.addComponent(ember, "Velocity", { vx: evx, vy: evy });
      this.world.addComponent(ember, "Projectile", {
        lifetime: 0.4 + Math.random() * 0.25,
        gravity: 0,
        growRate: 0,
        maxSize: 16,
      });
      this.world.addComponent(ember, "Vfx", { lifetime: 0.5, fade: true, initial: 0.5 });
    }
  }

  spawnGhost(player, hyper, t) {
    const style = this.getStyle(hyper);
    const sprite = this.world.getComponent(player, "Sprite");
    const renderable = this.world.getComponent(player, "Renderable");
    const aabb = this.world.getComponent(player, "AABB");
    const ghost = this.world.createEntity();
    const offsetX = -(hyper.backOffset || 0) * 0.5;
    this.world.addComponent(ghost, "Transform", { x: t.x + offsetX, y: t.y, z: 0 });
    if (sprite) {
      const ghostSprite = {
        ...sprite,
        animations: sprite.animations,
        currentAnimation: sprite.currentAnimation,
        frameIndex: sprite.frameIndex,
        frameTime: sprite.frameTime,
        frameDuration: sprite.frameDuration,
        width: sprite.width,
        height: sprite.height,
        flipX: sprite.flipX,
        flipY: sprite.flipY,
      };
      this.world.addComponent(ghost, "Sprite", ghostSprite);
    }
    if (aabb) {
      this.world.addComponent(ghost, "AABB", { w: aabb.w, h: aabb.h, ox: aabb.ox, oy: aabb.oy });
    }
    this.world.addComponent(ghost, "Renderable", {
      color: style.ghostColor,
      opacity: (renderable?.opacity ?? 1) * 0.8,
    });
    this.world.addComponent(ghost, "Velocity", { vx: style.ghostSpeed ?? -520, vy: 0 });
    const ghostLifetime = style.ghostLifetime ?? 0.7;
    this.world.addComponent(ghost, "Projectile", {
      lifetime: ghostLifetime,
      gravity: 0,
      radialSpeed: null,
      angularSpeed: 0,
      angle: 0,
      originX: t.x,
      originY: t.y,
    });
    this.world.addComponent(ghost, "Vfx", { lifetime: ghostLifetime, fade: true, initial: ghostLifetime });
  }
}
