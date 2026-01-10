// src/systems/goal-system.js
// 在關卡中生成光道（目標點），碰撞後進入慶祝模式並預備下一關
import { GOAL } from "../config.js";

export class GoalSystem {
  constructor(world, levelManager, celebrationSystem) {
    this.world = world;
    this.levelManager = levelManager;
    this.celebration = celebrationSystem;
    this.portalId = null;
    this.spawnX = 0;
    this.spawnY = 0;
    this.signId = null;
    this.signTime = 0;

    if (typeof window !== "undefined") {
      window.addEventListener("level-changed", (e) => {
        const spawn = e.detail?.spawn;
        this.placePortal(spawn);
      });
    }
  }

  update(dt) {
    if (!this.world.player) return;
    if (this.world.goalMenu?.active) {
      this.updateGoalMenu(dt);
      return;
    }
    if (!this.portalId) return;
    const portalT = this.world.getComponent(this.portalId, "Transform");
    const portalAabb = this.world.getComponent(this.portalId, "AABB");
    if (!portalT || !portalAabb) return;

    const playerT = this.world.getComponent(this.world.player, "Transform");
    const playerAabb = this.world.getComponent(this.world.player, "AABB");
    if (!playerT || !playerAabb) return;

    const overlap =
      playerT.x < portalT.x + portalAabb.w &&
      playerT.x + playerAabb.w > portalT.x &&
      playerT.y < portalT.y + portalAabb.h &&
      playerT.y + playerAabb.h > portalT.y;

    const dx = playerT.x - portalT.x;
    const dy = playerT.y - portalT.y;
    const dist = Math.hypot(dx, dy);
    this.world.goalHint = {
      active: dist <= (GOAL.hintDistance || 360),
      distance: dist,
      portalX: portalT.x,
      portalY: portalT.y,
    };

    if (overlap) {
      const nextLevel = this.levelManager.getNextLevelId();
      this.world.goalMenu = {
        active: true,
        timer: 1.0,
        ready: false,
        nextLevel,
        currentLevel: this.levelManager.currentLevelId,
      };
      if (this.world.sceneOverlay) {
        this.world.sceneOverlay.text = "抵達光道，準備選擇下一步...";
        this.world.sceneOverlay.timer = 1.0;
      }
      const v = this.world.getComponent(this.world.player, "Velocity");
      if (v) {
        v.vx = 0;
        v.vy = 0;
      }
    }

    // Pulse sign opacity
    if (this.signId) {
      this.signTime += dt;
      const renderable = this.world.getComponent(this.signId, "Renderable");
      if (renderable) {
        renderable.opacity = 0.55 + Math.sin(this.signTime * 3) * 0.2;
      }
    }
  }

  placePortal(spawn) {
    this.cleanupPortal();
    if (!spawn) return;

    this.spawnX = spawn.x + (GOAL.distanceFromSpawn || 2200);
    this.spawnY = spawn.y + (GOAL.heightOffset || 0);

    const portal = this.world.createEntity();
    this.world.addComponent(portal, "Transform", {
      x: this.spawnX,
      y: this.spawnY,
      z: 0,
    });
    this.world.addComponent(portal, "AABB", { w: 80, h: 200, ox: 0, oy: 0 });
    this.world.addComponent(portal, "Renderable", {
      color: "rgba(120,200,255,0.65)",
      opacity: 0.9,
    });
    this.world.addComponent(portal, "Vfx", { lifetime: 9999, fade: false, initial: 9999 });

    this.portalId = portal;

    // Hint sign above portal
    const sign = this.world.createEntity();
    this.world.addComponent(sign, "Transform", {
      x: this.spawnX + 10,
      y: this.spawnY + (GOAL.signOffsetY || -80),
      z: 0,
    });
    this.world.addComponent(sign, "AABB", { w: 60, h: 30, ox: 0, oy: 0 });
    this.world.addComponent(sign, "Renderable", {
      color: "rgba(255,255,255,0.25)",
      opacity: 0.8,
      renderDuringVoid: true,
    });
    this.world.addComponent(sign, "Vfx", { lifetime: 9999, fade: false, initial: 9999 });
    this.signId = sign;
  }

  cleanupPortal() {
    if (this.portalId) {
      this.world.destroyEntity(this.portalId);
      this.portalId = null;
    }
    if (this.signId) {
      this.world.destroyEntity(this.signId);
      this.signId = null;
    }
  }

  updateGoalMenu(dt) {
    const gm = this.world.goalMenu;
    if (!gm) return;
    gm.timer -= dt;
    if (gm.timer <= 0) gm.ready = true;
    const input = this.world.getComponent(this.world.player, "Input");
    if (!input || !gm.ready) return;
    if (input.goalCelebrate) {
      this.celebration?.enter(gm.nextLevel);
      this.world.goalMenu = null;
      this.cleanupPortal();
    } else if (input.goalNext) {
      const target = gm.nextLevel || this.levelManager.getNextLevelId();
      if (target) this.levelManager.loadLevel(target, { respawnPlayer: true });
      this.world.goalMenu = null;
      this.cleanupPortal();
    } else if (input.goalReplay) {
      const target = gm.currentLevel || this.levelManager.currentLevelId;
      if (target) this.levelManager.loadLevel(target, { respawnPlayer: true });
      this.world.goalMenu = null;
      this.cleanupPortal();
    }
  }
}
