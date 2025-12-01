// src/systems/spawn-system.js
// Spawns NPCs dynamically around the player to keep density across ground and air.
import {
  createGroundPatrol,
  createFlyingCharger,
  createVerticalSentinel,
} from "../entities/enemy-variants.js";

export class SpawnSystem {
  constructor(world, infiniteWorld, options = {}) {
    this.world = world;
    this.infiniteWorld = infiniteWorld;
    this.timer = 0;
    this.interval = options.interval ?? 0.5;
    this.spawnRadius = options.spawnRadius ?? 900;
    this.spawnAhead = options.spawnAhead ?? [280, 900];
    this.safeRadius = options.safeRadius ?? 180;
    this.targetGround = options.targetGround ?? 5;
    this.targetAir = options.targetAir ?? 4;
    this.verticalStep = options.verticalStep ?? 550; // height per sky band
    this.airPerBand = options.airPerBand ?? 3;
    this.bandLookahead = options.bandLookahead ?? 1;
  }

  update(dt) {
    if (this.world.celebration?.active) return;
    if (!this.world.player) return;
    this.timer += dt;
    if (this.timer < this.interval) return;
    this.timer = 0;

    const playerT = this.world.getComponent(this.world.player, "Transform");
    if (!playerT) return;

    const enemyIds = this.world.query(["Team", "AIState"]);
    const nearby = enemyIds.filter((id) => {
      const t = this.world.getComponent(id, "Transform");
      if (!t) return false;
      const dx = t.x - playerT.x;
      return Math.abs(dx) < this.spawnRadius;
    });

    const groundCount = nearby.filter((id) => {
      const phys = this.world.getComponent(id, "PhysicsBody");
      return phys ? phys.gravityScale > 0 : true;
    }).length;
    if (groundCount < this.targetGround) {
      this.spawnGroundNPC(playerT);
    }

    this.ensureAirBands(playerT, nearby);
  }

  ensureAirBands(playerT, enemies) {
    // Altitude above ground (groundLayerTop assumed 0); y decreases when going up
    const altitude = Math.max(0, -playerT.y);
    const bandIndex = Math.floor(altitude / this.verticalStep);
    const maxNew = 3;
    let spawned = 0;

    for (let b = bandIndex - this.bandLookahead; b <= bandIndex + this.bandLookahead; b++) {
      if (b < 0) continue; // only sky bands
      const bandMinY = -(b + 1) * this.verticalStep;
      const bandMaxY = -b * this.verticalStep;
      const airInBand = enemies.filter((id) => {
        const phys = this.world.getComponent(id, "PhysicsBody");
        if (phys && phys.gravityScale > 0) return false;
        const t = this.world.getComponent(id, "Transform");
        if (!t) return false;
        return t.y <= bandMaxY && t.y >= bandMinY;
      }).length;

      const needed = this.airPerBand - airInBand;
      for (let i = 0; i < needed && spawned < maxNew; i++, spawned++) {
        if (Math.random() < 0.5) {
          this.spawnFlyingNPC(playerT, b);
        } else {
          this.spawnSentinelNPC(playerT, b);
        }
      }
    }
  }

  spawnGroundNPC(playerT) {
    const x = playerT.x + this.randRange(this.spawnAhead[0], this.spawnAhead[1]) * (Math.random() < 0.2 ? -1 : 1);
    if (Math.abs(x - playerT.x) < this.safeRadius) return;
    const y = this.getGroundY(x, 120) ?? playerT.y;
    createGroundPatrol(this.world, { x, y, patrolPoints: [{ x: x - 60, y }, { x: x + 60, y }] });
  }

  spawnFlyingNPC(playerT, bandIndex = null) {
    const x = playerT.x + this.randRange(this.spawnAhead[0], this.spawnAhead[1]);
    if (Math.abs(x - playerT.x) < this.safeRadius) return;
    const baseY = bandIndex !== null ? -(bandIndex * this.verticalStep + this.verticalStep * 0.5) : playerT.y;
    const y = baseY + this.randRange(-80, 80);
    createFlyingCharger(this.world, { x, y, range: 420, speed: 240 });
  }

  spawnSentinelNPC(playerT, bandIndex = null) {
    const x = playerT.x + this.randRange(200, 600) * (Math.random() < 0.5 ? -1 : 1);
    if (Math.abs(x - playerT.x) < this.safeRadius) return;
    const baseY = bandIndex !== null ? -(bandIndex * this.verticalStep + this.verticalStep * 0.5) : playerT.y;
    const y = baseY + this.randRange(-60, 60);
    createVerticalSentinel(this.world, { x, y, range: 220, speed: 160 });
  }

  getGroundY(worldX, entityHeight = 120) {
    const map = this.infiniteWorld?.groundMap;
    if (!map) return null;
    const tileSize = map.tileSize;
    const tileX = Math.floor(worldX / tileSize);
    // Wrap horizontally
    const wrappedX = ((tileX % map.width) + map.width) % map.width;
    let surfaceY = null;
    for (let ty = 0; ty < map.height; ty++) {
      if (map.solids[ty][wrappedX]) {
        surfaceY = ty * tileSize;
        break;
      }
    }
    if (surfaceY === null) return null;
    return surfaceY - entityHeight;
  }

  randRange(min, max) {
    return min + Math.random() * (max - min);
  }
}
