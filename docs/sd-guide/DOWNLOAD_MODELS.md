# 模型下載完整指南
# Complete Model Download Guide

**專案 Project**: JavaScript Platformer Game Asset Generation
**硬體 Hardware**: RTX 5080 | CUDA 12.8
**版本 Version**: 1.0
**日期 Date**: 2025-11-13

---

## 📋 目錄 Table of Contents

1. [下載概覽](#下載概覽)
2. [ControlNet 模型 (必備)](#controlnet-模型-必備)
3. [VAE 模型 (強烈建議)](#vae-模型-強烈建議)
4. [LoRA 模型 (遊戲素材專用)](#lora-模型-遊戲素材專用)
5. [下載方法](#下載方法)
6. [自動下載腳本](#自動下載腳本)
7. [驗證安裝](#驗證安裝)

---

## 📊 下載概覽

### 必備 (Essential)

| 類型 | 數量 | 總大小 | 優先級 |
|------|------|--------|--------|
| ControlNet (SDXL) | 4 個 | ~8GB | ⭐⭐⭐⭐⭐ 必備 |
| VAE (SDXL) | 1 個 | ~335MB | ⭐⭐⭐⭐ 強烈建議 |
| LoRA (遊戲素材) | 3-5 個 | ~500MB | ⭐⭐⭐ 建議 |

**總計**: ~8.8GB（最少需求）

### 儲存路徑

```
C:\AI_LLM_projects\ai_warehouse\models\
├── controlnet\                    # ControlNet 模型
├── stable-diffusion\
│   ├── checkpoints\              # ✅ 已有 5 個模型
│   ├── vae\                      # VAE 模型
│   └── lora\                     # LoRA 模型
```

---

## 🎯 ControlNet 模型 (必備)

ControlNet 用於精確控制生成內容，對遊戲素材生成至關重要。

### 1. OpenPose SDXL (最重要 - 角色姿勢)

**用途**: 控制角色姿勢，確保動畫幀一致性

**模型名稱**: `OpenPoseXL2.safetensors`
**大小**: ~5GB
**優先級**: ⭐⭐⭐⭐⭐ 必備

**下載連結**:
```
https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors
```

**儲存位置**:
```
C:\AI_LLM_projects\ai_warehouse\models\controlnet\OpenPoseXL2.safetensors
```

**應用場景**:
- ✅ 角色動畫（idle, walk, attack, death）
- ✅ NPC 姿勢控制
- ✅ Boss 角色多動作生成

---

### 2. Canny SDXL (邊緣檢測)

**用途**: 保持輪廓線條，適合有參考圖的生成

**模型名稱**: `sai_xl_canny_256lora.safetensors`
**大小**: ~774MB
**優先級**: ⭐⭐⭐⭐ 強烈建議

**下載連結**:
```
https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_canny_256lora.safetensors
```

**儲存位置**:
```
C:\AI_LLM_projects\ai_warehouse\models\controlnet\sai_xl_canny_256lora.safetensors
```

**應用場景**:
- ✅ 從線稿生成完整角色
- ✅ 保持物品圖標輪廓
- ✅ 地圖素材邊緣控制

---

### 3. Depth SDXL (深度控制)

**用途**: 控制場景深度和立體感

**模型名稱**: `sai_xl_depth_256lora.safetensors`
**大小**: ~774MB
**優先級**: ⭐⭐⭐ 建議

**下載連結**:
```
https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_depth_256lora.safetensors
```

**儲存位置**:
```
C:\AI_LLM_projects\ai_warehouse\models\controlnet\sai_xl_depth_256lora.safetensors
```

**應用場景**:
- ✅ 3D 感覺的 2D 角色
- ✅ 背景圖層深度
- ✅ 平台和地形立體感

---

### 4. Lineart/Sketch SDXL (線稿風格)

**用途**: 保持手繪線稿風格

**模型名稱**: `sai_xl_sketch_256lora.safetensors`
**大小**: ~774MB
**優先級**: ⭐⭐⭐ 建議

**下載連結**:
```
https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_sketch_256lora.safetensors
```

**儲存位置**:
```
C:\AI_LLM_projects\ai_warehouse\models\controlnet\sai_xl_sketch_256lora.safetensors
```

**應用場景**:
- ✅ 卡通風格線稿轉色
- ✅ 手繪草圖完善
- ✅ 保持藝術風格一致

---

### ControlNet 快速下載 (4合1)

**使用 wget (WSL/Linux)**:
```bash
cd /mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet

# 1. OpenPose (5GB - 最重要)
wget https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors

# 2. Canny (774MB)
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_canny_256lora.safetensors

# 3. Depth (774MB)
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_depth_256lora.safetensors

# 4. Lineart (774MB)
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_sketch_256lora.safetensors
```

**使用 PowerShell (Windows)**:
```powershell
cd C:\AI_LLM_projects\ai_warehouse\models\controlnet

# 1. OpenPose
Invoke-WebRequest -Uri "https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors" -OutFile "OpenPoseXL2.safetensors"

# 2. Canny
Invoke-WebRequest -Uri "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_canny_256lora.safetensors" -OutFile "sai_xl_canny_256lora.safetensors"

# 3. Depth
Invoke-WebRequest -Uri "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_depth_256lora.safetensors" -OutFile "sai_xl_depth_256lora.safetensors"

# 4. Lineart
Invoke-WebRequest -Uri "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_sketch_256lora.safetensors" -OutFile "sai_xl_sketch_256lora.safetensors"
```

---

## 🖼️ VAE 模型 (強烈建議)

VAE 負責圖片的編碼和解碼，影響色彩和細節品質。

### SDXL VAE (官方推薦)

**用途**: 改善 SDXL 生成的色彩飽和度和細節

**模型名稱**: `sdxl_vae.safetensors`
**大小**: ~335MB
**優先級**: ⭐⭐⭐⭐ 強烈建議

**下載連結**:
```
https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors
```

**儲存位置**:
```
C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\vae\sdxl_vae.safetensors
```

**效果對比**:
- ❌ 不使用 VAE: 色彩暗淡、細節模糊
- ✅ 使用 VAE: 色彩鮮豔、細節清晰、高對比度

**下載命令**:

```bash
# WSL/Linux
cd /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/vae
wget https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors

# Windows PowerShell
cd C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\vae
Invoke-WebRequest -Uri "https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors" -OutFile "sdxl_vae.safetensors"
```

---

## 🎨 LoRA 模型 (遊戲素材專用)

LoRA 是小型風格調整模型，用於微調特定風格和物體。

### 1. Game Icon Institute (物品圖標必備)

**用途**: 生成專業遊戲物品圖標（武器、藥水、道具）

**模型資訊**:
- **名稱**: `GameIconResearch_gameicon_Lora.safetensors`
- **大小**: ~144MB
- **優先級**: ⭐⭐⭐⭐⭐ 遊戲素材必備
- **權重**: 0.7-0.9

**下載連結**:
```
https://civitai.com/models/108092/game-icon-research-lora
```

**Civitai 下載步驟**:
1. 前往 https://civitai.com/models/108092/game-icon-research-lora
2. 點選 "Download" 按鈕
3. 選擇最新版本（通常是 v2.0 或更高）
4. 下載 `.safetensors` 檔案
5. 移動到 `C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\lora\`

**使用方式**:
```
提示詞中加入: <lora:GameIconResearch_gameicon_Lora:0.8>

完整範例:
<lora:GameIconResearch_gameicon_Lora:0.8>, health potion icon,
red glowing liquid, glass bottle, game asset, transparent background,
clean design, professional game icon
```

**適用素材**:
- ✅ 武器圖標（劍、弓、法杖）
- ✅ 藥水圖標（生命、魔力、耐力）
- ✅ 道具圖標（鑰匙、寶石、金幣）
- ✅ 能量道具（盾牌、加速、攻擊提升）

---

### 2. Flat Color Anime (扁平卡通風格)

**用途**: 生成扁平化、簡潔的卡通角色

**模型資訊**:
- **名稱**: `FlatColorAnime.safetensors`
- **大小**: ~75MB
- **優先級**: ⭐⭐⭐⭐ 角色生成推薦
- **權重**: 0.5-0.7

**下載連結**:
```
https://civitai.com/models/23521/flat-color-anime
```

**下載步驟**:
1. 前往 Civitai 連結
2. 下載最新版本
3. 儲存到 `C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\lora\`

**使用方式**:
```
<lora:FlatColorAnime:0.6>, cute slime character,
simple flat design, bright colors, minimal shading
```

**適用素材**:
- ✅ 簡化風格敵人
- ✅ 扁平化 NPC
- ✅ UI 圖示角色
- ✅ 卡通背景元素

---

### 3. Character Sheet Helper (多角度視圖)

**用途**: 生成角色的多角度參考圖（正面、側面、背面）

**模型資訊**:
- **名稱**: `CharacterSheet.safetensors`
- **大小**: ~144MB
- **優先級**: ⭐⭐⭐⭐ 角色設計推薦
- **權重**: 0.8-1.0

**下載連結**:
```
https://civitai.com/models/82218/character-sheet-helper
```

**下載步驟**:
1. 前往 Civitai 連結
2. 下載適用於 SDXL 的版本
3. 儲存到 `C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\lora\`

**使用方式**:
```
<lora:CharacterSheet:0.9>, character reference sheet,
front view, side view, back view, full body,
blue slime character, clean design, white background
```

**適用素材**:
- ✅ 角色設計參考
- ✅ 動畫製作參考
- ✅ 多角度視圖
- ✅ 服裝設計展示

---

### 4. 2.5D Cartoon Style (2.5D 卡通風格)

**用途**: 生成帶有輕微立體感的 2D 卡通風格

**模型資訊**:
- **名稱**: `2.5D_Cartoon_Style.safetensors`
- **大小**: ~144MB
- **優先級**: ⭐⭐⭐ 選用
- **權重**: 0.6-0.8

**搜尋關鍵字** (在 Civitai 搜尋):
```
"2.5D cartoon" OR "cartoon style lora SDXL"
```

**推薦連結**:
- https://civitai.com/models (搜尋 "2.5D cartoon SDXL")

**使用方式**:
```
<lora:2.5D_Cartoon:0.7>, game character,
slight 3D effect, cartoon shading, depth
```

---

### 5. Hand Drawn Game Assets (手繪遊戲素材)

**用途**: 生成手繪風格的遊戲素材

**模型資訊**:
- **名稱**: `HandDrawnGameAssets.safetensors`
- **大小**: ~100MB
- **優先級**: ⭐⭐⭐ 選用
- **權重**: 0.5-0.7

**搜尋關鍵字**:
```
"hand drawn game assets lora" OR "cartoon game asset lora SDXL"
```

**使用方式**:
```
<lora:HandDrawnGameAssets:0.6>, game asset,
hand drawn style, colorful, thick outlines
```

---

## 📥 下載方法

### 方法 1: 瀏覽器下載 (最簡單)

**Hugging Face 模型**:
1. 點擊連結前往模型頁面
2. 點選檔案名稱右側的 ⬇️ 下載圖示
3. 儲存到對應資料夾

**Civitai 模型**:
1. 前往模型頁面
2. 點選 "Download" 按鈕
3. 選擇版本（通常選最新）
4. 下載 `.safetensors` 檔案
5. 移動到對應資料夾

---

### 方法 2: wget 命令 (批次下載)

```bash
# 激活環境
conda activate ai_env

# 創建資料夾
mkdir -p /mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet
mkdir -p /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/vae
mkdir -p /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/lora

# 下載 ControlNet (4個)
cd /mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet
wget https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_canny_256lora.safetensors
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_depth_256lora.safetensors
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_sketch_256lora.safetensors

# 下載 VAE (1個)
cd /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/vae
wget https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors

echo "✅ Downloads complete!"
```

---

### 方法 3: PowerShell 批次下載

創建 `download_models.ps1`:
```powershell
# ControlNet 下載
$controlnetPath = "C:\AI_LLM_projects\ai_warehouse\models\controlnet"
New-Item -ItemType Directory -Force -Path $controlnetPath

Write-Host "Downloading ControlNet models..."

# OpenPose
Invoke-WebRequest -Uri "https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors" -OutFile "$controlnetPath\OpenPoseXL2.safetensors"

# Canny
Invoke-WebRequest -Uri "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_canny_256lora.safetensors" -OutFile "$controlnetPath\sai_xl_canny_256lora.safetensors"

# Depth
Invoke-WebRequest -Uri "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_depth_256lora.safetensors" -OutFile "$controlnetPath\sai_xl_depth_256lora.safetensors"

# Lineart
Invoke-WebRequest -Uri "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_sketch_256lora.safetensors" -OutFile "$controlnetPath\sai_xl_sketch_256lora.safetensors"

# VAE 下載
$vaePath = "C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\vae"
New-Item -ItemType Directory -Force -Path $vaePath

Write-Host "Downloading VAE model..."
Invoke-WebRequest -Uri "https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors" -OutFile "$vaePath\sdxl_vae.safetensors"

Write-Host "✅ All downloads complete!"
```

執行：
```powershell
powershell -ExecutionPolicy Bypass -File download_models.ps1
```

---

## 🤖 自動下載腳本

我已創建 Python 自動下載腳本。

### 使用方式

```bash
# 激活環境
conda activate ai_env

# 前往 scripts 資料夾
cd /mnt/c/web-projects/javascript-platformer-concepts/scripts

# 下載所有必備模型
python download_models.py --all

# 或分別下載
python download_models.py --controlnet  # 只下載 ControlNet
python download_models.py --vae         # 只下載 VAE
```

---

## ✅ 驗證安裝

### 自動驗證

```bash
conda activate ai_env
cd scripts
python verify_sd_paths.py
```

**預期輸出**:
```
✅ Checkpoints: 5 models found
✅ ControlNet: 4 models found
   📄 OpenPoseXL2.safetensors
   📄 sai_xl_canny_256lora.safetensors
   📄 sai_xl_depth_256lora.safetensors
   📄 sai_xl_sketch_256lora.safetensors
✅ VAE: 1 model found
   📄 sdxl_vae.safetensors
⚠️  LoRA: 0-5 models found (手動下載)
```

### 手動驗證

**檢查 ControlNet**:
```bash
ls -lh /mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet/
```

應該看到：
```
OpenPoseXL2.safetensors              (5GB)
sai_xl_canny_256lora.safetensors     (774MB)
sai_xl_depth_256lora.safetensors     (774MB)
sai_xl_sketch_256lora.safetensors    (774MB)
```

**檢查 VAE**:
```bash
ls -lh /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/vae/
```

應該看到：
```
sdxl_vae.safetensors                 (335MB)
```

**檢查 LoRA**:
```bash
ls -lh /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/lora/
```

---

## 📋 完整下載清單

### 必備 (Essential)

| 模型 | 檔案名稱 | 大小 | 下載連結 |
|------|----------|------|----------|
| OpenPose | OpenPoseXL2.safetensors | 5GB | [Download](https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors) |
| Canny | sai_xl_canny_256lora.safetensors | 774MB | [Download](https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_canny_256lora.safetensors) |
| Depth | sai_xl_depth_256lora.safetensors | 774MB | [Download](https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_depth_256lora.safetensors) |
| Lineart | sai_xl_sketch_256lora.safetensors | 774MB | [Download](https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_sketch_256lora.safetensors) |
| SDXL VAE | sdxl_vae.safetensors | 335MB | [Download](https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors) |

### 建議 (Recommended)

| LoRA | 用途 | 下載連結 |
|------|------|----------|
| Game Icon Institute | 物品圖標 | [Civitai](https://civitai.com/models/108092/game-icon-research-lora) |
| Flat Color Anime | 扁平風格角色 | [Civitai](https://civitai.com/models/23521/flat-color-anime) |
| Character Sheet | 多角度視圖 | [Civitai](https://civitai.com/models/82218/character-sheet-helper) |

---

## 🎯 下載順序建議

### 第一階段 (立即下載 - 30分鐘)

1. ✅ OpenPose ControlNet (5GB) - 最重要
2. ✅ SDXL VAE (335MB) - 色彩品質

**完成後**: 已可開始生成角色

### 第二階段 (隨後下載 - 20分鐘)

3. ✅ Canny ControlNet (774MB)
4. ✅ Depth ControlNet (774MB)
5. ✅ Lineart ControlNet (774MB)

**完成後**: 可使用多種 ControlNet 功能

### 第三階段 (需要時下載)

6. ⭐ Game Icon Institute LoRA - 生成物品時下載
7. ⭐ Flat Color Anime LoRA - 需要扁平風格時
8. ⭐ Character Sheet LoRA - 需要多角度時

---

## 💾 儲存空間需求

### 最小配置

```
ControlNet (OpenPose only):     5GB
VAE:                            335MB
總計:                           ~5.4GB
```

### 建議配置

```
ControlNet (4個):               ~8GB
VAE:                            335MB
LoRA (3個):                     ~500MB
總計:                           ~8.8GB
```

### 完整配置

```
Checkpoint (已有):              14GB
ControlNet:                     8GB
VAE:                            335MB
LoRA:                           1GB
總計:                           ~23GB
```

---

## 📞 遇到問題？

### 下載速度慢

**Hugging Face 鏡像**:
```
https://hf-mirror.com (中國大陸用戶)
```

將連結中的 `huggingface.co` 替換為 `hf-mirror.com`

### 下載失敗

**使用下載工具**:
- **IDM** (Internet Download Manager)
- **FDM** (Free Download Manager)
- **aria2c** (命令行工具)

### Civitai 需要登入

某些模型需要 Civitai 帳號才能下載：
1. 前往 https://civitai.com 註冊
2. 登入後下載

---

## ✅ 下載後檢查清單

完成下載後確認：

```bash
# 執行驗證腳本
conda activate ai_env
cd scripts
python verify_sd_paths.py

# 應該看到:
# ✅ ControlNet: 4 models found
# ✅ VAE: 1 model found
# ✅ LoRA: 3-5 models found (視下載數量)
```

---

**Last Updated**: 2025-11-13
**維護者 Maintainer**: LLMProvider Tooling AI
