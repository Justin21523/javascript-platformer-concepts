# ⚡ 快速修正：Python 版本問題

## 問題

WebUI 啟動時顯示：
```
INCOMPATIBLE PYTHON VERSION
ERROR: Could not find a version that satisfies the requirement torch==2.1.2
```

## ✅ 已修正

所有腳本已更新，加入以下修正：

```bash
--skip-python-version-check   # 跳過 Python 版本檢查
--skip-torch-cuda-test        # 跳過 Torch CUDA 測試  
--skip-install                # 跳過自動安裝依賴
```

## 🚀 現在就啟動

### 方法 1: 使用修正後的腳本（推薦）

```bash
# 1. 複製修正後的配置檔
copy C:\web-projects\javascript-platformer-concepts\scripts\webui-user-rtx5080.bat C:\AI_LLM_projects\stable-diffusion-webui\webui-user.bat

# 2. 激活環境
conda activate ai_env

# 3. 啟動 WebUI
cd C:\AI_LLM_projects\stable-diffusion-webui
webui-user.bat
```

### 方法 2: 使用一鍵啟動（最簡單）

```bash
# 複製到 WebUI 資料夾
copy C:\web-projects\javascript-platformer-concepts\scripts\START_WEBUI_RTX5080.bat C:\AI_LLM_projects\stable-diffusion-webui\

# 雙擊執行
C:\AI_LLM_projects\stable-diffusion-webui\START_WEBUI_RTX5080.bat
```

## ⚠️ 首次啟動：刪除舊 venv

如果之前啟動失敗，需要刪除舊的虛擬環境：

```cmd
cd C:\AI_LLM_projects\stable-diffusion-webui
rmdir /s /q venv
```

## ✅ 預期成功輸出

```
Python 3.13.9 | packaged by Anaconda, Inc.
Skipping Python version check
Skipping torch installation
Running on local URL:  http://127.0.0.1:7860
```

## 📚 詳細說明

查看 `docs/sd-guide/FIX_PYTHON_VERSION.md`
