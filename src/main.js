// src/main.js
import { World } from "./ecs/world.js";
import { InputSystem } from "./systems/input-system.js";
import { PhysicsSystem } from "./systems/physics-system.js";
import { CharacterSystem } from "./systems/character-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { createPlayer } from "./entities/player.js";
import { getTimeScale, drawOverlay } from "./debug.js";

const canvas = document.getElementById("gameCanvas");
const world = new World(canvas);

// 初始化系統
const inputSystem = new InputSystem();
const physicsSystem = new PhysicsSystem();
const characterSystem = new CharacterSystem();
const renderSystem = new RenderSystem();

world.addSystem(inputSystem);
world.addSystem(physicsSystem);
world.addSystem(characterSystem);
world.addSystem(renderSystem);

// 創建玩家
const playerId = createPlayer(world, 400, 200);

// 遊戲循環
const FIXED_DT = 1 / 60;
let lastTime = performance.now();
let accumulator = 0;
let fpsCounter = 0;
let fpsTime = 0;
let currentFPS = 60;

function gameLoop(currentTime) {
  const rawDt = Math.min(0.25, (currentTime - lastTime) / 1000);
  const scaledDt = rawDt * getTimeScale();
  lastTime = currentTime;
  accumulator += scaledDt;

  // FPS 統計
  fpsCounter++;
  fpsTime += rawDt;
  if (fpsTime >= 1) {
    currentFPS = fpsCounter;
    fpsCounter = 0;
    fpsTime = 0;
  }

  // 固定步長更新
  while (accumulator >= FIXED_DT) {
    inputSystem.update(FIXED_DT);
    physicsSystem.update(FIXED_DT);
    characterSystem.update(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  // 渲染
  renderSystem.update(0);

  // Debug overlay
  drawOverlay(world.ctx, world, {
    fps: currentFPS,
    dt: rawDt * 1000,
  });

  requestAnimationFrame(gameLoop);
}

// 啟動遊戲
requestAnimationFrame(gameLoop);
