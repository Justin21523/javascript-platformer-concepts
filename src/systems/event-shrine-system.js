// src/systems/event-shrine-system.js
// 隨機事件祭壇：玩家靠近按 T 觸發獎勵
import { CELEBRATION, WORLD } from "../config.js";

export class EventShrineSystem {
  constructor(world) {
    this.world = world;
    this.shrines = [];
    if (typeof window !== "undefined") {
      window.addEventListener("level-changed", (e) => {
        this.spawnShrines(e.detail?.meta?.eventSpots || []);
      });
    }
  }

  spawnShrines(spots) {
    // 清理舊的
    for (const id of this.shrines) {
      this.world.destroyEntity(id);
    }
    this.shrines = [];
    for (const spot of spots) {
      const shrine = this.world.createEntity();
      this.world.addComponent(shrine, "Transform", { x: spot.x, y: spot.y, z: 0 });
      this.world.addComponent(shrine, "AABB", { w: 90, h: 120, ox: 0, oy: 0 });
      this.world.addComponent(shrine, "Renderable", {
        color: "rgba(200,180,255,0.5)",
        opacity: 0.9,
        renderDuringVoid: true,
      });
      const kindRoll = Math.random();
      let kind = "reward";
      const trapCut = WORLD.eventTrapChance ?? 0.15;
      const trialCut = WORLD.eventTrialChance ?? 0.2;
      if (kindRoll < trapCut) kind = "trap";
      else if (kindRoll < trapCut + trialCut) kind = "trial";
      else if (kindRoll < trapCut + trialCut + 0.15) kind = "trade";
      else if (kindRoll < trapCut + trialCut + 0.3) kind = "blessing";
      else if (kindRoll < trapCut + trialCut + 0.45) kind = "gamble";
      this.world.addComponent(shrine, "EventShrine", { kind });
      this.world.addComponent(shrine, "Vfx", { lifetime: 9999, fade: false, initial: 9999 });
      this.shrines.push(shrine);
    }
  }

  update(dt) {
    if (!this.world.player) return;
    const input = this.world.getComponent(this.world.player, "Input");
    const t = this.world.getComponent(this.world.player, "Transform");
    const aabb = this.world.getComponent(this.world.player, "AABB");
    if (!input || !t || !aabb) return;

    let near = false;
    let nearKind = "";
    for (const shrine of this.shrines) {
      const st = this.world.getComponent(shrine, "Transform");
      const sa = this.world.getComponent(shrine, "AABB");
      if (!st || !sa) continue;
      const overlap =
        t.x < st.x + sa.w &&
        t.x + aabb.w > st.x &&
        t.y < st.y + sa.h &&
        t.y + aabb.h > st.y;
      if (overlap) {
        near = true;
        nearKind = this.world.getComponent(shrine, "EventShrine")?.kind || "";
        if (input.eventInteract) {
          this.triggerReward(shrine);
          break;
        }
      }
    }
    this.world.eventPrompt = near ? "按 T 觸發事件" : "";
    if (this.world.eventPanel) {
      if (near) {
        this.world.eventPanel.show(`事件：${nearKind || "未知"} (按 T 觸發)`);
      } else {
        this.world.eventPanel.hide();
      }
    }
  }

  triggerReward(shrine) {
    const kind = this.world.getComponent(shrine, "EventShrine")?.kind || "reward";
    if (kind === "trap") {
      this.spawnTrap(shrine);
    } else if (kind === "trial") {
      this.spawnTrial(shrine);
    } else if (kind === "trade") {
      this.spawnTrade(shrine);
    } else if (kind === "blessing") {
      this.spawnBlessing(shrine);
    } else if (kind === "gamble") {
      this.spawnGamble(shrine);
    } else {
      this.spawnReward(shrine);
    }
    this.world.destroyEntity(shrine);
    this.shrines = this.shrines.filter((id) => id !== shrine);
    if (this.world.sceneOverlay) {
      this.world.sceneOverlay.text = "事件完成！";
      this.world.sceneOverlay.timer = 1.0;
    }
  }

