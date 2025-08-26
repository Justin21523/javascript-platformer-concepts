// core/Game.js - 游戏主控制类
import { InputHandler } from './InputHandler.js';
import { GameScene } from '../scenes/GameScene.js';
import { Time } from './Time.js';
import { PauseScene } from '../scenes/PauseScene.js';
import { Player } from '../entities/Player.js';
import { Platform } from '../entities/Platform.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { AssetLoader } from './AssetLoader.js';


export class Game {
    constructor(canvas, ctx, ui) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ui = ui;
        this.time = new Time();
        this.currentScene = null;
        this.previousScene = null; // 用於暫停場景
        this.isRunning = true;
        this.lastFrameTime = 0;

        // 除錯統計
        this.frameCount = 0;
        this.frameTimer = 0;
        this.fps = 0;

        // 輸入處理
        this.input = new InputHandler(this);

        // 相機系統 (稍後實作)
        this.camera = null;

        this.assetLoader = new AssetLoader()
        .addImage("player", "assets/images/player.png")
        .addImage("platform", "assets/images/platform.png");

    }

    // 初始化游戏
    init() {
        // 创建游戏场景
        this.currentScene = new GameScene(
            this.canvas,
            this.ctx,
            this.input,
            this.time // 传递时间系统实例
        );
        this.currentScene.init();
        // 设置事件监听器
        this.setupEventListeners();
    }

    setScene(scene) {
        // 暫停當前場景
        if (this.currentScene) {
            this.currentScene.destroy?.();
        }

        // 設置新場景
        this.currentScene = scene;
        scene.game = this;

        // 初始化場景
        if (scene.init) {
            scene.init();
        }
    }

    togglePause() {
        if (this.currentScene instanceof GameScene) {
            this.previousScene = this.currentScene;

            // 導入 PauseScene 類別
            import("../scenes/PauseScene.js").then(module => {
                const PauseScene = module.PauseScene;
                this.setScene(new PauseScene(this.previousScene));
            });
        } else if (this.currentScene instanceof PauseScene) {
            this.setScene(this.previousScene);
        }
    }

    // 启动游戏循环
    start() {
        this.assetLoader.loadAll().then(() => {
            this.setScene(new MenuScene());
            this.lastFrameTime = performance.now();
            this.gameLoop();
        });
    }

    // 游戏循环核心
    gameLoop() {
        if (!this.isRunning) return;

        const now = performance.now();
        const rawDeltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        // 更新時間系統
        this.time.update(rawDeltaTime);

        // 更新遊戲狀態
        this.update(this.time.scaledTime);

        // 繪製畫面
        this.draw();

        // 更新UI顯示
        this.updateDebugUI();

        requestAnimationFrame(() => this.gameLoop());
    }

    // 更新性能统计
    updateStats(deltaTime) {
        this.frameCount++;
        this.frameTimer += deltaTime;

        // 每秒更新一次FPS計數
        if (this.frameTimer >= 1) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.frameTimer = 0;
        }

        // 更新UI顯示
        if (this.ui.fpsCounter) this.ui.fpsCounter.textContent = Math.round(this.fps);
        if (this.ui.frameTime) this.ui.frameTime.textContent = (deltaTime * 1000).toFixed(1) + 'ms';
        if (this.ui.deltaTime) this.ui.deltaTime.textContent = deltaTime.toFixed(4) + 's';

        // 從場景獲取實體數量
        if (this.ui.entityCount && this.currentScene) {
        this.ui.entityCount.textContent = this.currentScene.entities.length;
        }

        // 更新遊戲速度顯示
        if (this.ui.speedValue) {
        this.ui.speedValue.textContent = Math.round(this.time.timeScale * 100) + '%';
        }
    }

    // 设置事件監聽器
    setupEventListeners() {
        // 按钮事件
        this.ui.pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            this.ui.pauseBtn.textContent = this.isPaused ? '继续游戏' : '暂停游戏';
        });

        this.ui.resetBtn.addEventListener('click', () => {
            this.init();
        });

        // 速度滑块
        this.ui.speedSlider.addEventListener('input', () => {
            this.gameSpeed = this.ui.speedSlider.value / 100;
            this.ui.speedValue.textContent = this.ui.speedSlider.value + '%';
        });
    }


}
