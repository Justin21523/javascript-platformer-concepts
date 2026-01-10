// src/world/procedural-level-generator.js
// Lightweight procedural generator that assembles ground, platforms, obstacles, and decor using existing tileset
import { TileMap } from "./tiles.js";
import { clamp } from "../core/math.js";
import { COLLISION } from "../config.js";

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed) {
  if (typeof seed === "number") return seed >>> 0;
  const str = String(seed);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function choice(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const THEMES = {
  plains: {
    groundTop: 1,
    groundMid: 2,
    groundBottom: 3,
    fill: 7,
    platform: { left: 4, mid: 5, right: 6 },
    cloud: 18,
    blocks: [11, 12, 14],
    walls: [15, 16, 17],
    decorBg: [8, 9],
    decorFg: [10, 13],
    label: "Plains",
  },
  ruins: {
    groundTop: 14,
    groundMid: 14,
    groundBottom: 14,
    fill: 11,
    platform: { left: 15, mid: 16, right: 17 },
    cloud: 18,
    blocks: [11, 12],
    walls: [15, 16, 17],
    decorBg: [8, 9],
    decorFg: [10, 13],
    label: "Ruins",
  },
  clouds: {
    groundTop: 18,
    groundMid: 18,
    groundBottom: 18,
    fill: 18,
    platform: { left: 4, mid: 5, right: 6 },
    cloud: 18,
    blocks: [11, 12],
    walls: [15, 16, 17],
    decorBg: [8, 9],
    decorFg: [13],
    label: "Clouds",
  },
};

export class ProceduralLevelGenerator {
  constructor(tilemapLoader) {
    this.tilemapLoader = tilemapLoader;
    this.cachedTilesetTheme = null;
    this.objectImages = [];
    this.preloadObjects();
    this.eventKinds = ["reward", "trap", "trial"];
  }

  preloadObjects() {
    const base = "assets/freetileset/png/Object";
    this.objectImages = [
      `${base}/Bush (1).png`,
      `${base}/Bush (2).png`,
      `${base}/Bush (3).png`,
      `${base}/Bush (4).png`,
      `${base}/Crate.png`,
      `${base}/Mushroom_1.png`,
      `${base}/Mushroom_2.png`,
      `${base}/Sign_1.png`,
      `${base}/Sign_2.png`,
      `${base}/Stone.png`,
      `${base}/Tree_1.png`,
      `${base}/Tree_2.png`,
      `${base}/Tree_3.png`,
    ];
  }

  buildThemeFromTileset() {
    if (this.cachedTilesetTheme) return this.cachedTilesetTheme;
    const tiles = this.tilemapLoader?.tileset?.tiles || {};
    const byType = {};
    for (const [gid, data] of Object.entries(tiles)) {
      const type = data.type || "decoration";
      if (!byType[type]) byType[type] = [];
      byType[type].push(Number(gid));
    }

    const pickAny = (types, fallback) => {
      for (const t of types) {
        if (byType[t]?.length) return byType[t];
      }
      return fallback;
    };

    const theme = {
      label: "Tileset Mix",
      groundTop: pickAny(["ground_top"], [1]),
      groundMid: pickAny(["ground_middle"], [2]),
      groundBottom: pickAny(["ground_bottom"], [3]),
      fill: pickAny(["ground_fill"], [7]),
      platform: {
        left: pickAny(["platform_left"], [4]),
        mid: pickAny(["platform_middle"], [5]),
        right: pickAny(["platform_right"], [6]),
      },
      cloud: pickAny(["cloud_platform"], [18]),
      blocks: [
        ...(byType["block_stone"] || []),
        ...(byType["block_wood"] || []),
        ...(byType["brick"] || []),
      ],
      walls: [
        ...(byType["wall_left"] || []),
        ...(byType["wall_middle"] || []),
        ...(byType["wall_right"] || []),
      ],
      decorBg: [...(byType["decoration"] || [])],
      decorFg: [
        ...(byType["grass_decor"] || []),
        ...(byType["decoration_fg"] || []),
        ...(byType["decoration"] || []).filter((gid) => (tiles[gid]?.layer || tiles[gid]?.layer === "foreground")),
      ],
    };

    // Use first element if arrays are present
    const pickOne = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : 0);
    theme.groundTop = pickOne(theme.groundTop);
    theme.groundMid = pickOne(theme.groundMid);
    theme.groundBottom = pickOne(theme.groundBottom);
    theme.fill = pickOne(theme.fill);
    theme.platform.left = pickOne(theme.platform.left);
    theme.platform.mid = pickOne(theme.platform.mid);
    theme.platform.right = pickOne(theme.platform.right);
    theme.cloud = pickOne(theme.cloud);

    // Ensure decor arrays are not empty
    if (!theme.decorBg.length) theme.decorBg = [8, 9].filter((g) => tiles[g]);
    if (!theme.decorFg.length) theme.decorFg = [10, 13].filter((g) => tiles[g]);
    if (!theme.blocks.length) theme.blocks = [11, 12, 14].filter((g) => tiles[g]);
    if (!theme.walls.length) theme.walls = [15, 16, 17].filter((g) => tiles[g]);

    this.cachedTilesetTheme = theme;
    return theme;
  }

  generate(options = {}) {
    const seed = options.seed ?? Date.now();
    const rand = mulberry32(hashSeed(seed));
    const theme =
      THEMES[options.theme] ||
      (options.theme === "tileset" ? this.buildThemeFromTileset() : null) ||
      this.buildThemeFromTileset() ||
      THEMES.plains;
    const width = options.width ?? 64;
    const height = options.height ?? 24;
    const segments = options.segments ?? 1;
    const totalWidth = width * segments;
    const tileSize = this.tilemapLoader?.tileSize || COLLISION.TILE_SIZE;
    const playerHeight = options.playerHeight ?? 180;

    const groundMap = new TileMap(totalWidth, height, tileSize);
    groundMap.tileset = this.tilemapLoader?.tileset || null;
    groundMap.infiniteHorizontal = true;
    groundMap.infiniteVertical = false;
    groundMap.groundLevel = height - 1;

    const heightmap = this.buildHeightmap(totalWidth, height, rand);
    const features = [];
    const restZones = this.buildRestZones(heightmap, width, segments);
    this.applySegmentFeatures(heightmap, width, segments, rand, features);
    const spawnTile = this.pickSpawnTile(heightmap);

    this.paintGround(groundMap, heightmap, theme);
    this.addPlatforms(groundMap, heightmap, rand, theme, spawnTile);
    this.addCloudPlatforms(groundMap, heightmap, rand, theme, spawnTile);
    this.addPillars(groundMap, heightmap, rand, theme, spawnTile);
    this.decorate(groundMap, heightmap, rand, theme);
    this.placeVerticalPlatforms(groundMap, heightmap, rand, theme, features);
    const { decor, events } = this.placeObjects(groundMap, heightmap, rand);
    const goalY = this.pickGoalHeight(spawnTile, heightmap, tileSize, features);

    const spawn = this.buildSpawnPoint(spawnTile, tileSize, playerHeight);
    this.carveSpawnCorridor(groundMap, spawnTile, 5, 8);

    const skyMap = this.generateSkyLayer(width, height, rand, theme, tileSize);

    return {
      groundMap,
      skyMap,
      spawn,
      meta: { seed, theme: theme.label, decorImages: decor, eventSpots: events, restZones, goalY, features },
    };
  }

  buildHeightmap(width, height, rand) {
    const minH = Math.floor(height * 0.45);
    const maxH = height - 3;
    const heights = [];
    let h = maxH - 1;
    let x = 0;
    while (x < width) {
      const segLen = 3 + Math.floor(rand() * 8); // 3..10
      const delta = choice(rand, [-1, 0, 0, 0, 1]); // smoother
      h = clamp(h + delta, minH, maxH);
      for (let i = 0; i < segLen && x < width; i++, x++) {
        heights[x] = h;
      }
    }
    return heights;
  }

  paintGround(map, heights, theme) {
    for (let x = 0; x < map.width; x++) {
      const surface = heights[x];
      for (let y = surface; y < map.height; y++) {
        if (y === surface) {
          this.place(map, x, y, theme.groundTop, true);
        } else if (y === map.height - 1) {
          this.place(map, x, y, theme.groundBottom, true);
        } else if (y === surface + 1) {
          this.place(map, x, y, theme.groundMid, true);
        } else {
          this.place(map, x, y, theme.fill, true);
        }
      }
    }
  }

  addPlatforms(map, heights, rand, theme, spawnTile) {
    const count = Math.floor(map.width / 4);
    for (let i = 0; i < count; i++) {
      const len = 2 + Math.floor(rand() * 4); // 2..5
      const startX = Math.floor(rand() * (map.width - len));
      if (spawnTile && Math.abs(startX - spawnTile.x) < 4) continue; // keep spawn clear
      const base = heights[startX] ?? heights[0];
      const elev = 3 + Math.floor(rand() * 6); // 3..8
      const y = clamp(base - elev, 3, map.height - 5);
      this.placePlatform(map, startX, y, len, theme.platform);
    }
  }

  addCloudPlatforms(map, heights, rand, theme, spawnTile) {
    const count = Math.floor(map.width / 6);
    for (let i = 0; i < count; i++) {
      const len = 2 + Math.floor(rand() * 3); // 2..4
      const startX = Math.floor(rand() * (map.width - len));
      if (spawnTile && Math.abs(startX - spawnTile.x) < 3) continue;
      const base = heights[startX] ?? map.height - 4;
      const elev = 8 + Math.floor(rand() * 6); // 8..13
      const y = clamp(base - elev, 2, map.height - 8);
      for (let dx = 0; dx < len; dx++) {
        this.place(map, startX + dx, y, theme.cloud, true);
      }
    }
  }

  addPillars(map, heights, rand, theme, spawnTile) {
    const count = Math.floor(map.width / 8);
    for (let i = 0; i < count; i++) {
      const x = Math.floor(rand() * map.width);
      if (spawnTile && Math.abs(x - spawnTile.x) < 3) continue;
      const surface = heights[x] ?? map.height - 4;
      const heightTiles = 2 + Math.floor(rand() * 3); // 2..4
      const block = choice(rand, theme.blocks);
      for (let dy = 1; dy <= heightTiles; dy++) {
        const y = clamp(surface - dy, 1, map.height - 2);
        this.place(map, x, y, block, true);
      }
    }
  }

  decorate(map, heights, rand, theme) {
    for (let x = 0; x < map.width; x++) {
      // Foreground grass/flowers
      if (rand() < 0.35) {
        const surface = heights[x];
        const decor = choice(rand, theme.decorFg);
        this.placeLayer(map, "foreground", x, surface - 1, decor);
      }
      // Background rocks/clouds
      if (rand() < 0.25) {
        const surface = heights[x];
        const decor = choice(rand, theme.decorBg);
        const offset = 2 + Math.floor(rand() * 3);
        this.placeLayer(map, "background", x, surface - offset, decor);
      }
    }
  }

  placeObjects(map, heights, rand) {
    const placed = [];
    const events = [];
    if (!this.objectImages.length) return placed;
    const count = Math.max(6, Math.floor(map.width / 3));
    for (let i = 0; i < count; i++) {
      const x = Math.floor(rand() * map.width);
      const surface = heights[x] ?? map.height - 2;
      const worldX = x * map.tileSize + map.tileSize * 0.2 + rand() * map.tileSize * 0.6;
      const worldY = (surface - 1) * map.tileSize;
      const imgPath = choice(rand, this.objectImages);
      placed.push({ x: worldX, y: worldY, path: imgPath });

      // 少量機率放事件點
      if (rand() < 0.1) {
        events.push({
          x: worldX + map.tileSize * 0.1,
          y: worldY - map.tileSize * 0.2,
          kind: choice(rand, this.eventKinds),
        });
      }
    }
    return { decor: placed, events };
  }

  buildRestZones(heights, baseWidth, segments) {
    const restZones = [];
    if (segments <= 1) return restZones;
    const restWidth = Math.max(8, Math.floor(baseWidth * 0.2));
    for (let s = 1; s < segments; s++) {
      const start = s * baseWidth - Math.floor(restWidth * 0.5);
      const end = start + restWidth;
      const h = heights[start] ?? heights[0] ?? heights[heights.length - 1] ?? 0;
      for (let x = start; x < end && x < heights.length; x++) {
        heights[x] = h;
      }
      restZones.push({
        startX: start * (this.tilemapLoader?.tileSize || COLLISION.TILE_SIZE),
        endX: end * (this.tilemapLoader?.tileSize || COLLISION.TILE_SIZE),
      });
    }
    return restZones;
  }

  applySegmentFeatures(heights, baseWidth, segments, rand, features) {
    for (let s = 0; s < segments; s++) {
      const start = s * baseWidth;
      const end = (s + 1) * baseWidth;
      const roll = rand();
      if (roll < 0.33) {
        // tower: slightly raise terrain and mark for vertical platforms
        for (let x = start; x < end; x++) {
          heights[x] = Math.max(3, heights[x] - 2);
        }
        features.push({ type: "tower", start, end });
      } else if (roll < 0.66) {
        // cave: lower terrain for pit/cave feel
        for (let x = start; x < end; x++) {
          heights[x] = Math.min(heights[x] + 3, heights.length ? Math.max(...heights) : heights[x]);
        }
        features.push({ type: "cave", start, end });
      } else {
        features.push({ type: "normal", start, end });
      }
    }
  }

  placeVerticalPlatforms(map, heights, rand, theme, features) {
    for (const f of features) {
      if (f.type !== "tower") continue;
      const span = f.end - f.start;
      const steps = 3 + Math.floor(rand() * 2); // 3-4 layers
      for (let i = 0; i < steps; i++) {
        const y = Math.max(2, heights[f.start] - (3 + i * 2));
        const len = Math.max(2, Math.floor(span / 6));
        const startX = f.start + Math.floor(rand() * Math.max(1, span - len - 2));
        for (let dx = 0; dx < len; dx++) {
          this.place(map, startX + dx, y, theme.platform.mid, true);
        }
      }
    }
  }

  pickGoalHeight(spawnTile, heights, tileSize, features) {
    const tower = features.find((f) => f.type === "tower");
    const cave = features.find((f) => f.type === "cave");
    if (tower) {
      const mid = Math.floor((tower.start + tower.end) * 0.5);
      const h = heights[mid] ?? spawnTile.y;
      return h * tileSize - 6 * tileSize; // high goal
    }
    if (cave) {
      const mid = Math.floor((cave.start + cave.end) * 0.5);
      const h = heights[mid] ?? spawnTile.y;
      return h * tileSize - tileSize; // low goal
    }
    return spawnTile.y * tileSize - 60;
  }

  pickSpawn(heights, tileSize, playerHeight) {
    const x = 2;
    const surface = heights[x] ?? heights[0] ?? 0;
    return {
      x: x * tileSize,
      y: surface * tileSize - playerHeight,
    };
  }

  pickSpawnTile(heights) {
    // Choose a stretch with minimal slope so the player doesn't spawn boxed in
    const window = 8;
    let bestX = 2;
    let bestScore = Infinity;

    for (let x = 1; x < heights.length - window; x++) {
      let maxH = -Infinity;
      let minH = Infinity;
      for (let i = 0; i < window; i++) {
        const h = heights[x + i];
        maxH = Math.max(maxH, h);
        minH = Math.min(minH, h);
      }
      const slope = maxH - minH;
      const score = slope * 10 + Math.abs(heights[x] - heights[0]); // flatter is better
      if (score < bestScore) {
        bestScore = score;
        bestX = x + Math.floor(window / 2);
      }
    }

    return { x: bestX, y: heights[bestX] };
  }

  buildSpawnPoint(spawnTile, tileSize, playerHeight) {
    return {
      x: spawnTile.x * tileSize,
      y: spawnTile.y * tileSize - playerHeight,
    };
  }

  carveSpawnCorridor(map, spawnTile, halfWidth = 5, heightTiles = 8) {
    if (!spawnTile) return;
    const sx = spawnTile.x;
    const topY = Math.max(1, spawnTile.y - heightTiles);
    const bottomY = spawnTile.y;

    for (let dx = -halfWidth; dx <= halfWidth; dx++) {
      const x = sx + dx;
      for (let y = topY; y <= bottomY; y++) {
        this.clear(map, x, y);
      }
    }
  }

  generateSkyLayer(width, height, rand, theme, tileSize) {
    const sky = new TileMap(width, height, tileSize);
    sky.tileset = this.tilemapLoader?.tileset || null;
    sky.infiniteHorizontal = true;
    sky.infiniteVertical = true;
    sky.groundLevel = height - 1;

    // Sparse cloud platforms and decorations
    const cloudRows = Math.max(2, Math.floor(height / 6));
    for (let i = 0; i < cloudRows; i++) {
      const y = clamp(2 + i * 3, 1, height - 3);
      const segments = 1 + Math.floor(rand() * 3);
      for (let s = 0; s < segments; s++) {
        const len = 2 + Math.floor(rand() * 4);
        const startX = Math.floor(rand() * (width - len));
        for (let dx = 0; dx < len; dx++) {
          this.place(sky, startX + dx, y, theme.cloud, true);
        }
      }
    }

    for (let x = 0; x < width; x++) {
      if (rand() < 0.2) {
        const decor = choice(rand, theme.decorBg);
        const y = 1 + Math.floor(rand() * (height - 4));
        this.placeLayer(sky, "background", x, y, decor);
      }
    }

    return sky;
  }

  place(map, x, y, gid, solid = false) {
    if (y < 0 || y >= map.height) return;
    const norm = map.normalizeCoords(x, y);
    map.layers.middleground.tiles[norm.y][norm.x] = gid;
    map.tiles[norm.y][norm.x] = gid;
    map.setSolid(norm.x, norm.y, solid);
  }

  clear(map, x, y) {
    if (y < 0 || y >= map.height) return;
    const norm = map.normalizeCoords(x, y);
    map.layers.middleground.tiles[norm.y][norm.x] = 0;
    map.layers.background.tiles[norm.y][norm.x] = 0;
    map.layers.foreground.tiles[norm.y][norm.x] = 0;
    map.tiles[norm.y][norm.x] = 0;
    map.setSolid(norm.x, norm.y, false);
  }

  placeLayer(map, layer, x, y, gid) {
    if (y < 0 || y >= map.height) return;
    const norm = map.normalizeCoords(x, y);
    if (map.layers[layer]) {
      map.layers[layer].tiles[norm.y][norm.x] = gid;
    }
  }

  placePlatform(map, startX, y, len, platformTiles) {
    for (let i = 0; i < len; i++) {
      const gid =
        i === 0
          ? platformTiles.left
          : i === len - 1
          ? platformTiles.right
          : platformTiles.mid;
      this.place(map, startX + i, y, gid, true);
    }
  }
}
