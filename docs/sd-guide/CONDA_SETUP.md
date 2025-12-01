# Conda ai_env 環境設定指南
# Conda ai_env Environment Setup Guide

**環境 Environment**: conda ai_env
**Python**: 3.10.x
**PyTorch**: 2.7
**CUDA**: 12.8
**專案 Project**: JavaScript Platformer Game + Stable Diffusion

---

## 📋 環境概述

你的系統使用 **conda ai_env** 環境來管理所有 Python 依賴，包括：
- PyTorch 2.7 + CUDA 12.8
- SD WebUI 相關套件
- 遊戲素材生成腳本

---

## 🔧 環境基本操作

### 激活環境

**每次使用前必須執行**:
```bash
conda activate ai_env
```

驗證環境已激活：
```bash
# 查看當前環境
conda info --envs
# 應該看到 * ai_env

# 或檢查環境變數
echo $CONDA_DEFAULT_ENV
# 應該輸出: ai_env
```

### 停用環境

```bash
conda deactivate
```

### 查看已安裝套件

```bash
conda activate ai_env
conda list
# 或使用 pip
pip list
```

---

## 🚀 WebUI 使用 conda ai_env

### 方法 1: 使用提供的配置檔 (推薦)

配置檔 `webui-user-rtx5080.sh` 已自動配置好使用 conda ai_env：

```bash
# 1. 激活環境
conda activate ai_env

# 2. 複製配置檔
cp /mnt/c/web-projects/javascript-platformer-concepts/scripts/webui-user-rtx5080.sh ~/stable-diffusion-webui/webui-user.sh

# 3. 啟動 WebUI
cd ~/stable-diffusion-webui
bash webui-user.sh
```

配置檔會自動：
- ✅ 檢查是否在 ai_env 環境中
- ✅ 跳過 PyTorch 重新安裝
- ✅ 使用現有的 PyTorch 2.7
- ✅ 配置客製化模型路徑

### 方法 2: 手動設定

編輯 `~/stable-diffusion-webui/webui-user.sh`:

```bash
#!/bin/bash

# 跳過 PyTorch 自動安裝
export TORCH_COMMAND="skip"

# 其他配置...
export COMMANDLINE_ARGS="--skip-torch-cuda-test --xformers --api ..."

bash webui.sh
```

然後啟動：
```bash
conda activate ai_env
cd ~/stable-diffusion-webui
bash webui-user.sh
```

---

## 📦 安裝專案依賴

### SD 生成腳本依賴

```bash
# 激活環境
conda activate ai_env

# 前往 scripts 資料夾
cd /mnt/c/web-projects/javascript-platformer-concepts/scripts

# 安裝依賴
pip install -r requirements.txt
```

這會安裝：
- `requests` (WebUI API 呼叫)
- `Pillow` (圖片處理)
- `rembg` (背景移除)

### 驗證安裝

```bash
conda activate ai_env

# 測試匯入
python -c "import requests, PIL, rembg; print('✅ All dependencies installed')"
```

---

## 🎯 常用工作流程

### 工作流程 1: 啟動 WebUI

```bash
# 終端 1: 啟動 WebUI
conda activate ai_env
cd ~/stable-diffusion-webui
bash webui-user.sh

# WebUI 會在 http://127.0.0.1:7860 啟動
# 保持此終端開啟
```

### 工作流程 2: 執行生成腳本

```bash
# 終端 2: 執行腳本 (新開終端)
conda activate ai_env
cd /mnt/c/web-projects/javascript-platformer-concepts/scripts

# 驗證路徑
python verify_sd_paths.py --check-webui

# 生成素材
python sd_batch_generator.py --type character --name slime --action idle --frames 10

# 移除背景
python batch_remove_bg.py --input ../assets/sprites/enemies/slime/idle
```

---

## 🔍 環境驗證

### 完整環境檢查腳本

創建 `check_env.sh`:
```bash
#!/bin/bash

echo "================================"
echo "Conda ai_env Environment Check"
echo "================================"
echo ""

# 檢查 conda 環境
echo "1. Conda Environment:"
if [ "$CONDA_DEFAULT_ENV" = "ai_env" ]; then
    echo "   ✅ ai_env activated"
else
    echo "   ❌ ai_env NOT activated"
    echo "   Current: ${CONDA_DEFAULT_ENV:-none}"
    echo "   Run: conda activate ai_env"
fi
echo ""

# 檢查 Python
echo "2. Python Version:"
python --version
echo ""

# 檢查 PyTorch
echo "3. PyTorch + CUDA:"
python -c "import torch; print(f'   PyTorch: {torch.__version__}'); print(f'   CUDA: {torch.version.cuda}'); print(f'   GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"N/A\"}')"
echo ""

# 檢查依賴
echo "4. Project Dependencies:"
python -c "
try:
    import requests
    print('   ✅ requests')
except: print('   ❌ requests')
try:
    import PIL
    print('   ✅ Pillow')
except: print('   ❌ Pillow')
try:
    import rembg
    print('   ✅ rembg')
except: print('   ❌ rembg')
"
echo ""

echo "================================"
```

