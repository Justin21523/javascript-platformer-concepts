# ✅ 使用 conda ai_env 啟動 WebUI
# Using conda ai_env with WebUI

## 前提條件

你的 conda ai_env 環境配置：
- ✅ Python 3.10.x
- ✅ PyTorch 2.7.x
- ✅ CUDA 12.8

這個配置**完全可以**與 WebUI 一起使用！

---

## 🔍 步驟 1: 驗證你的環境

```cmd
cd C:\web-projects\javascript-platformer-concepts\scripts
check_conda_env.bat
```

**預期輸出**:
```
Python 3.10.x
PyTorch: 2.7.x
CUDA available: True
CUDA version: 12.8
Python executable: C:\Users\...\anaconda3\envs\ai_env\python.exe
```

確認：
- ✅ Python 是 3.10.x（與 WebUI 兼容）
- ✅ PyTorch 是 2.7.x（比 WebUI 預設的 2.1.2 更新）
- ✅ Python 路徑在 conda/envs/ai_env/ 下

---

## 🚀 步驟 2: 清理並使用新配置

### 清理舊環境

```cmd
cd C:\AI_LLM_projects\stable-diffusion-webui

REM 刪除 WebUI 可能創建的 venv
rmdir /s /q venv

REM 刪除 Python 便攜版（如果有）
rmdir /s /q python
```

### 複製新配置

```cmd
copy C:\web-projects\javascript-platformer-concepts\scripts\webui-user-conda-aienv.bat C:\AI_LLM_projects\stable-diffusion-webui\webui-user.bat
```

---

## 🎯 步驟 3: 啟動 WebUI

```cmd
cd C:\AI_LLM_projects\stable-diffusion-webui
webui-user.bat
```

**腳本會自動**:
1. ✅ 激活 conda ai_env 環境
2. ✅ 驗證 Python 和 PyTorch 版本
3. ✅ 跳過 WebUI 的 torch 安裝（使用你的 PyTorch 2.7）
4. ✅ 跳過 venv 創建（直接使用 conda 環境）
5. ✅ 配置客製化模型路徑
6. ✅ 啟動 WebUI

---

## ✅ 預期成功輸出

```
============================================================================
  Activating conda ai_env environment
============================================================================

[OK] Environment activated

Verifying environment...
Python 3.10.13
PyTorch: 2.7.0

============================================================================
  SD WebUI Configuration (conda ai_env)
============================================================================

Environment:
  Python 3.10.13
  PyTorch:  2.7.0
  CUDA:     12.8

Model Paths:
  Checkpoints:  C:\AI_LLM_projects\ai_warehouse\models\...
  LoRA:         C:\AI_LLM_projects\ai_warehouse\models\...
  VAE:          C:\AI_LLM_projects\ai_warehouse\models\...
  ControlNet:   C:\AI_LLM_projects\ai_warehouse\models\...

Settings:
  [x] Using conda ai_env Python
  [x] Skip torch installation (use PyTorch 2.7 from conda)
  [x] Skip venv creation
  [x] RTX 5080 optimizations enabled

============================================================================
  Starting WebUI...
============================================================================

Python 3.10.13 (packaged by Anaconda)
Commit hash: 82a973c04367123ae98bd9abdf80d9eda9b910e2

Skipping Python version check
Skipping torch installation
Skipping venv creation (using conda environment)

Loading models from: C:\AI_LLM_projects\ai_warehouse\models\...
✓ Found 5 checkpoints

Running on local URL:  http://127.0.0.1:7860
Startup time: 12.3s
```

---

## 🔧 關鍵配置說明

### 為什麼可以用 PyTorch 2.7？

```
WebUI 預設: torch 2.1.2
你的環境:   torch 2.7.0

PyTorch 2.7 向下兼容 2.1.2 的 API
✅ 可以正常使用
✅ 性能可能更好
✅ 支援更多功能
```

### 腳本做了什麼？

```batch
1. conda activate ai_env               # 激活環境
2. set PYTHON=python                   # 使用 conda 的 Python
3. set TORCH_COMMAND=                  # 跳過 torch 安裝
4. set SKIP_INSTALL=1                  # 跳過依賴安裝
5. set VENV_DIR=                       # 不創建 venv
6. set SKIP_VENV=1                     # 跳過 venv
7. --skip-python-version-check         # 跳過版本檢查
8. --skip-torch-cuda-test              # 跳過 CUDA 測試
9. --skip-install                      # 跳過安裝步驟
```

