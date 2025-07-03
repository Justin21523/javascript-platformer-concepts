import { Component } from './Component.js';

/**
 * 物理组件 - 处理实体的物理运动
 */
export class PhysicsComponent extends Component {
    constructor(entity, options = {}) {
        super(entity);

        // 物理属性
        this.velocity = { x: 0, y: 0 };          // 速度向量
        this.gravity = options.gravity || 1500;   // 重力加速度 (像素/秒²)
        this.friction = options.friction || 0.9;  // 地面摩擦系数
        this.maxSpeed = options.maxSpeed || 400;  // 最大移动速度
        this.isOnGround = false;                  // 是否在地面
    }

    update(deltaTime) {
        if (!this.enabled) return;

        // 应用重力（如果不在地面）
        if (!this.isOnGround) {
            this.velocity.y += this.gravity * deltaTime;
        }

        // 应用地面摩擦（如果在地面）
        if (this.isOnGround) {
            this.velocity.x *= this.friction;
        }

        // 限制最大速度
        if (Math.abs(this.velocity.x) > this.maxSpeed) {
            this.velocity.x = Math.sign(this.velocity.x) * this.maxSpeed;
        }

        // 更新实体位置
        this.entity.x += this.velocity.x * deltaTime;
        this.entity.y += this.velocity.y * deltaTime;
    }

    /**
     * 施加力
     * @param {number} x - X轴力
     * @param {number} y - Y轴力
     */
    applyForce(x, y) {
        this.velocity.x += x;
        this.velocity.y += y;
    }

    /**
     * 设置速度
     * @param {number} x - X轴速度
     * @param {number} y - Y轴速度
     */
    setVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;
    }
}
