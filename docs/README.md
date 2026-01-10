# 文檔導航 Documentation Navigation

**專案 Project**: JavaScript Platformer Concepts
**版本 Version**: 2.0
**更新日期 Last Updated**: 2025-11-13

---

## 📚 文檔結構 Document Structure

本專案的所有文檔已按主題整理至 `docs/` 資料夾：

```
docs/
├── sd-guide/                    # Stable Diffusion 生成指南
│   ├── SD_COMPLETE_GUIDE.md   # 完整設定指南 (RTX 5080 優化)
│   └── PROMPT_LIBRARY.md       # 提示詞庫 (100+ prompts)
│
├── asset-guide/                # 素材整合指南
│   └── ASSET_INTEGRATION_GUIDE.md
│
├── config-examples/            # 配置範例
│   ├── enemies-example.json
│   ├── effects-example.json
│   └── projectiles-example.json
│
└── README.md                   # 本檔案 (文檔導航)
```

---

## 🚀 快速開始指南

### 1. Stable Diffusion 設定

#### 第一次使用 Stable Diffusion？

**閱讀順序**:
1. **DOWNLOAD_MODELS.md** (10 分鐘 - 先讀)
   - 下載必備 ControlNet 和 VAE
   - 推薦 LoRA 列表
   - 一鍵下載腳本

2. **SD_COMPLETE_GUIDE.md** (30-40 分鐘)
   - 安裝 WebUI
   - 配置客製化模型路徑
   - RTX 5080 優化設定

3. **PROMPT_LIBRARY.md** (參考文檔)
   - 100+ 提示詞模板
   - 涵蓋所有素材類型
   - 包含詳細配置說明

**操作步驟**:
```bash
# 0. 激活 conda 環境 (重要!)
conda activate ai_env

# 1. 下載必備模型 (第一次需要，約 5.4GB)
cd scripts
python download_models.py --priority  # 下載 OpenPose + VAE

# 2. 驗證路徑配置
python verify_sd_paths.py

# 3. 啟動 WebUI (一鍵啟動)
# 方法 A: 直接雙擊 START_WEBUI_RTX5080.bat (Windows)
# 方法 B: 命令行啟動
conda activate ai_env
cd /path/to/stable-diffusion-webui
# 先複製配置檔（只需一次）
cp /mnt/c/web-projects/javascript-platformer-concepts/scripts/webui-user-rtx5080.sh ./webui-user.sh
bash webui-user.sh

# 4. 驗證連線 (新開終端)
conda activate ai_env
cd scripts
python verify_sd_paths.py --check-webui

# 5. 開始生成
python sd_batch_generator.py --type character --name slime --action idle --frames 10
```

---

### 2. 素材整合到遊戲

#### 已生成素材，要整合到遊戲？

**閱讀**:
- **ASSET_INTEGRATION_GUIDE.md**
  - 素材命名規範
  - 資料夾結構
  - Loader 使用方法
  - 配置檔案格式

**操作步驟**:
```bash
# 0. 激活環境
conda activate ai_env

# 1. 移除背景
cd scripts
python batch_remove_bg.py --input ../assets/sprites/enemies/slime/idle

# 2. 檢查檔案命名
# 應該是: idle(1).png, idle(2).png, ..., idle(10).png

# 3. 更新配置檔 (如果需要)
# 參考 docs/config-examples/enemies-example.json

# 4. 在遊戲中載入
# 參考 ASSET_INTEGRATION_GUIDE.md 的 "整合步驟" 章節
```

---

## 📖 文檔詳細說明

### SD Guide - Stable Diffusion 指南

#### `SD_COMPLETE_GUIDE.md`

**包含內容**:
- ✅ RTX 5080 + CUDA 12.8 + PyTorch 2.7 優化配置
- ✅ WebUI 安裝與設定 (30 分鐘完成)
- ✅ 客製化模型路徑配置 (ai_warehouse)
- ✅ ControlNet 完整安裝指南
- ✅ VAE 和 LoRA 推薦與下載
- ✅ 路徑驗證腳本使用說明
- ✅ 問題排除指南
- ✅ RTX 5080 性能預期與建議設定

**適合對象**:
- 第一次使用 SD WebUI
- 需要設定客製化模型路徑
- 想要針對 RTX 5080 優化

**預計閱讀時間**: 30-40 分鐘

---

#### `PROMPT_LIBRARY.md`

**包含內容**:
- ✅ 100+ 專業提示詞模板
- ✅ 涵蓋 10 大類素材:
  - 角色 NPC (村民、商人、任務發布者、鐵匠)
  - 敵人 (史萊姆、骷髏、蝙蝠、哥布林、幽靈)
  - Boss (龍王、機械巨人)
  - 特效 VFX (戰鬥、爆炸、煙霧、收集、魔法)
  - 發射物 (子彈、箭矢、火球、魔法球、雷射)
  - 物品道具 (金幣、藥水、能量道具、收集品)
  - 地圖 Tileset (草地、泥土、石頭、水面、平台、裝飾)
  - UI 元素 (按鈕、生命條、圖標)
