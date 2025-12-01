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
      this.world.voidMode = { active: false };
    }
    this.world.voidMode.active = active;

    if (!active) {
      this.burstTimer = 0;
      return;
    }

    this.burstTimer -= dt;
    // 依攻擊鍵輸出不同效果
    if (input.attack && this.burstTimer <= 0) {
      this.burstTimer = 0.12;
      this.spawnBurst(player, 10, 380);
    } else if (input.attackHeavy && this.burstTimer <= 0) {
      this.burstTimer = 0.16;
      this.spawnBurst(player, 18, 520);
    } else if (input.attackProjectile && this.burstTimer <= 0) {
      this.burstTimer = 0.2;
      this.spawnSpiral(player, 14, 480);
    }
  }

  spawnBurst(player, count, speed) {
    const t = this.world.getComponent(player, "Transform");
    const aabb = this.world.getComponent(player, "AABB");
    if (!t || !aabb) return;
    const cx = t.x + aabb.w * 0.5;
    const cy = t.y + aabb.h * 0.5;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      this.spawnVoidProjectile(cx, cy, angle, speed);
    }
  }

  spawnSpiral(player, count, speed) {
    const t = this.world.getComponent(player, "Transform");
    const aabb = this.world.getComponent(player, "AABB");
    if (!t || !aabb) return;
    const cx = t.x + aabb.w * 0.5;
    const cy = t.y + aabb.h * 0.5;
    const base = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const angle = base + (Math.PI * 2 * i) / count;
      this.spawnVoidProjectile(cx, cy, angle, speed, true);
    }
  }

  spawnVoidProjectile(cx, cy, angle, speed, spiral = false) {
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = 18;
    const proj = this.world.createEntity();
    this.world.addComponent(proj, "Transform", { x: cx - size * 0.5, y: cy - size * 0.5, z: 0 });
    this.world.addComponent(proj, "Velocity", { vx, vy });
    this.world.addComponent(proj, "AABB", { w: size, h: size, ox: 0, oy: 0 });
    this.world.addComponent(proj, "Renderable", {
      color: this.pickColor(),
      opacity: 0.95,
      renderDuringVoid: true,
    });
    this.world.addComponent(proj, "Projectile", {
      lifetime: 0.8,
      gravity: 0,
      radialSpeed: spiral ? speed * 0.3 : null,
      angularSpeed: spiral ? 3 : 0,
      angle,
      originX: cx,
      originY: cy,
    });
    this.world.addComponent(proj, "Vfx", { lifetime: 0.8, fade: true, initial: 0.8 });
  }

  pickColor() {
    const arr = VOID_MODE.burstColors || ["rgba(255,255,255,0.9)"];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  isActive() {
    return Boolean(this.world.voidMode?.active);
  }
}
