import { Component } from './Component.js';

/**
 * 碰撞组件 - 处理实体碰撞检测
 */
export class ColliderComponent extends Component {
    constructor(entity, options = {}) {
        super(entity);

        // 碰撞属性
        this.type = options.type || 'box';    // 碰撞器类型 (box/circle)
        this.width = options.width || 0;      // 碰撞宽度
        this.height = options.height || 0;    // 碰撞高度
        this.radius = options.radius || 0;    // 碰撞半径（圆形用）
        this.offset = {                       // 碰撞器偏移
            x: options.offsetX || 0,
            y: options.offsetY || 0
        };
    }

    /**
     * 检查与另一个碰撞器的碰撞
     * @param {ColliderComponent} other - 另一个碰撞器
     * @returns {boolean} 是否发生碰撞
     */
    checkCollision(other) {
        if (this.type === 'box' && other.type === 'box') {
            return this._checkBoxBoxCollision(other);
        }
        // 可以扩展其他碰撞类型检测
        return false;
    }

    /**
     * 矩形与矩形碰撞检测
     */
    _checkBoxBoxCollision(other) {
        return (
            this.left < other.right &&
            this.right > other.left &&
            this.top < other.bottom &&
            this.bottom > other.top
        );
    }

    /**
     * 获取碰撞器边界
     */
    get left() { return this.entity.x + this.offset.x; }
    get right() { return this.left + this.width; }
    get top() { return this.entity.y + this.offset.y; }
    get bottom() { return this.top + this.height; }

    /**
     * 绘制碰撞器边界（调试用）
     */
    draw(ctx) {
        if (!this.enabled) return;

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;

        if (this.type === 'box') {
            ctx.strokeRect(
                this.left,
                this.top,
                this.width,
                this.height
            );
        } else if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(
                this.entity.x + this.offset.x,
                this.entity.y + this.offset.y,
                this.radius,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    }
}
