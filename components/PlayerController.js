import { Component } from './Component.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';

/**
 * 玩家控制组件 - 处理玩家输入响应
 */
export class PlayerController extends Component {
    constructor(entity, options = {}) {
        super(entity);

        // 控制参数
        this.moveSpeed = options.moveSpeed || 400;    // 移动速度
        this.jumpForce = options.jumpForce || -600;   // 跳跃力量（负值表示向上）

        // 获取物理组件引用
        this.physics = this.entity.getComponent('PhysicsComponent');
    }

    update(deltaTime) {
        if (!this.enabled || !this.entity || !this.entity.scene) return;

        // 获取物理组件
        const physics = this.entity.getComponent(PhysicsComponent);
        if (!physics) return;

        const input = this.entity.scene.input;

        // 左右移动
        if (input.isKeyDown('ArrowLeft') || input.isKeyDown('a')) {
            physics.velocity.x = -this.moveSpeed;
        }
        else if (input.isKeyDown('ArrowRight') || input.isKeyDown('d')) {
            physics.velocity.x = this.moveSpeed;
        }

        // 跳跃
        if ((input.isKeyDown(' ') || input.isKeyDown('ArrowUp')) && physics.isOnGround) {
            physics.velocity.y = this.jumpForce;
            physics.isOnGround = false;
        }
    }
}
