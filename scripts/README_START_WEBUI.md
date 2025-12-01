# START_WEBUI_RTX5080.bat 使用說明

## 🚀 一鍵啟動 WebUI

`START_WEBUI_RTX5080.bat` 是專為你的配置設計的一鍵啟動腳本。

### ✨ 特色

- ✅ 自動激活 conda ai_env 環境
- ✅ 自動配置客製化模型路徑
- ✅ RTX 5080 優化參數
- ✅ 檢查路徑是否正確
- ✅ 顯示配置摘要
- ✅ 自動開啟瀏覽器

### 📦 使用方法

#### 方法 1: 直接雙擊執行 (最簡單)

1. **複製 .bat 檔案到 WebUI 資料夾**:
   ```
   複製此檔案：
   C:\web-projects\javascript-platformer-concepts\scripts\START_WEBUI_RTX5080.bat

   到：
   C:\stable-diffusion-webui\START_WEBUI_RTX5080.bat
   ```

2. **雙擊執行**:
   - 找到 `START_WEBUI_RTX5080.bat`
   - 雙擊執行
   - 等待瀏覽器自動開啟

3. **完成**！
   - WebUI 會在 http://127.0.0.1:7860 啟動
   - 保持終端視窗開啟

#### 方法 2: 創建桌面捷徑

1. 右鍵點選 `START_WEBUI_RTX5080.bat`
2. 選擇「建立捷徑」
3. 將捷徑移動到桌面
4. 重新命名為「SD WebUI (RTX 5080)」
5. 以後直接點桌面圖示啟動！

#### 方法 3: 命令行執行

```cmd
cd C:\stable-diffusion-webui
START_WEBUI_RTX5080.bat
```

### 🎯 首次使用步驟

#### 步驟 1: 安裝 WebUI (如果還沒安裝)

```bash
cd C:\
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
```

#### 步驟 2: 下載必備模型

```bash
# 激活環境
conda activate ai_env

# 下載 ControlNet + VAE
cd C:\web-projects\javascript-platformer-concepts\scripts
python download_models.py --priority
```

#### 步驟 3: 複製啟動腳本

```cmd
copy C:\web-projects\javascript-platformer-concepts\scripts\START_WEBUI_RTX5080.bat C:\stable-diffusion-webui\
```

#### 步驟 4: 執行啟動腳本

雙擊 `START_WEBUI_RTX5080.bat`

### 📊 啟動畫面說明

執行後你會看到：

```
============================================================================
  Stable Diffusion WebUI - RTX 5080 Launcher
============================================================================

Initializing...

[OK] Found conda at: C:\Users\YourName\anaconda3

Activating conda ai_env environment...
[OK] Environment activated

Verifying model paths...

============================================================================
  Configuration Summary
============================================================================

Environment:
  Conda:      ai_env
  Python:     3.10.x

Hardware:
  GPU:        NVIDIA RTX 5080
  CUDA:       12.8
  PyTorch:    2.7

Model Paths:
  Checkpoints:  C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\checkpoints
  LoRA:         C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\lora
  VAE:          C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\vae
  ControlNet:   C:\AI_LLM_projects\ai_warehouse\models\controlnet

Optimizations:
  [x] xformers
  [x] No half VAE
  [x] Optimized attention
  [x] API enabled

============================================================================

Starting Stable Diffusion WebUI...

The browser will open automatically at: http://127.0.0.1:7860
```

### ✅ 驗證成功

WebUI 啟動後：

1. **檢查模型**: 左上角下拉選單應該看到你的 5 個模型
   - AnythingXL_v50 ⭐ 推薦
   - anything-v5-PrtRE
   - disneyPixarCartoon_v10
   - pixarStyleModel_v10
   - v1-5-pruned-emaonly

2. **檢查 ControlNet**:
   - 在 txt2img 標籤下方應該有 ControlNet 區塊
   - 點選 Enable
   - Model 下拉選單應該有 4 個 ControlNet 模型

