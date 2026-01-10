// src/ecs/world.js
import { components, ComponentBits } from "./components.js";

export class World {
  constructor() {
    this.nextEntityId = 1;
    this.entityCount = 0;
    this.entityMasks = new Map(); // entityId -> bitmask
    this.systems = [];

    // Component 儲存 (每個 component 類型一個 Map)
    this.componentStorage = {};
    for (const [name, comp] of Object.entries(components)) {
      this.componentStorage[name] = new Map();
    }

    // 碰撞旗標 (由 CollisionSystem 設定)
    this.collisionFlags = null;

    // 玩家實體 ID (便於其他系統引用)
    this.player = null;
  }

  // 創建新實體
  createEntity() {
    const id = this.nextEntityId++;
    this.entityMasks.set(id, 0);
    this.entityCount++;
    return id;
  }

  // 移除實體
  destroyEntity(entityId) {
    if (!this.entityMasks.has(entityId)) return;

    // 從所有 component storage 中移除
    for (const storage of Object.values(this.componentStorage)) {
      storage.delete(entityId);
    }

    this.entityMasks.delete(entityId);
    this.entityCount--;
  }

  // 添加組件
  addComponent(entityId, componentName, data = {}) {
    if (!this.entityMasks.has(entityId)) {
      console.warn(`Entity ${entityId} not found`);
      return;
    }

    const component = components[componentName];
    if (!component) {
      console.warn(`Component ${componentName} not found`);
      return;
    }

    // 合併預設值與傳入資料
    const componentData = { ...component.schema, ...data };

    // 儲存組件資料
    this.componentStorage[componentName].set(entityId, componentData);

    // 更新實體的組件遮罩
    const currentMask = this.entityMasks.get(entityId);
    this.entityMasks.set(entityId, currentMask | component.bit);
  }

  // 取得組件
  getComponent(entityId, componentName) {
    return this.componentStorage[componentName]?.get(entityId);
  }

  // 移除組件
  removeComponent(entityId, componentName) {
    const component = components[componentName];
    if (!component) return;

    this.componentStorage[componentName].delete(entityId);

    // 更新遮罩
    const currentMask = this.entityMasks.get(entityId);
    this.entityMasks.set(entityId, currentMask & ~component.bit);
  }

  // 檢查實體是否有組件
  hasComponent(entityId, componentName) {
    const component = components[componentName];
    if (!component) return false;

    const mask = this.entityMasks.get(entityId) || 0;
    return (mask & component.bit) !== 0;
  }

  // 查詢具有指定組件的實體
  query(componentNames) {
    let requiredMask = 0;

    for (const name of componentNames) {
      const bit = ComponentBits[name];
      if (bit !== undefined) {
        requiredMask |= bit;
      }
    }

    const result = [];
    for (const [entityId, mask] of this.entityMasks) {
      if ((mask & requiredMask) === requiredMask) {
        result.push(entityId);
      }
    }

    return result;
  }
}
