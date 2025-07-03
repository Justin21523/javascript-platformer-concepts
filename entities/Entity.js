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

        // 场景引用
        this.scene = null;    // 所属场景
        // 组件系统
        this._components = new Map(); // 存储组件的Map
    }

    /**
     * 添加组件
     * @param {Component} component - 要添加的组件
     */
    addComponent(component) {
        const componentName = component.constructor.name;
        this._components.set(componentName, component);
        component.entity = this; // 设置组件的实体引用
    }

    /**
     * 获取组件
     * @param {string|Function} componentType - 组件类型名称或构造函数
     * @returns {Component|null} 请求的组件
     */
    getComponent(componentType) {
        const name = typeof componentType === 'function'
            ? componentType.name
            : componentType;
        return this._components.get(name) || null;
    }

    /**
     * 移除组件
     * @param {string|Function} componentType - 组件类型名称或构造函数
     */
    removeComponent(componentType) {
        const name = typeof componentType === 'function'
            ? componentType.name
            : componentType;
        this._components.delete(name);
    }

    /**
     * 更新实体
     * @param {number} deltaTime - 帧间时间差
     */
    update(deltaTime) {
        // 更新所有组件
        for (const component of this._components.values()) {
            if (component.update) {
                component.update(deltaTime);
            }
        }
    }

    /**
     * 渲染实体
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    draw(ctx) {
        // 渲染所有组件
        for (const component of this._components.values()) {
            if (component.draw) {
                component.draw(ctx);
            }
        }
    }
}
