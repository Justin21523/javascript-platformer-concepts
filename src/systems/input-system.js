// src/systems/input-system.js
import { snapshot } from "../input.js";
import { COMPONENT_TYPES, components } from "../ecs/components.js";

export class InputSystem {
  update(dt) {
    const inputSnapshot = snapshot();

    // 找到所有具有 Input component 的實體
    const entities = this.world.query(COMPONENT_TYPES.INPUT);

    for (const entityId of entities) {
      const input = components.Input[entityId];
      if (input) {
        // 更新輸入狀態
        Object.assign(input, inputSnapshot);
      }
    }
  }
}
