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

    // 找到所有具有 Input component 的實體
    const entities = this.world.query(["Input"]);

    for (const entityId of entities) {
      const input = this.world.getComponent(entityId, "Input");
      if (input) {
        // 更新輸入狀態
        Object.assign(input, inputSnapshot);
      }
    }
  }
}
