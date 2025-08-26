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
        this.maxSpeedX = options.maxSpeedX || 400;  // 最大移动速度X
        this.jumpForce = options.jumpForce || 0;
        this.isOnGround = false;                  // 是否在地面
    }

    update() {
        if (!this.enabled) return;

        // 獲取時間系統實例 (需通過場景取得)
        const timeSystem = this.entity.scene.game.time;

        // 使用 scaledTime 確保受時間縮放影響
        const deltaTime = timeSystem.scaledTime;

        // 物理計算
        if (!this.isOnGround) {
            this.velocity.y += this.gravity * deltaTime;
        } else {
            this.velocity.x *= Math.pow(this.friction, deltaTime * 60); // 幀率補償
        }

        // 水平速度限制
        this.velocity.x = Math.max(-this.maxSpeedX, Math.min(this.velocity.x, this.maxSpeedX));

        // 更新實體位置
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

    // 跳躍方法供控制器呼叫
    jump() {
        if (this.isOnGround) {
        this.velocity.y = this.jumpForce;
        this.isOnGround = false;
        }
    }

}
