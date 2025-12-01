// src/main.js
import { World } from "./ecs/world.js";
import { InputSystem } from "./systems/input-system.js";
import { PhysicsSystem } from "./systems/physics-system.js";
import { CollisionSystem } from "./systems/collision-system.js";
import { CameraSystem } from "./systems/camera-system.js";
import { AnimationSystem } from "./systems/animation-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { ParallaxBackgroundSystem } from "./systems/parallax-background-system.js";
import { HitboxSystem } from "./systems/hitbox-system.js";
import { DamageSystem } from "./systems/damage-system.js";
import { PlayerAttackSystem } from "./systems/player-attack-system.js";
import { AISystem } from "./systems/ai-system.js";
import { MovementPatternSystem } from "./systems/movement-pattern-system.js";
import { CollectibleSystem } from "./systems/collectible-system.js";
import { SpawnSystem } from "./systems/spawn-system.js";
import { AbilitySystem } from "./systems/ability-system.js";
import { BuffSystem } from "./systems/buff-system.js";
import { ProjectileSystem } from "./systems/projectile-system.js";
import { VfxSystem } from "./systems/vfx-system.js";
import { WaveSystem } from "./systems/wave-system.js";
import { HyperdriveSystem } from "./systems/hyperdrive-system.js";
import { GoalSystem } from "./systems/goal-system.js";
import { CelebrationSystem } from "./systems/celebration-system.js";
import { VoidModeSystem } from "./systems/void-mode-system.js";
import { ShieldSystem } from "./systems/shield-system.js";
import { TilemapLoader } from "./loaders/tilemap-loader.js";
import { ActorLoader } from "./loaders/actor-loader.js";
import { InfiniteWorld } from "./world/infinite-world.js";
import { LevelManager } from "./world/level-manager.js";
import { ProceduralLevelGenerator } from "./world/procedural-level-generator.js";
import { COLLISION, RENDER, VOID_MODE } from "./config.js";
import { drawDebugOverlay, drawDebugHitboxes, drawVelocityVectors, drawAbilityHud } from "./render/overlay.js";
import { DebugConsole } from "./debug-console.js";
import { DebugPanel } from "./debug-panel.js";
import { LevelMenu } from "./ui/level-menu.js";
import { createBasicEnemy } from "./entities/enemy-basic.js";
import {
  createFlyingCharger,
  createVerticalSentinel,
  createFriendlyNpc,
} from "./entities/enemy-variants.js";
import { createCollectible } from "./entities/collectible.js";
import {
  shouldPauseUpdate,
  getScaledDeltaTime,
  profiler,
  debugLog,
  takeScreenshot,
} from "./debug.js";

// Initialize Canvas and Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set Canvas size
canvas.width = RENDER.CANVAS_WIDTH;
canvas.height = RENDER.CANVAS_HEIGHT;

// Disable image smoothing (pixel art style)
ctx.imageSmoothingEnabled = false;

// Global variables (will be initialized in async init function)
let world;
let infiniteWorld;
let systems;
let debugConsole;
let debugPanel;
let tilemapLoader;
let levelManager;
let levelMenu;
let proceduralGenerator;

/**
 * Asynchronous initialization - Load assets before starting game
 */