- ✅ 每個素材都有:
  - 詳細提示詞 (Positive + Negative)
  - 推薦幀數
  - 解析度建議
  - 顏色配置
  - 遊戲內尺寸
- ✅ 提示詞權重技巧
- ✅ 配置建議表

**適合對象**:
- 已設定好 WebUI，準備開始生成
- 需要參考提示詞範例
- 想快速生成各類遊戲素材

**使用方式**:
作為參考文檔，複製貼上提示詞到 WebUI 或修改腳本

---

### Asset Guide - 素材整合指南

#### `ASSET_INTEGRATION_GUIDE.md`

**包含內容**:
- ✅ 完整資料夾結構
- ✅ 檔案命名規範 (ActionName(N).png)
- ✅ 素材網站推薦 (itch.io, OpenGameArt, Kenney)
- ✅ 搜尋關鍵字策略 (英文，避免 pixel art)
- ✅ 整合步驟 (5 步驟)
- ✅ Loader 使用範例
- ✅ 配置檔案格式
- ✅ 授權檢查清單

**適合對象**:
- 需要整合素材到遊戲專案
- 想了解專案的資料夾結構
- 需要搜尋免費素材網站

---

### Config Examples - 配置範例

#### `enemies-example.json`

敵人角色配置範例：
```json
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
  }
}
```

#### `effects-example.json`

特效配置範例：
```json
{
  "slash": {
    "path": "assets/effects/combat/slash",
    "frameCount": 8,
    "frameDuration": 0.04,
    "loop": false,
    "width": 64,
    "height": 64
  }
}
```

#### `projectiles-example.json`

發射物配置範例：
```json
{
  "bullet": {
    "path": "assets/projectiles/bullet",
    "animated": false,
    "width": 16,
    "height": 8,
    "speed": 600,
    "damage": 15,
    "lifetime": 2.0
  }
}
```

---

## 🛠️ 相關腳本

所有腳本位於 `scripts/` 資料夾：

### SD WebUI 配置檔案

| 檔案 | 用途 |
|------|------|
| `webui-user-rtx5080.sh` | Linux/WSL 配置 (RTX 5080 優化) |
| `webui-user-rtx5080.bat` | Windows 配置 (RTX 5080 優化) |

**使用方法**:
```bash
# 複製到 WebUI 資料夾
cp scripts/webui-user-rtx5080.sh ~/stable-diffusion-webui/webui-user.sh

# 修改路徑 (如果需要)
nano ~/stable-diffusion-webui/webui-user.sh

# 啟動
cd ~/stable-diffusion-webui && bash webui-user.sh
```

### Python 腳本

| 腳本 | 功能 | 用法 |
|------|------|------|
| `verify_sd_paths.py` | 驗證模型路徑配置 | `python verify_sd_paths.py` |
| `sd_batch_generator.py` | 批次生成遊戲素材 | `python sd_batch_generator.py --type character --name slime --action idle --frames 10` |
| `batch_remove_bg.py` | 批次移除背景 | `python batch_remove_bg.py --input ../assets/sprites/enemies/slime/idle` |

**依賴安裝**:
```bash
# 激活環境
conda activate ai_env

# 安裝依賴
cd scripts
pip install -r requirements.txt
```

---

## 📊 工作流程圖

### 完整素材生成流程

```
1. 設定環境
   ├─ 安裝 WebUI
   ├─ 配置路徑 (webui-user-rtx5080.sh)
   ├─ 下載 ControlNet 模型
   └─ 驗證路徑 (verify_sd_paths.py)
         ↓
2. 生成素材
   ├─ 查閱 PROMPT_LIBRARY.md
   ├─ 使用 sd_batch_generator.py 批次生成
   └─ 或在 WebUI 中手動生成
         ↓
3. 後處理
   ├─ batch_remove_bg.py 移除背景
   ├─ 調整大小 (如果需要)
   └─ 檢查檔案命名
         ↓
4. 整合到遊戲
   ├─ 放入 assets/ 對應資料夾
   ├─ 更新 config JSON
   └─ 使用 Loader 載入
         ↓
5. 測試
   └─ 在遊戲中驗證效果
```

---

## 💡 常見任務快速參考

### 任務 1: 生成史萊姆敵人完整動畫

