// src/systems/ai-system.js
// Core AI runtime: perception + behavior + movement intent
import { clamp, sign } from "../core/math.js";

export class AISystem {
  constructor(world, damageSystem) {
    this.world = world;
    this.damageSystem = damageSystem;
  }

  update(dt) {
    if (this.world.voidMode?.active) return;
    const entities = this.world.query([
      "AIState",
      "Perception",
      "BehaviorProfile",
      "CombatStats",
      "Transform",
    ]);

    for (const entity of entities) {
      const ai = this.world.getComponent(entity, "AIState");
      const perception = this.world.getComponent(entity, "Perception");
      const behavior = this.world.getComponent(entity, "BehaviorProfile");
      const stats = this.world.getComponent(entity, "CombatStats");
      const transform = this.world.getComponent(entity, "Transform");
      const input = this.world.getComponent(entity, "Input");
      const characterState = this.world.getComponent(entity, "CharacterState");
      const health = this.world.getComponent(entity, "Health");
      const stun = this.world.getComponent(entity, "Stun");

      // AI needs an input surface to steer movement
      if (!input) continue;

      // Reset per-frame intent
      ai.intent = { move: 0, jump: false, attack: false };
      ai.stateTime += dt;

      // Resolve stun timers
      if (stun && stun.stunned) {
        stun.elapsed += dt;
        ai.state = "stunned";
        if (stun.elapsed >= stun.duration) {
          stun.stunned = false;
          stun.elapsed = 0;
          ai.stateTime = 0;
          ai.state = "idle";
        } else {
          this.applyIntent(entity, ai, input, characterState);
          continue;
        }
      }

      this.updateSense(entity, dt, ai, perception, transform, characterState);
      this.updateBehavior(entity, dt, {
        ai,
        behavior,
        stats,
        transform,
        characterState,
        health,
      });
      this.applyIntent(entity, ai, input, characterState);
    }
  }

  updateSense(entity, dt, ai, perception, transform, characterState) {
    const playerId = this.world.player;
    const playerTransform =
      playerId !== null ? this.world.getComponent(playerId, "Transform") : null;

    if (!playerTransform) {
      ai.alertLevel = Math.max(0, ai.alertLevel - dt);
      ai.target = null;
      return;
    }

    // Check distance and FOV
    const dx = playerTransform.x - transform.x;
    const dy = playerTransform.y - transform.y;
    const dist = Math.hypot(dx, dy) || 1;
    const facing = characterState ? characterState.facing : 1;
    const forward = { x: facing, y: 0 };
    const dir = { x: dx / dist, y: dy / dist };
    const dot = clamp(dir.x * forward.x + dir.y * forward.y, -1, 1);
    const angle = Math.acos(dot);

    const behavior = this.world.getComponent(entity, "BehaviorProfile");
    const maxAggro = behavior?.maxAggroDistance ?? Infinity;

    const inFov =
      dist <= perception.sightRange &&
      angle <= perception.fov * 0.5 &&
      dist <= maxAggro;
    const inPeripheral = dist <= perception.peripheralRange && dist <= maxAggro;
    const detected = inFov || inPeripheral;

    // Smooth alert level up/down
    if (detected) {
      ai.alertLevel = clamp(ai.alertLevel + dt / perception.checkInterval, 0, 1);
      ai.target = playerId;
      ai.lastSeenPos = { x: playerTransform.x, y: playerTransform.y };
    } else {
      ai.alertLevel = clamp(
        ai.alertLevel - dt / Math.max(0.001, perception.loseSightTime),
        0,
        1
      );
      if (ai.alertLevel === 0) {
        ai.target = null;
      }
    }
  }

