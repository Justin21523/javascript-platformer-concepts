# 給 Claude Code 的中文開場（一次一模組協作）

> 你是我的共同開發者。我們採用「一次只做一個模組」的協作流程（One-Module-at-a-Time Protocol）。
> **規範：**
>
> 1. 專案為純 Vanilla JS + ECS；禁止外部套件與框架。
> 2. 你所有的「程式碼、檔名、註解、commit 訊息與技術文件」一律 **English**；你的說明文字請用 **中文**。
> 3. 我們的素材規格：
>    　　• **Tilemap**：整張關卡由「單一大小的 PNG tile」拼出來（例如 16×16 或 32×32）。
>    　　• **角色動畫**：**每個動畫幀都是一張獨立 PNG**（不是 spritesheet），例如 `run_0.png, run_1.png ...`。
> 4. 每個模組回合都要遵守以下格式：
>    　　**(a) 模組目標**（一句話）、**(b) 變更摘要**、**(c) 新增/修改檔案清單**、**(d) 驗收步驟**（我開頁面可以看到什麼）、**(e) 下一步建議**。
> 5. 每回合只改少量檔案，務必可直接在瀏覽器執行（ES modules，開 `index.html` 或用 Live Server）。
> 6. Tilemap 與動畫的載入器要支援下列 JSON 結構（稍後提供）：
>    　　• Tilemap 用「索引網格」＋「tileset 對應到單張 PNG tile」。
>    　　• Actor 動畫用「幀路徑陣列」＋ 每幀時間（frameTime）。
> 7. 先從 **Module 1** 開始，完成後再做下一個。每次請先列「驗收步驟」，讓我立即看出畫面變化。

---

## 資料與命名（固定規格）

```
assets/
  tiles/
    ground_0.png
    ground_1.png
    ...
  actors/
    player/
      idle/
        idle_0.png
        idle_1.png
      run/
        run_0.png
        run_1.png
        ...
      jump/
        jump_0.png
  levels/
    level1.json          // 關卡定義（含 tilemap 與 entities）
    tileset.json         // tileset 對照（索引→檔名）
```

### tileset.json（單張 PNG tiles）

```json
{
  "tileSize": 16,
  "tiles": {
    "0": "assets/tiles/ground_0.png",
    "1": "assets/tiles/ground_1.png",
    "2": "assets/tiles/brick_0.png"
  }
}
```

### level1.json（索引網格 + 實體）

```json
{
  "tileSize": 16,
  "width": 40,
  "height": 12,
  "layers": {
    "solid": [
      [0,0,0,0,0,0,0,0, ...],
      ...
    ],
    "decor": [
      [-1,-1,-1,-1, ...],
      ...
    ]
  },
  "entities": [
    { "type": "player", "x": 32, "y": 64, "animations": {
      "idle":  { "frames": ["assets/actors/player/idle/idle_0.png","assets/actors/player/idle/idle_1.png"], "frameTime": 120 },
      "run":   { "frames": ["assets/actors/player/run/run_0.png","assets/actors/player/run/run_1.png","assets/actors/player/run/run_2.png"], "frameTime": 80 },
      "jump":  { "frames": ["assets/actors/player/jump/jump_0.png"], "frameTime": 160 }
    }}
  ]
}
```

> 說明：`layers.*` 用 **tile 索引**，`-1` 表示空白。`entities[].animations` 每個幀是一張 PNG，`frameTime` 是毫秒。

---

## 一次一模組流程（每個模組都有可見成果）

### Module 1 — Canvas 與 Loop 基礎

**目標**：建立固定 timestep（1/60）更新迴圈、清屏、顯示 FPS。
**完成定義**：打開頁面可看到 FPS 數字與背景顏色。
**重點檔案**：`src/loop/GameLoop.js`, `src/main.js`, `index.html`, `styles/main.css`。
**驗收步驟**：開啟 `index.html`，畫面左上角有 FPS 變動。

### Module 2 — ECS Core（World/Entity/Component/System）

**目標**：能註冊系統並在 `update()/draw()` 依序執行；能建立 entity 與掛載 components。
**完成定義**：Console 中可看到 entity 被系統查詢並印出。
**驗收**：按 F1 可切換 debug overlay 顯示 entity count。

### Module 3 — Input（Keyboard）

