// core/Scene.js
export class Scene {
    constructor() {
        this.game = null;
        this.entities = [];
        this.systems = [];
        this.ui = {};
    }

    init() {
        // 初始化場景
    }

    update(deltaTime) {
        // 更新所有系統
        this.systems.forEach(system => system.update(deltaTime));

        // 更新所有實體
        this.entities.forEach(entity => {
            if (entity.active) entity.update(deltaTime);
        });
    }

    draw() {
        const ctx = this.game.ctx;
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // 繪製所有實體
        this.entities.forEach(entity => {
            if (entity.active) entity.draw(ctx);
        });
    }

    addEntity(entity) {
        entity.scene = this;
        this.entities.push(entity);
        return entity;
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    getEntityByType(type) {
        return this.entities.filter(e => e instanceof type);
    }

    addSystem(system) {
        system.scene = this;
        this.systems.push(system);
        return system;
    }

    destroy() {
        // 清理資源
        this.entities = [];
        this.systems = [];
    }
}
