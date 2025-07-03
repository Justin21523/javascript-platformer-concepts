// entities/Player.js - 玩家角色
import { Entity } from './Entity.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';
import { ColliderComponent } from '../components/ColliderComponent.js';
import { PlayerController } from '../components/PlayerController.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y);

        // 基本屬性
        this.width = 40;
        this.height = 60;
        this.color = '#FF5722';

        // 添加组件  - 必须步骤！
        this.addComponent(new PhysicsComponent(this, {
            gravity: 1500,
            friction: 0.9,
            maxSpeed: 400
        }));

        this.addComponent(new ColliderComponent(this, {
            type: 'box',
            width: 40,
            height: 60,
            offsetX: 0,
            offsetY: 0
        }));

        this.addComponent(new PlayerController(this, {
            moveSpeed: 400,
            jumpForce: -600
        }));

    }

    /**
     * 更新玩家状态
     * @param {number} deltaTime - 帧间时间差
     */
    // 更新玩家状态
    update(deltaTime) {
        // 调用父类更新方法（更新所有组件）
        super.update(deltaTime);

        // 玩家特定逻辑

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

    /**
     * 渲染玩家
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    draw(ctx) {
        // 保存当前绘图状态
        ctx.save();

        // 绘制玩家主体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 绘制眼睛 - 使用相对位置
        const eyeX = this.x + this.width * 0.75; // 眼睛在75%宽度处
        const eyeY = this.y + this.height * 0.33; // 眼睛在1/3高度处
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, this.width * 0.125, 0, Math.PI * 2); // 眼睛大小为宽度1/8
        ctx.fill();

        // 获取物理组件
        const physics = this.getComponent(PhysicsComponent);
        const isJumping = physics && !physics.isOnGround;

        // 绘制嘴巴表情
        this.drawMouth(ctx, isJumping);

        // 绘制跳跃状态指示器  - 更明显的效果
        if (isJumping) {
            this.drawJumpIndicator(ctx);
        }

        // 绘制碰撞器边界（调试用）
        if (this.scene && this.scene.debugMode) {
            const collider = this.getComponent(ColliderComponent);
            if (collider) {
                collider.draw(ctx);
            }
        }

        // 恢复绘图状态
        ctx.restore();
    }

    /**
     * 绘制嘴巴表情
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {boolean} isJumping - 是否跳跃中
     */
    drawMouth(ctx, isJumping) {
        const mouthY = this.y + this.height * 0.6;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.3, mouthY);

        // 跳跃时微笑，地面时平嘴
        const curveOffset = isJumping ? -5 : 0;

        ctx.quadraticCurveTo(
            this.x + this.width * 0.5,
            mouthY + curveOffset,
            this.x + this.width * 0.7,
            mouthY
        );

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * 绘制跳跃指示器
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     */
    drawJumpIndicator(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';

        // 创建三个粒子表示跳跃强度
        for (let i = 0; i < 3; i++) {
            // 动态偏移使粒子轻微晃动
            const offset = Math.sin(this.scene.time.gameTime * 10 + i) * 3;

            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2 + offset,
                this.y - 15 - i * 5,
                2 + i,  // 粒子大小递增
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }


    // 以下可能不需要用了
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
