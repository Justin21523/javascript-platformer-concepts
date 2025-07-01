// core/InputHandler.js - 输入处理系统
export class InputHandler {
    constructor() {
        // 存储按键状态
        this.keys = {};

        // 添加事件监听器
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    // 更新输入状态
    update() {
        // 这里可以添加输入处理逻辑
    }

    // 检查按键是否按下
    isKeyDown(key) {
        return this.keys[key] === true;
    }

    // 检查按键组合
    isKeyComboDown(keys) {
        return keys.every(key => this.keys[key] === true);
    }
}
