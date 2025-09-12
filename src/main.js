// src/main.js
import { World } from "./ecs/world.js";
import { InputSystem } from "./systems/input-system.js";
import { PhysicsSystem } from "./systems/physics-system.js";
import { CollisionSystem } from "./systems/collision-system.js";
import { CameraSystem } from "./systems/camera-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { TileMap } from "./world/tiles.js";
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

// Create ECS World
const world = new World();

// Create larger test world (3x wider for camera testing)
const tileMap = new TileMap(150, 16, COLLISION.TILE_SIZE); // 150x16 instead of 50x16

// Add ground platforms (y=12-15, x=0-149)
for (let y = 12; y < 16; y++) {
  for (let x = 0; x < 50; x++) {
    tileMap.setSolid(x, y, true);
  }
}

// Add various platforms across the wide world
for (let x = 10; x < 15; x++) tileMap.setSolid(x, 10, true); // small platform
for (let x = 20; x < 30; x++) tileMap.setSolid(x, 8, true); // medium platform
for (let x = 40; x < 50; x++) tileMap.setSolid(x, 6, true); // high platform
for (let x = 60; x < 70; x++) tileMap.setSolid(x, 9, true); // another platform
for (let x = 80; x < 90; x++) tileMap.setSolid(x, 7, true); // scattered platforms
for (let x = 110; x < 125; x++) tileMap.setSolid(x, 5, true); // far platform
for (let x = 130; x < 140; x++) tileMap.setSolid(x, 8, true); // end area platform

// Initialize systems
const systems = {
  input: new InputSystem(),
  physics: new PhysicsSystem(world),
  collision: new CollisionSystem(world, tileMap),
  camera: new CameraSystem(world, tileMap), // NEW
  render: new RenderSystem(ctx, tileMap),
};

// Set system world references
systems.input.setWorld(world);
systems.render.setWorld(world);
systems.render.setCameraSystem(systems.camera); // NEW

// Create player entity
const player = world.createEntity();
world.addComponent(player, "Transform", { x: 100, y: 50, z: 0 });
world.addComponent(player, "Velocity", { vx: 0, vy: 0 });
world.addComponent(player, "AABB", { w: 16, h: 24, ox: 0, oy: 0 });
world.addComponent(player, "Collider", { solid: true, group: "player" });
world.addComponent(player, "PhysicsBody", {
  gravityScale: 1,
  frictionX: 0.8,
  maxSpeedX: 180,
  maxSpeedY: 800,
});
world.addComponent(player, "CharacterState", { action: "idle", facing: 1 });
world.addComponent(player, "Renderable", { color: RENDER.PLAYER_COLOR });
world.addComponent(player, "Input", {});
world.addComponent(player, "CameraFollow", {
  // NEW: Make camera follow player
  deadZoneX: 100,
  deadZoneY: 80,
  smoothing: 0.1,
  priority: 1,
});

// Store player ID for other systems
world.player = player;

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

// Start game
debugLog("main", "Starting Vanilla Platformer - Stage 3: Camera System");
debugLog(
  "main",
  "Debug keys: F1=Overlay, F2=Hitboxes, F3=SlowMo, F4=Grid, `=Pause, .=Step"
);
debugLog("main", "World size: 150x16 tiles = 2400x256 pixels");
requestAnimationFrame(gameLoop);