  updateBehavior(entity, dt, ctx) {
    const { ai, behavior, stats, transform, characterState, health } = ctx;
    const attack = this.world.getComponent(entity, "Attack");
    const targetId = ai.target;
    const targetTransform =
      targetId !== null ? this.world.getComponent(targetId, "Transform") : null;

    const attackRange = behavior.attackRange ?? stats.attackRange;
    const chaseRange = behavior.chaseRange ?? stats.attackRange * 2;
    const disengageRange = behavior.disengageRange ?? chaseRange * 1.3;
    const lowHealth =
      health && health.max > 0
        ? health.current / health.max <= behavior.retreatHealthPct
        : false;

    let distToTarget = Infinity;
    if (targetTransform) {
      distToTarget = Math.hypot(
        targetTransform.x - transform.x,
        targetTransform.y - transform.y
      );
    } else if (ai.lastSeenPos) {
      distToTarget = Math.hypot(
        ai.lastSeenPos.x - transform.x,
        ai.lastSeenPos.y - transform.y
      );
    }

    // State selection
    if (ai.state === "stunned") {
      return;
    } else if (lowHealth && targetTransform) {
      this.setState(ai, "retreat");
    } else if (targetTransform && ai.alertLevel > 0.2) {
      if (distToTarget > disengageRange) {
        ai.target = null;
        ai.lastSeenPos = null;
        this.setState(ai, "idle");
      } else if (distToTarget <= attackRange * 0.9) {
        this.setState(ai, "attack");
      } else {
        this.setState(ai, "chase");
      }
    } else if (ai.lastSeenPos && distToTarget < chaseRange) {
      this.setState(ai, "investigate");
    } else if (behavior.patrolPoints.length > 0) {
      if (ai.state !== "patrol" && ai.state !== "idle") {
        this.setState(ai, "patrol");
      }
    } else {
      this.setState(ai, "idle");
    }

    // Decay jump timer for gap assists
    behavior.jumpTimer = Math.max(0, behavior.jumpTimer - dt);

    // State actions
    switch (ai.state) {
      case "idle":
        ai.intent.move = 0;
        ai.debugLabel = "idle";
        if (behavior.patrolPoints.length > 0 && ai.stateTime > behavior.idleDuration) {
          this.setState(ai, "patrol");
        }
        break;

      case "patrol": {
        ai.debugLabel = "patrol";
        const points = behavior.patrolPoints;
        if (points.length === 0) {
          ai.intent.move = 0;
          break;
        }
        const targetPoint = points[behavior.patrolIndex % points.length];
        const dirX = sign(targetPoint.x - transform.x);
        ai.intent.move = dirX;
        if (Math.hypot(targetPoint.x - transform.x, targetPoint.y - transform.y) < 8) {
          behavior.patrolIndex = (behavior.patrolIndex + 1) % points.length;
          this.setState(ai, "idle");
        }
        break;
      }

      case "investigate": {
        ai.debugLabel = "investigate";
        if (!ai.lastSeenPos) {
          this.setState(ai, "idle");
          break;
        }
        const dirX = sign(ai.lastSeenPos.x - transform.x);
        ai.intent.move = dirX;
        if (distToTarget < 12) {
          this.setState(ai, "idle");
        }
        break;
      }

      case "chase": {
        ai.debugLabel = "chase";
        if (!targetTransform) {
          this.setState(ai, "investigate");
          break;
        }
        const dirX = sign(targetTransform.x - transform.x);
        ai.intent.move = dirX;
        if (targetTransform.y + 12 < transform.y && behavior.jumpGap && behavior.jumpTimer === 0) {
          ai.intent.jump = true;
          behavior.jumpTimer = behavior.jumpCooldown;
        }
        if (distToTarget <= attackRange * 0.9) {
          this.setState(ai, "attack");
        }
        break;
      }

      case "attack": {
        ai.debugLabel = "attack";
        ai.intent.move = 0;
        if (!targetTransform) {
          this.setState(ai, "idle");
          break;
        }
        if (characterState) {
          characterState.facing = targetTransform.x >= transform.x ? 1 : -1;
        }
        const attackReady =
          attack && this.damageSystem && this.damageSystem.canAttack(entity);
        if (attackReady && distToTarget <= attackRange * 1.05) {
          ai.intent.attack = true;
          this.damageSystem.triggerAttack(entity);
        } else if (distToTarget > attackRange * 1.2) {
          this.setState(ai, "chase");
        }
        break;
      }

      case "retreat": {
        ai.debugLabel = "retreat";
        if (targetTransform) {
          const dirX = sign(transform.x - targetTransform.x);
          ai.intent.move = dirX;
          if (distToTarget > chaseRange * 1.2) {
            this.setState(ai, "idle");
          }
        } else {
          ai.intent.move = 0;
          this.setState(ai, "idle");
        }
        break;
      }
    }
  }

  applyIntent(entity, ai, input, characterState) {
    const intent = ai.intent || { move: 0, jump: false, attack: false };
    const hasPattern = this.world.hasComponent(entity, "MovementPattern");

    if (!hasPattern) {
      input.left = intent.move < 0;
      input.right = intent.move > 0;
      input.jump = intent.jump;
    }
    input.attack = intent.attack;

    if (characterState && intent.move !== 0) {
      characterState.facing = intent.move;
    }
  }

  setState(ai, newState) {
    if (ai.state !== newState) {
      ai.state = newState;
      ai.stateTime = 0;
    }
  }
}
