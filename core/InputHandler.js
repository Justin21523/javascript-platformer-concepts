// core/InputHandler.js - 输入处理系统
export class InputHandler {
    constructor(game) {
        // 存储按键状态
        this.game = game;
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.isMouseDown = false;


        // 鍵盤事件監聽
        window.addEventListener('keydown', e => {
        this.keys[e.key] = true;

        // 將按鍵事件傳遞給當前場景
        if (this.game.currentScene && this.game.currentScene.handleKeyDown) {
            this.game.currentScene.handleKeyDown(e.key);
        }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // 滑鼠事件監聽
        this.game.canvas.addEventListener('mousemove', e => {
            const rect = this.game.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        });

        this.game.canvas.addEventListener('mousedown', e => {
            this.isMouseDown = true;

            // 將點擊事件傳遞給當前場景
            if (this.game.currentScene && this.game.currentScene.handleClick) {
                const rect = this.game.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.game.currentScene.handleClick(x, y);
            }
        });

        this.game.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

    }

    // 更新输入状态
    update() {
        // 这里可以添加输入处理逻辑
    }

    // 检查按键是否按下
    isKeyDown(key) {
        return !!this.keys[key];
    }

    // 检查按键组合
    isKeyComboDown(keys) {
        return keys.every(key => this.keys[key] === true);
    }

}
