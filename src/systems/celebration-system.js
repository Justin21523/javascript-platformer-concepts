// src/systems/celebration-system.js
// 慶祝模式：平坦地圖、壁紙切換、分身派對、煙火
import { CELEBRATION, GOAL, ARTIFACT } from "../config.js";
import { TileMap } from "../world/tiles.js";

export class CelebrationSystem {
  constructor(world, levelManager, parallaxSystem) {
    this.world = world;
    this.levelManager = levelManager;
    this.parallaxSystem = parallaxSystem;
    this.active = false;
    this.nextLevelId = null;
    this.wallpaperHeld = false;
    this.cloneLast = false;
    this.fireworkTimer = 0;
    this.flatMap = null;
    this.confettiTimer = 0;
    this.balloonTimer = 0;
    this.musicOn = false;
  }

  update(dt) {
    if (!this.active || !this.world.player) return;
    const input = this.world.getComponent(this.world.player, "Input");
    if (!input) return;

    this.wallpaperHeld = Boolean(input.partyWallpaper);
    this.world.celebration.wallpaperHeld = this.wallpaperHeld;
    const clonePressed = Boolean(input.partyClone);
    if (clonePressed && !this.cloneLast) {
      this.spawnClones();
    }
    this.cloneLast = clonePressed;

    if (input.partyExit) {
      this.exitCelebration();
      return;
    }

    if (input.partyConfetti) {
      this.spawnConfetti(16);
    }

    if (input.partyMusic) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sfx", { detail: { type: "party-music-toggle" } }));
      }
      this.musicOn = !this.musicOn;
    }

    // 每進入慶祝時，提供神器三選一
    if (this.world.artifactMenu && !this.world.artifactMenu.visible) {
      const opts = this.randomArtifacts();
      const cost = ARTIFACT.fragmentCost || 3;
      const frags = this.world.fragments || 0;
      this.world.artifactMenu.show(
        opts,
        (opt, spent) => {
          if (spent && spent > 0) {
            this.world.fragments = Math.max(0, this.world.fragments - spent);
          }
          this.applyArtifact(opt);
        },
        frags,
        cost
      );
    }

    this.fireworkTimer -= dt;
    if (this.fireworkTimer <= 0) {
      this.fireworkTimer = CELEBRATION.fireworkInterval || 1.2;
      this.spawnFireworks();
    }

    this.confettiTimer -= dt;
    if (this.confettiTimer <= 0) {
      this.confettiTimer = CELEBRATION.confettiInterval || 1.6;
      this.spawnConfetti();
    }

    this.balloonTimer -= dt;
    if (this.balloonTimer <= 0) {
      this.balloonTimer = CELEBRATION.balloonInterval || 2.4;
      this.spawnBalloon();
    }
  }

  enter(nextLevelId) {
    this.nextLevelId = nextLevelId;
    this.active = true;
    this.fireworkTimer = CELEBRATION.fireworkInterval || 1.2;
    this.confettiTimer = CELEBRATION.confettiInterval || 1.6;
    this.balloonTimer = CELEBRATION.balloonInterval || 2.4;
    this.musicOn = false;
    this.cleanWorld();
    this.buildFlatWorld();
    this.respawnPlayerFlat();
    this.world.celebration = { active: true, wallpaperHeld: false };
    if (this.world.sceneOverlay) {
      this.world.sceneOverlay.text = "慶祝開始！盡情狂歡吧！";
      this.world.sceneOverlay.timer = 1.5;
    }
  }

  exitCelebration() {
    if (!this.active) return;
    this.active = false;
    this.world.celebration = { active: false, wallpaperHeld: false };
    const target = this.nextLevelId || this.levelManager.getNextLevelId();
    if (target) {
      this.levelManager.loadLevel(target, { respawnPlayer: true });
    }
  }

  cleanWorld() {
    // 移除玩家以外的實體（保留全域系統用的特殊暫存如 portal）
    for (const [entityId] of this.world.entityMasks) {
      if (entityId === this.world.player) continue;
      this.world.destroyEntity(entityId);
    }
  }

  buildFlatWorld() {
    const tileSize = this.world.tilemapLoader?.tileSize || 32;
    const width = CELEBRATION.groundWidth || 48;
    const height = CELEBRATION.groundHeight || 14;
    const groundTile = CELEBRATION.groundTile || 1;
    const map = new TileMap(width, height, tileSize);
    map.tileset = this.world.tilemapLoader?.tileset || null;
    map.infiniteHorizontal = true;
    map.infiniteVertical = false;

    // 填底層為地面
    for (let x = 0; x < width; x++) {
      for (let y = height - 2; y < height; y++) {
        map.tiles[y][x] = groundTile;
        map.solids[y][x] = true;
      }
    }
    map.groundLevel = height - 2;

    this.world.infiniteWorld.setGroundMap(map);
    this.world.infiniteWorld.setSkyMap(map); // recycle for backdrop continuity
    if (this.world.systems?.render) {
      this.world.systems.render.tileMap = map;
    }
    if (this.world.systems?.camera) {
      this.world.systems.camera.setTileMap(map);
    }
    this.flatMap = map;
  }

  respawnPlayerFlat() {
    const tileSize = this.flatMap?.tileSize || 32;
    const groundY = (this.flatMap?.groundLevel ?? (CELEBRATION.groundHeight - 2)) * tileSize;
    const spawn = {
      x: tileSize * 4,
      y: groundY - (this.levelManager?.playerHeight ?? 180),
    };
    const t = this.world.getComponent(this.world.player, "Transform");
    const v = this.world.getComponent(this.world.player, "Velocity");
    if (t) {
      t.x = spawn.x;
      t.y = spawn.y;
    }
    if (v) {
      v.vx = 0;
      v.vy = 0;
    }
    if (this.world.systems?.camera) {
      this.world.systems.camera.firstUpdate = true;
    }
  }

  spawnClones() {
    const player = this.world.player;
    const t = this.world.getComponent(player, "Transform");
    const sprite = this.world.getComponent(player, "Sprite");
    const aabb = this.world.getComponent(player, "AABB");
    const renderable = this.world.getComponent(player, "Renderable");
    if (!t) return;

    const count = CELEBRATION.cloneBurst || 3;
    for (let i = 0; i < count; i++) {
      const clone = this.world.createEntity();
      this.world.addComponent(clone, "Transform", {
        x: t.x + (Math.random() - 0.5) * 80,
        y: t.y + (Math.random() - 0.5) * 40,
        z: 0,
      });
      if (sprite) {
        this.world.addComponent(clone, "Sprite", { ...sprite });
      }
      if (aabb) {
        this.world.addComponent(clone, "AABB", { ...aabb });
      }
      this.world.addComponent(clone, "Renderable", {
        color: renderable?.color || "rgba(255,255,255,0.8)",
        opacity: 0.85,
      });
      this.world.addComponent(clone, "Velocity", {
        vx: (Math.random() - 0.5) * 360,
        vy: -80 + Math.random() * 160,
      });
      const life =
        CELEBRATION.cloneLifetime[0] +
        Math.random() *
          Math.max(0.2, CELEBRATION.cloneLifetime[1] - CELEBRATION.cloneLifetime[0]);
      this.world.addComponent(clone, "Projectile", { lifetime: life, gravity: 0 });
      this.world.addComponent(clone, "Vfx", { lifetime: life, fade: true, initial: life });
    }
  }

  spawnFireworks() {
    const player = this.world.player;
    const t = this.world.getComponent(player, "Transform");
    if (!t) return;
    const vfxCount = this.world.query(["Vfx"]).length;
    if (vfxCount > 320) return;
    for (let i = 0; i < 5; i++) {
      const fx = this.world.createEntity();
      const size = 20 + Math.random() * 20;
      const vx = (Math.random() - 0.5) * 200;
      const vy = -220 - Math.random() * 120;
      this.world.addComponent(fx, "Transform", { x: t.x + (Math.random() - 0.5) * 120, y: t.y - 40, z: 0 });
      this.world.addComponent(fx, "AABB", { w: size, h: size, ox: 0, oy: 0 });
      this.world.addComponent(fx, "Renderable", { color: this.randomFireColor(), opacity: 0.9 });
      this.world.addComponent(fx, "Velocity", { vx, vy });
      this.world.addComponent(fx, "Projectile", { lifetime: 1.8, gravity: 420 });
      this.world.addComponent(fx, "Vfx", { lifetime: 1.8, fade: true, initial: 1.8 });
    }
  }

  randomFireColor() {
    const palette = [
      "rgba(255,200,120,0.9)",
      "rgba(120,200,255,0.9)",
      "rgba(180,120,255,0.9)",
      "rgba(120,255,200,0.9)",
      "rgba(255,120,180,0.9)",
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  spawnConfetti(count = 10) {
    const player = this.world.player;
    const t = this.world.getComponent(player, "Transform");
    if (!t) return;
    const vfxCount = this.world.query(["Vfx"]).length;
    if (vfxCount > 280) return;
    for (let i = 0; i < count; i++) {
      const fx = this.world.createEntity();
      const size = 8 + Math.random() * 6;
      const vx = (Math.random() - 0.5) * 180;
      const vy = -260 - Math.random() * 120;
      this.world.addComponent(fx, "Transform", {
        x: t.x + (Math.random() - 0.5) * 200,
        y: t.y - 40,
        z: 0,
      });
      this.world.addComponent(fx, "AABB", { w: size, h: size, ox: 0, oy: 0 });
      this.world.addComponent(fx, "Renderable", {
        color: this.randomFireColor(),
        opacity: 0.95,
        renderDuringVoid: true,
      });
      this.world.addComponent(fx, "Velocity", { vx, vy });
      this.world.addComponent(fx, "Projectile", { lifetime: 1.4, gravity: 520 });
      this.world.addComponent(fx, "Vfx", { lifetime: 1.4, fade: true, initial: 1.4 });
    }
  }

  spawnBalloon() {
    const player = this.world.player;
    const t = this.world.getComponent(player, "Transform");
    if (!t) return;
    const balloon = this.world.createEntity();
    const size = 24 + Math.random() * 12;
    const color = this.randomFireColor();
    this.world.addComponent(balloon, "Transform", {
      x: t.x + (Math.random() - 0.5) * 180,
      y: t.y + 20,
      z: 0,
    });
    this.world.addComponent(balloon, "AABB", { w: size, h: size * 1.2, ox: 0, oy: 0 });
    this.world.addComponent(balloon, "Renderable", { color, opacity: 0.8, renderDuringVoid: true });
    this.world.addComponent(balloon, "Velocity", { vx: (Math.random() - 0.5) * 40, vy: -60 - Math.random() * 40 });
    this.world.addComponent(balloon, "Projectile", { lifetime: 4, gravity: -30 });
    this.world.addComponent(balloon, "Vfx", { lifetime: 4, fade: true, initial: 4 });
  }

  randomArtifacts() {
    const base = [
      {
        name: "速攻",
        desc: "攻擊冷卻 -20%，移速 +10%",
        rarity: "common",
        apply: (world) => {
          const player = world.player;
          const atk = world.getComponent(player, "Attack");
          const phys = world.getComponent(player, "PhysicsBody");
          if (atk) atk.cooldownMax *= 0.8;
          if (phys) phys.maxSpeedX *= 1.1;
        },
      },
      {
        name: "燃焰尾跡",
        desc: "Hyperdrive 尾焰傷害 +30%，擊退增加並附灼燒",
        rarity: "common",
        apply: (world) => {
          if (world.hyperdrive) {
            world.hyperdrive.flameBoost = 1.3;
          }
          world.flameBurn = true;
        },
      },
      {
        name: "完美格檔",
        desc: "盾牌格檔成功時，反擊並造成火花傷害",
        rarity: "common",
        apply: (world) => {
          world.blockCounter = true;
        },
      },
      {
        name: "元素星爆",
        desc: "星爆彈幕數量 +4，持續時間 +20%",
        rarity: "common",
        apply: (world) => {
          world.starburstBoost = true;
        },
      },
      {
        name: "持久 Hyper",
        desc: "Hyperdrive 時間 +2 秒",
        rarity: "rare",
        apply: (world) => {
          world.hyperdriveDurationBoost = (world.hyperdriveDurationBoost || 0) + 2;
        },
      },
      {
        name: "攻速加成",
        desc: "攻擊冷卻 -25%",
        rarity: "common",
        apply: (world) => {
          world.passives.attackCooldownMult = (world.passives.attackCooldownMult || 1) * 0.75;
          this.applyAttackSpeed(world);
        },
      },
      {
        name: "移速狂奔",
        desc: "移動上限 +20%",
        rarity: "common",
        apply: (world) => {
          world.passives.moveSpeedMult = (world.passives.moveSpeedMult || 1) * 1.2;
          this.applyMoveSpeed(world);
        },
      },
      {
        name: "擊殺回血",
        desc: "擊殺敵人回復 8 HP",
        rarity: "rare",
        apply: (world) => {
          world.healOnKill = (world.healOnKill || 0) + 8;
        },
      },
      {
        name: "雙倍碎片",
        desc: "擊殺掉落碎片 +1",
        rarity: "common",
        apply: (world) => {
          world.fragmentBonus = (world.fragmentBonus || 0) + 1;
        },
      },
      {
        name: "雙跳",
        desc: "獲得二段跳能力",
        rarity: "rare",
        apply: (world) => {
          world.passives.doubleJump = true;
        },
      },
      {
        name: "落地震擊",
        desc: "從高處落地時造成範圍傷害",
        rarity: "rare",
        apply: (world) => {
          world.passives.groundSlam = true;
        },
      },
      {
        name: "冰寒彈幕",
        desc: "投射物附帶緩速，星爆改為冰元素",
        rarity: "epic",
        apply: (world) => {
          world.passives.element = "ice";
        },
      },
      {
        name: "雷霆連鎖",
        desc: "投射物可鏈擊額外目標",
        rarity: "epic",
        apply: (world) => {
          world.passives.chain = true;
        },
      },
    ];
    // 按稀有度權重抽 3 個
    const picks = [];
    const rareChance = ARTIFACT.rareChance || 0.2;
    const epicChance = ARTIFACT.epicChance || 0.05;
    for (let i = 0; i < 3; i++) {
      const roll = Math.random();
      const pool =
        roll < epicChance
          ? base.filter((b) => b.rarity === "epic")
          : roll < rareChance
          ? base.filter((b) => b.rarity === "rare")
          : base.filter((b) => b.rarity === "common");
      if (pool.length === 0) continue;
      const opt = pool[Math.floor(Math.random() * pool.length)];
      picks.push(opt);
    }
    return picks;
  }

  applyArtifact(opt) {
    if (opt?.apply) {
      opt.apply(this.world);
      if (!this.world.artifacts) this.world.artifacts = [];
      this.world.artifacts.push(opt.name);
    }
  }

  applyAttackSpeed(world) {
    const player = world.player;
    const atk = world.getComponent(player, "Attack");
    const stats = world.getComponent(player, "CombatStats");
    const mult = world.passives.attackCooldownMult || 1;
    if (atk) {
      atk.cooldownMax *= mult;
      atk.windup *= mult;
      atk.recovery *= mult;
    }
    if (stats) {
      stats.attackCooldown *= mult;
      stats.attackWindup *= mult;
      stats.attackDuration *= mult;
    }
  }

  applyMoveSpeed(world) {
    const player = world.player;
    const phys = world.getComponent(player, "PhysicsBody");
    const stats = world.getComponent(player, "CombatStats");
    const mult = world.passives.moveSpeedMult || 1;
    if (phys) {
      phys.maxSpeedX *= mult;
    }
    if (stats) {
      stats.moveSpeed *= mult;
      stats.runSpeed *= mult;
    }
  }
}
