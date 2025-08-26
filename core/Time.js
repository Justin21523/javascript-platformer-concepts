/**
 * 时间管理系统 - 统一管理游戏时间
 */
export class Time {
    constructor() {
        this.gameTime = 0;       // 游戏运行总时间（秒）
        this.deltaTime = 0;      // 帧间时间差（秒）
        this.scaledTime = 0;     // 经过时间缩放的时间
        this.timeScale = 1.0;    // 时间缩放因子

        // 新增除錯相關屬性
        this.frameCount = 0;     // 幀計數器
        this.frameTimer = 0;     // 幀計時器
        this.fps = 0;            // 當前FPS
    }

    /**
     * 更新时间
     * @param {number} deltaTime - 原始帧间时间差
     */
    update(deltaTime) {
        this.deltaTime = deltaTime;
        this.gameTime += deltaTime;
        this.scaledTime = deltaTime * this.timeScale;

        // 更新FPS計算
        this.frameCount++;
        this.frameTimer += deltaTime;

        if (this.frameTimer >= 1) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.frameTimer = 0;
        }
    }

    /**
     * 设置时间缩放
     * @param {number} scale - 时间缩放因子 (0.0-2.0)
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, Math.min(scale, 2.0));
    }
}
