# Python 版本問題解決方案
# Fix Python Version Issues with WebUI

## 問題描述

使用 conda ai_env 環境（Python 3.13.9）啟動 WebUI 時遇到錯誤：

```
INCOMPATIBLE PYTHON VERSION
This program is tested with 3.10.6 Python, but you have 3.13.9.
ERROR: Could not find a version that satisfies the requirement torch==2.1.2
```

## 原因分析

1. **Python 版本不符**: WebUI 預設要求 Python 3.10.6，但 conda ai_env 使用 3.13.9
2. **Torch 版本衝突**: WebUI 嘗試安裝 torch 2.1.2，但你已有 PyTorch 2.7
3. **安裝邏輯**: WebUI 會自動檢測並嘗試安裝依賴，與 conda 環境衝突

## ✅ 解決方案

已在配置腳本中加入以下修正：

### 新增參數

```bash
--skip-python-version-check   # 跳過 Python 版本檢查
--skip-torch-cuda-test        # 跳過 Torch CUDA 測試
--skip-install                # 跳過自動安裝依賴
```

### 環境變數

```bash
export TORCH_COMMAND=""       # 空字串，完全跳過 torch 安裝
export SKIP_INSTALL=1         # 跳過所有依賴安裝
```

## 📝 已修正的腳本

以下腳本已自動修正：

1. ✅ `webui-user-rtx5080.sh` (Linux/WSL)
2. ✅ `webui-user-rtx5080.bat` (Windows)
3. ✅ `START_WEBUI_RTX5080.bat` (一鍵啟動)

## 🚀 使用修正後的腳本

### 方法 1: 直接使用 START_WEBUI_RTX5080.bat

```cmd
REM 1. 複製到 WebUI 資料夾
copy C:\web-projects\javascript-platformer-concepts\scripts\START_WEBUI_RTX5080.bat C:\AI_LLM_projects\stable-diffusion-webui\

REM 2. 雙擊執行
C:\AI_LLM_projects\stable-diffusion-webui\START_WEBUI_RTX5080.bat
```

### 方法 2: 使用 webui-user-rtx5080.bat

```cmd
REM 1. 複製到 WebUI 資料夾並重命名
copy C:\web-projects\javascript-platformer-concepts\scripts\webui-user-rtx5080.bat C:\AI_LLM_projects\stable-diffusion-webui\webui-user.bat

REM 2. 激活環境
conda activate ai_env

REM 3. 啟動 WebUI
cd C:\AI_LLM_projects\stable-diffusion-webui
webui-user.bat
```

### 方法 3: Linux/WSL

```bash
# 1. 複製配置檔
cp /mnt/c/web-projects/javascript-platformer-concepts/scripts/webui-user-rtx5080.sh ~/stable-diffusion-webui/webui-user.sh

# 2. 激活環境
conda activate ai_env

# 3. 啟動 WebUI
cd ~/stable-diffusion-webui
bash webui-user.sh
```

## ⚠️ 首次啟動注意事項

### 清理舊的 venv (如果存在)

如果之前啟動失敗，可能已經創建了不兼容的 venv，需要刪除：

```cmd
REM Windows
cd C:\AI_LLM_projects\stable-diffusion-webui
rmdir /s /q venv

REM Linux/WSL
cd ~/stable-diffusion-webui
rm -rf venv
```

### 驗證 conda 環境

```bash
# 激活環境
conda activate ai_env

# 檢查 Python 版本（可以是 3.13.9 或任何版本）
python --version

# 檢查 PyTorch（應該是 2.7+）
python -c "import torch; print(torch.__version__)"
```

## 🔍 參數說明

### --skip-python-version-check

**作用**: 跳過 Python 版本檢查

**原因**: WebUI 要求 Python 3.10.6，但使用 conda 環境時版本可能不同

**結果**: WebUI 將接受任何 Python 版本

### --skip-torch-cuda-test

**作用**: 跳過 Torch 和 CUDA 測試

**原因**: 避免 WebUI 檢測到版本不符並嘗試重新安裝

**結果**: 直接使用 conda 環境中的 PyTorch

### --skip-install

**作用**: 跳過所有依賴自動安裝

**原因**: conda ai_env 已包含所有必要套件

**結果**: WebUI 不會嘗試安裝任何套件

