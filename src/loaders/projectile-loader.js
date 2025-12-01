// src/loaders/projectile-loader.js
/**
 * ProjectileLoader - Loads projectile sprites (bullets, arrows, magic, etc.)
 * Handles both static and animated projectiles
 *
 * Directory structure:
 * assets/projectiles/{projectileName}/{projectileName}(N).png  (for animated)
 * assets/projectiles/{projectileName}/{projectileName}.png     (for static)
 *
 * Example: assets/projectiles/arrow/arrow(1).png ~ arrow(4).png
 */

import { assetLoader } from "../core/asset-loader.js";

export class ProjectileLoader {
  constructor() {
    this.projectiles = new Map(); // Store loaded projectile data
  }

  /**
   * Load a projectile sprite (static or animated)
   * @param {string} projectileName - Projectile identifier
   * @param {Object} config - Projectile configuration
   * @returns {Promise<void>}
   */
  async loadProjectile(projectileName, config) {
    const {
      path = `assets/projectiles/${projectileName}`,
      animated = false,
      frameCount = 1,
      frameDuration = 0.1,
      width,
      height,
      speed = 400, // Default projectile speed (px/s)
      damage = 10, // Default damage
      lifetime = 2.0, // Default lifetime (seconds)
    } = config;

    const projectileData = {
      name: projectileName,
      animated,
      frames: [],
      frameCount,
      frameDuration,
      width,
      height,
      speed,
      damage,
      lifetime,
    };

    if (animated) {
      // Load animated projectile frames
      for (let i = 1; i <= frameCount; i++) {
        const framePath = `${path}/${projectileName}(${i}).png`;
        try {
          const img = await assetLoader.loadImage(framePath);
          projectileData.frames.push(img);
          console.log(`✓ Loaded projectile ${projectileName} frame ${i}/${frameCount}`);
        } catch (err) {
          console.error(`✗ Failed to load ${projectileName} frame ${i}:`, framePath, err);
        }
      }
    } else {
      // Load static projectile image
      const framePath = `${path}/${projectileName}.png`;
      try {
        const img = await assetLoader.loadImage(framePath);
        projectileData.frames.push(img);
        console.log(`✓ Loaded static projectile ${projectileName}`);
      } catch (err) {
        console.error(`✗ Failed to load projectile ${projectileName}:`, framePath, err);
      }
    }

    this.projectiles.set(projectileName, projectileData);
    console.log(`✓ Projectile "${projectileName}" fully loaded`);
  }

  /**
   * Load multiple projectiles from a configuration object
   * @param {Object} projectilesConfig - Configuration for multiple projectiles
   * @returns {Promise<void>}
   */
  async loadProjectiles(projectilesConfig) {
    const promises = [];

    for (const [projectileName, config] of Object.entries(projectilesConfig)) {
      promises.push(this.loadProjectile(projectileName, config));
    }

    await Promise.all(promises);
    console.log(`✓ All ${promises.length} projectiles loaded`);
  }

  /**
   * Get projectile data
   * @param {string} projectileName - Projectile name
   * @returns {Object|null} Projectile data
   */
  getProjectile(projectileName) {
    return this.projectiles.get(projectileName) || null;
  }

  /**
   * Create a projectile entity component data
   * @param {string} projectileName - Projectile name
   * @param {number} x - Starting world X position
   * @param {number} y - Starting world Y position
   * @param {number} directionX - X direction (-1, 0, 1)
   * @param {number} directionY - Y direction (-1, 0, 1)
   * @returns {Object} Component data for projectile entity
   */
  createProjectileComponents(projectileName, x, y, directionX, directionY) {
    const projectile = this.getProjectile(projectileName);
    if (!projectile) {
      console.error(`Projectile "${projectileName}" not loaded`);
      return null;
    }

    // Normalize direction
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    const normDirX = length > 0 ? directionX / length : 1;
    const normDirY = length > 0 ? directionY / length : 0;

    return {
      // Transform component
      transform: {
        x,
        y,
        z: 5, // Projectiles render above ground
      },

      // Velocity component (direction * speed)
      velocity: {
        vx: normDirX * projectile.speed,
        vy: normDirY * projectile.speed,
      },

      // Projectile component (for collision detection)
      projectile: {
        damage: projectile.damage,
        piercing: false, // Can pass through enemies
        hitEntities: [], // Track hit entities
      },

      // Hitbox component (for damage dealing)
      hitbox: {
        active: true,
        damage: projectile.damage,
        knockbackX: normDirX * 50,
        knockbackY: normDirY * 50,
        hitOnce: false, // Can hit multiple targets unless piercing
        hitEntities: [],
        offsetX: 0,
        offsetY: 0,
        width: projectile.width,
        height: projectile.height,
        duration: projectile.lifetime,
        elapsed: 0,
      },

      // Lifetime component (auto-destroy)
      lifetime: {
        duration: projectile.lifetime,
        elapsed: 0,
        destroyOnFinish: true,
      },

      // Animation/Sprite component (if animated)
      sprite: projectile.animated ? {
        currentFrame: 0,
        frameTime: 0,
        frameDuration: projectile.frameDuration,
        frames: projectile.frames,
        loop: true,
      } : {
        currentFrame: 0,
        frames: projectile.frames,
      },

      // Renderable
      renderable: {
        width: projectile.width,
        height: projectile.height,
        visible: true,
      },

      // AABB for world collision (optional, can be removed if projectiles don't collide with tiles)
      aabb: {
        w: projectile.width,
        h: projectile.height,
        ox: 0,
        oy: 0,
      },
    };
  }

  /**
   * Check if projectile is loaded
   * @param {string} projectileName - Projectile name
   * @returns {boolean}
   */
  isLoaded(projectileName) {
    return this.projectiles.has(projectileName);
  }

  /**
   * Get all loaded projectile names
   * @returns {string[]}
   */
  getAllProjectileNames() {
    return Array.from(this.projectiles.keys());
  }

  /**
   * Helper: Load common projectiles
   * @returns {Promise<void>}
   */
  async loadCommonProjectiles() {
    const commonProjectiles = {
      "bullet": {
        animated: false,
        width: 16,
        height: 8,
        speed: 600,
        damage: 15,
        lifetime: 2.0,
      },
      "arrow": {
        animated: true,
        frameCount: 4,
        frameDuration: 0.1,
        width: 32,
        height: 8,
        speed: 500,
        damage: 20,
        lifetime: 3.0,
      },
      "fireball": {
        animated: true,
        frameCount: 6,
        frameDuration: 0.08,
        width: 32,
        height: 32,
        speed: 400,
        damage: 25,
        lifetime: 2.5,
      },
      "magic-orb": {
        animated: true,
        frameCount: 8,
        frameDuration: 0.06,
        width: 24,
        height: 24,
        speed: 350,
        damage: 18,
        lifetime: 3.0,
      },
    };

    await this.loadProjectiles(commonProjectiles);
  }
}