  spawnReward() {
    const roll = Math.random();
    if (roll < 0.3) {
      this.giveFragments(5);
    } else if (roll < 0.6) {
      this.heal(60);
    } else if (roll < 0.8) {
      this.freeArtifact();
    } else {
      this.buffPlayer();
    }
  }

  spawnTrade() {
    const frags = this.world.fragments || 0;
    if (frags >= 5) {
      this.world.fragments -= 5;
      this.freeArtifact();
      if (this.world.sceneOverlay) {
        this.world.sceneOverlay.text = "交易成功：消耗 5 碎片換神器";
        this.world.sceneOverlay.timer = 1.2;
      }
    } else {
      this.heal(30);
    }
  }

  spawnBlessing() {
    // 短暫攻速/移速強化
    const buff = this.world.getComponent(this.world.player, "BuffState");
    if (buff) {
      buff.active = true;
      buff.elapsed = 0;
      buff.duration = 8;
      buff.speedMultiplier = 1.25;
      buff.attackSpeedMultiplier = 0.8;
    }
  }

  spawnGamble() {
    if (Math.random() < 0.5) {
      this.giveFragments(8);
      this.freeArtifact();
    } else {
      this.spawnTrap();
    }
  }

  spawnTrap(shrine) {
    const t = this.world.getComponent(this.world.player, "Transform");
    if (!t) return;
    // 毒雲/炸彈
    for (let i = 0; i < 4; i++) {
      const bomb = this.world.createEntity();
      const size = 26;
      this.world.addComponent(bomb, "Transform", { x: t.x + (Math.random() - 0.5) * 200, y: t.y - 40, z: 0 });
      this.world.addComponent(bomb, "Velocity", { vx: (Math.random() - 0.5) * 200, vy: -220 + Math.random() * 120 });
      this.world.addComponent(bomb, "AABB", { w: size, h: size, ox: 0, oy: 0 });
      this.world.addComponent(bomb, "Renderable", { color: "rgba(80,200,80,0.8)", opacity: 0.9 });
      this.world.addComponent(bomb, "Projectile", { lifetime: 1.6, gravity: 620 });
      this.world.addComponent(bomb, "Vfx", { lifetime: 1.6, fade: true, initial: 1.6 });
    }
    // 放置毒雲區域傷害
    const cloud = this.world.createEntity();
    this.world.addComponent(cloud, "Transform", { x: t.x, y: t.y, z: 0 });
    this.world.addComponent(cloud, "AABB", { w: 200, h: 120, ox: 0, oy: 0 });
    this.world.addComponent(cloud, "Renderable", { color: "rgba(100,200,100,0.35)", opacity: 0.7 });
    this.world.addComponent(cloud, "Hitbox", {
      active: true,
      damage: 6,
      knockbackX: 20,
      knockbackY: 0,
      hitOnce: false,
      hitEntities: [],
      offsetX: 0,
      offsetY: 0,
      width: 200,
      height: 120,
      duration: 2.5,
      elapsed: 0,
    });
    this.world.addComponent(cloud, "Vfx", { lifetime: 2.5, fade: true, initial: 2.5 });
  }

