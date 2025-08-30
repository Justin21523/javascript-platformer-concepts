#!/bin/bash
# 建立完整專案結構

echo "建立 Vanilla Platformer JS 專案結構..."

# 建立根目錄
mkdir -p vanilla-platformer-js
cd vanilla-platformer-js

# 建立文件結構
mkdir -p docs scripts dist .github/workflows
mkdir -p src/{core,ecs,components,systems,entities,render,world,tools}

# 建立資產結構
mkdir -p assets/{maps,tilesets,ui,effects,audio}

# 建立詳細的資產子目錄
mkdir -p assets/tilesets/{forest,cave,castle,sky}
mkdir -p assets/characters/{hero,enemy-goblin,enemy-slime,npc-wizard}
mkdir -p assets/items/{collectibles,weapons,hazards,interactables}
mkdir -p assets/effects/{particles,projectiles}
mkdir -p assets/ui/{fonts,hud,menu,icons}
mkdir -p assets/backgrounds/{forest,cave,castle,sky}
mkdir -p assets/audio/{music,sfx,ambient}
mkdir -p assets/audio/sfx/{player,enemies,items,environment,ui}

# 建立角色動作資料夾
mkdir -p assets/characters/hero/{idle,run,jump,fall,attack,hurt}
mkdir -p assets/characters/enemy-goblin/{idle,walk,attack,death}
mkdir -p assets/characters/enemy-slime/{idle,move,death}
mkdir -p assets/characters/npc-wizard/{idle,talk}

# 建立道具子分類
mkdir -p assets/items/collectibles/{coin-gold,coin-silver,gem-red,powerup-health}
mkdir -p assets/items/hazards/{spikes,fire,poison-gas}
mkdir -p assets/items/interactables/{lever,door,chest}

# 建立特效分類
mkdir -p assets/effects/particles/{dust,explosion,magic-sparkle}
mkdir -p assets/effects/projectiles/{fireball}

# 建立基礎檔案
touch index.html styles.css README.md LICENSE .gitignore

# 建立核心 JavaScript 檔案
touch src/main.js src/config.js src/debug.js src/input.js

# 建立核心模組
touch src/core/{math.js,time.js,events.js,log.js,profiler.js,assert.js,random.js}
touch src/ecs/{world.js,components.js,systems.js}
touch src/components/{transform.js,physics.js,collision.js,character.js,render.js,gameplay.js}
touch src/systems/{input-system.js,physics-system.js,collision-system.js,ai-system.js,camera-system.js,render-system.js,hud-system.js,level-system.js}
touch src/entities/{factory.js,player.js,enemy-basic.js,coin.js,goal.js,hazard.js}
touch src/render/{atlas.js,camera.js,debug-draw.js,overlay.js}
touch src/world/{level.js,tiles.js}
touch src/tools/{validate-level.js,validate-manifest.js,replay.js,dev-console.js}

# 建立資產說明檔案
touch assets/README.md

# 建立角色 manifest 範本
cat > assets/characters/hero/manifest.json << 'EOF'
{
  "name": "hero",
  "type": "character",
  "aabb": { "w": 16, "h": 24 },
  "actions": {
    "idle": {
      "folder": "idle",
      "frames": ["idle_01.png", "idle_02.png", "idle_03.png", "idle_04.png"],
      "frameRate": 8,
      "loop": true,
      "origin": [8, 24]
    },
    "run": {
      "folder": "run", 
      "frames": ["run_01.png", "run_02.png", "run_03.png", "run_04.png", "run_05.png", "run_06.png"],
      "frameRate": 12,
      "loop": true,
      "origin": [8, 24]
    },
    "jump": {
      "folder": "jump",
      "frames": ["jump_01.png", "jump_02.png", "jump_03.png"],
      "frameRate": 10,
      "loop": false,
      "origin": [8, 24]
    },
    "fall": {
      "folder": "fall",
      "frames": ["fall_01.png", "fall_02.png"],
      "frameRate": 6,
      "loop": true,
      "origin": [8, 24]
    },
    "attack": {
      "folder": "attack",
      "frames": ["attack_01.png", "attack_02.png", "attack_03.png"],
      "frameRate": 15,
      "loop": false,
      "origin": [8, 24],
      "onComplete": "idle"
    },
    "hurt": {
      "folder": "hurt",
      "frames": ["hurt_01.png", "hurt_02.png"],
      "frameRate": 8,
      "loop": false,
      "origin": [8, 24],
      "onComplete": "idle"
    }
  },
  "physics": {
    "gravityScale": 1.0,
    "frictionX": 0.8,
    "maxSpeedX": 180,
    "maxSpeedY": 500
  },
  "gameplay": {
    "maxHealth": 3,
    "invincibleTime": 1.5,
    "attackDamage": 1,
    "attackRange": 20
  }
}
EOF

# 建立基礎 HTML
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanilla Platformer JS</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <div id="loadingScreen">
    <div class="loading-text">Loading...</div>
    <div class="loading-bar">
      <div class="loading-progress" id="loadingProgress"></div>
    </div>
  </div>
  <div id="debugOverlay" class="debug-overlay hidden"></div>
  
  <script type="module" src="./src/main.js"></script>
</body>
</html>
EOF

# 建立基礎 CSS
cat > styles.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #222;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Courier New', monospace;
}

#gameCanvas {
  border: 2px solid #444;
  background: #000;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

#loadingScreen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  z-index: 1000;
}

.loading-text {
  font-size: 24px;
  margin-bottom: 20px;
}

.loading-bar {
  width: 300px;
  height: 10px;
  border: 2px solid #444;
  background: #222;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  width: 0%;
  transition: width 0.3s ease;
}

.debug-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #0f0;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  border-radius: 4px;
  z-index: 999;
}

.debug-overlay.hidden {
  display: none;
}

/* 響應式設計 */
@media (max-width: 768px) {
  #gameCanvas {
    width: 100vw;
    height: 60vh;
  }
}
EOF

# 建立 .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
*.tgz

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Assets cache (if generated)
assets/.cache/
EOF

echo "專案結構建立完成！"
echo "下一步："
echo "1. cd vanilla-platformer-js"
echo "2. 開始 Stage 0 開發"
echo "3. 準備一些 placeholder 圖片放入 assets/characters/hero/ 各動作資料夾"