# ⚡ 最終解決方案：分離環境

## 問題

WebUI 需要 Python 3.10 + torch 2.1.2，但 conda ai_env 是 Python 3.13 + PyTorch 2.7，無法兼容。

## ✅ 解決方案

**讓 WebUI 和 Python 腳本使用不同環境**：
- WebUI: 使用自己的 Python 3.10 環境（WebUI 自動管理）
- Python 腳本: 使用 conda ai_env

## 🚀 立即執行

### 步驟 1: 清理舊環境

```cmd
cd C:\AI_LLM_projects\stable-diffusion-webui
rmdir /s /q venv
```

### 步驟 2: 使用獨立配置

```cmd
copy C:\web-projects\javascript-platformer-concepts\scripts\webui-user-rtx5080-standalone.bat C:\AI_LLM_projects\stable-diffusion-webui\webui-user.bat
```

### 步驟 3: 啟動 WebUI（不需要 conda）

```cmd
cd C:\AI_LLM_projects\stable-diffusion-webui
webui-user.bat
```

**首次啟動會自動**：
- 下載 Python 3.10.6 便攜版
- 安裝 torch 2.1.2
- 設定好所有依賴

**預計 5-10 分鐘**

### 步驟 4: Python 腳本使用 conda ai_env

```cmd
REM 新開終端
conda activate ai_env
cd C:\web-projects\javascript-platformer-concepts\scripts
python sd_batch_generator.py --check
```

## ✅ 優點

- ✅ 避免版本衝突
- ✅ WebUI 使用穩定配置
- ✅ Python 腳本使用最新 PyTorch
- ✅ 共享客製化模型路徑

## 📚 詳細文檔

查看 `docs/sd-guide/SEPARATE_ENVIRONMENTS.md`
