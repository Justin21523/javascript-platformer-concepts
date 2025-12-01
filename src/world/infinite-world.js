// src/world/infinite-world.js
import { COLLISION } from "../config.js";

/**
 * InfiniteWorld - 管理多層無限循環世界
 * - 地面層：固定在底部，只水平循環
 * - 天空層：離開地面後進入，水平+垂直循環，計數高度
 */
export class InfiniteWorld {
  constructor() {
    this.tileSize = COLLISION.TILE_SIZE;

    // 地面層地圖（只水平循環）
    this.groundMap = null;

    // 天空層地圖（水平+垂直循環）
    this.skyMap = null;

    // 天空層高度計數
    this.skyLayerCount = 0;

    // 地面層的垂直範圍（世界座標）
    this.groundLayerTop = 0; // 地面層頂部 Y 座標
    this.groundLayerBottom = 0; // 地面層底部 Y 座標

    // 背景切換高度
    this.backgroundSwitchHeight = 0;
  }

  /**
   * 設定地面層地圖
   */
  setGroundMap(tileMap) {
    this.groundMap = tileMap;
    // 地面層範圍：從地圖頂部到底部（用於碰撞檢測）
    this.groundLayerTop = 0;
    this.groundLayerBottom = tileMap.height * tileMap.tileSize;

    // 背景切換高度：玩家需要跳很高才進入天空層
    // 地圖高度 = 640px，玩家初始 Y=364
    // 玩家一跳約 146px，所以從 364 跳一次到 218
    // 設定為 -50px，需要跳出地圖上方才會進入天空層
    // 過渡區：-50 到 50，共 100px
    this.backgroundSwitchHeight = -50;
  }

  /**
   * 設定天空層地圖
   */
  setSkyMap(tileMap) {
    this.skyMap = tileMap;
  }

  /**
   * 根據世界 Y 座標判斷當前層級（用於碰撞檢測）
   * @param {number} worldY - 世界 Y 座標
   * @returns {string} "ground" 或 "sky"
   */
  getLayerType(worldY) {
    // 地面層包含所有在地面頂部以下的區域（包括底部以下）
    // 天空層只有在地面頂部以上
    if (worldY < this.groundLayerTop) {
      return "sky"; // 在地面層頂部上方 = 天空層
    }
    // 在地面層頂部或以下 = 地面層（包括底部以下的無限深度）
    return "ground";
  }

  /**
   * 根據世界 Y 座標判斷背景層級（用於背景渲染）
   * @param {number} worldY - 世界 Y 座標
   * @returns {string} "ground" 或 "sky"
   */
  getBackgroundLayerType(worldY) {
    // 玩家 Y 越小表示越高（往上跳）
    // 在地圖上半部（Y 小）顯示天空背景
    // 在地圖下半部（Y 大）顯示地面背景
    if (worldY < this.backgroundSwitchHeight) {
      return "sky";
    }
    return "ground";
  }

  /**
   * 取得天空層的高度層數
   * @param {number} worldY - 世界 Y 座標
   * @returns {number} 天空層數（0 = 剛離開地面，1 = 第一層，-1 = 地面下方）
   */
  getSkyLayerIndex(worldY) {
    if (worldY >= this.groundLayerTop) {
      return 0; // 還在地面或地面下方
    }

    // 計算離開地面多少個天空層
    const distanceAboveGround = this.groundLayerTop - worldY;
    const skyHeight = this.skyMap ? this.skyMap.height * this.skyMap.tileSize : 1000;
    return Math.floor(distanceAboveGround / skyHeight) + 1;
  }

  /**
   * 取得指定位置的 tile 資訊
   * @param {number} worldX - 世界 X 座標
   * @param {number} worldY - 世界 Y 座標
   * @returns {Object|null} tile 資訊
   */
  getTileInfo(worldX, worldY) {
    const layerType = this.getLayerType(worldY);
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);

