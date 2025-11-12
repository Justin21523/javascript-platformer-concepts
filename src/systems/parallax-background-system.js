// src/systems/parallax-background-system.js
import { assetLoader } from "../core/asset-loader.js";
import { RENDER } from "../config.js";
import { debugLog } from "../debug.js";

/**
 * ParallaxBackgroundSystem - Renders multi-layer parallax scrolling backgrounds
 * Supports both horizontal and vertical parallax effects
 */
export class ParallaxBackgroundSystem {
  constructor(ctx, cameraSystem) {
    this.ctx = ctx;
    this.cameraSystem = cameraSystem;
    this.layers = [];
    this.enabled = true;
  }

  /**
   * Add a parallax layer
   * @param {string} imagePath - Path to background image
   * @param {number} speedX - Horizontal parallax speed (0.0 = static, 1.0 = same as camera)
   * @param {number} speedY - Vertical parallax speed (0.0 = static, 1.0 = same as camera)
   * @param {number} [offsetY=0] - Vertical offset for layer positioning
   * @param {boolean} [repeat=true] - Whether to repeat/tile the image
   */
  addLayer(imagePath, speedX, speedY, offsetY = 0, repeat = true) {
    this.layers.push({
      imagePath,
      speedX,
      speedY,
      offsetY,
      repeat,
      image: null,
    });
  }

  /**
   * Load all background images asynchronously
   * @returns {Promise<void>}
   */
  async loadImages() {
    const promises = this.layers.map((layer) =>
      assetLoader.loadImage(layer.imagePath).then((img) => {
        layer.image = img;
        debugLog(
          "ParallaxBackground",
          `Loaded layer: ${layer.imagePath} (${img.width}x${img.height})`
        );
      })
    );

    await Promise.all(promises);
    debugLog("ParallaxBackground", `All ${this.layers.length} layers loaded`);
  }

  /**
   * Draw all parallax layers
   */
  draw() {
    if (!this.enabled || !this.cameraSystem) return;

    const camera = this.cameraSystem.getCamera();
    const { ctx } = this;

    // Draw layers from back to front
    for (const layer of this.layers) {
      if (!layer.image) continue;

      // Calculate parallax offset
      const offsetX = camera.x * layer.speedX;
      const offsetY = camera.y * layer.speedY + layer.offsetY;

      if (layer.repeat) {
        this.drawRepeatingLayer(layer, offsetX, offsetY);
      } else {
        this.drawSingleLayer(layer, offsetX, offsetY);
      }
    }
  }

  /**
   * Draw a repeating/tiling layer
   */
  drawRepeatingLayer(layer, offsetX, offsetY) {
    const { ctx } = this;
    const img = layer.image;

    // Calculate how many tiles we need to cover the canvas
    const startX = Math.floor(-offsetX / img.width) * img.width - offsetX;
    const startY = Math.floor(-offsetY / img.height) * img.height - offsetY;

    const tilesX = Math.ceil(RENDER.CANVAS_WIDTH / img.width) + 2;
    const tilesY = Math.ceil(RENDER.CANVAS_HEIGHT / img.height) + 2;

    // Draw repeated tiles
    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        const x = startX + tx * img.width;
        const y = startY + ty * img.height;
        ctx.drawImage(img, x, y);
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
  clearLayers() {
    this.layers = [];
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
  getLayerCount() {
    return this.layers.length;
  }
}
