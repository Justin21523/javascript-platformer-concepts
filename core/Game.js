// core/Game.js - 游戏主控制类
import { InputHandler } from './InputHandler.js';
import { GameScene } from '../scenes/GameScene.js';
import { Time } from './Time.js';

export class Game {
    constructor(canvas, uiElements) {
        // 游戏核心元素
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // UI元素引用
        this.ui = uiElements;

        // 遊戲系统
        this.input = new InputHandler();
        this.time = new Time(); // 创建时间系统实例

        // 游戏状态
        this.lastTime = 0;
        this.gameTime = 0;
        this.isPaused = false;
        this.gameSpeed = 1.0;
        // 性能統計
        this.fps = 0;
        this.frameCount = 0;
        this.frameTimer = 0;

        // 当前场景
        this.currentScene = null;
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

    // 启动游戏循环
    start() {
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    // 游戏循环核心
    gameLoop(timestamp) {
        // 1. 计算Delta Time（时间差）
        const rawDeltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // 2. 更新时间系统
        this.time.update(rawDeltaTime * this.gameSpeed);

        if (!this.isPaused) {
            // 3. 更新输入状态
            this.input.update();

            // 4. 更新当前场景
            this.currentScene.update(this.time.deltaTime);

            // 5. 渲染当前场景
            this.currentScene.render();
        }

        // 6. 更新性能统计
        this.updateStats(this.time.deltaTime);

        // 7. 请求下一帧
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    // 更新性能统计
    updateStats(deltaTime) {
        this.frameCount++;
        this.frameTimer += deltaTime;

        // 每秒更新一次FPS计数
        if (this.frameTimer >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.frameTimer = 0;
        }

        // 更新UI显示
        if (this.ui.fpsCounter) this.ui.fpsCounter.textContent = Math.round(this.fps);
        if (this.ui.frameTimeEl) this.ui.frameTimeEl.textContent = (deltaTime * 1000).toFixed(1) + 'ms';
        if (this.ui.deltaTimeEl) this.ui.deltaTimeEl.textContent = deltaTime.toFixed(4) + 's';
        if (this.ui.entityCountEl) this.ui.entityCountEl.textContent = this.currentScene.entityCount;
    }

    // 设置事件监听器
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
