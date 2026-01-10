# 分離環境策略
# Separate Environments Strategy

## 問題分析

WebUI 需要 **Python 3.10.x + torch 2.1.2**，但你的 conda ai_env 是 **Python 3.13.9 + PyTorch 2.7**，兩者不兼容。

### 為什麼會衝突？

1. **torch 2.1.2 不支援 Python 3.13**
   - torch 2.1.2 只支援 Python 3.8-3.11
   - Python 3.13 最低需要 torch 2.6+

2. **WebUI 硬編碼版本**
   - WebUI 的 `launch_utils.py` 要求 `torch==2.1.2`
   - 使用 Python 3.13 時無法安裝這個版本

## ✅ 最佳解決方案：分離環境

讓 WebUI 和 Python 腳本使用不同環境：

```
┌─────────────────────────────────────────────────────────┐
│                     你的系統                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  WebUI 環境                  Python 腳本環境            │
│  ├─ Python 3.10.6            ├─ conda ai_env            │
│  ├─ torch 2.1.2              ├─ Python 3.13.9           │
│  ├─ CUDA 12.1                ├─ PyTorch 2.7             │
│  └─ WebUI 自動管理           ├─ CUDA 12.8               │
│                               └─ 手動管理                │
│                                                          │
│  用途：                      用途：                      │
│  - 啟動 WebUI 伺服器         - 批次生成腳本              │
│  - 瀏覽器操作                - 背景移除                  │
│                               - 路徑驗證                 │
│                                                          │
│  共享：客製化模型路徑 (ai_warehouse)                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 優點

1. ✅ **避免版本衝突** - 各自使用相容版本
2. ✅ **穩定性高** - WebUI 使用它測試過的環境
3. ✅ **保留先進功能** - Python 腳本仍用 PyTorch 2.7
4. ✅ **共享模型** - 兩個環境讀取相同的模型路徑

---

## 🚀 實施步驟

### 步驟 1: 清理舊環境

```cmd
REM 刪除之前失敗的 venv
cd C:\AI_LLM_projects\stable-diffusion-webui
rmdir /s /q venv
```

### 步驟 2: 使用新的獨立配置

```cmd
REM 複製獨立配置檔
copy C:\web-projects\javascript-platformer-concepts\scripts\webui-user-rtx5080-standalone.bat C:\AI_LLM_projects\stable-diffusion-webui\webui-user.bat
```

### 步驟 3: 啟動 WebUI（不需要激活 conda）

```cmd
REM 直接啟動，不需要 conda activate
cd C:\AI_LLM_projects\stable-diffusion-webui
webui-user.bat
```

**首次啟動會**：
1. 自動下載 Python 3.10.6 便攜版
2. 創建 venv 虛擬環境
3. 安裝 torch 2.1.2 + torchvision 0.16.2
4. 安裝所有依賴
5. 啟動 WebUI

**預計時間**: 5-10 分鐘

### 步驟 4: 驗證 WebUI 成功

瀏覽器開啟 http://127.0.0.1:7860，確認：
- ✅ 左上角看到你的 5 個模型
- ✅ ControlNet 可用（如果已下載）

### 步驟 5: Python 腳本仍使用 conda ai_env

```cmd
REM 開新終端
conda activate ai_env
cd C:\web-projects\javascript-platformer-concepts\scripts

REM 驗證 WebUI 連線
python verify_sd_paths.py --check-webui

REM 生成素材
python sd_batch_generator.py --type character --name slime --action idle --frames 10
```

---

## 📋 環境對照表

| 項目 | WebUI 環境 | conda ai_env |
|------|-----------|--------------|
| Python | 3.10.6 | 3.13.9 |
| PyTorch | 2.1.2 | 2.7 |
| CUDA | 12.1 | 12.8 |
| 管理方式 | WebUI 自動 | 手動 conda |
| 用途 | 運行 WebUI | 執行 Python 腳本 |
| 啟動方式 | 直接執行 webui-user.bat | `conda activate ai_env` |

---

## 🔍 預期輸出

### WebUI 首次啟動

```
Installing python...
Downloading: https://www.python.org/ftp/python/3.10.6/python-3.10.6-embed-amd64.zip
Extracting...

Creating venv...
Installing torch and torchvision...
Successfully installed torch-2.1.2 torchvision-0.16.2

Installing requirements...
Successfully installed gradio clip omegaconf...

Loading models from: C:\AI_LLM_projects\ai_warehouse\models\...
✓ Found 5 checkpoints

Running on local URL:  http://127.0.0.1:7860
Startup time: 45.2s
```

### Python 腳本使用 conda ai_env

```
(ai_env) C:\> python sd_batch_generator.py --check

✅ Connected to SD WebUI
📦 Available models: 5
   - AnythingXL_v50
   ...