```bash
# 1. 生成 idle (10 幀)
python sd_batch_generator.py --type character --name slime --action idle --frames 10

# 2. 記下 seed，用於後續動作
# 假設 seed 是 123456

# 3. 生成 walk (8 幀，使用相同 seed)
python sd_batch_generator.py --type character --name slime --action walk --frames 8 --seed 123456

# 4. 生成 attack (6 幀)
python sd_batch_generator.py --type character --name slime --action attack --frames 6 --seed 123456

# 5. 生成 death (10 幀)
python sd_batch_generator.py --type character --name slime --action death --frames 10 --seed 123456

# 6. 移除所有背景
python batch_remove_bg.py --recursive --input ../assets/sprites/enemies/slime
```

### 任務 2: 生成爆炸特效

```bash
# 1. 小型爆炸 (10 幀)
python sd_batch_generator.py --type effect --name small --category explosion --frames 10

# 2. 中型爆炸 (12 幀)
python sd_batch_generator.py --type effect --name medium --category explosion --frames 12

# 3. 大型爆炸 (15 幀)
python sd_batch_generator.py --type effect --name large --category explosion --frames 15

# 4. 移除背景
python batch_remove_bg.py --recursive --input ../assets/effects/explosion
```

### 任務 3: 生成物品圖標

```bash
# 手動在 WebUI 中生成 (使用 LoRA)
# 參考 PROMPT_LIBRARY.md → 物品道具 Prompts
# 使用提示詞:
# <lora:game-icon-institute:0.8>, health potion icon, red glowing liquid, ...

# 或使用腳本 (需要修改加入 LoRA 支援)
```

---

## ❓ 常見問題

### Q1: 我的模型沒有顯示在 WebUI 下拉選單中？

**A**:
1. 檢查路徑配置: `cat ~/stable-diffusion-webui/webui-user.sh | grep CKPT_DIR`
2. 驗證路徑: `python verify_sd_paths.py`
3. 完全重啟 WebUI (Ctrl+C 停止，重新執行)

### Q2: 生成的圖片背景不透明？

**A**:
使用背景移除腳本:
```bash
python batch_remove_bg.py --input [圖片資料夾]
```

### Q3: CUDA out of memory 錯誤？

**A**:
RTX 5080 應該不會遇到，如果發生:
- 降低解析度: 1024x1024 → 768x768
- 減少批次數量: Batch count = 1

### Q4: 如何確保角色一致性？

**A**:
1. 第一幀生成後記錄 Seed
2. 所有後續幀使用相同 Seed: `--seed 123456`
3. 只微調提示詞中的動作描述

### Q5: 提示詞太長怎麼辦？

**A**:
SDXL 支援較長提示詞，通常沒問題。如果需要簡化:
1. 移除不重要的修飾詞
2. 保留核心描述 + 透明背景 + 風格
3. 使用權重強調重點: `(transparent background:1.3)`

---

## 📞 取得協助

### 文檔問題

如果文檔內容有誤或不清楚：
1. 查看對應文檔的更新日期
2. 確認你使用的是最新版本
3. 參考多個文檔交叉確認

### 技術問題

- **WebUI 相關**: https://github.com/AUTOMATIC1111/stable-diffusion-webui/issues
- **ControlNet**: https://github.com/Mikubill/sd-webui-controlnet/issues
- **模型下載**: https://civitai.com
- **Prompt 靈感**: https://lexica.art

---

## 🔄 文檔更新日誌

### v2.0 (2025-11-13)
- ✅ 重構文檔結構，整理至 docs/ 資料夾
- ✅ 新增 RTX 5080 + CUDA 12.8 + PyTorch 2.7 優化配置
- ✅ 新增詳細提示詞庫 (100+ prompts)
- ✅ 新增路徑驗證腳本
- ✅ 合併 SD_SETUP_GUIDE 和 SD_QUICK_START
- ✅ 新增配置範例檔案

### v1.0 (2025-11-13 早期)
- 初始版本

---

## ✅ 建議閱讀順序

### 新手 (第一次使用)

1. **SD_COMPLETE_GUIDE.md** (完整閱讀)
2. **verify_sd_paths.py** (執行驗證)
3. **PROMPT_LIBRARY.md** (快速瀏覽，需要時參考)
4. **ASSET_INTEGRATION_GUIDE.md** (生成素材後再讀)

**預計時間**: 1-2 小時 (含設定)

### 已有經驗 (熟悉 SD)

1. **SD_COMPLETE_GUIDE.md** → "客製化模型路徑設定" 章節
2. **webui-user-rtx5080.sh** (複製配置)
3. **verify_sd_paths.py** (執行驗證)
4. **PROMPT_LIBRARY.md** (參考提示詞)

**預計時間**: 15-30 分鐘

### 只需要提示詞

直接查閱 **PROMPT_LIBRARY.md**，按素材類型查找

---

**Last Updated**: 2025-11-13
**文檔維護者 Maintainer**: LLMProvider Tooling AI
**專案 Project**: JavaScript Platformer Concepts