---

## 💡 優點

### 統一環境
- ✅ WebUI 和 Python 腳本使用**相同環境**
- ✅ 不需要管理多個 Python 安裝
- ✅ 依賴套件一致

### 使用最新 PyTorch
- ✅ PyTorch 2.7（比 WebUI 預設的 2.1.2 新）
- ✅ 支援 CUDA 12.8（WebUI 預設 12.1）
- ✅ 更好的性能和功能

### 簡化管理
- ✅ 只需管理一個 conda 環境
- ✅ 套件更新統一處理
- ✅ 環境變數一致

---

## 📊 環境對比

### 方案 1: 分離環境（之前的方案）

```
WebUI:          Python 3.10 + torch 2.1.2 (WebUI 管理)
Python 腳本:    conda ai_env (Python 3.10 + torch 2.7)

優點: 穩定、WebUI 推薦配置
缺點: 需要管理兩個環境、PyTorch 版本不一致
```

### 方案 2: 統一使用 conda ai_env（現在的方案）✅

```
WebUI:          conda ai_env (Python 3.10 + torch 2.7)
Python 腳本:    conda ai_env (Python 3.10 + torch 2.7)

優點: 統一環境、使用最新 PyTorch、管理簡單
缺點: 需要跳過 WebUI 的預設安裝流程
```

---

## 🔍 驗證成功

### 檢查 1: WebUI 正常啟動

```
瀏覽器打開 http://127.0.0.1:7860
左上角看到你的 5 個模型
```

### 檢查 2: Python 腳本可以連線

```cmd
conda activate ai_env
cd C:\web-projects\javascript-platformer-concepts\scripts
python verify_sd_paths.py --check-webui
```

應該顯示：
```
✅ Checkpoints: 5 models found
✅ WebUI API: Connected
```

### 檢查 3: 生成測試

```cmd
python sd_batch_generator.py --check
```

應該顯示：
```
✅ Connected to SD WebUI
📦 Available models: 5
```

---

## ⚠️ 如果遇到問題

### 問題 1: conda activate 失敗

**症狀**: `conda: command not found`

**解決**:
```cmd
REM 初始化 conda
call C:\Users\YourName\anaconda3\Scripts\activate.bat
conda init
REM 重新開啟終端
```

### 問題 2: ai_env 不存在

**症狀**: `Could not find conda environment: ai_env`

**解決**:
```cmd
REM 列出所有環境
conda env list

REM 如果 ai_env 不存在，創建它
conda create -n ai_env python=3.10
conda activate ai_env
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

### 問題 3: PyTorch 找不到

**症狀**: `ModuleNotFoundError: No module named 'torch'`

**解決**:
```cmd
conda activate ai_env
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

### 問題 4: WebUI 還是嘗試安裝 torch

**症狀**: WebUI 啟動時還是顯示 `Installing torch...`

**解決**: 確認環境變數正確設定
```batch
REM 在 webui-user.bat 中確認:
set TORCH_COMMAND=
set SKIP_INSTALL=1
set VENV_DIR=
set SKIP_VENV=1
```

---

## 🎮 日常使用

### 啟動 WebUI

```cmd
cd C:\AI_LLM_projects\stable-diffusion-webui
webui-user.bat
```

腳本會自動激活 ai_env

### 執行 Python 腳本（相同環境）

```cmd
REM 在同一終端或新終端
conda activate ai_env
cd C:\web-projects\javascript-platformer-concepts\scripts
python sd_batch_generator.py --type character --name slime --action idle --frames 10
```

---

## 📚 相關腳本

1. **check_conda_env.bat** - 檢查 conda ai_env 配置
2. **webui-user-conda-aienv.bat** - WebUI 配置（使用 conda ai_env）
3. **webui-user-conda-aienv.sh** - Linux/WSL 版本

---

## ✅ 總結

如果你的 conda ai_env 確實是 **Python 3.10 + PyTorch 2.7**，那麼：

1. ✅ **完全可以**讓 WebUI 使用這個環境
2. ✅ PyTorch 2.7 向下兼容 WebUI 需要的 2.1.2 API
3. ✅ Python 3.10 完全符合 WebUI 要求
4. ✅ 統一環境，管理更簡單

**推薦使用此方案！**

---

**Last Updated**: 2025-11-13
**Strategy**: 統一使用 conda ai_env (Python 3.10 + PyTorch 2.7)