**目標**：`isDown/pressed/released`、key mapping（Left/Right/Up/Space/R/F1）。
**完成定義**：按左右鍵，console 顯示 key 狀態；R 可清場或重設。
**驗收**：壓住鍵與點按有不同狀態。

### Module 4 — Renderer2D（Draw Image + Debug Primitives）

**目標**：能畫圖片與基本幾何（線、矩形邊框），支援 world→screen 轉換。
**完成定義**：畫一張測試 PNG、畫數條 debug 線。
**驗收**：切 F1 顯示/隱藏 debug primitives。

### Module 5 — Tilemap Loader（索引網格 + 單張 PNG tiles）

**目標**：讀 `tileset.json` 與 `level1.json`，用索引將 tile 貼到世界座標。
**完成定義**：能看見鋪好的地板/牆面；支援多層（solid/decor）。
**驗收**：更改 `level1.json` 的某個索引，畫面立即有變。

### Module 6 — 基礎碰撞（Tile AABB）

**目標**：建立 `TileCollider`，將 `solid` 層生成 AABB 查詢；角色方塊能站在地上。
**完成定義**：一個測試 entity（Transform+Velocity+Collider）受重力落下並被地面阻擋。
**驗收**：左右移動不穿牆；落下落地不穿透。

### Module 7 — Actor Loader（以「單張 PNG」幀為動畫）

**目標**：支援 `entities[].animations` 的結構，建立 `SpriteFrames` component 與 `AnimationSystem`。
**完成定義**：`player` idle 能循環播幀；按左右切換到 run 動畫。
**驗收**：看得到幀切換；切換狀態時動畫正確重置。

### Module 8 — Player Controller（移動/跳躍）

**目標**：`PlayerController` 讀取 `Input`，更新 `Velocity`；落地檢測與單按跳。
**完成定義**：左右移動、起跳、落地回到 idle/run 動畫。
**驗收**：長按 Space 不連跳；落地後才可再次跳。

### Module 9 — Camera（跟隨 + clamp）

**目標**：`CameraTarget` + `Camera2D` 跟隨主角、dead-zone 與地圖邊界 clamp。
**完成定義**：主角跑到邊緣，鏡頭不超出地圖。
**驗收**：畫面平滑跟隨；切換關卡邊界正確。

### Module 10 — Polish & Debug（Overlay、碰撞框、逐步執行）

**目標**：F1 顯示 overlay（FPS、pos、vel、grounded、entities）、`[`/`]` 單步更新、切換 hitbox 顯示。
**完成定義**：可目視檢查碰撞框與計時資訊。
**驗收**：逐步追蹤角色移動與碰撞。

> 每個模組回合都請：
> • 先給「變更摘要」→ 貼檔案 → 告訴我「驗收步驟」→ 我確認後才進下一模組。
> • Commit 用 Conventional Commits（英文），例如：
> `feat(tilemap): render indexed grid using single-image tiles`
> `feat(animation): add SpriteFrames component for per-frame PNG animations`

---

## 關鍵介面（英文，讓 Claude 直接照做）

**SpriteFrames component（單張 PNG 幀動畫）**

```js
// src/game/components/SpriteFrames.js
export class SpriteFrames {
  constructor(def) {
    // def = { frames: [url,...], frameTime: 100 }
    this.frames = def.frames;     // array of image URLs
    this.frameTime = def.frameTime; // ms per frame
    this.elapsed = 0;
    this.index = 0;
    this.currentImage = null;     // Image object cache
  }
}
```

**AnimationSystem（進位幀 + 載入/快取）**

```js
// src/game/systems/AnimationSystem.js
export class AnimationSystem {
  constructor(assets) { this.assets = assets; } // simple image cache/loader
  update(world, dt) {
    for (const e of world.query(['SpriteFrames'])) {
      const anim = world.get(e, 'SpriteFrames');
      anim.elapsed += dt * 1000;
      while (anim.elapsed >= anim.frameTime) {
        anim.elapsed -= anim.frameTime;
        anim.index = (anim.index + 1) % anim.frames.length;
      }
      anim.currentImage = this.assets.get(anim.frames[anim.index]); // preloaded Image
    }
  }
  draw(world, renderer) {
    for (const e of world.query(['SpriteFrames','Transform'])) {
      const t = world.get(e, 'Transform');
      const anim = world.get(e, 'SpriteFrames');
      if (anim.currentImage) renderer.drawImage(anim.currentImage, t.x, t.y);
    }
  }
}
```