使用：
```bash
conda activate ai_env
bash check_env.sh
```

---

## ⚠️ 常見問題

### Q1: 忘記激活環境就執行腳本

**症狀**:
```
ModuleNotFoundError: No module named 'torch'
```

**解決**:
```bash
conda activate ai_env
# 然後重新執行命令
```

### Q2: WebUI 找不到 GPU

**症狀**:
```
CUDA is not available
```

**解決**:
```bash
# 確認在 ai_env 環境中
conda activate ai_env

# 驗證 CUDA
python -c "import torch; print(torch.cuda.is_available())"
# 應該輸出: True

# 如果是 False，檢查 CUDA 驅動
nvidia-smi
```

### Q3: pip install 失敗

**症狀**:
```
ERROR: Could not install packages
```

**解決**:
```bash
# 確認在正確環境
conda activate ai_env
conda info --envs

# 更新 pip
pip install --upgrade pip

# 重新安裝
pip install -r requirements.txt
```

### Q4: WebUI 重新安裝 PyTorch

**症狀**:
WebUI 啟動時嘗試下載 PyTorch

**解決**:
確認 `webui-user.sh` 中有：
```bash
export TORCH_COMMAND="skip"
```

---

## 📝 每日工作檢查清單

開始工作前確認：

```bash
# ✅ 激活環境
conda activate ai_env

# ✅ 驗證環境
echo $CONDA_DEFAULT_ENV
# 輸出: ai_env

# ✅ 檢查 GPU
nvidia-smi

# ✅ 前往專案資料夾
cd /mnt/c/web-projects/javascript-platformer-concepts/scripts

# ✅ 開始工作
```

---

## 🔄 環境更新

### 更新套件

```bash
conda activate ai_env

# 更新特定套件
pip install --upgrade requests

# 更新所有依賴
pip install --upgrade -r requirements.txt

# 更新 conda 套件
conda update --all
```

### 重建環境 (如果出問題)

```bash
# 匯出當前環境
conda activate ai_env
conda env export > ai_env_backup.yml

# 停用並刪除環境
conda deactivate
conda env remove -n ai_env

# 重新創建 (從備份)
conda env create -f ai_env_backup.yml

# 或手動重建
conda create -n ai_env python=3.10
conda activate ai_env
# 安裝 PyTorch 2.7 + CUDA 12.8
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

---

## 🎓 Conda 快速參考

### 常用命令

```bash
# 列出所有環境
conda env list

# 激活環境
conda activate ai_env

# 停用環境
conda deactivate

# 安裝套件 (使用 conda)
conda install package_name

# 安裝套件 (使用 pip)
pip install package_name

# 更新套件
conda update package_name
pip install --upgrade package_name

# 移除套件
conda remove package_name
pip uninstall package_name

# 列出已安裝套件
conda list
pip list

# 查看環境資訊
conda info

# 匯出環境
conda env export > environment.yml

# 從檔案創建環境
conda env create -f environment.yml
```

---

## ✅ 快速驗證腳本

```bash
#!/bin/bash
# quick_check.sh - 快速檢查 ai_env 環境

conda activate ai_env && \
python -c "
import sys
import torch

print('✅ Environment Check')
print(f'Python: {sys.version.split()[0]}')
print(f'PyTorch: {torch.__version__}')
print(f'CUDA: {torch.version.cuda}')
print(f'GPU Available: {torch.cuda.is_available()}')

if torch.cuda.is_available():
    print(f'GPU Name: {torch.cuda.get_device_name(0)}')
    print('✅ All systems ready!')
else:
    print('⚠️  GPU not detected')
"
```

使用：
```bash
bash quick_check.sh
```

---

## 🔗 相關文檔

- **SD_COMPLETE_GUIDE.md**: WebUI 完整設定
- **PROMPT_LIBRARY.md**: 提示詞庫
- **README.md**: 文檔導航

---

## 📊 環境摘要

```
環境名稱:    ai_env
Python:      3.10.x
PyTorch:     2.7
CUDA:        12.8
GPU:         RTX 5080
用途:        SD WebUI + 遊戲素材生成
激活命令:    conda activate ai_env
```

---

**Last Updated**: 2025-11-13
**維護者 Maintainer**: Claude Code AI
