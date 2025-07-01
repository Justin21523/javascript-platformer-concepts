// main.js - 程序入口点
import { Game } from './core/Game.js';

// DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 获取Canvas元素
    const canvas = document.getElementById('gameCanvas');

    // 获取UI元素
    const uiElements = {
        fpsCounter: document.getElementById('fpsCounter'),
        frameTimeEl: document.getElementById('frameTime'),
        deltaTimeEl: document.getElementById('deltaTime'),
        entityCountEl: document.getElementById('entityCount'),
        speedSlider: document.getElementById('speedSlider'),
        speedValue: document.getElementById('speedValue'),
        pauseBtn: document.getElementById('pauseBtn'),
        resetBtn: document.getElementById('resetBtn')
    };

    // 创建游戏实例
    const game = new Game(canvas, uiElements);

    // 初始化并启动游戏
    game.init();
    game.start();
});
