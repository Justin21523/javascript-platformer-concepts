// src/ecs/world.js
import { components, COMPONENT_TYPES } from "./components.js";

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false; // 像素風格

    this.entities = new Map(); // entityId -> bitmask
    this.nextEntityId = 1;
    this.systems = [];
  }

  createEntity() {
    const id = this.nextEntityId++;
    this.entities.set(id, 0);
    return id;
  }

  addComponent(entityId, componentType, componentData) {
    if (!this.entities.has(entityId)) return;

    const mask = this.entities.get(entityId);
    this.entities.set(entityId, mask | componentType);

    // Store component data
    const componentName = this.getComponentName(componentType);
    if (componentName) {
      components[componentName][entityId] = componentData;
    }
  }

  getComponentName(type) {
    return Object.keys(COMPONENT_TYPES).find(
      (key) => COMPONENT_TYPES[key] === type
    );
  }

  hasComponents(entityId, ...componentTypes) {
    if (!this.entities.has(entityId)) return false;
    const mask = this.entities.get(entityId);
    const required = componentTypes.reduce((acc, type) => acc | type, 0);
    return (mask & required) === required;
  }

  query(...componentTypes) {
    const results = [];
    for (const [entityId, mask] of this.entities) {
      const required = componentTypes.reduce((acc, type) => acc | type, 0);
      if ((mask & required) === required) {
        results.push(entityId);
      }
    }
    return results;
  }

  addSystem(system) {
    system.world = this;
    this.systems.push(system);
  }
}
