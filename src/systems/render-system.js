// src/systems/render-system.js
import { COMPONENT_TYPES, components } from "../ecs/components.js";
import { RENDER } from "../config.js";

export class RenderSystem {
  update(dt) {
    const ctx = this.world.ctx;

    // 清空畫布
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 繪製所有可渲染實體
    const entities = this.world.query(
      COMPONENT_TYPES.TRANSFORM,
      COMPONENT_TYPES.RENDERABLE
    );

    for (const entityId of entities) {
      const transform = components.Transform[entityId];
      const renderable = components.Renderable[entityId];

      if (!renderable.visible) continue;

      // 暫時畫白色矩形代表玩家
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        Math.round(transform.x - renderable.originX),
        Math.round(transform.y - renderable.originY),
        16, // 寬度
        24 // 高度
      );

      // 畫朝向箭頭
      const state = components.CharacterState[entityId];
      if (state) {
        ctx.fillStyle =
          state.action === "jump"
            ? "#00ff00"
            : state.action === "fall"
            ? "#ff8800"
            : state.action === "run"
            ? "#0088ff"
            : "#ffffff";

        const arrowX = transform.x + (state.facing > 0 ? 12 : -12);
        const arrowY = transform.y - 10;

        ctx.fillRect(arrowX, arrowY, 4, 4);
      }
    }
  }
}
