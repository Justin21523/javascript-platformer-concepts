#!/bin/bash
# ============================================================================
# SD WebUI 啟動腳本 - 使用 conda ai_env 環境
# Python 3.10 + PyTorch 2.7 from conda ai_env
# ============================================================================

echo "============================================================================"
echo "  Activating conda ai_env environment"
echo "============================================================================"
echo ""

# 初始化 conda (WSL/Linux 需要)
# 嘗試多個常見的 conda 安裝路徑
CONDA_PATHS=(
    "$HOME/anaconda3"
    "$HOME/miniconda3"
    "/opt/anaconda3"
    "/opt/miniconda3"
    "$CONDA_PREFIX/../../.."  # 如果已在 conda 環境中
)

CONDA_INITIALIZED=false

for CONDA_PATH in "${CONDA_PATHS[@]}"; do
    if [ -f "$CONDA_PATH/etc/profile.d/conda.sh" ]; then
        echo "[INFO] Found conda at: $CONDA_PATH"
        source "$CONDA_PATH/etc/profile.d/conda.sh"
        CONDA_INITIALIZED=true
        break
    fi
done

# 如果找不到，嘗試使用 conda init 的輸出
if [ "$CONDA_INITIALIZED" = false ]; then
    if command -v conda &> /dev/null; then
        echo "[INFO] Initializing conda using conda hook"
        eval "$(conda shell.bash hook)"
        CONDA_INITIALIZED=true
    fi
fi

if [ "$CONDA_INITIALIZED" = false ]; then
    echo "[ERROR] Could not initialize conda"
    echo ""
    echo "Please run one of the following:"
    echo "1. conda init bash"
    echo "2. source ~/anaconda3/etc/profile.d/conda.sh"
    echo ""
    echo "Then restart your terminal and try again"
    exit 1
fi

# 激活環境
conda activate ai_env

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to activate ai_env"
    echo ""
    echo "Please check:"
    echo "1. Does ai_env exist? (conda env list)"
    echo "2. Run: conda env list"
    exit 1
fi

echo "[OK] Environment activated"
echo ""

# 驗證環境
echo "Verifying environment..."
python --version
python -c "import torch; print(f'PyTorch: {torch.__version__}');" 2>/dev/null || echo "[WARNING] PyTorch not found"
echo ""

echo "============================================================================"
echo "  SD WebUI Configuration (conda ai_env)"
echo "============================================================================"
echo ""
echo "Environment:"
python --version
python -c "import torch; print(f'  PyTorch:  {torch.__version__}');" 2>/dev/null
python -c "import torch; print(f'  CUDA:     {torch.version.cuda if torch.cuda.is_available() else \"N/A\"}');" 2>/dev/null
echo ""

CKPT_DIR="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/checkpoints"
LORA_DIR="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/lora"
VAE_DIR="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/vae"

echo "Model Paths:"
echo "  Checkpoints:  $CKPT_DIR"
echo "  LoRA:         $LORA_DIR"
echo "  VAE:          $VAE_DIR"
echo "  ControlNet:   models/ControlNet/ (symlink to ai_warehouse)"
echo ""
echo "Settings:"
echo "  [x] Using conda ai_env Python"
echo "  [x] Skip torch installation (use PyTorch 2.7 from conda)"
echo "  [x] Skip venv creation"
echo "  [x] RTX 5080 optimizations (no xformers, sub-quad-attention)"
echo ""
echo "============================================================================"
echo "  Starting WebUI..."
echo "============================================================================"
echo ""

# 切換到 WebUI 目錄並啟動
cd /mnt/c/AI_LLM_projects/stable-diffusion-webui
bash webui.sh
