// src/loaders/enemy-loader.js
/**
 * EnemyLoader - Loads enemy character sprites and animations
 * Similar to ActorLoader but specifically for enemy assets
 *
 * Directory structure:
 * assets/sprites/enemies/{enemyName}/{actionName}/{actionName}(N).png
 *
 * Example: assets/sprites/enemies/slime/idle/idle(1).png
 */

import { assetLoader } from "../core/asset-loader.js";

export class EnemyLoader {
  constructor() {
    this.enemies = new Map(); // Store loaded enemy data
  }

  /**
   * Load an enemy character with all its animations
   * @param {string} enemyName - Enemy character name (e.g., "slime", "bat")
   * @param {Object} config - Enemy configuration
   * @returns {Promise<void>}
   */
  async loadEnemy(enemyName, config) {
    const {
      basePath = `assets/sprites/enemies/${enemyName}`,
      width,
      height,
      frameDuration = 0.1,
      animations = {},
    } = config;

    const enemyData = {
      name: enemyName,
      width,
      height,
      frameDuration,
      animations: {},
    };

    // Load each animation
    for (const [animName, animConfig] of Object.entries(animations)) {
      const { folder, frameCount } = animConfig;
      const frames = [];

      // Load all frames for this animation
      for (let i = 1; i <= frameCount; i++) {
        const framePath = `${basePath}/${folder}/${folder}(${i}).png`;
        try {
          const img = await assetLoader.loadImage(framePath);
          frames.push(img);
          console.log(`✓ Loaded enemy ${enemyName} ${animName} frame ${i}/${frameCount}`);
        } catch (err) {
          console.error(`✗ Failed to load ${enemyName} ${animName} frame ${i}:`, framePath, err);
        }
      }

      enemyData.animations[animName] = {
        frames,
        frameCount,
      };
    }

    this.enemies.set(enemyName, enemyData);
    console.log(`✓ Enemy "${enemyName}" fully loaded with ${Object.keys(animations).length} animations`);
  }

  /**
   * Get enemy data
   * @param {string} enemyName - Enemy name
   * @returns {Object|null} Enemy data
   */
  getEnemy(enemyName) {
    return this.enemies.get(enemyName) || null;
  }

  /**
   * Create a Sprite component for an enemy
   * @param {string} enemyName - Enemy name
   * @param {string} initialAnimation - Initial animation name
   * @returns {Object} Sprite component data
   */
  createSpriteComponent(enemyName, initialAnimation = "idle") {
    const enemy = this.getEnemy(enemyName);
    if (!enemy) {
      console.error(`Enemy "${enemyName}" not loaded`);
      return null;
    }

    return {
      currentAnimation: initialAnimation,
      frameIndex: 0,
      frameTime: 0,
      frameDuration: enemy.frameDuration,
      animations: enemy.animations,
      flipX: false,
      flipY: false,
      width: enemy.width,
      height: enemy.height,
    };
  }

  /**
   * Check if enemy is loaded
   * @param {string} enemyName - Enemy name
   * @returns {boolean}
   */
  isLoaded(enemyName) {
    return this.enemies.has(enemyName);
  }

  /**
   * Get all loaded enemy names
   * @returns {string[]}
   */
  getAllEnemyNames() {
    return Array.from(this.enemies.keys());
  }
}