    if (layerType === "ground") {
      return this._getGroundTile(tileX, tileY);
    } else {
      return this._getSkyTile(tileX, tileY, worldY);
    }
  }

  /**
   * 檢查指定位置是否為實心磚塊
   */
  isSolid(worldX, worldY) {
    const tileInfo = this.getTileInfo(worldX, worldY);
    return tileInfo ? tileInfo.solid : false;
  }

  /**
   * 取得地面層 tile（只水平循環）
   */
  _getGroundTile(tileX, tileY) {
    if (!this.groundMap) return null;

    // 水平循環（無限左右移動）
    const wrappedX = ((tileX % this.groundMap.width) + this.groundMap.width) % this.groundMap.width;

    // 垂直方向：
    // - 頂部以上 (tileY < 0) = 沒有磚塊
    // - 底部以下 (tileY >= height) = 實心磚塊（防止掉下去）
    if (tileY < 0) {
      return null; // 頂部以上沒有磚塊
    }

    if (tileY >= this.groundMap.height) {
      // 底部以下是實心磚塊（無限深度）
      return {
        solid: true,
        oneWay: false,
        path: null, // 不需要圖像
      };
    }

    // 在地面層範圍內，正常取得磚塊資料
    const tileGID = this.groundMap.tiles[tileY][wrappedX];
    if (tileGID === 0) return null;

    // 從 tileset 取得 tile 屬性
    if (this.groundMap.tileset && this.groundMap.tileset.tiles[String(tileGID)]) {
      return this.groundMap.tileset.tiles[String(tileGID)];
    }

    return {
      solid: this.groundMap.solids[tileY][wrappedX],
      oneWay: false,
    };
  }

  /**
   * 取得天空層 tile（水平+垂直循環）
   */
  _getSkyTile(tileX, tileY, worldY) {
    if (!this.skyMap) return null;

    // 計算相對於天空層的座標
    const skyStartY = Math.floor(this.groundLayerTop / this.tileSize);
    const relativeTileY = tileY - skyStartY;

    // 水平循環
    const wrappedX = ((tileX % this.skyMap.width) + this.skyMap.width) % this.skyMap.width;

    // 垂直循環
    const wrappedY = ((relativeTileY % this.skyMap.height) + this.skyMap.height) % this.skyMap.height;

    const tileGID = this.skyMap.tiles[wrappedY][wrappedX];
    if (tileGID === 0) return null;

    // 從 tileset 取得 tile 屬性
    if (this.skyMap.tileset && this.skyMap.tileset.tiles[String(tileGID)]) {
      return this.skyMap.tileset.tiles[String(tileGID)];
    }

    return {
      solid: this.skyMap.solids[wrappedY][wrappedX],
      oneWay: false,
    };
  }

  /**
   * 取得可見範圍內的所有 tiles（用於渲染）
   * @param {number} cameraX - 相機 X
   * @param {number} cameraY - 相機 Y
   * @param {number} viewWidth - 視窗寬度
   * @param {number} viewHeight - 視窗高度
   * @returns {Array} tiles 陣列
   */
  getVisibleTiles(cameraX, cameraY, viewWidth, viewHeight) {
    const tiles = [];

    const startTileX = Math.floor(cameraX / this.tileSize);
    const endTileX = Math.ceil((cameraX + viewWidth) / this.tileSize);
    const startTileY = Math.floor(cameraY / this.tileSize);
    const endTileY = Math.ceil((cameraY + viewHeight) / this.tileSize);

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const worldX = tx * this.tileSize;
        const worldY = ty * this.tileSize;
        const tileInfo = this.getTileInfo(worldX, worldY);

        // 只渲染有圖像的磚塊（底部以下的實心磚塊沒有圖像，不渲染）
        if (tileInfo && tileInfo.path) {
          tiles.push({
            worldX,
            worldY,
            tileX: tx,
            tileY: ty,
            tileInfo,
            layerType: this.getLayerType(worldY),
          });
        }
      }
    }

    return tiles;
  }

  /**
   * 取得當前層級的地圖（用於舊系統相容）
   */
  getCurrentMap(worldY) {
    const layerType = this.getLayerType(worldY);
    return layerType === "ground" ? this.groundMap : this.skyMap;
  }
}
