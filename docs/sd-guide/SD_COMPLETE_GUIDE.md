# Stable Diffusion 完整設定指南
# SD Complete Setup Guide for RTX 5080

**硬體配置 Hardware**: RTX 5080 | CUDA 12.8 | PyTorch 2.7
**專案 Project**: JavaScript Platformer Game Asset Generation
**版本 Version**: 2.0
**日期 Date**: 2025-11-13

---

## 📋 目錄 Table of Contents

1. [硬體規格與優化](#硬體規格與優化)
2. [WebUI 安裝與配置](#webui-安裝與配置)
3. [客製化模型路徑設定](#客製化模型路徑設定)
4. [ControlNet 完整設定](#controlnet-完整設定)
5. [VAE 與 LoRA 安裝](#vae-與-lora-安裝)
6. [路徑驗證腳本](#路徑驗證腳本)
7. [快速開始生成](#快速開始生成)
8. [問題排除](#問題排除)

---

## 🖥️ 硬體規格與優化

### 你的硬體配置

| 組件 | 規格 | 性能等級 |
|------|------|----------|
| GPU | NVIDIA RTX 5080 | 🔥 高階 |
| VRAM | 16GB (推測) | 優秀 |
| CUDA | 12.8 | 最新 |
| PyTorch | 2.7 | 最新 |

### RTX 5080 優化建議

**優勢**:
- ✅ 可以跑 SDXL 全解析度 (1024x1024) 無壓力
- ✅ 可以同時啟用 ControlNet + LoRA
- ✅ 批次生成速度快
- ✅ 不需要 --medvram 或 --lowvram

**最佳設定**:
```bash
--xformers          # 記憶體優化 (必開)
--no-half-vae       # VAE 使用全精度 (RTX 5080 建議)
--opt-sdp-attention # 最佳注意力機制
--api               # 啟用 API
```

### Python 環境 (Conda ai_env)

**你的環境配置**:
```bash
# 激活 conda 環境
conda activate ai_env

# 確認環境
conda info --envs
# 應該看到 * ai_env

# 確認 Python 版本
python --version
# Python 3.10.x (建議)
```

### PyTorch 2.7 + CUDA 12.8 驗證

確認版本：
```bash
# 激活環境
conda activate ai_env

# 驗證 PyTorch 和 CUDA
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA: {torch.version.cuda}'); print(f'GPU: {torch.cuda.get_device_name(0)}')"
```

預期輸出：
```
PyTorch: 2.7.x
CUDA: 12.8
GPU: NVIDIA GeForce RTX 5080
```

---

## 🚀 WebUI 安裝與配置

### 方法 1: 全新安裝 (推薦)

```bash
# 1. 下載 Automatic1111 WebUI
cd /mnt/c/
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# 2. 確認 Python 環境
python --version  # 應該是 3.10.x

# 3. 首次啟動 (會自動安裝依賴)
bash webui.sh --xformers
```

### 方法 2: 使用現有 Conda 環境 (推薦 - 你的配置)

你已經有 conda ai_env 環境 (PyTorch 2.7 + CUDA 12.8)：

```bash
# 激活 conda 環境
conda activate ai_env

# 前往 WebUI 資料夾
cd stable-diffusion-webui

# 設定使用現有 PyTorch (不重新安裝)
export COMMANDLINE_ARGS="--skip-torch-cuda-test --xformers"

# 啟動 WebUI
bash webui.sh
```

**重要**: 每次啟動 WebUI 前都要先激活 ai_env 環境

### 首次啟動驗證

啟動成功會看到：
```
Running on local URL:  http://127.0.0.1:7860
```

瀏覽器打開後確認：
1. 左上角有 "Stable Diffusion checkpoint" 下拉選單
2. 可以看到預設模型 (v1-5-pruned-emaonly)
3. 介面正常顯示

---

## 📂 客製化模型路徑設定

### 你的模型結構

```
/mnt/c/AI_LLM_projects/ai_warehouse/models/
├── stable-diffusion/
│   ├── checkpoints/              # 主模型 (已有 5 個)
│   │   ├── AnythingXL_v50.safetensors          ✅ 推薦
│   │   ├── anything-v5-PrtRE.safetensors
│   │   ├── disneyPixarCartoon_v10.safetensors
│   │   ├── pixarStyleModel_v10.safetensors
│   │   └── v1-5-pruned-emaonly.safetensors
│   ├── lora/                     # LoRA 模型
│   ├── vae/                      # VAE 模型
│   └── embeddings/               # Textual Inversion
└── controlnet/                   # ControlNet 模型
```

### WebUI 配置檔案 (RTX 5080 優化版)

**webui-user.sh** (Linux/WSL):

```bash
#!/bin/bash

# ============================================================================
# RTX 5080 優化配置
# CUDA 12.8 + PyTorch 2.7
# ============================================================================

# 客製化模型路徑
CKPT_DIR="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/checkpoints"
LORA_DIR="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/lora"
VAE_DIR="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/vae"
EMBEDDINGS_DIR="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/embeddings"
CONTROLNET_DIR="/mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet"

# RTX 5080 最佳化參數
export COMMANDLINE_ARGS="--ckpt-dir $CKPT_DIR \
--lora-dir $LORA_DIR \
--vae-dir $VAE_DIR \
--embeddings-dir $EMBEDDINGS_DIR \
--controlnet-dir $CONTROLNET_DIR \
--xformers \
--no-half-vae \
--opt-sdp-attention \
--api \
--autolaunch"

# 使用現有的 PyTorch 2.7 環境
export TORCH_COMMAND="pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121"

echo "============================================================================"
echo "RTX 5080 Optimized Configuration"
echo "CUDA: 12.8 | PyTorch: 2.7"
echo "============================================================================"
echo "Checkpoint Dir:  $CKPT_DIR"
echo "LoRA Dir:        $LORA_DIR"
echo "VAE Dir:         $VAE_DIR"
echo "ControlNet Dir:  $CONTROLNET_DIR"
echo "============================================================================"

bash webui.sh
```

**webui-user.bat** (Windows):

```batch
@echo off

REM ============================================================================
REM RTX 5080 優化配置
REM CUDA 12.8 + PyTorch 2.7
REM ============================================================================

set CKPT_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\checkpoints
set LORA_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\lora
set VAE_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\vae
set EMBEDDINGS_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\embeddings
set CONTROLNET_DIR=C:\AI_LLM_projects\ai_warehouse\models\controlnet

set COMMANDLINE_ARGS=^
--ckpt-dir "%CKPT_DIR%" ^
--lora-dir "%LORA_DIR%" ^
--vae-dir "%VAE_DIR%" ^
--embeddings-dir "%EMBEDDINGS_DIR%" ^
--controlnet-dir "%CONTROLNET_DIR%" ^
--xformers ^
--no-half-vae ^
--opt-sdp-attention ^
--api ^
--autolaunch

echo ============================================================================
echo RTX 5080 Optimized Configuration
echo CUDA: 12.8 ^| PyTorch: 2.7
echo ============================================================================

call webui.bat
```

### 參數說明

| 參數 | 用途 | RTX 5080 推薦 |
|------|------|---------------|
| --xformers | 記憶體優化 | ✅ 必須 |
| --no-half-vae | VAE 全精度 | ✅ 推薦 (避免黑圖) |
| --opt-sdp-attention | 最佳注意力機制 | ✅ 推薦 |
| --api | 啟用 API | ✅ 必須 (腳本需要) |
| --medvram | 中等 VRAM 優化 | ❌ 不需要 (16GB 夠) |
| --lowvram | 低 VRAM 優化 | ❌ 不需要 |

---

## 🎯 ControlNet 完整設定

### 安裝 ControlNet 擴充套件

**方法 1: WebUI 內建 (推薦)**

1. 啟動 WebUI
2. 前往 **Extensions** 標籤
3. 點選 **Available**
4. 點選 **Load from**
5. 搜尋 `controlnet`
6. 安裝 `sd-webui-controlnet`
7. **Installed** → **Apply and restart UI**

**方法 2: Git 安裝**

```bash
cd stable-diffusion-webui/extensions
git clone https://github.com/Mikubill/sd-webui-controlnet.git
# 重啟 WebUI
```

### 下載 ControlNet 模型 (SDXL 版本)

```bash
cd /mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet

# 1. OpenPose (人物姿勢控制) - 必備
wget https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors

# 2. Canny (邊緣檢測) - 必備
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_canny_256lora.safetensors

# 3. Depth (深度圖) - 建議
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_depth_256lora.safetensors

# 4. Lineart (線稿) - 建議
wget https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_sketch_256lora.safetensors
```

**或使用瀏覽器下載**:
直接前往連結，點選 Download，移動到 `C:\AI_LLM_projects\ai_warehouse\models\controlnet\`

### 驗證 ControlNet 安裝

重啟 WebUI 後：

1. 在 **txt2img** 標籤下方應看到 **ControlNet** 區塊
2. 點選 **Enable**
3. **Model** 下拉選單應該有:
   - ✅ OpenPoseXL2
   - ✅ sai_xl_canny_256lora
   - ✅ sai_xl_depth_256lora
   - ✅ sai_xl_sketch_256lora

---

## 🎨 VAE 與 LoRA 安裝

### VAE 下載 (視覺品質增強)

```bash
cd /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/vae

# SDXL VAE (必備)
wget https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors
```

**在 WebUI 中啟用 VAE**:
1. Settings → Stable Diffusion
2. **SD VAE** → 選擇 `sdxl_vae.safetensors`
3. Apply settings

### 遊戲素材 LoRA 推薦

```bash
cd /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/lora
```

從 Civitai 下載以下 LoRA:

| LoRA 名稱 | 用途 | 下載連結 | 權重 |
|-----------|------|----------|------|
| Game Icon Institute | 物品圖標 | https://civitai.com/models/108092 | 0.7-0.9 |
| Flat Color Anime | 扁平風格角色 | https://civitai.com/models/23521 | 0.5-0.7 |
| Character Sheet Helper | 多角度視圖 | https://civitai.com/models/82218 | 0.8-1.0 |

**使用方法**:
在提示詞中加入: `<lora:檔名:0.8>`

---

## ✅ 路徑驗證腳本

我已創建驗證腳本，確保所有路徑正確讀取。

### 使用方法

```bash
cd /mnt/c/web-projects/javascript-platformer-concepts/scripts

# 執行驗證
python verify_sd_paths.py
```

**預期輸出**:
```
✅ Checkpoints: 5 models found
   - AnythingXL_v50.safetensors
   - anything-v5-PrtRE.safetensors
   ...
✅ ControlNet: 4 models found
✅ VAE: 1 model found
✅ WebUI API: Connected
✅ All paths verified successfully!
```

---

## 🎮 快速開始生成

### 步驟 1: 啟動 WebUI

```bash
cd /mnt/c/stable-diffusion-webui
bash webui-user.sh
```

等待啟動完成，打開 http://127.0.0.1:7860

### 步驟 2: 選擇模型和設定

1. **Model**: AnythingXL_v50
2. **VAE**: sdxl_vae
3. **Sampling method**: DPM++ 2M Karras
4. **Steps**: 28
5. **CFG Scale**: 7
6. **Resolution**: 768x768 (角色) 或 1024x1024 (SDXL 原生)

### 步驟 3: 測試生成史萊姆角色

**Positive Prompt**:
```
masterpiece, best quality, game character sprite, cute blue slime character,
jelly body, simple rounded shape, idle pose, full body view,
cartoon style, thick black outline, bright vibrant colors,
transparent background, clean design, kawaii style, soft cel shading
```

**Negative Prompt**:
```
pixel art, pixelated, 8-bit, retro, realistic, photograph,
3d render, complex background, signature, watermark, worst quality
```

點選 **Generate** → 約 5-10 秒完成 (RTX 5080)

### 步驟 4: 記錄 Seed

生成後記下 **Seed** 數字，後續動畫幀使用相同 Seed 保持一致性。

### 步驟 5: 批次生成 (使用 Python 腳本)

```bash
cd /mnt/c/web-projects/javascript-platformer-concepts/scripts

# 檢查連線
python sd_batch_generator.py --check

# 生成 10 幀 idle 動畫
python sd_batch_generator.py --type character --name slime --action idle --frames 10

# 移除背景
python batch_remove_bg.py --input ../assets/sprites/enemies/slime/idle
```

---

## 🔍 問題排除

### ❌ "No module named 'xformers'"

**原因**: xformers 未安裝或版本不符

**解決**:
```bash
cd stable-diffusion-webui
pip install xformers --extra-index-url https://download.pytorch.org/whl/cu121
```

### ❌ 看不到自定義路徑的模型

**原因**: 路徑配置錯誤或未重啟

**解決**:
```bash
# 1. 檢查路徑是否存在
ls -la /mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/checkpoints/

# 2. 確認 webui-user.sh 中路徑正確
cat ~/stable-diffusion-webui/webui-user.sh | grep CKPT_DIR

# 3. 完全重啟 WebUI (Ctrl+C 停止，重新執行)

# 4. 檢查終端輸出是否有錯誤
```

### ❌ "CUDA out of memory" (不太可能發生在 RTX 5080)

如果真的發生:
```bash
# 降低解析度
# 1024x1024 → 768x768

# 或減少批次數量
Batch count: 1
```

### ❌ ControlNet 模型不顯示

**原因**: 路徑配置錯誤

**解決**:
```bash
# 1. 確認模型存在
ls -la /mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet/

# 2. 確認 webui-user.sh 中有 --controlnet-dir
cat ~/stable-diffusion-webui/webui-user.sh | grep controlnet-dir

# 3. 重啟 WebUI

# 4. 在 Settings → ControlNet 檢查 Model Path
```

### ❌ 生成圖片全黑

**原因**: VAE 精度問題

**解決**: 已在配置中加入 `--no-half-vae`，應該不會發生

### ❌ API 連線失敗

**檢查**:
```bash
# 1. 確認 --api 參數存在
# 2. 測試 API
curl http://127.0.0.1:7860/sdapi/v1/options

# 3. 如果使用防火牆，確認 7860 端口開放
```

---

## 📊 RTX 5080 性能預期

### 生成速度參考

| 任務 | 解析度 | 步數 | 預期時間 |
|------|--------|------|----------|
| SDXL 單圖 | 1024x1024 | 28 | 5-8 秒 |
| SDXL 單圖 | 768x768 | 28 | 3-5 秒 |
| SD 1.5 單圖 | 512x512 | 28 | 1-2 秒 |
| SDXL + ControlNet | 1024x1024 | 28 | 8-12 秒 |
| 批次 10 張 | 768x768 | 28 | 30-50 秒 |

### 建議配置

**最佳品質** (不趕時間):
- Resolution: 1024x1024
- Steps: 35-40
- Sampler: DPM++ 2M Karras
- CFG: 7-8

**快速生成** (大量素材):
- Resolution: 768x768
- Steps: 25
- Sampler: DPM++ 2M Karras
- CFG: 7

**超快速** (測試用):
- Resolution: 512x512
- Steps: 20
- Sampler: Euler a
- CFG: 6

---

## 📚 相關文檔

- **詳細提示詞庫**: `docs/sd-guide/PROMPT_LIBRARY.md`
- **素材整合指南**: `docs/asset-guide/ASSET_INTEGRATION_GUIDE.md`
- **配置範例**: `docs/config-examples/`

---

## ✅ 完成檢查清單

設定完成後，你應該能夠：

- [ ] WebUI 成功啟動在 http://127.0.0.1:7860
- [ ] 看到 5 個自定義模型在下拉選單中
- [ ] ControlNet 選單顯示且有 4 個模型
- [ ] VAE 設定為 sdxl_vae
- [ ] Python 腳本連線成功 (`--check` 通過)
- [ ] 成功生成測試圖片 (5-10 秒內完成)
- [ ] 路徑驗證腳本全部通過
- [ ] 無 CUDA 或記憶體錯誤

---

**Last Updated**: 2025-11-13
**硬體配置**: RTX 5080 | CUDA 12.8 | PyTorch 2.7
**維護者 Maintainer**: Claude Code AI