async function init() {
  debugLog("main", "Loading assets...");

  // Create tilemap loader and load tileset + maps
  tilemapLoader = new TilemapLoader();
  await tilemapLoader.loadTileset("assets/tileset.json");

  // Create infinite world
  infiniteWorld = new InfiniteWorld();
  proceduralGenerator = new ProceduralLevelGenerator(tilemapLoader);
  levelManager = new LevelManager(tilemapLoader, infiniteWorld, proceduralGenerator, { playerHeight: 180 });

  // Load initial level (without respawn until player exists)
  await levelManager.loadLevel("proc-plains", { respawnPlayer: false });
  debugLog("main", "Infinite world created and initial level loaded");

  // Load JackOLantern actor
  const actorLoader = new ActorLoader();
  await actorLoader.loadActor("JackOLantern", {
    basePath: "assets/sprites/player/JackOLantern",
    width: 120,
    height: 180,
    frameDuration: 0.08, // Faster animation
    animations: {
      idle: { folder: "Idle", frameCount: 10 },
      run: { folder: "Run", frameCount: 8 },
      jump: { folder: "Jump", frameCount: 10 },
      dead: { folder: "Dead", frameCount: 10 },
    },
  });

  debugLog("main", "JackOLantern actor loaded");

  // Create ECS World
  world = new World();
  world.tilemapLoader = tilemapLoader;
  world.actorLoader = actorLoader;
  world.systems = null; // will attach after systems are created
  world.celebration = { active: false, wallpaperHeld: false };

  // Store infiniteWorld reference in world for debugging
  world.infiniteWorld = infiniteWorld;
  world.voidMode = { active: false };

  // Initialize systems (use infiniteWorld instead of tileMap)
  systems = {
    input: new InputSystem(),
    physics: new PhysicsSystem(world),
    collision: new CollisionSystem(world, infiniteWorld),
    hitbox: new HitboxSystem(world),
    damage: null, // Will be initialized after hitbox
    playerAttack: null, // Will be initialized after damage
    ai: null, // Will be initialized after damage
    movementPattern: new MovementPatternSystem(world),
    collectibles: new CollectibleSystem(world),
    ability: new AbilitySystem(world),
    hyperdrive: null, // Will be initialized after ability (needs collision)
    buffs: new BuffSystem(world),
    projectiles: new ProjectileSystem(world),
    vfx: new VfxSystem(world),
    waves: new WaveSystem(world),
    celebration: null,
    goal: null,
    voidMode: null,
    shield: new ShieldSystem(world),
    spawn: null, // will init after world ready
    camera: new CameraSystem(world, infiniteWorld.groundMap),
    animation: new AnimationSystem(world),
    parallax: new ParallaxBackgroundSystem(ctx, null), // Camera will be set after creation
    render: new RenderSystem(ctx, infiniteWorld),
  };

  // Initialize combat systems (damage needs hitbox reference)
  systems.damage = new DamageSystem(world, systems.hitbox);
  systems.playerAttack = new PlayerAttackSystem(world, systems.damage);
  systems.ai = new AISystem(world, systems.damage);
  systems.hyperdrive = new HyperdriveSystem(world, systems.collision);
  systems.celebration = new CelebrationSystem(world, levelManager, systems.parallax);
  systems.goal = new GoalSystem(world, levelManager, systems.celebration);
  systems.voidMode = new VoidModeSystem(world, systems.damage);
  systems.spawn = new SpawnSystem(world, infiniteWorld, {
    interval: 0.5,
    spawnRadius: 900,
    targetGround: 4,
    targetAir: 3,
    verticalStep: 550,
  });

  // Set system world references
  systems.input.setWorld(world);
  systems.render.setWorld(world);
  systems.render.setCameraSystem(systems.camera);
  world.systems = systems;

  // Attach systems to level manager and update camera/map references
  levelManager.setWorld(world, systems);
  if (infiniteWorld.groundMap) {
    systems.camera.setTileMap(infiniteWorld.groundMap);
    systems.render.tileMap = infiniteWorld.groundMap;
  }

  // Configure parallax background layers for GROUND layer (from far to near)
  // Use repeat to enable horizontal looping like the tilemap
  systems.parallax.addLayer("ground", "assets/background/layer-1.png", 0.1, 0, 0, true, 1.0);
  systems.parallax.addLayer("ground", "assets/background/layer-2.png", 0.2, 0, 0, true, 1.0);
  systems.parallax.addLayer("ground", "assets/background/layer-3.png", 0.4, 0, 0, true, 1.0);
  systems.parallax.addLayer("ground", "assets/background/layer-4.png", 0.6, 0, 0, true, 1.0);

  // Configure parallax background layers for SKY layer (simpler, more atmospheric)
  // Sky background: lighter, cloudier, more vertical parallax
  systems.parallax.addLayer("sky", "assets/background/layer-1.png", 0.05, 0.1, 0, true, 1.0);
  systems.parallax.addLayer("sky", "assets/background/layer-2.png", 0.1, 0.2, 0, true, 1.0);

  // Load parallax images
  await systems.parallax.loadImages();

  // Set camera and infinite world references for parallax system
  systems.parallax.cameraSystem = systems.camera;
  systems.parallax.setInfiniteWorld(infiniteWorld);
  systems.parallax.world = world; // Need world reference to get player position

  // Store parallax system reference in world for debugging
  world.parallaxSystem = systems.parallax;

  // Create player entity (spawn in middle of map, above ground)
  // Player size: 120x180
  // Map: 32x20 tiles, 32px per tile = 1024x640px
  // Ground at y = 17 * 32 = 544px, player height = 180
  const spawnPos = levelManager.getSpawnPosition() || { x: 512, y: 364 };
  const player = world.createEntity();
  world.addComponent(player, "Transform", {
    x: spawnPos.x,
    y: spawnPos.y,
    z: 0
  });
  world.addComponent(player, "Velocity", { vx: 0, vy: 0 });
  world.addComponent(player, "AABB", { w: 120, h: 180, ox: 0, oy: 0 });
  world.addComponent(player, "Collider", { solid: true, group: "player" });
  world.addComponent(player, "PhysicsBody", {
    gravityScale: 1,
    frictionX: 0.8,
    maxSpeedX: 800, // Much faster
    maxSpeedY: 1600, // Higher terminal velocity
  });
  world.addComponent(player, "CharacterState", { action: "idle", facing: 1 });
  world.addComponent(player, "Renderable", { color: RENDER.PLAYER_COLOR });
  world.addComponent(player, "Input", {});

  // Add sprite component for JackOLantern
  const spriteData = actorLoader.createSpriteComponent("JackOLantern", "idle");
  world.addComponent(player, "Sprite", spriteData);
  world.addComponent(player, "CameraFollow", {
    deadZoneX: 200, // Larger dead zone for bigger player
    deadZoneY: 150,
    smoothing: 0.05, // Faster initial follow
    priority: 1,
  });

  // Add combat components to player
  world.addComponent(player, "Health", {
    current: 100,
    max: 100,
    invulnerable: false,
  });

  world.addComponent(player, "Team", {
    id: "player",
  });

  world.addComponent(player, "Attack", {
    isAttacking: false,
    cooldown: 0,
    cooldownMax: 0.5, // 500ms cooldown
    damage: 20,
    range: 60,
    knockbackX: 150,
    knockbackY: -80,
  });

  world.addComponent(player, "Hitbox", {
    active: false,
    damage: 20,
    knockbackX: 150,
    knockbackY: -80,
    hitOnce: true, // Each attack can only hit an entity once
    hitEntities: [],
    offsetX: 60, // In front of player
    offsetY: 40,
    width: 60,
    height: 80,
    duration: 0.15,
    elapsed: 0,
  });

  world.addComponent(player, "Hurtbox", {
    active: true,
    width: 80,
    height: 120,
    offsetX: 20,
    offsetY: 30,
  });

  world.addComponent(player, "IFrame", {
    active: false,
    duration: 1.0, // 1 second invulnerability
    elapsed: 0,
    flashInterval: 0.1,
    flashTimer: 0,
    visible: true,
  });

  world.addComponent(player, "AbilityMeter", {
    current: 100,
    max: 100,
    chargeRate: 1,
    ready: true,
  });

  world.addComponent(player, "AbilitySkill", {
    active: false,
    duration: 5,
    speedMultiplier: 1.5,
    attackSpeedMultiplier: 0.7,
    invulnerable: true,
  });

  world.addComponent(player, "Block", {
    active: false,
    angle: 160,
    reduction: 0.6,
    cooldown: 0.6,
    window: 0.6,
    cooldownTimer: 0,
    windowTimer: 0,
  });

  // Store player ID for other systems
  world.player = player;

  // Create dummy enemy for testing combat
  const dummy = createBasicEnemy(world, {
    x: 800,
    y: 364,
    patrolPoints: [
      { x: 760, y: 364 },
      { x: 920, y: 364 },
    ],
  });

  // Flying charger enemy (horizontal mover)
  createFlyingCharger(world, {
    x: spawnPos.x + 300,
    y: spawnPos.y - 200,
    range: 400,
    speed: 240,
  });

  // Vertical sentinel enemy (up/down patrol)
  createVerticalSentinel(world, {
    x: spawnPos.x - 300,
    y: spawnPos.y - 150,
    range: 220,
    speed: 140,
  });

  // Neutral friendly NPC
  createFriendlyNpc(world, {
    x: spawnPos.x + 120,
    y: spawnPos.y,
    color: "#44cc88",
  });

  // Collectibles near spawn
  createCollectible(world, {
    x: spawnPos.x + 40,
    y: spawnPos.y - 80,
    kind: "energy",
    value: 20,
    color: "#ffd700",
  });
  createCollectible(world, {
    x: spawnPos.x - 60,
    y: spawnPos.y - 120,
    kind: "haste",
    value: 0,
    color: "#ffa500",
  });
  createCollectible(world, {
    x: spawnPos.x + 120,
    y: spawnPos.y - 140,
    kind: "health",
    value: 20,
    color: "#88ff88",
  });

  debugLog("main", "Initialization complete! Starting game loop...");

  // Create debug console
  debugConsole = new DebugConsole(world, systems);
  // Create debug panel (HTML overlay controls)
  debugPanel = new DebugPanel(world, systems, infiniteWorld, tilemapLoader);
  // Create level selection menu
  levelMenu = new LevelMenu(levelManager);

  // Setup screenshot handler
  window.addEventListener("debug-screenshot", () => {
    takeScreenshot(canvas, "platformer");
  });

  // Setup console toggle handler
  window.addEventListener("debug-console-toggle", () => {
    debugConsole.toggle();
  });
  window.addEventListener("debug-panel-toggle", () => {
    debugPanel.toggle();
  });
  window.addEventListener("debug-level-menu-toggle", () => {
    levelMenu.toggle();
  });

  // Start game loop
  requestAnimationFrame(gameLoop);
}

