// src/systems/celebration-system.js
// 慶祝模式：平坦地圖、壁紙切換、分身派對、煙火
import { CELEBRATION, GOAL } from "../config.js";
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

    this.fireworkTimer -= dt;
    if (this.fireworkTimer <= 0) {
      this.fireworkTimer = CELEBRATION.fireworkInterval || 1.2;
      this.spawnFireworks();
    }
  }

  enter(nextLevelId) {
    this.nextLevelId = nextLevelId;
    this.active = true;
    this.fireworkTimer = CELEBRATION.fireworkInterval || 1.2;
    this.cleanWorld();
    this.buildFlatWorld();
    this.respawnPlayerFlat();
    this.world.celebration = { active: true, wallpaperHeld: false };
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
}