  spawnTrial(shrine) {
    // 試煉：免費 artifact 但生成兩個敵人
    this.freeArtifact();
    const t = this.world.getComponent(this.world.player, "Transform");
    if (!t) return;
    const spawnX = [t.x + 180, t.x - 180];
    for (const sx of spawnX) {
      const enemy = this.world.createEntity();
      this.world.addComponent(enemy, "Transform", { x: sx, y: t.y, z: 0 });
      this.world.addComponent(enemy, "Velocity", { vx: 0, vy: 0 });
      this.world.addComponent(enemy, "AABB", { w: 80, h: 120, ox: 0, oy: 0 });
      this.world.addComponent(enemy, "Collider", { solid: true, group: "enemy" });
      this.world.addComponent(enemy, "PhysicsBody", { gravityScale: 1, frictionX: 0.8, maxSpeedX: 400, maxSpeedY: 1600 });
      this.world.addComponent(enemy, "CharacterState", { action: "idle", facing: sx > t.x ? -1 : 1 });
      this.world.addComponent(enemy, "Renderable", { color: "#ff8888" });
      this.world.addComponent(enemy, "Input", {});
      this.world.addComponent(enemy, "Health", { current: 40, max: 40, invulnerable: false });
      this.world.addComponent(enemy, "Team", { id: "enemy" });
      this.world.addComponent(enemy, "Hurtbox", { active: true, width: 70, height: 100, offsetX: 5, offsetY: 10 });
      this.world.addComponent(enemy, "Attack", { isAttacking: false, cooldown: 0, cooldownMax: 0.8, damage: 10, range: 90, knockbackX: 140, knockbackY: -90 });
      this.world.addComponent(enemy, "Hitbox", { active: false, damage: 10, knockbackX: 140, knockbackY: -90, hitOnce: true, hitEntities: [], offsetX: 50, offsetY: 30, width: 60, height: 80, duration: 0.16, elapsed: 0 });
      this.world.addComponent(enemy, "AIState", { state: "idle", target: null, stateTime: 0, alertLevel: 0 });
      this.world.addComponent(enemy, "Perception", { sightRange: 450, peripheralRange: 240, hearingRange: 200, fov: Math.PI * 0.75, loseSightTime: 1.5 });
      this.world.addComponent(enemy, "BehaviorProfile", { behavior: "chase", attackRange: 90, chaseRange: 480, idleDuration: 0.2 });
      this.world.addComponent(enemy, "CombatStats", { moveSpeed: 340, runSpeed: 420, attackCooldown: 0.8, attackWindup: 0.15, attackDuration: 0.16, attackRange: 90, damage: 10, knockbackX: 140, knockbackY: -90, staggerThreshold: 6, staggerDuration: 0.2 });
    }
    // 放置傷害區域作為挑戰
    const hazard = this.world.createEntity();
    this.world.addComponent(hazard, "Transform", { x: t.x - 60, y: t.y + 40, z: 0 });
    this.world.addComponent(hazard, "AABB", { w: 260, h: 30, ox: 0, oy: 0 });
    this.world.addComponent(hazard, "Renderable", { color: "rgba(255,120,80,0.35)", opacity: 0.8 });
    this.world.addComponent(hazard, "Hitbox", {
      active: true,
      damage: 10,
      knockbackX: 0,
      knockbackY: -200,
      hitOnce: false,
      hitEntities: [],
      offsetX: 0,
      offsetY: 0,
      width: 260,
      height: 30,
      duration: 3.0,
      elapsed: 0,
    });
    this.world.addComponent(hazard, "Vfx", { lifetime: 3.0, fade: true, initial: 3.0 });
  }
  giveFragments(amount) {
    this.world.fragments = (this.world.fragments || 0) + amount;
  }

  heal(amount) {
    const h = this.world.getComponent(this.world.player, "Health");
    if (h) h.current = Math.min(h.max, h.current + amount);
  }

  freeArtifact() {
    if (this.world.artifactMenu && !this.world.artifactMenu.visible) {
      const opts =
        this.world.systems?.celebration?.randomArtifacts?.call(this.world.systems.celebration) || [];
      this.world.artifactMenu.show(
        opts,
        (opt) => this.world.systems?.celebration?.applyArtifact?.call(this.world.systems.celebration, opt),
        this.world.fragments || 0,
        0
      );
    }
  }

  buffPlayer() {
    const buff = this.world.getComponent(this.world.player, "BuffState");
    if (buff) {
      buff.active = true;
      buff.elapsed = 0;
      buff.duration = 6;
      buff.speedMultiplier = 1.2;
      buff.attackSpeedMultiplier = 0.85;
    }
  }
}
