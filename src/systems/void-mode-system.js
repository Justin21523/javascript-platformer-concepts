// src/systems/void-mode-system.js
// 按住 voidMode 鍵 (預設 X) 進入無敵桌布模式，並可用攻擊鍵觸發趣味彈幕
import { VOID_MODE } from "../config.js";

export class VoidModeSystem {
  constructor(world, damageSystem) {
    this.world = world;
    this.damageSystem = damageSystem;
    this.burstTimer = 0;
  }

  update(dt) {
    const player = this.world.player;
    if (!player) return;
    const input = this.world.getComponent(player, "Input");
    if (!input) return;

    const active = Boolean(input.voidMode);
    if (!this.world.voidMode) {
      this.world.voidMode = { active: false, themeIndex: 0, particleMult: 1 };
    }
    const state = this.world.voidMode;
    state.active = active;
    if (this.world.currentFPS) {
      state.currentFPS = this.world.currentFPS;
    }

    // Theme cycle
    const themePressed = Boolean(input.voidThemeNext);
    if (themePressed && !state._themeLast) {
      const next = ((state.themeIndex ?? 0) + 1) % (VOID_MODE.themes?.length || 1);
      state.themeIndex = next;
    }
    state._themeLast = themePressed;

    // Particle level cycle
    const particlePressed = Boolean(input.voidParticleUp);
    if (particlePressed && !state._particleLast) {
      const levels = VOID_MODE.particleLevels || [1];
      const idx = levels.indexOf(state.particleMult ?? 1);
      const next = levels[(idx + 1) % levels.length];
      state.particleMult = next;
      state.manualTimer = 3.0; // 暫停自動調整
    }
    state._particleLast = particlePressed;

    // Auto adjust based on FPS when未手動
    if (state.manualTimer && state.manualTimer > 0) {
      state.manualTimer -= dt;
    } else {
      const levels = VOID_MODE.particleLevels || [1];
      if (levels.length > 1 && state.currentFPS) {
        if (state.currentFPS < 50 && state.particleMult > levels[0]) {
          state.particleMult = levels[0];
        } else if (state.currentFPS > 75 && state.particleMult < levels[levels.length - 1]) {
          state.particleMult = levels[levels.length - 1];
        }
      }
    }

    if (!active) {
      this.burstTimer = 0;
      return;
    }

    this.burstTimer -= dt;
    // 依攻擊鍵輸出不同效果
    if (input.attack && this.burstTimer <= 0) {
      this.burstTimer = 0.12;
      this.spawnBurst(player, 10, 380, state);
    } else if (input.attackHeavy && this.burstTimer <= 0) {
      this.burstTimer = 0.16;
      this.spawnBurst(player, 18, 520, state);
    } else if (input.attackProjectile && this.burstTimer <= 0) {
      this.burstTimer = 0.2;
      this.spawnSpiral(player, 14, 480, state);
    }
  }

  spawnBurst(player, count, speed, state) {
    const t = this.world.getComponent(player, "Transform");
    const aabb = this.world.getComponent(player, "AABB");
    if (!t || !aabb) return;
    const vfxCount = this.world.query(["Vfx"]).length;
    if (vfxCount > 260) return;
    const cx = t.x + aabb.w * 0.5;
    const cy = t.y + aabb.h * 0.5;
    const mult = state?.particleMult ?? 1;
    const total = Math.round(count * mult);
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this.spawnVoidProjectile(cx, cy, angle, speed, false, state);
    }
  }

  spawnSpiral(player, count, speed, state) {
    const t = this.world.getComponent(player, "Transform");
    const aabb = this.world.getComponent(player, "AABB");
    if (!t || !aabb) return;
    const cx = t.x + aabb.w * 0.5;
    const cy = t.y + aabb.h * 0.5;
    const base = Math.random() * Math.PI * 2;
    const mult = state?.particleMult ?? 1;
    const total = Math.round(count * mult);
    for (let i = 0; i < total; i++) {
      const angle = base + (Math.PI * 2 * i) / count;
      this.spawnVoidProjectile(cx, cy, angle, speed, true, state);
    }
  }

  spawnVoidProjectile(cx, cy, angle, speed, spiral = false, state) {
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = 18;
    const proj = this.world.createEntity();
    this.world.addComponent(proj, "Transform", { x: cx - size * 0.5, y: cy - size * 0.5, z: 0 });
    this.world.addComponent(proj, "Velocity", { vx, vy });
    this.world.addComponent(proj, "AABB", { w: size, h: size, ox: 0, oy: 0 });
    const theme = this.getTheme(state);
    this.world.addComponent(proj, "Renderable", {
      color: this.pickColor(state),
      opacity: 0.95,
      renderDuringVoid: true,
      shape: theme?.shape || null,
    });
    this.world.addComponent(proj, "Projectile", {
      lifetime: 0.8 * (state?.particleMult ?? 1),
      gravity: 0,
      radialSpeed: spiral ? speed * 0.3 : null,
      angularSpeed: spiral ? 3 : 0,
      angle,
      originX: cx,
      originY: cy,
    });
    const life = 0.8 * (state?.particleMult ?? 1);
    this.world.addComponent(proj, "Vfx", { lifetime: life, fade: true, initial: life });
  }

  pickColor(state) {
    const themes = VOID_MODE.themes || [];
    const theme = themes[state?.themeIndex || 0] || themes[0];
    const arr = theme?.colors || ["rgba(255,255,255,0.9)"];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getTheme(state) {
    const themes = VOID_MODE.themes || [];
    return themes[state?.themeIndex || 0] || themes[0];
  }

  isActive() {
    return Boolean(this.world.voidMode?.active);
  }
}