// FPS calculation
let frameCount = 0;
let fpsTime = 0;
let currentFPS = 60;

// Game main loop
const FIXED_DT = 1 / 60;
let last = performance.now();
let acc = 0;

function gameLoop(now) {
  profiler.start("frame");

  const rawDt = Math.min(0.25, (now - last) / 1000);
  last = now;
  // Apply time scaling
  const scaledDt = getScaledDeltaTime(rawDt);
  acc += scaledDt;

  // FPS calculation
  fpsTime += rawDt;
  frameCount++;
  if (fpsTime >= 1.0) {
    currentFPS = Math.round(frameCount / fpsTime);
    frameCount = 0;
    fpsTime = 0;
  }

  // 固定步長更新 (除非暫停)
  while (acc >= FIXED_DT && !shouldPauseUpdate()) {
    profiler.start("input");
    systems.input.update(FIXED_DT);
    profiler.end("input");

    profiler.start("ai");
    systems.ai.update(FIXED_DT);
    profiler.end("ai");

    profiler.start("movementPattern");
    systems.movementPattern.update(FIXED_DT);
    profiler.end("movementPattern");

    profiler.start("physics");
    systems.physics.update(FIXED_DT);
    profiler.end("physics");

    profiler.start("collision");
    systems.collision.update(FIXED_DT);
    profiler.end("collision");

    profiler.start("voidMode");
    systems.voidMode.update(FIXED_DT);
    profiler.end("voidMode");

    const voidActive = systems.voidMode.isActive();

    // Combat systems
    profiler.start("playerAttack");
    systems.playerAttack.update(FIXED_DT);
    profiler.end("playerAttack");

    profiler.start("shield");
    systems.shield.update(FIXED_DT);
    profiler.end("shield");

    profiler.start("ability");
    systems.ability.update(FIXED_DT);
    profiler.end("ability");

    profiler.start("hyperdrive");
    systems.hyperdrive.update(FIXED_DT);
    profiler.end("hyperdrive");

    profiler.start("celebration");
    systems.celebration.update(FIXED_DT);
    profiler.end("celebration");

    if (!voidActive) {
      profiler.start("waves");
      systems.waves.update(FIXED_DT);
      profiler.end("waves");

      profiler.start("projectiles");
      systems.projectiles.update(FIXED_DT);
      profiler.end("projectiles");

      profiler.start("hitbox");
      systems.hitbox.update(FIXED_DT);
      profiler.end("hitbox");

      profiler.start("damage");
      systems.damage.update(FIXED_DT);
      profiler.end("damage");

      profiler.start("collectibles");
      systems.collectibles.update(FIXED_DT);
      profiler.end("collectibles");

      profiler.start("goal");
      systems.goal.update(FIXED_DT);
      profiler.end("goal");

      profiler.start("spawn");
      systems.spawn.update(FIXED_DT);
      profiler.end("spawn");
    } else {
      profiler.start("projectiles");
      systems.projectiles.update(FIXED_DT);
      profiler.end("projectiles");
    }

    profiler.start("buffs");
    systems.buffs.update(FIXED_DT);
    profiler.end("buffs");

    profiler.start("vfx");
    systems.vfx.update(FIXED_DT);
    profiler.end("vfx");

    // NEW: Camera update after collision
    profiler.start("camera");
    systems.camera.update(FIXED_DT);
    profiler.end("camera");

    // NEW: Animation update
    profiler.start("animation");
    systems.animation.update(FIXED_DT);
    profiler.end("animation");

    acc -= FIXED_DT;
  }

  // Rendering (even when paused)
  profiler.start("render");

  // Clear screen first
  ctx.fillStyle = RENDER.BACKGROUND_COLOR;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const voidActiveRender = world.voidMode?.active;
  const isWallpaper = world.celebration?.active && world.celebration.wallpaperHeld;
  if (voidActiveRender) {
    const grd = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
    grd.addColorStop(0, VOID_MODE.wallpaperA || "rgba(0,15,30,0.9)");
    grd.addColorStop(1, VOID_MODE.wallpaperB || "rgba(10,0,20,0.8)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else if (isWallpaper) {
    const grd = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
    grd.addColorStop(0, "rgba(40,10,60,0.9)");
    grd.addColorStop(1, "rgba(10,10,20,0.9)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    // Draw parallax background (bottom layer)
    profiler.start("parallax");
    systems.parallax.draw();
    profiler.end("parallax");
  }

  // Draw main game content (multi-layer rendering)
  profiler.start("tiles-entities");
  const camera = systems.camera.getCamera();

  const voidActive = world.voidMode?.active;

  if (!voidActive) {
    // Draw background tiles (behind everything)
    systems.render.drawTiles(camera);

    // Draw middleground tiles (with player)
    systems.render.drawMiddleground(camera);
  }

  // Draw entities (player layer)
  const entities = world.query(["Transform", "Renderable"]);
  for (const entity of entities) {
    systems.render.drawEntity(entity, camera);
  }

  if (!voidActive) {
    // Draw foreground tiles (in front of player)
    systems.render.drawForeground(camera);
  }

  profiler.end("tiles-entities");

  profiler.end("render");

  // Always-on HUD (ability/meter)
  drawAbilityHud(ctx, world);

  // Debug overlay
  profiler.start("debug");
  drawDebugOverlay(ctx, world, currentFPS, systems.camera); // pass camera system
  drawDebugHitboxes(ctx, world, infiniteWorld, systems.camera); // pass infiniteWorld
  drawVelocityVectors(ctx, world, systems.camera); // draw velocity vectors
  profiler.end("debug");

  if (debugPanel) {
    debugPanel.update(currentFPS);
  }

  profiler.end("frame");

  requestAnimationFrame(gameLoop);
}

// Start game initialization
debugLog("main", "Starting Vanilla Platformer - Module 5: Tilemap Loader");
debugLog(
  "main",
  "Debug keys: F1=Overlay, F2=Hitboxes, F3=SlowMo, F4=Grid, `=Pause, .=Step"
);

// Initialize and start (async)
init().catch((error) => {
  console.error("Failed to initialize game:", error);
  document.body.innerHTML += `<div style="color: red; padding: 20px;">
    <h2>Failed to load game</h2>
    <p>${error.message}</p>
    <p>Make sure you're running this via HTTP server (not file://)</p>
  </div>`;
});
