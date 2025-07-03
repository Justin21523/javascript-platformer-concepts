// entities/Particle.js - 粒子实体
import { Entity } from './Entity.js';

export class Particle extends Entity {
    constructor(x, y, color) {
        super(x, y);

        // 外观属性
        this.size = Math.random() * 8 + 2; // 2~10
        this.color = color;

        // 运动属性
        this.speedX = Math.random() * 200 - 100; // 100~-100
        this.speedY = Math.random() * 200 - 100; // 100~-100

        // 生命周期属性
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.01; // 0.01 ~ 0.06
    }

    // 更新粒子状态
    update(deltaTime) {
        // 更新位置
        this.x += this.speedX * deltaTime;
        this.y += this.speedY * deltaTime;

        // 更新生命周期
        this.life -= this.decay * deltaTime * 60;

        // 返回粒子是否仍然存活
        return this.life > 0;
    }

    // 绘制粒子
    draw(ctx) {
        // 设置透明度基于生命周期
        ctx.globalAlpha = this.life;

        // 绘制粒子
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // 重置透明度
        ctx.globalAlpha = 1.0;
    }
}
