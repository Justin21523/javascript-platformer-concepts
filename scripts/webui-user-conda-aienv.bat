@echo off
REM ============================================================================
REM SD WebUI - 使用 conda ai_env 環境
REM Python 3.10 + PyTorch 2.7 from conda ai_env
REM ============================================================================

REM ============================================================================
REM 激活 conda ai_env 環境
REM ============================================================================

echo ============================================================================
echo   Activating conda ai_env environment
echo ============================================================================
echo.

REM 自動激活 conda ai_env
call conda activate ai_env

if errorlevel 1 (
    echo [ERROR] Failed to activate ai_env environment
    echo.
    echo Please check:
    echo 1. Is conda installed?
    echo 2. Does ai_env exist? (conda env list)
    echo 3. Is conda in PATH?
    echo.
    pause
    exit /b 1
)

echo [OK] Environment activated
echo.

REM 驗證環境
echo Verifying environment...
python --version
python -c "import torch; print(f'PyTorch: {torch.__version__}')" 2>nul
if errorlevel 1 (
    echo [WARNING] PyTorch not found in ai_env
    echo WebUI will try to install it
)
echo.

REM ============================================================================
REM 客製化模型路徑
REM ============================================================================

set CKPT_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\checkpoints
set LORA_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\lora
set VAE_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\vae
set EMBEDDINGS_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\embeddings
set CONTROLNET_DIR=C:\AI_LLM_projects\ai_warehouse\models\controlnet

REM ============================================================================
REM WebUI 參數配置
REM ============================================================================

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
--autolaunch ^
--skip-python-version-check ^
--skip-torch-cuda-test ^
--skip-install

REM ============================================================================
REM 環境變數設定
REM ============================================================================

REM 設置 Python 路徑（使用 conda 環境的 Python）
set PYTHON=python
set GIT=git

REM 跳過 torch 安裝（使用 conda ai_env 的 PyTorch 2.7）
set TORCH_COMMAND=
set SKIP_INSTALL=1

REM 跳過 venv 創建（直接使用 conda 環境）
set VENV_DIR=
set SKIP_VENV=1

REM ============================================================================
REM 顯示配置資訊
REM ============================================================================

echo ============================================================================
echo   SD WebUI Configuration (conda ai_env)
echo ============================================================================
echo.
echo Environment:
call python --version
call python -c "import torch; print(f'  PyTorch:  {torch.__version__}')" 2>nul
call python -c "import torch; print(f'  CUDA:     {torch.version.cuda if torch.cuda.is_available() else \"N/A\"}')" 2>nul
echo.
echo Model Paths:
echo   Checkpoints:  %CKPT_DIR%
echo   LoRA:         %LORA_DIR%
echo   VAE:          %VAE_DIR%
echo   ControlNet:   %CONTROLNET_DIR%
echo.
echo Settings:
echo   [x] Using conda ai_env Python
echo   [x] Skip torch installation (use PyTorch 2.7 from conda)
echo   [x] Skip venv creation
echo   [x] RTX 5080 optimizations enabled
echo.
echo ============================================================================
echo   Starting WebUI...
echo ============================================================================
echo.

REM 啟動 WebUI
call webui.bat
