// src/systems/parallax-background-system.js
import { assetLoader } from "../core/asset-loader.js";
import { RENDER } from "../config.js";
import { debugLog } from "../debug.js";

/**
 * ParallaxBackgroundSystem - Renders multi-layer parallax scrolling backgrounds
 * Supports both horizontal and vertical parallax effects
 * Supports multiple layer sets for different world layers (ground/sky)
 */
export class ParallaxBackgroundSystem {
  constructor(ctx, cameraSystem) {
    this.ctx = ctx;
    this.cameraSystem = cameraSystem;
    this.enabled = true;

    // Multiple layer sets for different world layers
    this.layerSets = {
      ground: [], // 地面層背景
      sky: [],    // 天空層背景
    };

    // Reference to InfiniteWorld for layer detection
    this.infiniteWorld = null;

    // Reference to world for player position
    this.world = null;
  }

  /**
   * Set infinite world reference for layer detection
   */
  setInfiniteWorld(infiniteWorld) {
    this.infiniteWorld = infiniteWorld;
  }

  /**
   * Add a parallax layer to specific layer set
   * @param {string} layerSet - "ground" or "sky"
   * @param {string} imagePath - Path to background image
   * @param {number} speedX - Horizontal parallax speed (0.0 = static, 1.0 = same as camera)
   * @param {number} speedY - Vertical parallax speed (0.0 = static, 1.0 = same as camera)
   * @param {number} [offsetY=0] - Vertical offset for layer positioning
   * @param {boolean} [repeat=true] - Whether to repeat/tile the image
   * @param {number} [scale=1.0] - Scale factor for the layer (1.0 = original size)
   */
  addLayer(layerSet, imagePath, speedX, speedY, offsetY = 0, repeat = true, scale = 1.0) {
    // Support old API (backward compatibility)
    if (typeof layerSet !== 'string' || (layerSet !== 'ground' && layerSet !== 'sky')) {
      // Old API: addLayer(imagePath, speedX, speedY, ...)
      const oldArgs = arguments;
      this.layerSets.ground.push({
        imagePath: oldArgs[0],
        speedX: oldArgs[1],
        speedY: oldArgs[2],
        offsetY: oldArgs[3] || 0,
        repeat: oldArgs[4] !== undefined ? oldArgs[4] : true,
        scale: oldArgs[5] || 1.0,
        image: null,
      });
      return;
    }

    // New API: addLayer(layerSet, imagePath, speedX, ...)
    if (!this.layerSets[layerSet]) {
      this.layerSets[layerSet] = [];
    }

    this.layerSets[layerSet].push({
      imagePath,
      speedX,
      speedY,
      offsetY,
      repeat,
      scale,
      image: null,
    });
  }

  /**
   * Load all background images asynchronously
   * @returns {Promise<void>}
   */
  async loadImages() {
    const allPromises = [];

    // Load all layer sets
    for (const [setName, layers] of Object.entries(this.layerSets)) {
      const promises = layers.map((layer, index) =>
        assetLoader.loadImage(layer.imagePath).then((img) => {
          layer.image = img;
          console.log(`✓ Loaded ${setName}[${index}]: ${layer.imagePath} (${img.width}x${img.height})`);
          debugLog(
            "ParallaxBackground",
            `Loaded ${setName} layer: ${layer.imagePath} (${img.width}x${img.height})`
          );
        }).catch(err => {
          console.error(`✗ Failed to load ${setName}[${index}]: ${layer.imagePath}`, err);
        })
      );
      allPromises.push(...promises);
    }

    await Promise.all(allPromises);

    const totalLayers = Object.values(this.layerSets).reduce((sum, layers) => sum + layers.length, 0);
    console.log(`✓ All ${totalLayers} parallax layers loaded`);
    console.log(`  Ground layers: ${this.layerSets.ground.length}`);
    console.log(`  Sky layers: ${this.layerSets.sky.length}`);
    debugLog("ParallaxBackground", `All ${totalLayers} layers loaded`);
  }

