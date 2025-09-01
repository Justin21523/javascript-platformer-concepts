// src/main.js
import { World } from "./ecs/world.js";
import { InputSystem } from "./systems/input-system.js";
import { PhysicsSystem } from "./systems/physics-system.js";
import { CharacterSystem } from "./systems/character-system.js";
import { CollisionSystem } from "./systems/collision-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { createPlayer } from "./entities/player.js";
import { getTimeScale, drawOverlay } from "./debug.js";
import { TileMap } from "./world/tiles.js";
import { COLLISION, RENDER } from "./config.js";
import { drawDebugOverlay, drawDebugHitboxes } from "./render/overlay.js";

// 初始化 Canvas 和 Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 設定 Canvas 尺寸
canvas.width = RENDER.CANVAS_WIDTH;
canvas.height = RENDER.CANVAS_HEIGHT;

// 關閉圖像平滑化 (像素風格)
ctx.imageSmoothingEnabled = false;

// 創建 ECS World
const world = new World();

// 創建簡單測試地圖
const tileMap = new TileMap(50, 16, COLLISION.TILE_SIZE);

// 添加地面平台 (y=12-15, x=0-49)
for (let y = 12; y < 16; y++) {
  for (let x = 0; x < 50; x++) {
    tileMap.setSolid(x, y, true);
  }
}

// 添加一些平台
for (let x = 10; x < 15; x++) tileMap.setSolid(x, 10, true); // 小平台
for (let x = 20; x < 30; x++) tileMap.setSolid(x, 8, true); // 中平台

// 初始化系統
const systems = {
  input: new InputSystem(),
  physics: new PhysicsSystem(world),
  collision: new CollisionSystem(world, tileMap), // 新增
  render: new RenderSystem(ctx, tileMap),
};

// 設定系統的 world 引用
systems.input.setWorld(world);
systems.render.setWorld(world);

// 創建玩家實體
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

// 儲存玩家 ID 以供其他系統使用
world.player = player;

// FPS 計算
let frameCount = 0;
let fpsTime = 0;
let currentFPS = 60;

// 遊戲主迴圈
const FIXED_DT = 1 / 60;
let last = performance.now();
let acc = 0;

function gameLoop(now) {
  const rawDt = Math.min(0.25, (now - last) / 1000);
  last = now;
  acc += rawDt;

  // FPS 計算
  fpsTime += rawDt;
  frameCount++;
  if (fpsTime >= 1.0) {
    currentFPS = Math.round(frameCount / fpsTime);
    frameCount = 0;
    fpsTime = 0;
  }

  // 固定步長更新
  while (acc >= FIXED_DT) {
    systems.input.update(FIXED_DT);
    systems.physics.update(FIXED_DT);
    systems.collision.update(FIXED_DT);
    acc -= FIXED_DT;
  }

  // 渲染
  systems.render.draw();

  // Debug 覆蓋層
  drawDebugOverlay(ctx, world, currentFPS);
  drawDebugHitboxes(ctx, world, tileMap);

  requestAnimationFrame(gameLoop);
}

// 啟動遊戲
console.log("🎮 Starting Vanilla Platformer - Stage 2: Collision System");
requestAnimationFrame(gameLoop);
