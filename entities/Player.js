// entities/Player.js - 玩家角色
import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y);

        // 尺寸属性
        this.width = 40;
        this.height = 60;

        // 速度属性
        this.velocityX = 0;
        this.velocityY = 0;

        // 状态属性
        this.isJumping = false;
        this.isOnGround = false;

        // 外观属性
        this.color = '#FF5722';

        // 物理属性
        this.gravity = 1500;
        this.moveSpeed = 400;
        this.jumpForce = -600;
        this.friction = 0.9;
    }

    // 更新玩家状态
    update(deltaTime) {
        // 应用重力
        this.velocityY += this.gravity * deltaTime;

        // 应用摩擦力
        this.velocityX *= this.friction;

        // 更新位置
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        // 地面碰撞检测
        this.isOnGround = this.y >= this.scene.groundLevel - this.height;
        if (this.isOnGround) {
            this.y = this.scene.groundLevel - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }

    // 渲染玩家
    draw(ctx) {
        // 绘制玩家主体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 30, this.y + 20, 5, 0, Math.PI * 2);
        ctx.fill();

        // 绘制状态指示器
        if (this.isJumping) {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(this.x + 10, this.y - 10, 5, 5);
        }
    }

    // 移动方法
    move(direction) {
        this.velocityX = direction * this.moveSpeed;
    }

    // 跳跃方法
    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
            this.isOnGround = false;
        }
    }
}
