// src/loaders/tilemap-loader.js
import { TileMap } from "../world/tiles.js";
import { assetLoader } from "../core/asset-loader.js";
import { debugLog } from "../debug.js";

/**
 * TilemapLoader - Loads Tiled JSON format and converts to TileMap
 * Supports multiple layers and tile properties from tileset.json
 */
export class TilemapLoader {
  constructor() {
    this.tileset = null;
    this.tileSize = 32; // Very small tiles for much larger character
  }

  /**
   * Load tileset configuration from JSON
   * @param {string} tilesetPath - Path to tileset.json
   * @returns {Promise<Object>}
   */
  async loadTileset(tilesetPath) {
    const tilesetData = await assetLoader.loadJSON(tilesetPath);
    this.tileset = tilesetData;
    this.tileSize = 32; // Override to 32 for much larger character

    // Preload all tile images
    const imagePromises = Object.values(tilesetData.tiles).map((tile) =>
      assetLoader.loadImage(tile.path)
    );

    await Promise.all(imagePromises);
    debugLog(
      "TilemapLoader",
      `Tileset loaded: ${tilesetData.name} (${tilesetData.tileCount} tiles)`
    );

    return tilesetData;
  }

  /**
   * Load a Tiled JSON map and convert to TileMap
   * @param {string} mapPath - Path to Tiled JSON file
   * @returns {Promise<TileMap>}
   */
  async loadMap(mapPath) {
    if (!this.tileset) {
      throw new Error(
        "Tileset must be loaded before loading a map. Call loadTileset() first."
      );
    }

    const mapData = await assetLoader.loadJSON(mapPath);
    debugLog(
      "TilemapLoader",
      `Loading map: ${mapData.width}x${mapData.height} tiles`
    );

    // Extract map dimensions (Tiled uses tilewidth/tileheight, not our tileSize)
    const tiledTileSize = mapData.tilewidth || mapData.tileheight || this.tileSize;
    const width = mapData.width;
    const height = mapData.height;

    // Create TileMap instance
    const tileMap = new TileMap(width, height, this.tileSize);

    // Process layers
    if (mapData.layers && mapData.layers.length > 0) {
      // Find the first tile layer (Tiled can have object layers too)
      const tileLayer = mapData.layers.find((layer) => layer.type === "tilelayer");

      if (tileLayer) {
        this.parseTileLayer(tileLayer, tileMap, width, height);
      } else {
        debugLog("TilemapLoader", "Warning: No tile layer found in map");
      }
    }

    // Store tileset reference for rendering
    tileMap.tileset = this.tileset;

    debugLog("TilemapLoader", `Map loaded successfully: ${mapPath}`);
    return tileMap;
  }

  /**
   * Parse a Tiled tile layer and populate TileMap
   * @param {Object} layer - Tiled layer data
   * @param {TileMap} tileMap - Target TileMap instance
   * @param {number} width - Map width in tiles
   * @param {number} height - Map height in tiles
   */
  parseTileLayer(layer, tileMap, width, height) {
    const data = layer.data; // Flat array of tile indices

    if (!data || data.length !== width * height) {
      throw new Error(
        `Invalid tile data: expected ${width * height} tiles, got ${data ? data.length : 0}`
      );
    }

    // Convert flat array to 2D grid and distribute to layers
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const tileGID = data[index];

        // Store tile GID for legacy rendering (0 = empty)
        if (!tileMap.tiles) {
          tileMap.tiles = Array.from({ length: height }, () =>
            Array(width).fill(0)
          );
        }
        tileMap.tiles[y][x] = tileGID;

        if (tileGID > 0 && this.tileset.tiles[String(tileGID)]) {
          const tileInfo = this.tileset.tiles[String(tileGID)];

          // Distribute tile to appropriate layer
          const layerName = tileInfo.layer || "middleground";
          if (tileMap.layers[layerName]) {
            tileMap.layers[layerName].tiles[y][x] = tileGID;
          }

          // Mark as solid if tile has solid property
          if (tileInfo.solid) {
            tileMap.setSolid(x, y, true);
          }
        }
      }
    }

    debugLog(
      "TilemapLoader",
      `Parsed layer '${layer.name}': ${width}x${height} tiles`
    );

    // DEBUG: Count tiles per layer
    for (const [layerName, layerData] of Object.entries(tileMap.layers)) {
      let count = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (layerData.tiles[y][x] > 0) count++;
        }
      }
      if (count > 0) {
        debugLog("TilemapLoader", `  ${layerName}: ${count} tiles`);
      }
    }

    // DEBUG: Count solid tiles
    let solidCount = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (tileMap.isSolid(x, y)) solidCount++;
      }
    }
    debugLog("TilemapLoader", `Solid tiles marked: ${solidCount}`);
  }

  /**
   * Get tile image by GID
   * @param {number} gid - Tile Global ID
   * @returns {HTMLImageElement|null}
   */
  getTileImage(gid) {
    if (gid === 0 || !this.tileset) return null;

    const tileInfo = this.tileset.tiles[String(gid)];
    if (!tileInfo) return null;

    return assetLoader.getImage(tileInfo.path);
  }

  /**
   * Get tile properties by GID
   * @param {number} gid - Tile Global ID
   * @returns {Object|null}
   */
  getTileProperties(gid) {
    if (gid === 0 || !this.tileset) return null;
    return this.tileset.tiles[String(gid)] || null;
  }
}
