// components/Component.js
/**
 * 组件基类
 * 所有游戏组件都应继承自此类
 */
export class Component {
    /**
     * @param {Entity} entity - 组件所属的实体
     */
    constructor(entity) {
        this.entity = entity; // 关联的实体
        this.enabled = true;  // 组件是否启用
    }
    
    /**
     * 更新组件状态
     * @param {number} deltaTime - 帧间时间差（秒）
     */
    update(deltaTime) {
        // 基类不做具体实现，子类可重写
    }

    /**
     * 渲染组件
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    draw(ctx) {
        // 基类不做具体实现，子类可重写
    }
}