**Tilemap（索引→單張 PNG）**

```js
// src/engine/tilemap/Tilemap.js
export class Tilemap {
  constructor(tileSize, width, height, layers, tileset) {
    this.tileSize = tileSize;
    this.width = width; this.height = height;
    this.layers = layers;   // {solid: number[][], decor: number[][]}
    this.tileset = tileset; // { '0': 'assets/tiles/ground_0.png', ...}
  }
}
```

**TileRenderer（把索引貼成地圖）**

```js
// src/engine/tilemap/TileRenderer.js
export class TileRenderer {
  constructor(assets) { this.assets = assets; } // image cache
  drawLayer(renderer, tilemap, layerName) {
    const grid = tilemap.layers[layerName];
    const T = tilemap.tileSize;
    for (let y=0; y<tilemap.height; y++) {
      for (let x=0; x<tilemap.width; x++) {
        const idx = grid[y][x];
        if (idx < 0) continue;
        const url = tilemap.tileset[String(idx)];
        const img = this.assets.get(url);
        if (img) renderer.drawImage(img, x*T, y*T);
      }
    }
  }
}
```


太好了～那就把整個路線圖拉長、拉細，專門針對「有 AI 行為的 NPC、戰鬥（主角攻擊/發射物/命中判定）、特效與運動學」做成**一次一模組、每回合都看得到效果**的擴充版。下面這份你可以直接貼給 Claude Code，照著 Module 11 開始做；每個模組都有目標、可見成果（驗收），而且全部維持 Vanilla JS + ECS、代碼與註解全英文、說明中文的規範。

---

# 一次一模組路線（擴充戰鬥與 AI 版本）

> 保持之前 Module 1–10 的順序與規格；以下從 **Module 11** 接續。
> 規則同前：每回合提交「(1)變更摘要 (2)檔案清單 (3)驗收步驟 (4)下一步建議」，代碼全英文。

---

## Module 11 — Hitbox/Hurtbox 架構（近戰命中框）

**目標**：建立基礎的近戰命中框系統，分離「攻擊判定」與「受擊判定」。
**新元件**：`Hitbox`, `Hurtbox`, `Team`, `Damage`, `Cooldown`, `IFrame`（invulnerability frames）。
**新系統**：`HitboxSystem`, `DamageSystem`.
**驗收**：主角按 `J` 揮擊一次：畫面顯示攻擊框撞到假人（dummy）後，dummy 顯示受擊（減 HP、閃白或退後 2~3px），主角進入短暫攻擊冷卻；同隊不互打（Team 分組）。

---

## Module 12 — Health/Death/Respawn（血量與重生）

**目標**：生命值與死亡流程，支援重生點（Checkpoint）。
**新元件**：`Health`, `RespawnPoint`.
**新系統**：`HealthSystem`, `RespawnSystem`.
**驗收**：dummy 被揮擊多次會死亡並消失；按 `R` 重置關卡後出現於重生點；主角掉出地圖也會重生。

---

## Module 13 — Particles & VFX（命中特效/灰塵/斬擊光）

**目標**：簡易粒子系統與 VFX 播放器，支援預置樣式（hit spark、dust）。
**新元件**：`ParticleEmitter`, `VFXClip`, `Lifetime`.
**新系統**：`ParticleSystem`, `VFXSystem`.
**驗收**：揮擊命中播放 hit spark；落地播放 dust；效果會自動消失。

---

## Module 14 — Audio（SFX）

**目標**：加入 SFX 播放（攻擊、命中、跳躍、受傷）。
**新系統**：`AudioSystem`，簡易資源快取。
**驗收**：攻擊/命中/跳躍各播放不同音效；提供 `mute` 切換鍵。

---

## Module 15 — Projectile（遠程發射物）

**目標**：主角可發射投射物（例如 `K` 鍵），具飛行速度、壽命、命中傷害、擊退。
**新元件**：`Projectile`, `Lifetime`, `Knockback`.
**新系統**：`ProjectileSystem`（含物件池 object pooling）。
**驗收**：按 `K` 會射出彈體，撞到 dummy 會造成傷害並消失；最遠飛到壽命結束也會消失。

