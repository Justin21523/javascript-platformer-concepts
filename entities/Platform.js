// entities/Platform.js - 平台实体
import { Entity } from './Entity.js';

export class Platform extends Entity {
    constructor(x, y, width, height, color = '#4CAF50') {
        super(x, y);
        this.width = width;
        this.height = height;
        this.color = color;
    }

    // 绘制平台
    draw(ctx) {
        // 绘制平台主体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // 添加平台纹理
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < this.width; i += 20) {
            ctx.fillRect(this.x + i, this.y, 10, 3);
        }
    }
}
