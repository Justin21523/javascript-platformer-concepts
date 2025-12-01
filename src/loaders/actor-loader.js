// src/loaders/actor-loader.js
import { assetLoader } from "../core/asset-loader.js";
import { debugLog } from "../debug.js";

/**
 * ActorLoader - Loads character sprites and animations
 */
export class ActorLoader {
  constructor() {
    this.actors = {}; // Cached actor data
  }

  /**
   * Load an actor with all animations
   * @param {string} actorName - Actor name (e.g., "JackOLantern")
   * @param {Object} config - Actor configuration
   * @returns {Promise<Object>} Actor data with animations
   */
  async loadActor(actorName, config) {
    debugLog("ActorLoader", `Loading actor: ${actorName}`);

    const basePath = config.basePath || `assets/sprites/player/${actorName}`;
    const animations = {};

    // Load all animations
    for (const [animName, animConfig] of Object.entries(config.animations)) {
      const frames = [];
      const frameCount = animConfig.frameCount;
      const animPath = `${basePath}/${animConfig.folder}`;

      // Load all frames for this animation
      for (let i = 1; i <= frameCount; i++) {
        const framePath = `${animPath}/${animConfig.folder}(${i}).png`;
        try {
          const img = await assetLoader.loadImage(framePath);
          frames.push(img);
        } catch (error) {
          console.error(`Failed to load frame: ${framePath}`, error);
        }
      }

      animations[animName] = {
        frames,
        frameCount,
      };

      debugLog(
        "ActorLoader",
        `Loaded animation '${animName}': ${frames.length} frames`
      );
    }

    const actorData = {
      name: actorName,
      animations,
      width: config.width || 128,
      height: config.height || 192,
      frameDuration: config.frameDuration || 0.1,
    };

    this.actors[actorName] = actorData;
    debugLog("ActorLoader", `Actor '${actorName}' loaded successfully`);

    return actorData;
  }

  /**
   * Get cached actor data
   */
  getActor(actorName) {
    return this.actors[actorName];
  }

  /**
   * Create sprite component data from actor
   */
  createSpriteComponent(actorName, initialAnimation = "idle") {
    const actor = this.getActor(actorName);
    if (!actor) {
      console.error(`Actor '${actorName}' not loaded!`);
      return null;
    }

    return {
      currentAnimation: initialAnimation,
      frameIndex: 0,
      frameTime: 0,
      frameDuration: actor.frameDuration,
      animations: actor.animations,
      flipX: false,
      flipY: false,
      width: actor.width,
      height: actor.height,
    };
  }
}