---

## Module 16 — Camera Shake & Hitstop（手感強化）

**目標**：命中時短暫停格（hitstop）、鏡頭震動（shake）。
**新系統**：`ScreenShakeSystem`, `HitstopSystem`.
**驗收**：命中 dummy，畫面有 60–120ms 的 hitstop（角色停格但不掉幀），同時鏡頭輕微震動。

---

## Module 17 — NPC Perception（視覺/聽覺偵測）

**目標**：NPC 擁有簡單感知：視線距離、視角、遮擋（tile 阻擋線段），以及噪音事件（例如跳躍落地）。
**新元件**：`Perception`（`sightRange`, `fov`, `hearingRange`）, `NoiseEvent`.
**新系統**：`PerceptionSystem`, `NoiseSystem`.
**驗收**：NPC 在玩家進入視線或聽到落地聲時改變狀態（idle→alert），頭上出現 `!` 圖示（VFX/Text）。

---

## Module 18 — AI FSM（巡邏/追擊/返回）

**目標**：NPC 使用有限狀態機（FSM）：`patrol → chase → return`。
**新元件**：`FSMState`（以字串標記當前狀態）。
**新系統**：`AISystem`（FSM 版）。
**驗收**：NPC 在兩點間巡邏；看到玩家會追擊；玩家脫離/失去視線則在短時間後返回巡邏路線。

---

## Module 19 — Pathfinding（A* 基於 tilemap）

**目標**：在 tile 層級進行簡單 A* 尋路（可先限定只在平地/平台，不做跳躍導航）。
**新模組**：`engine/pathfinding/GridAStar.js`.
**驗收**：放置障礙時，NPC 能繞路接近玩家；在 debug 視圖顯示路徑節點。

---

## Module 20 — AI Behavior Tree（BT）與策略差異

**目標**：導入簡易 BT 節點：Selector/Sequence/Condition/Action/Decorator（Cooldown），NPC 策略可配置。
**新元件**：`BehaviorTree`, `Blackboard`.
**新系統**：`BehaviorTreeSystem`.
**驗收**：兩種 NPC：

* `Brute`：接近後重擊（慢、傷害高、有蓄力動畫）。
* `Archer`：保持距離並射箭（使用 Projectile）。
  兩者用不同 BT json 載入行為。

---

## Module 21 — 攻擊資料表（Datadriven Attacks）

**目標**：把攻擊參數資料化：傷害、硬直、擊退、判定框、啟動/持續/恢復時間（startup/active/recovery）、特效、音效。
**新檔**：`assets/data/attacks/player.json`, `assets/data/attacks/brute.json` …
**新系統**：`AttackSystem` 依據資料表驅動攻擊生成 hitbox/VFX/SFX。
**驗收**：玩家與 NPC 攻擊都由 json 控制；調一個數字（如 damage）就能看到改變。

---

## Module 22 — 狀態機（角色動作狀態）與動畫整合

**目標**：玩家與 NPC 的 `idle/run/jump/attack/hitstun/death` 以 State Machine 管理，與 `SpriteFrames` 動畫對齊。
**新元件**：`StateMachine`（可與 `BehaviorTree` 並存；BT 決策，SM 控制動作）。
**新系統**：`AnimationStateSystem`.
**驗收**：攻擊期間鎖定移動；受擊進入 hitstun 動畫，結束才恢復可控。

---

## Module 23 — 多種命中效果（DoT、穿刺、貫穿、爆炸）

**目標**：支持特殊效果與命中類型：

* DoT（持續傷害）、
* Piercing（穿透多個敵人）、
* Explosive（範圍傷害）、
* Armor（減傷/破甲）
  **新元件**：`Buff`, `Modifier`, `Explosion`.
  **新系統**：`BuffSystem`, `ExplosionSystem`.
  **驗收**：設一顆爆炸彈，命中地面後爆炸，附近敵人同時扣血；設定一把穿刺箭可扎穿 2 個 dummy。

---

## Module 24 — 物品與掉落（Pickups/Loot）

**目標**：敵人死亡掉落補血或彈藥；玩家可撿取。
**新元件**：`Pickup`, `Inventory`（簡易）。
**新系統**：`PickupSystem`, `InventorySystem`.
**驗收**：打死敵人掉出心型道具；碰到後回血並播放 SFX/VFX。

