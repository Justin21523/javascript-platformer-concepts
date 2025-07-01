// scenes/GameScene.js - 游戏主场景
import { Player } from '../entities/Player.js';
import { Platform } from '../entities/Platform.js';
import { Particle } from '../entities/Particle.js';

export class GameScene {
    constructor(canvas, ctx, input) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.input = input;

        // 场景实体
        this.entities = [];
        this.player = null;

        // 场景属性
        this.groundLevel = canvas.height - 50;
    }

    // 初始化场景
    init() {
        this.entities = [];

        // 创建玩家
        this.player = new Player(100, 200);
        this.player.scene = this; // 让玩家可以访问场景
        this.entities.push(this.player);

        // 创建平台
        this.createPlatforms();
    }

    // 创建平台
    createPlatforms() {
        // 地面
        this.entities.push(new Platform(0, this.groundLevel, this.canvas.width, 50, '#795548'));

        // 其他平台
        this.entities.push(new Platform(200, 350, 150, 20));
        this.entities.push(new Platform(400, 280, 120, 20));
        this.entities.push(new Platform(100, 200, 100, 20, '#2196F3'));
        this.entities.push(new Platform(550, 350, 100, 20, '#9C27B0'));
    }

    // 更新场景状态
    update(deltaTime) {
        // 处理玩家输入
        this.handlePlayerInput();

        // 更新所有实体
        this.entities.forEach(entity => {
            if (entity.active && entity.update) {
                entity.update(deltaTime);
            }
        });

        // 生成粒子效果
        this.generateParticles();

        // 清理无效实体
        this.cleanupEntities();
    }

    // 处理玩家输入
    handlePlayerInput() {
        // 左右移动
        if (this.input.isKeyDown('ArrowLeft') || this.input.isKeyDown('a')) {
            this.player.move(-1);
        }
        else if (this.input.isKeyDown('ArrowRight') || this.input.isKeyDown('d')) {
            this.player.move(1);
        }

        // 跳跃
        if (this.input.isKeyDown(' ')) {
            this.player.jump();
        }
    }

    // 生成粒子效果
    generateParticles() {
        if (Math.random() < 0.3 && this.player.isOnGround) {
            this.entities.push(new Particle(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height,
                `hsl(${Math.random() * 60 + 20}, 100%, 50%)`
            ));
        }
    }

    // 清理无效实体
    cleanupEntities() {
        this.entities = this.entities.filter(entity => {
            // 清理生命周期结束的粒子
            if (entity instanceof Particle && entity.life <= 0) {
                return false;
            }
            return true;
        });
    }

    // 渲染场景
    render() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.drawBackground();

        // 绘制所有实体
        this.entities.forEach(entity => {
            if (entity.visible && entity.draw) {
                entity.draw(this.ctx);
            }
        });

        // 绘制游戏信息
        this.drawGameInfo();
    }

    // 绘制背景
    drawBackground() {
        // 渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a237e');
        gradient.addColorStop(1, '#311b92');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 星星
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 100; i++) {
            const x = (i * 73) % this.canvas.width;
            const y = (i * 57) % this.canvas.height;
            const size = Math.sin(this.scene.gameTime + i) * 1 + 1.5;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    // 绘制游戏信息
    drawGameInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 90);

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(`实体数: ${this.entities.length}`, 20, 30);
        this.ctx.fillText(`玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`, 20, 50);
        this.ctx.fillText(`速度: (${Math.round(this.player.velocityX)}, ${Math.round(this.player.velocityY)})`, 20, 70);
        this.ctx.fillText(`状态: ${this.player.isOnGround ? '地面' : '空中'}`, 20, 90);
    }

    // 获取实体数量
    get entityCount() {
        return this.entities.length;
    }
}
