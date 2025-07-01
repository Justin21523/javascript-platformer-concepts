// entities/Entity.js - 实体基类
export class Entity {
    constructor(x = 0, y = 0) {
        // 基本属性
        this.x = x;
        this.y = y;
        this.width = 0;
        this.height = 0;

        // 状态属性
        this.active = true;
        this.visible = true;
    }

    // 更新实体状态 (子类需重写)
    update(deltaTime) {
        // 基类不做具体实现
    }

    // 渲染实体 (子类需重写)
    draw(ctx) {
        // 基类不做具体实现
    }
}
