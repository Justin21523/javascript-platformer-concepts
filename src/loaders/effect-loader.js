// src/loaders/effect-loader.js
/**
 * EffectLoader - Loads visual effect sprites and animations
 * Handles combat effects, explosions, smoke, pickup effects, etc.
 *
 * Directory structure:
 * assets/effects/{category}/{effectName}/{effectName}(N).png
 *
 * Example: assets/effects/combat/slash/slash(1).png
 */

import { assetLoader } from "../core/asset-loader.js";

export class EffectLoader {
  constructor() {
    this.effects = new Map(); // Store loaded effect data
  }

  /**
   * Load a visual effect animation
   * @param {string} effectName - Effect identifier (e.g., "slash", "explosion-small")
   * @param {Object} config - Effect configuration
   * @returns {Promise<void>}
   */
  async loadEffect(effectName, config) {
    const {
      path, // Full path to effect folder
      frameCount,
      frameDuration = 0.05, // Effects are usually faster (50ms per frame)
      loop = false, // Most effects don't loop
      width,
      height,
    } = config;

    const effectData = {
      name: effectName,
      frames: [],
      frameCount,
      frameDuration,
      loop,
      width,
      height,
    };

    // Load all frames
    for (let i = 1; i <= frameCount; i++) {
      const framePath = `${path}/${effectName}(${i}).png`;
      try {
        const img = await assetLoader.loadImage(framePath);
        effectData.frames.push(img);
        console.log(`✓ Loaded effect ${effectName} frame ${i}/${frameCount}`);
      } catch (err) {
        console.error(`✗ Failed to load effect ${effectName} frame ${i}:`, framePath, err);
      }
    }

    this.effects.set(effectName, effectData);
    console.log(`✓ Effect "${effectName}" fully loaded (${frameCount} frames, loop=${loop})`);
  }

  /**
   * Load multiple effects from a configuration object
   * @param {Object} effectsConfig - Configuration for multiple effects
   * @returns {Promise<void>}
   */
  async loadEffects(effectsConfig) {
    const promises = [];

    for (const [effectName, config] of Object.entries(effectsConfig)) {
      promises.push(this.loadEffect(effectName, config));
    }

    await Promise.all(promises);
    console.log(`✓ All ${promises.length} effects loaded`);
  }

  /**
   * Get effect data
   * @param {string} effectName - Effect name
   * @returns {Object|null} Effect data
   */
  getEffect(effectName) {
    return this.effects.get(effectName) || null;
  }

  /**
   * Create an effect entity component
   * @param {string} effectName - Effect name
   * @param {number} x - World X position
   * @param {number} y - World Y position
   * @returns {Object} Component data for effect entity
   */
  createEffectComponent(effectName, x, y) {
    const effect = this.getEffect(effectName);
    if (!effect) {
      console.error(`Effect "${effectName}" not loaded`);
      return null;
    }

    return {
      // Transform component
      transform: {
        x,
        y,
        z: 10, // Effects render above entities
      },

      // Sprite-like animation component
      animation: {
        currentFrame: 0,
        frameTime: 0,
        frameDuration: effect.frameDuration,
        frames: effect.frames,
        loop: effect.loop,
        finished: false,
      },

      // Lifetime component (auto-destroy when animation finishes)
      lifetime: {
        duration: effect.frameCount * effect.frameDuration,
        elapsed: 0,
        destroyOnFinish: true,
      },

      // Renderable
      renderable: {
        width: effect.width,
        height: effect.height,
        visible: true,
      },
    };
  }

  /**
   * Check if effect is loaded
   * @param {string} effectName - Effect name
   * @returns {boolean}
   */
  isLoaded(effectName) {
    return this.effects.has(effectName);
  }

  /**
   * Get all loaded effect names
   * @returns {string[]}
   */
  getAllEffectNames() {
    return Array.from(this.effects.keys());
  }

  /**
   * Helper: Load common combat effects
   * @returns {Promise<void>}
   */
  async loadCommonCombatEffects() {
    const combatEffects = {
      "slash": {
        path: "assets/effects/combat/slash",
        frameCount: 8,
        frameDuration: 0.04,
        loop: false,
        width: 64,
        height: 64,
      },
      "hit-impact": {
        path: "assets/effects/combat/hit-impact",
        frameCount: 6,
        frameDuration: 0.05,
        loop: false,
        width: 48,
        height: 48,
      },
      "spark": {
        path: "assets/effects/combat/spark",
        frameCount: 8,
        frameDuration: 0.03,
        loop: false,
        width: 32,
        height: 32,
      },
    };

    await this.loadEffects(combatEffects);
  }

  /**
   * Helper: Load common explosion effects
   * @returns {Promise<void>}
   */
  async loadCommonExplosionEffects() {
    const explosionEffects = {
      "explosion-small": {
        path: "assets/effects/explosion/small",
        frameCount: 10,
        frameDuration: 0.05,
        loop: false,
        width: 64,
        height: 64,
      },
      "explosion-medium": {
        path: "assets/effects/explosion/medium",
        frameCount: 12,
        frameDuration: 0.06,
        loop: false,
        width: 96,
        height: 96,
      },
      "explosion-large": {
        path: "assets/effects/explosion/large",
        frameCount: 15,
        frameDuration: 0.07,
        loop: false,
        width: 128,
        height: 128,
      },
    };

    await this.loadEffects(explosionEffects);
  }

  /**
   * Helper: Load common pickup effects
   * @returns {Promise<void>}
   */
  async loadCommonPickupEffects() {
    const pickupEffects = {
      "coin-sparkle": {
        path: "assets/effects/pickup/coin-sparkle",
        frameCount: 8,
        frameDuration: 0.06,
        loop: false,
        width: 32,
        height: 32,
      },
      "star-shine": {
        path: "assets/effects/pickup/star-shine",
        frameCount: 10,
        frameDuration: 0.05,
        loop: false,
        width: 48,
        height: 48,
      },
    };

    await this.loadEffects(pickupEffects);
  }
}
