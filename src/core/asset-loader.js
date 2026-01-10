// src/core/asset-loader.js
import { debugLog } from "../debug.js";

/**
 * AssetLoader - Centralized asset loading and caching system
 * Handles images, JSON, and other resources with Promise-based loading
 */
export class AssetLoader {
  constructor() {
    this.images = new Map(); // path -> HTMLImageElement
    this.json = new Map(); // path -> parsed JSON object
    this.loading = new Map(); // path -> Promise (for deduplication)
    this.loaded = 0;
    this.total = 0;
  }

  /**
   * Load an image and cache it
   * @param {string} path - Image file path
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(path) {
    // Return cached image if already loaded
    if (this.images.has(path)) {
      return Promise.resolve(this.images.get(path));
    }

    // Return existing promise if already loading
    if (this.loading.has(path)) {
      return this.loading.get(path);
    }

    // Start new load
    const promise = new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.images.set(path, img);
        this.loading.delete(path);
        this.loaded++;
        debugLog("AssetLoader", `Loaded image: ${path} (${this.loaded}/${this.total})`);
        resolve(img);
      };

      img.onerror = () => {
        this.loading.delete(path);
        const error = new Error(`Failed to load image: ${path}`);
        debugLog("AssetLoader", error.message);
        reject(error);
      };

      img.src = path;
    });

    this.loading.set(path, promise);
    this.total++;
    return promise;
  }

  /**
   * Load a JSON file and cache it
   * @param {string} path - JSON file path
   * @returns {Promise<Object>}
   */
  async loadJSON(path) {
    // Return cached JSON if already loaded
    if (this.json.has(path)) {
      return Promise.resolve(this.json.get(path));
    }

    // Return existing promise if already loading
    if (this.loading.has(path)) {
      return this.loading.get(path);
    }

    // Start new load
    const promise = fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${path}`);
        }
        return response.json();
      })
      .then((data) => {
        this.json.set(path, data);
        this.loading.delete(path);
        this.loaded++;
        debugLog("AssetLoader", `Loaded JSON: ${path} (${this.loaded}/${this.total})`);
        return data;
      })
      .catch((error) => {
        this.loading.delete(path);
        debugLog("AssetLoader", `Failed to load JSON: ${path} - ${error.message}`);
        throw error;
      });

    this.loading.set(path, promise);
    this.total++;
    return promise;
  }

  /**
   * Load multiple assets in parallel
   * @param {Array<{type: 'image'|'json', path: string}>} assets
   * @returns {Promise<void>}
   */
  async loadBatch(assets) {
    const promises = assets.map((asset) => {
      if (asset.type === "image") {
        return this.loadImage(asset.path);
      } else if (asset.type === "json") {
        return this.loadJSON(asset.path);
      } else {
        throw new Error(`Unknown asset type: ${asset.type}`);
      }
    });

    return Promise.all(promises);
  }

  /**
   * Get a cached image (synchronous)
   * @param {string} path - Image file path
   * @returns {HTMLImageElement|null}
   */
  getImage(path) {
    return this.images.get(path) || null;
  }

  /**
   * Get a cached JSON object (synchronous)
   * @param {string} path - JSON file path
   * @returns {Object|null}
   */
  getJSON(path) {
    return this.json.get(path) || null;
  }

  /**
   * Check if an asset is loaded
   * @param {string} path - Asset path
   * @returns {boolean}
   */
  isLoaded(path) {
    return this.images.has(path) || this.json.has(path);
  }

  /**
   * Get loading progress (0.0 to 1.0)
   * @returns {number}
   */
  getProgress() {
    return this.total === 0 ? 1 : this.loaded / this.total;
  }

  /**
   * Clear all cached assets
   */
  clear() {
    this.images.clear();
    this.json.clear();
    this.loading.clear();
    this.loaded = 0;
    this.total = 0;
    debugLog("AssetLoader", "All assets cleared");
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getStats() {
    return {
      imagesLoaded: this.images.size,
      jsonLoaded: this.json.size,
      loading: this.loading.size,
      progress: this.getProgress(),
    };
  }
}

// Export singleton instance
export const assetLoader = new AssetLoader();
