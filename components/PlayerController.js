import { Component } from './Component.js';
import { PhysicsComponent } from './PhysicsComponent.js';

/**
 * 玩家控制组件 - 处理玩家输入响应
 */
export class PlayerController extends Component {
    constructor(entity, opts = {}) {
        super(entity);

        this.moveAcceleration = opts.acceleration || 1800; // 加速度取代固定速度
        // 获取物理组件引用
        this.physics = this.entity.getComponent(PhysicsComponent);
    }

    update() {
        if (!this.enabled || !this.entity) return;

        // 获取物理组件
        const physics = this.entity.getComponent(PhysicsComponent);
        if (!physics) return;
        // 獲取時間系統
        const deltaTime = this.entity.scene.game.time.scaledTime;
        // 獲取輸入系統
        const input = this.entity.scene.input

        // (左右) 加速度基礎移動
        if (input.isKeyDown('ArrowLeft')) {
        this.physics.velocity.x -= this.moveAcceleration * deltaTime;
        } else if (input.isKeyDown('ArrowRight')) {
        this.physics.velocity.x += this.moveAcceleration * deltaTime;
        }

        // 跳躍觸發
        if ((input.isKeyDown(' ') || input.isKeyDown('ArrowUp')) && this.physics.isOnGround) {
            this.physics.jump();
        }

    }
}
