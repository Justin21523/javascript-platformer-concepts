// scenes/GameScene.js - 游戏主场景
import { Player } from '../entities/Player.js';
import { Platform } from '../entities/Platform.js';
import { Particle } from '../entities/Particle.js';


export class GameScene {
    constructor(canvas, ctx, input, time) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.input = input;
        this.time = time; // 时间系统引用

        // 场景实体
        this.entities = [];
        this.player = null;

        // 场景属性
        this.groundLevel = canvas.height - 50;
        this.gameTime = 0; // 场景局部时间（可选）
        // 调试模式状态
        this.debugMode = true; // 默认开启调试模式
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
        // 更新场景时间（可选）
        this.gameTime += deltaTime;

        // 处理玩家输入
        this.handlePlayerInput();

        // 更新所有实体
        this.entities.forEach(entity => {
            if (entity.active && entity.update) {
                entity.update(deltaTime);
            }
        });
        // 处理碰撞
        this.handleCollisions();

        // 生成粒子效果
        this.generateParticles();

        // 清理无效实体
        this.cleanupEntities();

        // 检测调试模式切换
        if (this.input.isKeyDown('F1')) {
            this.debugMode = !this.debugMode;
        }
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


    handleCollisions() {
        // 获取玩家和所有平台
        const player = this.player;
        const platforms = this.entities.filter(e => e instanceof Platform);

        if (!player) return;

        // 获取玩家的物理和碰撞组件
        const playerPhysics = player.getComponent('PhysicsComponent');
        const playerCollider = player.getComponent('ColliderComponent');

        // 初始假设玩家不在地面
        playerPhysics.isOnGround = false;

        // 检查与每个平台的碰撞
        for (const platform of platforms) {
            const platformCollider = platform.getComponent('ColliderComponent');

            if (playerCollider && platformCollider &&
                playerCollider.checkCollision(platformCollider)) {

                // 从上方碰撞平台（落地）
                if (playerPhysics.velocity.y > 0 &&
                    playerCollider.bottom >= platformCollider.top &&
                    playerCollider.bottom <= platformCollider.top + 10) {

                    player.y = platformCollider.top - player.height;
                    playerPhysics.velocity.y = 0;
                    playerPhysics.isOnGround = true;
                }
                // 从下方碰撞平台
                else if (playerPhysics.velocity.y < 0 &&
                        playerCollider.top <= platformCollider.bottom &&
                        playerCollider.top >= platformCollider.bottom - 10) {

                    player.y = platformCollider.bottom;
                    playerPhysics.velocity.y = 0;
                }
                // 从左侧碰撞平台
                else if (playerPhysics.velocity.x > 0 &&
                        playerCollider.right >= platformCollider.left &&
                        playerCollider.right <= platformCollider.left + 10) {

                    player.x = platformCollider.left - player.width;
                    playerPhysics.velocity.x = 0;
                }
                // 从右侧碰撞平台
                else if (playerPhysics.velocity.x < 0 &&
                        playerCollider.left <= platformCollider.right &&
                        playerCollider.left >= platformCollider.right - 10) {

                    player.x = platformCollider.right;
                    playerPhysics.velocity.x = 0;
                }
            }
        }

        // 地面碰撞检测
        if (player.y >= this.groundLevel - player.height) {
            player.y = this.groundLevel - player.height;
            playerPhysics.velocity.y = 0;
            playerPhysics.isOnGround = true;
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

        // 星星 - 使用全局时间
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 100; i++) {
            const x = (i * 73) % this.canvas.width; //  使用模运算在画布上分布星星
            const y = (i * 57) % this.canvas.height; // 73 和 57 是质数，这样分布更均匀，避免重复模式
             // 正弦函数创建脉动效果
             // + i 使每颗星星有相位偏移，创建波浪效果  大小范围控制在 0.5-2.5 像素之间
            const size = Math.sin(this.time.gameTime * 2 + i) * 1 + 1.5;
            this.ctx.fillRect(x, y, size, size)
        }

        // 远处山脉 - 同样使用全局时间
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let i = 0; i < 5; i++) {
            const height = 100 + Math.sin(this.time.gameTime/2 + i) * 20;
            this.ctx.beginPath();
            this.ctx.moveTo(i * 200 - 50, this.canvas.height - 50);
            this.ctx.lineTo(i * 200 + 50, this.canvas.height - 50);
            this.ctx.lineTo(i * 200 + 100, this.canvas.height - 50 - height);
            this.ctx.lineTo(i * 200 + 200, this.canvas.height - 50 - height/2);
            this.ctx.lineTo(i * 200 + 250, this.canvas.height - 50);
            this.ctx.lineTo(i * 200 + 300, this.canvas.height - 50);
            this.ctx.fill();
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

        // 显示调试模式状态
        this.ctx.fillText(`调试模式: ${this.debugMode ? '开启' : '关闭'} (F1)`, 20, 110);
        // 调试模式提示
        if (this.debugMode) {
            this.ctx.fillStyle = 'rgba(255, 50, 50, 0.7)';
            this.ctx.fillRect(10, 130, 250, 40);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('碰撞框: 红色 | 跳跃状态: 黄色粒子', 20, 150);
            this.ctx.fillText('地面碰撞: 绿色 | 平台碰撞: 蓝色', 20, 165);
        }
        // 为了更好理解这些数学效果，我创建了一个可视化面板：
        // 正弦波可视化
        if (this.debugMode) {
            this.drawWaveVisualization();
        }
    }

    // 获取实体数量
    get entityCount() {
        return this.entities.length;
    }

    drawWaveVisualization() {
        const ctx = this.ctx;
        const startX = 400;
        const startY = 100;
        const width = 150;
        const height = 60;

        // 绘制坐标系
        ctx.strokeStyle = '#ccc';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + width, startY);
        ctx.moveTo(startX, startY - height/2);
        ctx.lineTo(startX, startY + height/2);
        ctx.stroke();

        // 绘制基准线
        ctx.strokeStyle = '#666';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + width, startY);
        ctx.stroke();

        // 绘制正弦波
        ctx.strokeStyle = '#ff9900';
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        for (let x = 0; x < width; x++) {
            const t = (x / width) * 2 * Math.PI;
            const y = Math.sin(t + this.time.gameTime * 2) * height/2;
            ctx.lineTo(startX + x, startY - y);
        }

        ctx.stroke();

        // 绘制说明文字
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('正弦波可视化', startX, startY + height/2 + 20);
        ctx.fillText(`频率: 2.0 | 时间: ${this.time.gameTime.toFixed(1)}s`, startX, startY + height/2 + 35);
    }
}
