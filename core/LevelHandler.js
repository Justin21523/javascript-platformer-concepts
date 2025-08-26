// core/LevelHandler.js
export class LevelHandler {
    constructor() {
      this.currentLevel = 0;
      this.levels = [];
    }

    loadLevels(levelData) {
      this.levels = levelData;
    }

    loadCurrentLevel(scene) {
      const level = this.levels[this.currentLevel];

      // 清除現有實體
      scene.entities = [];

      // 加載平台
      level.platforms.forEach(plat => {
        scene.addEntity(new Platform(plat.x, plat.y, plat.width, plat.height));
      });

      // 加載敵人
      level.enemies.forEach(enemy => {
        scene.addEntity(new Enemy(enemy.x, enemy.y));
      });

      // 加載玩家
      scene.player = new Player(level.playerStart.x, level.playerStart.y);
      scene.addEntity(scene.player);
    }

    nextLevel() {
      this.currentLevel++;
      return this.currentLevel < this.levels.length;
    }
}

// 在GameScene中使用
export class GameScene {
    constructor() {
      this.levelHandler = new LevelHandler();
    }

    init() {
      this.levelHandler.loadLevels(levelData);
      this.levelHandler.loadCurrentLevel(this);
    }

    // 當玩家完成關卡時
    completeLevel() {
      if (this.levelHandler.nextLevel()) {
        this.levelHandler.loadCurrentLevel(this);
      } else {
        // 遊戲通關
      }
    }
}