### TORCH_COMMAND=""

**作用**: 設為空字串，完全跳過 torch 安裝命令

**原因**: 防止 WebUI 執行 `pip install torch==2.1.2`

**結果**: 使用 conda 環境中的 PyTorch 2.7

### SKIP_INSTALL=1

**作用**: 環境變數標記，告訴 WebUI 跳過安裝

**原因**: 確保 launch.py 不執行任何安裝邏輯

**結果**: 直接使用現有環境

## ✅ 預期成功輸出

正確配置後，啟動時應該看到：

```
Python 3.13.9 | packaged by Anaconda, Inc. | (main, Oct 21 2025, ...)
Version: v1.10.1
Commit hash: 82a973c04367123ae98bd9abdf80d9eda9b910e2

Skipping Python version check (--skip-python-version-check)
Skipping torch installation (TORCH_COMMAND is empty)
Skipping dependency installation (--skip-install)

Loading checkpoints...
✓ Found 5 models in C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\checkpoints

Loading ControlNet models...
✓ Found 4 ControlNet models

Running on local URL:  http://127.0.0.1:7860
```

## 🐛 如果還是失敗

### 檢查 1: 確認環境已激活

```bash
echo $CONDA_DEFAULT_ENV  # 應該輸出 ai_env
```

### 檢查 2: 確認 PyTorch 可用

```python
python -c "
import torch
print(f'PyTorch: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
print(f'CUDA version: {torch.version.cuda}')
"
```

預期輸出：
```
PyTorch: 2.7.x
CUDA available: True
CUDA version: 12.8
```

### 檢查 3: 確認配置檔正確

```bash
# Windows
type C:\AI_LLM_projects\stable-diffusion-webui\webui-user.bat | findstr SKIP

# Linux/WSL
cat ~/stable-diffusion-webui/webui-user.sh | grep SKIP
```

應該看到：
```
set SKIP_INSTALL=1
--skip-python-version-check
--skip-torch-cuda-test
--skip-install
```

### 檢查 4: 手動測試參數

```bash
conda activate ai_env
cd stable-diffusion-webui

# 手動執行，查看錯誤
python launch.py --skip-python-version-check --skip-torch-cuda-test --skip-install
```

## 💡 替代方案：降級 Python (不推薦)

如果以上都無效，可以創建 Python 3.10 環境（不推薦，因為會失去 PyTorch 2.7）：

```bash
# 創建新環境
conda create -n sd_webui python=3.10.6

# 激活
conda activate sd_webui

# 安裝 PyTorch
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# 啟動 WebUI
cd stable-diffusion-webui
bash webui.sh
```

**不推薦原因**:
- 需要重新配置環境
- 失去 PyTorch 2.7 的優勢
- 需要重新安裝所有套件

## 📊 版本對照表

| 組件 | WebUI 預設 | conda ai_env | 兼容性 |
|------|-----------|--------------|--------|
| Python | 3.10.6 | 3.13.9 | ⚠️ 需要跳過檢查 |
| PyTorch | 2.1.2 | 2.7.x | ✅ 更好 (需要跳過安裝) |
| CUDA | 11.8 / 12.1 | 12.8 | ✅ 兼容 |
| xformers | 自動安裝 | 需手動安裝 | ✅ 可用 pip 安裝 |

## 🎯 最終確認清單

啟動前確認：

```bash
# ✅ 1. 環境已激活
conda activate ai_env

# ✅ 2. PyTorch 可用
python -c "import torch; print(torch.__version__)"

# ✅ 3. 配置檔已複製
ls -la ~/stable-diffusion-webui/webui-user.sh

# ✅ 4. 舊 venv 已刪除 (如果存在)
rm -rf ~/stable-diffusion-webui/venv

# ✅ 5. 啟動 WebUI
cd ~/stable-diffusion-webui
bash webui-user.sh
```

## 📞 需要幫助？

如果仍然遇到問題：

1. 檢查終端完整錯誤訊息
2. 確認 conda ai_env 環境配置
3. 驗證模型路徑是否正確
4. 查看 WebUI GitHub Issues

---

**Last Updated**: 2025-11-13
**問題**: Python 3.13.9 與 WebUI 兼容性
**解決方案**: 跳過版本檢查，使用 conda 環境