```

---

## 💡 工作流程

### 日常使用流程

1. **啟動 WebUI** (終端 1):
   ```cmd
   cd C:\AI_LLM_projects\stable-diffusion-webui
   webui-user.bat
   ```
   保持此終端開啟

2. **執行生成腳本** (終端 2):
   ```cmd
   conda activate ai_env
   cd C:\web-projects\javascript-platformer-concepts\scripts
   python sd_batch_generator.py --type character --name slime --action idle --frames 10
   ```

3. **後處理**:
   ```cmd
   python batch_remove_bg.py --input ..\assets\sprites\enemies\slime\idle
   ```

---

## ⚙️ 配置檔案說明

### webui-user-rtx5080-standalone.bat

**關鍵特性**:
```batch
REM 不設定 TORCH_COMMAND - 讓 WebUI 自己安裝
REM 不設定 SKIP_INSTALL - 讓 WebUI 管理依賴
REM 不需要激活 conda - 使用系統 Python

REM 只設定客製化模型路徑
set CKPT_DIR=C:\AI_LLM_projects\ai_warehouse\models\...
```

**與之前的差異**:
- ❌ 移除 `--skip-python-version-check`
- ❌ 移除 `--skip-torch-cuda-test`
- ❌ 移除 `--skip-install`
- ❌ 移除 `TORCH_COMMAND=`
- ❌ 移除 `SKIP_INSTALL=1`
- ✅ 保留客製化模型路徑
- ✅ 保留 RTX 5080 優化參數

---

## 🎯 為什麼這樣更好？

### 1. 穩定性

**之前**:
```
conda ai_env (Python 3.13.9) + 強制跳過 WebUI 安裝
→ 依賴版本不匹配
→ 可能有隱藏問題
```

**現在**:
```
WebUI 環境 (Python 3.10.6 + torch 2.1.2)
→ WebUI 測試過的配置
→ 完全兼容
```

### 2. 靈活性

- WebUI 更新時自動處理依賴
- Python 腳本可以使用最新 PyTorch 功能
- 兩個環境互不干擾

### 3. 維護性

- WebUI 環境由 WebUI 管理，不需手動維護
- conda ai_env 環境專注於開發工具
- 問題排查更容易

---

## 📊 磁碟空間需求

### WebUI 環境

```
C:\AI_LLM_projects\stable-diffusion-webui\
├── python\              ~500MB (Python 3.10 便攜版)
├── venv\                ~3GB (依賴套件)
└── repositories\        ~2GB (相關 repo)
總計: ~5.5GB
```

### conda ai_env 環境

```
已存在，不需額外空間
```

### 模型（共享）

```
C:\AI_LLM_projects\ai_warehouse\models\
├── checkpoints\         14GB (已有)
├── controlnet\          ~8GB (如果下載)
└── vae\                 ~335MB
總計: ~22GB (共享，不重複)
```

---

## ✅ 檢查清單

完成後確認：

```cmd
REM 1. WebUI 環境存在
dir C:\AI_LLM_projects\stable-diffusion-webui\venv
dir C:\AI_LLM_projects\stable-diffusion-webui\python

REM 2. WebUI 可以啟動
cd C:\AI_LLM_projects\stable-diffusion-webui
webui-user.bat
REM 應該成功啟動在 http://127.0.0.1:7860

REM 3. Python 腳本可以連線
conda activate ai_env
python scripts\verify_sd_paths.py --check-webui
REM 應該顯示 ✅ WebUI API: Connected
```

---

## 🔄 舊配置 vs 新配置

### 舊配置（有問題）

```batch
REM 嘗試使用 conda ai_env (Python 3.13.9)
REM 強制跳過 WebUI 的安裝
--skip-python-version-check
--skip-torch-cuda-test
--skip-install

結果: torch 2.1.2 無法安裝在 Python 3.13.9
```

### 新配置（推薦）

```batch
REM 讓 WebUI 使用自己的環境
REM 不跳過任何安裝步驟
REM 自動下載 Python 3.10.6
REM 自動安裝 torch 2.1.2

結果: 完全兼容，穩定運行
```

---

## 📞 如果還是失敗

### 檢查 1: 確認沒有激活 conda

```cmd
REM 不應該看到 (ai_env) 或其他環境名稱
echo %CONDA_DEFAULT_ENV%
REM 應該輸出: %CONDA_DEFAULT_ENV%（未定義）
```

### 檢查 2: 網路連線

WebUI 需要下載 Python 和套件，確保網路暢通

### 檢查 3: 防毒軟體

某些防毒軟體會阻擋 Python 下載，暫時關閉

### 檢查 4: 磁碟空間

確保 C:\ 有至少 10GB 可用空間

---

## 💾 備份舊配置

如果想保留舊配置：

```cmd
REM 備份
ren webui-user.bat webui-user.bat.backup

REM 使用新配置
copy webui-user-rtx5080-standalone.bat webui-user.bat
```

---

**Last Updated**: 2025-11-13
**策略**: 分離環境 - WebUI 獨立 + Python 腳本使用 conda ai_env
**建議**: 強烈推薦此方案，避免版本衝突
