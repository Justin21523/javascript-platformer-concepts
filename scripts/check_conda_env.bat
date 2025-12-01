@echo off
REM ============================================================================
REM 檢查 conda ai_env 環境配置
REM ============================================================================

echo ============================================================================
echo Checking conda ai_env environment
echo ============================================================================
echo.

REM 激活環境
call conda activate ai_env

if errorlevel 1 (
    echo [ERROR] Failed to activate ai_env
    echo Please check if the environment exists: conda env list
    pause
    exit /b 1
)

echo [OK] Environment activated: ai_env
echo.

REM 檢查 Python 版本
echo Checking Python version...
python --version
echo.

REM 檢查 PyTorch 版本
echo Checking PyTorch version...
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}'); print(f'CUDA version: {torch.version.cuda if torch.cuda.is_available() else \"N/A\"}')"
echo.

REM 檢查 Python 路徑
echo Checking Python path...
python -c "import sys; print(f'Python executable: {sys.executable}')"
echo.

echo ============================================================================
echo Summary:
echo - If Python is 3.10.x: Compatible with WebUI
echo - If PyTorch is 2.7.x: Can be used (need to skip WebUI's torch install)
echo - Python path should be in conda/envs/ai_env/
echo ============================================================================
echo.

pause