3. **測試生成**:
   - 選擇 AnythingXL_v50
   - 輸入提示詞測試
   - 點選 Generate

### ⚠️ 問題排除

#### ❌ "Conda not found"

**原因**: 腳本找不到 conda 安裝位置

**解決**:
1. 檢查 conda 是否已安裝: `conda --version`
2. 如果使用非標準路徑，編輯 .bat 檔案加入你的 conda 路徑

#### ❌ "Failed to activate ai_env"

**原因**: ai_env 環境不存在

**解決**:
```bash
# 查看現有環境
conda env list

# 確認 ai_env 存在
# 如果不存在，請先創建環境
```

#### ❌ "Checkpoint directory not found"

**原因**: 模型路徑不正確

**解決**:
1. 檢查路徑是否正確:
   ```
   C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\checkpoints
   ```
2. 驗證路徑:
   ```bash
   conda activate ai_env
   cd scripts
   python verify_sd_paths.py
   ```

#### ❌ WebUI 重新安裝 PyTorch

**原因**: `TORCH_COMMAND=skip` 沒有生效

**解決**:
腳本已經設定好，如果還是重新安裝：
1. 檢查是否在 ai_env 環境中
2. 等待安裝完成（第一次會需要）

### 🔧 自訂配置

如果需要修改配置，編輯 `START_WEBUI_RTX5080.bat`:

```batch
REM 修改模型路徑
set CKPT_DIR=你的路徑\checkpoints

REM 修改參數
set COMMANDLINE_ARGS=^
--ckpt-dir "%CKPT_DIR%" ^
--xformers ^
--api ^
你的額外參數
```

### 📝 命令行參數說明

腳本自動設定的參數：

| 參數 | 說明 | 用途 |
|------|------|------|
| `--ckpt-dir` | Checkpoint 路徑 | 客製化模型位置 |
| `--lora-dir` | LoRA 路徑 | 客製化 LoRA 位置 |
| `--vae-dir` | VAE 路徑 | 客製化 VAE 位置 |
| `--controlnet-dir` | ControlNet 路徑 | 客製化 ControlNet 位置 |
| `--xformers` | 記憶體優化 | 減少 VRAM 使用 |
| `--no-half-vae` | VAE 全精度 | 避免黑圖 (RTX 5080 推薦) |
| `--opt-sdp-attention` | 優化注意力 | 提升性能 (PyTorch 2.0+) |
| `--api` | 啟用 API | 批次生成腳本需要 |
| `--autolaunch` | 自動開啟瀏覽器 | 方便使用 |

### 🎮 使用後續步驟

WebUI 啟動後：

1. **在新終端執行生成腳本**:
   ```bash
   conda activate ai_env
   cd C:\web-projects\javascript-platformer-concepts\scripts
   python sd_batch_generator.py --check
   ```

2. **開始生成素材**:
   ```bash
   python sd_batch_generator.py --type character --name slime --action idle --frames 10
   ```

3. **移除背景**:
   ```bash
   python batch_remove_bg.py --input ..\assets\sprites\enemies\slime\idle
   ```

### 💡 提示

- ✅ **保持 WebUI 終端開啟**: 關閉終端會停止 WebUI
- ✅ **使用新終端執行腳本**: 生成腳本在另一個終端執行
- ✅ **記得激活環境**: 每個新終端都要 `conda activate ai_env`
- ✅ **停止 WebUI**: 在終端按 Ctrl+C

### 🔗 相關文檔

- **完整設定指南**: `docs/sd-guide/SD_COMPLETE_GUIDE.md`
- **模型下載**: `docs/sd-guide/DOWNLOAD_MODELS.md`
- **提示詞庫**: `docs/sd-guide/PROMPT_LIBRARY.md`
- **Conda 環境**: `docs/sd-guide/CONDA_SETUP.md`

---

**Last Updated**: 2025-11-13
**作者**: Claude Code AI
