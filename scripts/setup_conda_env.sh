#!/bin/bash
# ============================================================================
# 一鍵設定 SD WebUI with conda ai_env
# Quick Setup Script for SD WebUI with conda ai_env
# ============================================================================

echo "============================================================================"
echo "  SD WebUI Setup with conda ai_env"
echo "============================================================================"
echo ""

# 檢查 conda
if ! command -v conda &> /dev/null; then
    echo "❌ conda not found. Please install Anaconda or Miniconda first."
    exit 1
fi

# 激活環境
echo "Step 1: Activating conda ai_env..."
if conda activate ai_env 2>/dev/null; then
    echo "✅ ai_env activated"
else
    echo "❌ Failed to activate ai_env"
    echo "   Make sure the environment exists: conda env list"
    exit 1
fi

# 驗證 Python
echo ""
echo "Step 2: Checking Python..."
python --version
if [ $? -ne 0 ]; then
    echo "❌ Python not found in ai_env"
    exit 1
fi

# 驗證 PyTorch
echo ""
echo "Step 3: Checking PyTorch + CUDA..."
python -c "import torch; print(f'PyTorch: {torch.__version__}'); print(f'CUDA: {torch.version.cuda}'); print(f'GPU: {torch.cuda.get_device_name(0)}')"
if [ $? -ne 0 ]; then
    echo "❌ PyTorch not found or not working"
    exit 1
fi

# 安裝依賴
echo ""
echo "Step 4: Installing project dependencies..."
pip install -q requests Pillow rembg
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Some dependencies failed to install"
fi

# 驗證模型路徑
echo ""
echo "Step 5: Verifying model paths..."
python verify_sd_paths.py

# 複製 WebUI 配置
echo ""
echo "Step 6: Copying WebUI config..."
if [ -d ~/stable-diffusion-webui ]; then
    cp webui-user-rtx5080.sh ~/stable-diffusion-webui/webui-user.sh
    chmod +x ~/stable-diffusion-webui/webui-user.sh
    echo "✅ WebUI config copied"
else
    echo "⚠️  stable-diffusion-webui not found at ~/stable-diffusion-webui"
    echo "   Please install WebUI first"
fi

echo ""
echo "============================================================================"
echo "✅ Setup Complete!"
echo "============================================================================"
echo ""
echo "Next steps:"
echo "1. Start WebUI:"
echo "   conda activate ai_env"
echo "   cd ~/stable-diffusion-webui"
echo "   bash webui-user.sh"
echo ""
echo "2. In a new terminal, generate assets:"
echo "   conda activate ai_env"
echo "   cd scripts"
echo "   python sd_batch_generator.py --type character --name slime --action idle --frames 10"
echo ""
echo "============================================================================"
