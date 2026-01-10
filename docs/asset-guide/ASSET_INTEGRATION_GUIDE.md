# 素材搜尋與整合指南
# Asset Search and Integration Guide

**版本 Version**: 1.0
**日期 Date**: 2025-11-13
**專案 Project**: JavaScript Platformer Concepts

---

## 📋 目錄 Table of Contents

1. [素材網站推薦](#素材網站推薦)
2. [搜尋關鍵字策略](#搜尋關鍵字策略)
3. [資料夾結構](#資料夾結構)
4. [命名規範](#命名規範)
5. [整合步驟](#整合步驟)
6. [範例配置](#範例配置)

---

## 🌐 素材網站推薦

### 頂級免費素材平台

| 網站 | 網址 | 特色 | 篩選重點 |
|------|------|------|----------|
| **itch.io** | https://itch.io/game-assets/free | 大量免費 2D 素材 | 搜尋「2D Platformer Cartoon」，避免「Pixel Art」 |
| **OpenGameArt** | https://opengameart.org | 開源遊戲素材庫 | Style = "Cartoon" / "Vector"，排除 Pixel Art |
| **Kenney.nl** | https://kenney.nl/assets | 高品質向量素材 | 選擇 Vector/Cartoon 類別 |
| **GameArt2D** | https://www.gameart2d.com/freebies.html | 專業卡通角色 | 有免費和付費選項 |
| **Craftpix** | https://craftpix.net/freebies | 精美 2D 素材 | 篩選「Not Pixel Art」 |

### 特效專門網站

- **VFX For Games** (itch.io)
- **Unity Asset Store** (Free Assets，也可用於非Unity專案)

---

## 🔍 搜尋關鍵字策略

### 敵人角色 Enemy Characters

**必用關鍵字 Must-Use Keywords:**
```
2D character sprite sheet cartoon
platformer enemy pack cartoon style
animated enemy game asset non-pixel
hand-drawn enemy character 2D
```

**具體敵人類型 Specific Types:**
- **史萊姆 Slime**: `"2D slime character sprite sheet cartoon"`
- **蝙蝠 Bat**: `"bat enemy character animation 2D"`
- **骷髏 Skeleton**: `"skeleton enemy game asset non-pixel"`
- **飛行敵人 Flying**: `"flying enemy sprite 2D vector"`

**避免詞彙 Avoid Keywords:**
```
❌ pixel
❌ 8-bit
❌ retro
❌ pixelated
❌ pixel art
```

### NPC 角色 NPC Characters

```
✓ "NPC villager character 2D cartoon"
✓ "merchant shopkeeper sprite animation"
✓ "quest giver character game asset"
✓ "friendly NPC sprite sheet"
✓ "civilian character 2D platformer"
```

### Boss 角色 Boss Characters

```
✓ "boss character sprite sheet 2D"
✓ "large enemy platformer cartoon"
✓ "boss fight character animation"
✓ "final boss game asset hand-drawn"
```

### 攻擊特效 Attack Effects

```
✓ "slash effect sprite sheet 2D"
✓ "hit impact VFX game animation"
✓ "sword swing effect cartoon"
✓ "attack particle effect 2D"
✓ "combat effect sprite"
```

### 爆炸煙霧 Explosions & Smoke

```
✓ "explosion sprite sheet 2D cartoon"
✓ "smoke effect animation game"
✓ "dust particle effect 2D"
✓ "firework explosion sprite"
✓ "debris effect game asset"
```

### 發射物 Projectiles

```
✓ "projectile sprite 2D bullet arrow"
✓ "magic projectile game asset"
✓ "fireball sprite animation"
✓ "arrow projectile 2D"
✓ "energy ball sprite"
```

### 收集物品效果 Collectible Effects

```
✓ "coin collect effect animation"
✓ "pickup sparkle effect 2D"
✓ "star collect particle game"
✓ "item pickup VFX sprite"
✓ "collectible shine effect"
```

---

## 📁 資料夾結構

### 完整目錄樹 Complete Directory Tree

```
assets/
├── sprites/
│   ├── player/                    # 玩家角色 (已存在)
│   │   ├── JackOLantern/
│   │   ├── Cat/
│   │   └── Dog/
│   │
│   ├── enemies/                   # 敵人角色 (新增)
│   │   ├── slime/
│   │   │   ├── idle/
│   │   │   ├── walk/
│   │   │   ├── attack/
│   │   │   └── death/
│   │   ├── bat/
│   │   ├── skeleton/
│   │   └── [其他敵人]/
│   │
│   ├── bosses/                    # Boss 角色 (新增)
│   │   ├── dragon-boss/
│   │   │   ├── idle/
│   │   │   ├── attack1/
│   │   │   ├── attack2/
│   │   │   ├── hurt/
│   │   │   └── death/
│   │   └── [其他Boss]/
│   │
│   └── npc/                       # NPC 角色 (新增)
│       ├── villager/
│       │   ├── idle/
│       │   └── talk/
│       ├── merchant/
│       └── quest-giver/
│
├── effects/                       # 特效 (新增)
│   ├── combat/
│   │   ├── slash/
│   │   ├── hit-impact/
│   │   ├── punch/
│   │   └── spark/
│   ├── explosion/
│   │   ├── small/
│   │   ├── medium/
│   │   └── large/
│   ├── smoke/
│   │   ├── dust/
│   │   ├── cloud/
│   │   └── debris/
│   └── pickup/
│       ├── coin-sparkle/
│       ├── star-shine/
│       └── item-glow/
│
├── projectiles/                   # 發射物 (新增)
│   ├── bullet/
│   ├── arrow/
│   ├── fireball/
│   ├── magic-orb/
│   └── laser/
│
├── items/                         # 物品道具 (新增)
│   ├── coins/
│   ├── powerups/
│   └── collectibles/
│
├── ui/                            # UI 素材 (新增)
│   ├── buttons/
│   ├── health-bar/
│   └── icons/
│
├── background/                    # 背景圖層 (已存在)
├── freetileset/                   # 地圖磚塊 (已存在)
└── levels/                        # 關卡地圖 (已存在)
```

---

## 📝 命名規範

### 角色動畫檔案 Character Animation Files

**格式 Format:**
```
ActionName(N).png
```

**範例 Examples:**
```
idle(1).png, idle(2).png, ..., idle(10).png
walk(1).png, walk(2).png, ..., walk(8).png
attack(1).png, attack(2).png, ..., attack(6).png
death(1).png, death(2).png, ..., death(10).png
```

**規則 Rules:**
1. ✓ 動作名稱使用小寫 (Lowercase action names)
2. ✓ 編號從 1 開始 (Numbering starts from 1)
3. ✓ 用括號包圍數字 (Enclose numbers in parentheses)
4. ✓ 不補零 (No zero-padding)
5. ✓ PNG 格式，支援透明背景 (PNG format with transparency)

**標準幀數 Standard Frame Counts:**
- `idle`: 10 frames
- `walk/run`: 8 frames
- `jump`: 8-10 frames
- `attack`: 6-8 frames
- `death`: 10 frames
- `hurt`: 6-8 frames

### 特效檔案 Effect Files

**格式 Format:**
```
EffectName(N).png
```

**範例 Examples:**
```
explosion(1).png ~ explosion(12).png
slash(1).png ~ slash(8).png
smoke(1).png ~ smoke(10).png
```

**靜態特效 Static Effects:**
```
star.png
coin.png
```

### 發射物檔案 Projectile Files

**靜態 Static:**
```
bullet.png
```

**動畫 Animated:**
```
arrow(1).png ~ arrow(4).png
fireball(1).png ~ fireball(6).png
```

---

## 🔧 整合步驟

### 步驟 1：下載素材

1. 前往推薦網站
2. 使用搜尋關鍵字
3. 確認授權條款 (CC0, CC-BY等)
4. 下載素材包

### 步驟 2：整理和重命名

1. 解壓縮素材包
2. 按照命名規範重新命名檔案
3. 將檔案放入對應資料夾

**範例：整理史萊姆敵人**
```bash
# 原始檔案
downloaded_slime/
  ├── Slime_Idle_01.png
  ├── Slime_Idle_02.png
  └── ...

# 整理後
assets/sprites/enemies/slime/
  ├── idle/
  │   ├── idle(1).png
  │   ├── idle(2).png
  │   └── ...
  ├── walk/
  └── attack/
```

### 步驟 3：創建配置檔案

**敵人配置範例 (enemies-config.json):**
```json
{
  "slime": {
    "width": 64,
    "height": 64,
    "frameDuration": 0.1,
    "animations": {
      "idle": { "folder": "idle", "frameCount": 10 },
      "walk": { "folder": "walk", "frameCount": 8 },
      "attack": { "folder": "attack", "frameCount": 6 },
      "death": { "folder": "death", "frameCount": 10 }
    }
  }
}
```

### 步驟 4：載入素材

**在 main.js 中:**
```javascript
import { EnemyLoader } from "./loaders/enemy-loader.js";

const enemyLoader = new EnemyLoader();

// 載入史萊姆敵人
await enemyLoader.loadEnemy("slime", {
  basePath: "assets/sprites/enemies/slime",
  width: 64,
  height: 64,
  frameDuration: 0.1,
  animations: {
    idle: { folder: "idle", frameCount: 10 },
    walk: { folder: "walk", frameCount: 8 },
    attack: { folder: "attack", frameCount: 6 },
    death: { "folder": "death", "frameCount": 10 }
  }
});
```

### 步驟 5：創建實體

```javascript
// 創建史萊姆敵人實體
const slime = world.createEntity();
world.addComponent(slime, "Transform", { x: 400, y: 400, z: 0 });
world.addComponent(slime, "Velocity", { vx: 0, vy: 0 });

// 添加 Sprite 組件
const spriteData = enemyLoader.createSpriteComponent("slime", "idle");
world.addComponent(slime, "Sprite", spriteData);

// 添加戰鬥組件
world.addComponent(slime, "Health", { current: 50, max: 50 });
world.addComponent(slime, "Team", { id: "enemy" });
world.addComponent(slime, "Hurtbox", { active: true, width: 50, height: 50, offsetX: 7, offsetY: 7 });
```

---

## 📊 範例配置

### 敵人素材配置 Enemy Assets Config

```javascript
// assets/configs/enemies.json
{
  "slime": {
    "width": 64,
    "height": 64,
    "frameDuration": 0.1,
    "health": 50,
    "damage": 10,
    "speed": 100,
    "animations": {
      "idle": { "folder": "idle", "frameCount": 10 },
      "walk": { "folder": "walk", "frameCount": 8 },
      "attack": { "folder": "attack", "frameCount": 6 },
      "death": { "folder": "death", "frameCount": 10 }
    }
  },
  "bat": {
    "width": 48,
    "height": 48,
    "frameDuration": 0.08,
    "health": 30,
    "damage": 8,
    "speed": 150,
    "animations": {
      "idle": { "folder": "idle", "frameCount": 8 },
      "fly": { "folder": "fly", "frameCount": 8 },
      "attack": { "folder": "attack", "frameCount": 6 },
      "death": { "folder": "death", "frameCount": 8 }
    }
  }
}
```

### 特效素材配置 Effects Assets Config

```javascript
// assets/configs/effects.json
{
  "slash": {
    "path": "assets/effects/combat/slash",
    "frameCount": 8,
    "frameDuration": 0.04,
    "loop": false,
    "width": 64,
    "height": 64
  },
  "explosion-small": {
    "path": "assets/effects/explosion/small",
    "frameCount": 10,
    "frameDuration": 0.05,
    "loop": false,
    "width": 64,
    "height": 64
  }
}
```

### 發射物素材配置 Projectiles Assets Config

```javascript
// assets/configs/projectiles.json
{
  "bullet": {
    "animated": false,
    "width": 16,
    "height": 8,
    "speed": 600,
    "damage": 15,
    "lifetime": 2.0
  },
  "fireball": {
    "animated": true,
    "frameCount": 6,
    "frameDuration": 0.08,
    "width": 32,
    "height": 32,
    "speed": 400,
    "damage": 25,
    "lifetime": 2.5
  }
}
```

---

## ✅ 檢查清單

### 素材品質檢查 Asset Quality Checklist

- [ ] ✓ 非像素風格 (NOT pixel art)
- [ ] ✓ 背景透明 (PNG with transparency)
- [ ] ✓ 解析度足夠 (Sufficient resolution)
- [ ] ✓ 檔案命名正確 (Correct naming)
- [ ] ✓ 幀數一致 (Consistent frame count)
- [ ] ✓ 動畫流暢 (Smooth animation)
- [ ] ✓ 風格統一 (Consistent art style)

### 授權檢查 License Checklist

- [ ] ✓ 確認授權條款 (Check license terms)
- [ ] ✓ 商業使用許可 (Commercial use allowed)
- [ ] ✓ 標註作者 (Credit author if required)
- [ ] ✓ 保留授權檔案 (Keep license file)

---

## 📚 相關程式檔案

### Loaders 載入器

- `src/loaders/actor-loader.js` - 玩家角色載入器 (已存在)
- `src/loaders/enemy-loader.js` - 敵人載入器 (新增)
- `src/loaders/effect-loader.js` - 特效載入器 (新增)
- `src/loaders/projectile-loader.js` - 發射物載入器 (新增)

### 使用範例

參考 `src/main.js` 中的玩家角色載入方式，套用到敵人和特效載入。

---

## 🎯 預估素材數量

| 類型 | 建議數量 | 總幀數預估 |
|------|----------|------------|
| 敵人角色 | 3-5 種 | 150-250 幀 |
| NPC 角色 | 3-4 種 | 60-80 幀 |
| Boss 角色 | 1-2 個 | 100-200 幀 |
| 攻擊特效 | 5-8 種 | 48-96 幀 |
| 爆炸煙霧 | 3-4 種 | 36-60 幀 |
| 發射物 | 4-6 種 | 10-30 幀 |
| 收集物品效果 | 3-5 種 | 24-50 幀 |

**總計約**: 400-750 個 PNG 檔案

---

## 🚀 快速開始

1. 建立資料夾結構 (已完成)
2. 前往 itch.io 搜尋「2D platformer enemy cartoon」
3. 下載免費素材包
4. 按照命名規範整理檔案
5. 使用 Loader 載入素材
6. 在遊戲中創建實體測試

---

**Last Updated**: 2025-11-13
**Maintainer**: LLMProvider Tooling AI
