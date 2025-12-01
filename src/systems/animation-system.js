// src/systems/animation-system.js

export class AnimationSystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const entities = this.world.query(["Sprite", "CharacterState"]);

    for (const entity of entities) {
      this.updateAnimation(entity, dt);
    }
  }

  updateAnimation(entity, dt) {
    const sprite = this.world.getComponent(entity, "Sprite");
    const state = this.world.getComponent(entity, "CharacterState");
    const velocity = this.world.getComponent(entity, "Velocity");
    const attack = this.world.getComponent(entity, "Attack");
    const stun = this.world.getComponent(entity, "Stun");
    const health = this.world.getComponent(entity, "Health");

    if (!sprite || !state) return;

    // Determine animation based on character state
    let targetAnimation = "idle";

    if (health && health.current <= 0) {
      state.action = "dead";
    }

    if (state.action === "dead") {
      targetAnimation = this.chooseAvailable(sprite, ["dead", "idle"]);
    } else if (stun && stun.stunned) {
      targetAnimation = this.chooseAvailable(sprite, ["hurt", "idle"]);
    } else if (attack && attack.isAttacking) {
      targetAnimation = this.chooseAvailable(sprite, ["attack", "run", "idle"]);
    } else if (velocity && velocity.vy < -50) {
      // Jumping up
      targetAnimation = "jump";
    } else if (velocity && velocity.vy > 50) {
      // Falling
      targetAnimation = "jump"; // Use jump animation for fall too (or add separate fall)
    } else if (velocity && Math.abs(velocity.vx) > 10) {
      // Running/Walking
      targetAnimation = "run";
    } else {
      // Idle
      targetAnimation = "idle";
    }

    // Change animation if different
    if (sprite.currentAnimation !== targetAnimation) {
      this.setAnimation(sprite, targetAnimation);
    }

    // Update flip direction based on facing
    if (state.facing === -1) {
      sprite.flipX = true;
    } else {
      sprite.flipX = false;
    }

    // Update frame timing
    sprite.frameTime += dt;

    if (sprite.frameTime >= sprite.frameDuration) {
      sprite.frameTime = 0;

      const anim = sprite.animations[sprite.currentAnimation];
      if (anim) {
        sprite.frameIndex = (sprite.frameIndex + 1) % anim.frameCount;
      }
    }
  }

  chooseAvailable(sprite, order) {
    for (const name of order) {
      if (sprite.animations[name]) return name;
    }
    return order[order.length - 1] || sprite.currentAnimation;
  }

  setAnimation(sprite, animationName) {
    if (sprite.animations[animationName]) {
      sprite.currentAnimation = animationName;
      sprite.frameIndex = 0;
      sprite.frameTime = 0;
    }
  }
}