---

## Module 25 — 難度與生成器（Spawner/Waves）

**目標**：依關卡節點生成敵人波次；支持冷卻與最大同場數量。
**新元件**：`Spawner`, `WaveConfig`.
**新系統**：`SpawnSystem`.
**驗收**：進入某個 tile 區塊觸發一波敵人；清空後才開下一波。

---

## Module 26 — UI/HUD（HP/彈藥/提示）

**目標**：畫面 HUD 顯示主角 HP、彈藥、提示（`Press J to attack`）。
**新系統**：`UISystem`（渲染至同一 canvas 或 DOM overlay 皆可，但建議仍 canvas）。
**驗收**：扣血/撿補給會即時更新 HUD。

---

## Module 27 — 存檔/讀檔（LocalStorage）

**目標**：保存關卡、玩家狀態（HP、彈藥、已解鎖技能），重進頁面可續玩。
**新系統**：`SaveSystem`。
**驗收**：刷新頁面仍保留上一關進度與數值。

---

## Module 28 — 效能與 QA（配置/剖析/障礙測試）

**目標**：簡易 Profiler（每系統耗時統計）、Config 開關（關閉特效、降低粒子）、自動化邊界測試腳本（例如 100 顆投射物）。
**新系統**：`ProfilerSystem`, `ConfigService`.
**驗收**：F1 顯示各系統毫秒；切 `P` 降低特效後 FPS 提升；壓力測試仍不掉幀到不可玩。

---

# 可配置資料格式（讓 Claude 直接照做）

### 1) NPC 行為（Behavior Tree JSON）

```json
{
  "type": "Selector",
  "children": [
    { "type": "Sequence", "name": "RangedKite",
      "children": [
        { "type": "Condition", "check": "playerVisible" },
        { "type": "Action", "do": "maintainDistance", "min": 80, "max": 140 },
        { "type": "Decorator", "name": "Cooldown", "ms": 900,
          "child": { "type": "Action", "do": "shootProjectile", "attackId": "archer_arrow" }
        }
      ]
    },
    { "type": "Sequence", "name": "Patrol",
      "children": [
        { "type": "Action", "do": "patrolBetween", "a":[64,160], "b":[320,160] }
      ]
    }
  ]
}
```

### 2) 攻擊資料（Data-driven）

```json
{
  "attacks": {
    "player_slash": {
      "damage": 10,
      "startup": 80,
      "active": 120,
      "recovery": 180,
      "knockback": [120, -60],
      "team": "player",
      "hitbox": { "w": 18, "h": 12, "offsetX": 10, "offsetY": 4 },
      "effects": { "vfx": "hit_spark_small", "sfx": "slash_1", "shake": 4, "hitstop": 100 }
    },
    "archer_arrow": {
      "projectile": true,
      "speed": 220,
      "lifetime": 1800,
      "damage": 6,
      "piercing": 0,
      "team": "enemy",
      "effects": { "sfx": "arrow_shoot" }
    }
  }
}
```

### 3) Level 中的 NPC 與 Spawner

```json
{
  "entities": [
    { "type":"npc_archer", "x": 260, "y": 144,
      "bt": "assets/ai/archer_bt.json",
      "hp": 24, "team":"enemy" },
    { "type":"spawner", "x": 640, "y": 120,
      "wave": { "count": 3, "intervalMs": 1200, "enemy": "npc_brute" },
      "limit": 5 }
  ]
}
```

---

# 對 Claude 的「回合指令範本」

每次要做一個模組時，就丟這段（換掉模組名稱與目標）：

> **[Module N]: <模組名稱>**
> 目標：<一句話>
> 請用一次一模組流程，先列：
>
> 1. 變更摘要（中文）
> 2. 新增/修改檔案清單（英文路徑）
> 3. 驗收步驟（我怎麼操作、畫面會出現什麼）
> 4. 下一步建議
>    然後貼上所有檔案完整內容（English code + comments）。
>    若要新增資料格式（JSON），請一併提供最小可跑範例。

第一次你就發這個：

> **[Module 11]: Hitbox/Hurtbox 基礎**
> 目標：主角近戰揮擊命中 dummy，造成傷害與輕微擊退；同隊不互打；有簡單受擊 VFX。
> 用回合格式開始。