  /**
   * Draw all parallax layers (backgrounds are fixed at world heights)
   */
  draw() {
    if (!this.enabled || !this.cameraSystem) return;

    const camera = this.cameraSystem.getCamera();
    const { ctx } = this;

    // Sky background transition height (in world coordinates)
    // Sky background is fixed at world top, shows when camera.y is small (looking up)
    // Ground background is fixed at ground level, shows when camera.y is large (looking down)
    const SKY_WORLD_HEIGHT = 200; // Sky background starts showing when camera above this
    const GROUND_WORLD_HEIGHT = 400; // Ground background visible when camera below this
    const TRANSITION_RANGE = 200; // Blend range between sky and ground

    // Calculate which backgrounds to show based on camera Y
    const cameraMiddleY = camera.y + RENDER.CANVAS_HEIGHT / 2;

    let groundAlpha = 1.0;
    let skyAlpha = 0.0;

    if (cameraMiddleY < SKY_WORLD_HEIGHT) {
      // Fully in sky region
      groundAlpha = 0.0;
      skyAlpha = 1.0;
      this._currentLayerSet = "sky";
    } else if (cameraMiddleY > GROUND_WORLD_HEIGHT) {
      // Fully in ground region
      groundAlpha = 1.0;
      skyAlpha = 0.0;
      this._currentLayerSet = "ground";
    } else {
      // In transition zone
      const blendFactor = (cameraMiddleY - SKY_WORLD_HEIGHT) / TRANSITION_RANGE;
      skyAlpha = 1.0 - blendFactor;
      groundAlpha = blendFactor;
      this._currentLayerSet = "transition";
    }

    this._transitionAlpha = Math.min(skyAlpha, groundAlpha);

    // Draw sky background (if visible)
    if (skyAlpha > 0.01) {
      const skyLayers = this.layerSets.sky || [];
      ctx.save();
      ctx.globalAlpha = skyAlpha;

      for (const layer of skyLayers) {
        if (!layer.image) continue;

        // Sky background offset - positioned at top of world
        const offsetX = camera.x * layer.speedX;
        const offsetY = (camera.y - 0) * layer.speedY + layer.offsetY; // Sky at Y=0

        if (layer.repeat) {
          this.drawRepeatingLayer(layer, offsetX, offsetY);
        } else {
          this.drawSingleLayer(layer, offsetX, offsetY);
        }
      }
      ctx.restore();
    }

    // Draw ground background (if visible)
    if (groundAlpha > 0.01) {
      const groundLayers = this.layerSets.ground || [];
      ctx.save();
      ctx.globalAlpha = groundAlpha;

      for (const layer of groundLayers) {
        if (!layer.image) continue;

        // Ground background offset - positioned at ground level
        const offsetX = camera.x * layer.speedX;
        const offsetY = (camera.y - GROUND_WORLD_HEIGHT) * layer.speedY + layer.offsetY;

        if (layer.repeat) {
          this.drawRepeatingLayer(layer, offsetX, offsetY);
        } else {
          this.drawSingleLayer(layer, offsetX, offsetY);
        }
      }
      ctx.restore();
    }

    // Debug info
    this._layerCount = this.layerSets.ground.length + this.layerSets.sky.length;
    this._drawnCount = (skyAlpha > 0.01 ? this.layerSets.sky.length : 0) +
                       (groundAlpha > 0.01 ? this.layerSets.ground.length : 0);
    this._skyAlpha = skyAlpha;
    this._groundAlpha = groundAlpha;
    this._cameraMiddleY = cameraMiddleY;

    // Debug log (occasionally)
    if (Math.random() < 0.01) {
      console.log(`Camera Y: ${cameraMiddleY.toFixed(0)}, Sky α: ${skyAlpha.toFixed(2)}, Ground α: ${groundAlpha.toFixed(2)}`);
    }
  }

  /**
   * Draw a repeating/tiling layer
   */
  drawRepeatingLayer(layer, offsetX, offsetY) {
    const { ctx } = this;
    const img = layer.image;
    const scale = layer.scale || 1.0;

    // Calculate scaled dimensions
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    // Calculate starting position with proper wrapping
    // Use modulo to wrap the offset within one tile width/height
    const wrappedOffsetX = ((offsetX % scaledWidth) + scaledWidth) % scaledWidth;
    const wrappedOffsetY = ((offsetY % scaledHeight) + scaledHeight) % scaledHeight;

    const startX = -wrappedOffsetX;
    const startY = -wrappedOffsetY;

    // Calculate how many tiles needed to cover canvas
    const tilesX = Math.ceil((RENDER.CANVAS_WIDTH + wrappedOffsetX) / scaledWidth) + 1;
    const tilesY = Math.ceil((RENDER.CANVAS_HEIGHT + wrappedOffsetY) / scaledHeight) + 1;

    // Draw repeated tiles with scaling
    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        const x = startX + tx * scaledWidth;
        const y = startY + ty * scaledHeight;
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      }
    }
  }

  /**
   * Draw a single non-repeating layer (stretched to fit)
   */
  drawSingleLayer(layer, offsetX, offsetY) {
    const { ctx } = this;
    const img = layer.image;

    // Draw image stretched to canvas size with parallax offset
    const x = -offsetX % img.width;
    const y = -offsetY % img.height;

    ctx.drawImage(
      img,
      x,
      y,
      RENDER.CANVAS_WIDTH,
      RENDER.CANVAS_HEIGHT
    );
  }

  /**
   * Clear all layers
   */
  clearLayers(layerSet = null) {
    if (layerSet) {
      this.layerSets[layerSet] = [];
    } else {
      this.layerSets = {
        ground: [],
        sky: [],
      };
    }
  }

  /**
   * Toggle parallax rendering
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Get layer count
   */
  getLayerCount(layerSet = null) {
    if (layerSet) {
      return this.layerSets[layerSet] ? this.layerSets[layerSet].length : 0;
    }
    return Object.values(this.layerSets).reduce((sum, layers) => sum + layers.length, 0);
  }
}
