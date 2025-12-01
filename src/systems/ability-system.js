// src/systems/ability-system.js
// Handles ability meter recharge, style cycling, and hyperdrive activation
import { ABILITY, HYPERDRIVE } from "../config.js";

export class AbilitySystem {
  constructor(world) {
    this.world = world;
    this.lastStyleToggle = false;
  }

  update(dt) {
    const player = this.world.player;
    if (!player) return;
    const input = this.world.getComponent(player, "Input");
    const meter = this.world.getComponent(player, "AbilityMeter");
    const ability = this.world.getComponent(player, "AbilitySkill");

    if (!input || !meter || !ability) return;

    if (ability.styleToastTimer > 0) {
      ability.styleToastTimer = Math.max(0, ability.styleToastTimer - dt);
    }

    this.rechargeMeter(meter, ability, dt);
    this.handleStyleToggle(input, ability);

    // Activate on ability key press when ready and not active
    if (input.ability && meter.ready && !ability.active) {
      this.activate(player, meter, ability);
    }

    if (ability.active) {
      ability.elapsed += dt;
      if (ability.elapsed >= ability.duration) {
        ability.active = false;
        ability.elapsed = 0;
        this.clearInvulnerability(player);
        this.endHyperdrive(player);
      } else {
        this.applyInvulnerability(player, ability);
      }
    }
  }

  rechargeMeter(meter, ability, dt) {
    if (ability.active) return;
    const max = ABILITY.meterMax;
    meter.max = max;
    meter.current = Math.min(max, meter.current + ABILITY.meterChargeRate * dt);
    if (meter.current >= max) {
      meter.current = max;
      meter.ready = true;
    }
  }

  handleStyleToggle(input, ability) {
    const pressed = Boolean(input.hyperStyleNext);
    if (pressed && !this.lastStyleToggle) {
      const order = HYPERDRIVE.styleOrder || [];
      const currentIndex = order.indexOf(ability.style);
      const nextIndex =
        currentIndex >= 0 ? (currentIndex + 1) % order.length : 0;
      const nextStyle = order[nextIndex] || ability.style || "inferno";
      ability.style = nextStyle;
      ability.styleIndex = nextIndex;
      const label = HYPERDRIVE.styles[nextStyle]?.label || nextStyle;
      ability.styleToastTimer = 1.2;
      ability.styleToastLabel = label;
      console.log(`Hyperdrive style -> ${label}`);
    }
    this.lastStyleToggle = pressed;
  }

  activate(player, meter, ability) {
    ability.active = true;
    ability.elapsed = 0;
    ability.duration = HYPERDRIVE.duration;
    meter.current = 0;
    meter.ready = false;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sfx", { detail: { type: "hyper-start" } }));
      window.dispatchEvent(new CustomEvent("camera-shake", { detail: { strength: 14, duration: 0.35 } }));
    }

    // Ensure buff component exists
    let buff = this.world.getComponent(player, "BuffState");
    if (!buff) {
      this.world.addComponent(player, "BuffState", {});
      buff = this.world.getComponent(player, "BuffState");
    }

    buff.active = true;
    buff.elapsed = 0;
    buff.duration = ability.duration;
    buff.speedMultiplier = ability.speedMultiplier;
    buff.attackSpeedMultiplier = ability.attackSpeedMultiplier;
    buff.invulnerable = ability.invulnerable;

    this.applyInvulnerability(player, ability);
    this.startHyperdrive(player, ability);
    // Aura VFX
    const t = this.world.getComponent(player, "Transform");
    if (t) {
      const style =
        HYPERDRIVE.styles[ability.style] || HYPERDRIVE.styles.inferno;
      const aura = this.world.createEntity();
      this.world.addComponent(aura, "Transform", {
        x: t.x - 20,
        y: t.y - 20,
        z: 0,
      });
      this.world.addComponent(aura, "AABB", { w: 200, h: 220, ox: 0, oy: 0 });
      this.world.addComponent(aura, "Renderable", {
        color: style?.flameSecondary || "rgba(120,200,255,0.25)",
        opacity: 0.6,
      });
      this.world.addComponent(aura, "Vfx", {
        lifetime: ability.duration,
        fade: true,
        initial: ability.duration,
      });

      // Start flash burst
      const burst = this.world.createEntity();
      this.world.addComponent(burst, "Transform", { x: t.x - 40, y: t.y - 40, z: 0 });
      this.world.addComponent(burst, "AABB", { w: 280, h: 280, ox: 0, oy: 0 });
      this.world.addComponent(burst, "Renderable", { color: style?.flameColor || "rgba(255,255,255,0.6)", opacity: 0.9 });
      this.world.addComponent(burst, "Vfx", { lifetime: 0.35, fade: true, initial: 0.35 });
    }
  }

  startHyperdrive(player, ability) {
    let hyper = this.world.getComponent(player, "Hyperdrive");
    if (!hyper) {
      this.world.addComponent(player, "Hyperdrive", {});
      hyper = this.world.getComponent(player, "Hyperdrive");
    }
    hyper.active = true;
    hyper.elapsed = 0;
    hyper.duration = HYPERDRIVE.duration;
    hyper.speed = HYPERDRIVE.speed;
    hyper.jumpSpeed = HYPERDRIVE.jumpSpeed;
    hyper.obstacleLookahead = HYPERDRIVE.obstacleLookahead;
    hyper.flameInterval = HYPERDRIVE.flameInterval;
    hyper.ghostInterval = HYPERDRIVE.ghostInterval;
    hyper.plowInterval = HYPERDRIVE.plowInterval;
    hyper.plowTimer = 0;
    hyper.flameTimer = 0;
    hyper.ghostTimer = 0;
    hyper.style = ability.style || "inferno";
    hyper.backOffset = HYPERDRIVE.backOffset;
    hyper.verticalNudge = HYPERDRIVE.verticalNudge;
    hyper.plowDamage = HYPERDRIVE.plowDamage;
    hyper.plowKnockbackX = HYPERDRIVE.plowKnockbackX;
    hyper.plowKnockbackY = HYPERDRIVE.plowKnockbackY;
  }

  endHyperdrive(player) {
    const hyper = this.world.getComponent(player, "Hyperdrive");
    if (hyper) {
      hyper.active = false;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sfx", { detail: { type: "hyper-end" } }));
    }
  }

  applyInvulnerability(player, ability) {
    if (!ability.invulnerable) return;
    const health = this.world.getComponent(player, "Health");
    if (health) {
      health.invulnerable = true;
    }
  }

  clearInvulnerability(player) {
    const health = this.world.getComponent(player, "Health");
    if (health) {
      health.invulnerable = false;
    }
    const buff = this.world.getComponent(player, "BuffState");
    if (buff) {
      buff.invulnerable = false;
      buff.active = false;
    }
  }
}
