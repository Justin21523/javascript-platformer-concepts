// src/systems/input-system.js
import { snapshot } from "../input.js";
import { ComponentBits } from "../ecs/components.js";

export class InputSystem {
  constructor() {
    this.world = null;
  }

  setWorld(world) {
    this.world = world;
  }

  update(dt) {
    if (!this.world) return;

    const inputSnapshot = snapshot();

    // 只更新玩家輸入，避免覆蓋 AI 實體的指令
    const playerId = this.world.player;
    if (!playerId) return;

    const input = this.world.getComponent(playerId, "Input");
    if (input) {
      Object.assign(input, inputSnapshot);
    }
  }
}
