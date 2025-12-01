@echo off
REM ============================================================================
REM SD WebUI 一鍵啟動腳本 - RTX 5080 + conda ai_env
REM Double-click this file to start WebUI with all custom configurations
REM
REM 使用方法:
REM 1. 將此檔案複製到 stable-diffusion-webui 資料夾
REM 2. 雙擊執行即可
REM ============================================================================

title SD WebUI - RTX 5080 (ai_env)

echo.
echo ============================================================================
echo   Stable Diffusion WebUI - RTX 5080 Launcher
echo ============================================================================
echo.
echo Initializing...
echo.

REM ============================================================================
REM 自動激活 conda ai_env 環境
REM ============================================================================

REM 尋找 conda 安裝位置（常見路徑）
set CONDA_PATH=
if exist "%USERPROFILE%\anaconda3\Scripts\activate.bat" (
    set CONDA_PATH=%USERPROFILE%\anaconda3
) else if exist "%USERPROFILE%\miniconda3\Scripts\activate.bat" (
    set CONDA_PATH=%USERPROFILE%\miniconda3
) else if exist "C:\ProgramData\anaconda3\Scripts\activate.bat" (
    set CONDA_PATH=C:\ProgramData\anaconda3
) else if exist "C:\ProgramData\miniconda3\Scripts\activate.bat" (
    set CONDA_PATH=C:\ProgramData\miniconda3
)

if "%CONDA_PATH%"=="" (
    echo [!] WARNING: Conda not found in common locations
    echo     Please make sure conda is installed and in PATH
    echo.
    echo Press any key to try continuing anyway...
    pause >nul
) else (
    echo [OK] Found conda at: %CONDA_PATH%
    echo.
    echo Activating conda ai_env environment...
    call "%CONDA_PATH%\Scripts\activate.bat" ai_env

    if errorlevel 1 (
        echo [!] Failed to activate ai_env environment
        echo     Make sure the environment exists: conda env list
        echo.
        pause
        exit /b 1
    )

    echo [OK] Environment activated
    echo.
)

REM ============================================================================
REM 客製化模型路徑配置
REM ============================================================================

set CKPT_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\checkpoints
set LORA_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\lora
set VAE_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\vae
set EMBEDDINGS_DIR=C:\AI_LLM_projects\ai_warehouse\models\stable-diffusion\embeddings
set CONTROLNET_DIR=C:\AI_LLM_projects\ai_warehouse\models\controlnet

REM ============================================================================
REM 驗證路徑
REM ============================================================================

echo Verifying model paths...
echo.

if not exist "%CKPT_DIR%" (
    echo [!] WARNING: Checkpoint directory not found
    echo     Path: %CKPT_DIR%
    echo.
)

if not exist "%CONTROLNET_DIR%" (
    echo [!] WARNING: ControlNet directory not found
    echo     Path: %CONTROLNET_DIR%
    echo     Creating directory...
    mkdir "%CONTROLNET_DIR%" 2>nul
)

if not exist "%LORA_DIR%" (
    echo [!] INFO: LoRA directory not found, creating...
    mkdir "%LORA_DIR%" 2>nul
)

if not exist "%VAE_DIR%" (
    echo [!] INFO: VAE directory not found, creating...
    mkdir "%VAE_DIR%" 2>nul
)

REM ============================================================================
REM RTX 5080 最佳化參數
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

REM 完全跳過 PyTorch 安裝（使用 conda ai_env 中的版本）
set TORCH_COMMAND=
set SKIP_INSTALL=1

REM ============================================================================
REM 顯示配置資訊
REM ============================================================================

echo ============================================================================
echo   Configuration Summary
echo ============================================================================
echo.
echo Environment:
echo   Conda:      ai_env
echo   Python:
python --version 2>nul
echo.
echo Hardware:
echo   GPU:        NVIDIA RTX 5080
echo   CUDA:       12.8
echo   PyTorch:    2.7
echo.
echo Model Paths:
echo   Checkpoints:  %CKPT_DIR%
echo   LoRA:         %LORA_DIR%
echo   VAE:          %VAE_DIR%
echo   ControlNet:   %CONTROLNET_DIR%
echo.
echo Optimizations:
echo   [x] xformers
echo   [x] No half VAE
echo   [x] Optimized attention
echo   [x] API enabled
echo.
echo ============================================================================
echo.

REM ============================================================================
REM 啟動 WebUI
REM ============================================================================

echo Starting Stable Diffusion WebUI...
echo.
echo The browser will open automatically at: http://127.0.0.1:7860
echo.
echo Keep this window open while using WebUI.
echo Press Ctrl+C to stop the server.
echo.
echo ============================================================================
echo.

REM 啟動 WebUI
call webui.bat

REM 如果 webui.bat 執行失敗
if errorlevel 1 (
    echo.
    echo ============================================================================
    echo [!] ERROR: Failed to start WebUI
    echo ============================================================================
    echo.
    echo Possible solutions:
    echo 1. Make sure you are in the stable-diffusion-webui directory
    echo 2. Check that webui.bat exists
    echo 3. Verify conda ai_env is properly configured
    echo.
    pause
    exit /b 1
)
