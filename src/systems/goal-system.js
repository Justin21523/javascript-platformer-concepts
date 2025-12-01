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

    if (typeof window !== "undefined") {
      window.addEventListener("level-changed", (e) => {
        const spawn = e.detail?.spawn;
        this.placePortal(spawn);
      });
    }
  }

  update(dt) {
    if (!this.world.player || !this.portalId) return;
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

    if (overlap) {
      const nextLevel = this.levelManager.getNextLevelId();
      this.celebration?.enter(nextLevel);
      this.cleanupPortal();
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
  }

  cleanupPortal() {
    if (this.portalId) {
      this.world.destroyEntity(this.portalId);
      this.portalId = null;
    }
  }
}
