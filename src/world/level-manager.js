// src/world/level-manager.js
// Centralized level loading and respawn logic
const DEFAULT_LEVELS = [
  {
    id: "proc-plains",
    name: "Procedural Plains",
    procedural: { theme: "plains", width: 64, height: 24, seed: 101 },
  },
  {
    id: "proc-ruins",
    name: "Procedural Ruins",
    procedural: { theme: "ruins", width: 64, height: 24, seed: 202 },
  },
  {
    id: "proc-clouds",
    name: "Procedural Clouds",
    procedural: { theme: "clouds", width: 64, height: 24, seed: 303 },
  },
  {
    id: "demo-ground-sky",
    name: "Demo: Ground + Sky (Static)",
    ground: "assets/levels/ground-layer.json",
    sky: "assets/levels/sky-layer.json",
    spawnTile: { x: 16, y: 17 },
  },
  {
    id: "level1",
    name: "Level 1 Plains (Static)",
    ground: "assets/levels/Level1.json",
    sky: "assets/levels/skylevel1.json",
    spawnTile: { x: 8, y: 14 },
  },
  {
    id: "platform-test",
    name: "Platform Test (Static)",
    ground: "assets/levels/platformer-level1.json",
    sky: "assets/levels/skylevel2.json",
    spawnTile: { x: 10, y: 12 },
  },
];

export class LevelManager {
  constructor(tilemapLoader, infiniteWorld, generator, options = {}) {
    this.tilemapLoader = tilemapLoader;
    this.infiniteWorld = infiniteWorld;
    this.generator = generator;
    this.levels = options.levels || DEFAULT_LEVELS;
    this.currentLevelId = null;
    this.world = null;
    this.systems = null;
    this.lastSpawn = null;
    this.playerHeight = options.playerHeight || 180;
  }

  setWorld(world, systems) {
    this.world = world;
    this.systems = systems;
  }

  getLevels() {
    return this.levels;
  }

  getCurrentLevel() {
    return this.levels.find((lvl) => lvl.id === this.currentLevelId) || null;
  }

  getNextLevelId() {
    if (!this.levels.length) return null;
    const idx = this.levels.findIndex((lvl) => lvl.id === this.currentLevelId);
    const nextIdx = idx >= 0 ? (idx + 1) % this.levels.length : 0;
    return this.levels[nextIdx].id;
  }

  getSpawnPosition() {
    return this.lastSpawn;
  }

  async loadLevel(levelId, options = {}) {
    const level = this.levels.find((lvl) => lvl.id === levelId);
    if (!level) throw new Error(`Level not found: ${levelId}`);

    let groundMap = null;
    let skyMap = null;
    let spawn = null;
    let meta = null;

    if (level.procedural) {
      if (!this.generator) throw new Error("Procedural generator not configured");
      const result = this.generator.generate({
        ...level.procedural,
        playerHeight: this.playerHeight,
      });
      groundMap = result.groundMap;
      skyMap = result.skyMap;
      spawn = result.spawn;
      meta = result.meta;
    } else {
      const groundPromise = level.ground
        ? this.tilemapLoader.loadMap(level.ground)
        : null;
      const skyPromise = level.sky
        ? this.tilemapLoader.loadMap(level.sky)
        : null;
      [groundMap, skyMap] = await Promise.all([groundPromise, skyPromise]);
    }

    if (groundMap) {
      this.infiniteWorld.setGroundMap(groundMap);
      if (this.systems?.render) {
        this.systems.render.tileMap = groundMap;
      }
      if (this.systems?.camera) {
        this.systems.camera.setTileMap(groundMap);
      }
    }

    if (skyMap) {
      this.infiniteWorld.setSkyMap(skyMap);
    }

    const spawnPoint = spawn || this.computeSpawn(level, groundMap);
    this.lastSpawn = spawnPoint;
    this.currentLevelId = levelId;

    if (options.respawnPlayer !== false) {
      this.respawnPlayer(spawnPoint);
    }

    this.emitLevelChanged(level, spawnPoint, meta);
    return { level, groundMap, skyMap, spawn: spawnPoint, meta };
  }

  computeSpawn(level, groundMap) {
    if (level.spawn) return level.spawn;
    const tileSize = groundMap?.tileSize || 32;
    const width = groundMap?.width || 32;
    const height = groundMap?.height || 20;
    const tileX =
      level.spawnTile?.x ?? Math.floor(width / 2);
    const tileY =
      level.spawnTile?.y ?? Math.max(0, height - 3);

    return {
      x: tileX * tileSize,
      y: tileY * tileSize - this.playerHeight,
    };
  }

  respawnPlayer(spawnOverride) {
    if (!this.world?.player) return;
    const spawn = spawnOverride || this.lastSpawn;
    if (!spawn) return;

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

    if (this.systems?.camera) {
      this.systems.camera.firstUpdate = true;
    }
  }

  emitLevelChanged(level, spawn, meta) {
    try {
      window.dispatchEvent(
        new CustomEvent("level-changed", {
          detail: {
            level,
            spawn,
            current: this.currentLevelId,
            meta,
          },
        })
      );
    } catch (e) {
      // No-op if window is unavailable
    }
  }
}
