// main.js - 程序入口点
import { Game } from './core/Game.js';
import { MenuScene } from './scenes/MenuScene.js';

// DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 获取Canvas元素
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 添加圓角矩形支持
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;

        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };


    // 获取UI元素
    const uiElements = {
        fpsCounter: document.getElementById('fpsCounter'),
        frameTime: document.getElementById('frameTime'),
        deltaTime: document.getElementById('deltaTime'),
        entityCount: document.getElementById('entityCount'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        pauseBtn: document.getElementById('pauseBtn'),
        resetBtn: document.getElementById('resetBtn')
    };

    // 创建游戏实例
    const game = new Game(canvas, ctx, uiElements);

    // 初始化并启动游戏
    game.init();
    game.start();
});
