// src/main.js
import { World } from "./ecs/world.js";
import { InputSystem } from "./systems/input-system.js";
import { PhysicsSystem } from "./systems/physics-system.js";
import { CollisionSystem } from "./systems/collision-system.js";
import { CameraSystem } from "./systems/camera-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { ParallaxBackgroundSystem } from "./systems/parallax-background-system.js";
import { TilemapLoader } from "./loaders/tilemap-loader.js";
import { COLLISION, RENDER } from "./config.js";
import { drawDebugOverlay, drawDebugHitboxes } from "./render/overlay.js";
import {
  shouldPauseUpdate,
  getScaledDeltaTime,
  profiler,
  debugLog,
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
let tileMap;
let systems;

/**
 * Asynchronous initialization - Load assets before starting game
 */
async function init() {
  debugLog("main", "Loading assets...");

  // Create tilemap loader and load tileset + map
  const tilemapLoader = new TilemapLoader();
  await tilemapLoader.loadTileset("assets/tileset.json");
  tileMap = await tilemapLoader.loadMap("assets/levels/platformer-level1.json");

  debugLog("main", `Map loaded: ${tileMap.width}x${tileMap.height} tiles`);

  // Create ECS World
  world = new World();

  // Initialize systems
  systems = {
    input: new InputSystem(),
    physics: new PhysicsSystem(world),
    collision: new CollisionSystem(world, tileMap),
    camera: new CameraSystem(world, tileMap),
    parallax: new ParallaxBackgroundSystem(ctx, null), // Camera will be set after creation
    render: new RenderSystem(ctx, tileMap),
  };

  // Set system world references
  systems.input.setWorld(world);
  systems.render.setWorld(world);
  systems.render.setCameraSystem(systems.camera);

  // Configure parallax background layers (from far to near)
  // Layer 1: Farthest (slowest parallax, 20% horizontal, 10% vertical)
  systems.parallax.addLayer("assets/background/layer-1.png", 0.2, 0.1, 0, true);
  // Layer 2: Far (30% horizontal, 20% vertical)
  systems.parallax.addLayer("assets/background/layer-2.png", 0.3, 0.2, 0, true);
  // Layer 3: Middle (50% horizontal, 40% vertical)
  systems.parallax.addLayer("assets/background/layer-3.png", 0.5, 0.4, 0, true);
  // Layer 4: Near (70% horizontal, 60% vertical)
  systems.parallax.addLayer("assets/background/layer-4.png", 0.7, 0.6, 0, true);

  // Load parallax images
  await systems.parallax.loadImages();

  // Set camera reference for parallax system
  systems.parallax.cameraSystem = systems.camera;

  // Create player entity (spawn on left side of map, above ground)
  // Player size matches tile size: 128x192 (keeping 16:24 aspect ratio)
  // Map: 50x20 tiles, 128px per tile = 6400x2560px world
  // Bottom ground is at y = 19 * 128 = 2432px
  const player = world.createEntity();
  world.addComponent(player, "Transform", {
    x: 256,          // Spawn at tile x=2
    y: 2200,         // Spawn above ground (ground at y=2432)
    z: 0
  });
  world.addComponent(player, "Velocity", { vx: 0, vy: 0 });
  world.addComponent(player, "AABB", { w: 128, h: 192, ox: 0, oy: 0 });
  world.addComponent(player, "Collider", { solid: true, group: "player" });
  world.addComponent(player, "PhysicsBody", {
    gravityScale: 1,
    frictionX: 0.8,
    maxSpeedX: 400, // Increased for larger player
    maxSpeedY: 1200, // Increased terminal velocity
  });
  world.addComponent(player, "CharacterState", { action: "idle", facing: 1 });
  world.addComponent(player, "Renderable", { color: RENDER.PLAYER_COLOR });
  world.addComponent(player, "Input", {});
  world.addComponent(player, "CameraFollow", {
    deadZoneX: 200, // Larger dead zone for bigger player
    deadZoneY: 150,
    smoothing: 0.05, // Faster initial follow
    priority: 1,
  });

  // Store player ID for other systems
  world.player = player;

  debugLog("main", "Initialization complete! Starting game loop...");

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

    profiler.start("physics");
    systems.physics.update(FIXED_DT);
    profiler.end("physics");

    profiler.start("collision");
    systems.collision.update(FIXED_DT);
    profiler.end("collision");

    // NEW: Camera update after collision
    profiler.start("camera");
    systems.camera.update(FIXED_DT);
    profiler.end("camera");

    acc -= FIXED_DT;
  }

  // Rendering (even when paused)
  profiler.start("render");

  // Draw parallax background first (bottom layer)
  profiler.start("parallax");
  systems.parallax.draw();
  profiler.end("parallax");

  // Draw main game content
  systems.render.draw();
  profiler.end("render");

  // Debug overlay
  profiler.start("debug");
  drawDebugOverlay(ctx, world, currentFPS, systems.camera); // pass camera system
  drawDebugHitboxes(ctx, world, tileMap, systems.camera); // pass camera system
  profiler.end("debug");

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
