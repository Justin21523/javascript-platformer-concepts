#!/bin/bash
# ============================================================================
# SD WebUI - webui-user.sh 配置文件
# 使用 conda ai_env 環境 (Python 3.10 + PyTorch 2.7)
#
# 注意：此文件會被 webui.sh 自動 source
# 不要在此文件中執行 conda activate 或其他命令，只設置環境變數
# ============================================================================

# ============================================================================
# 客製化模型路徑
# ============================================================================

export ckpt_dir="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/checkpoints"
export lora_dir="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/lora"
export vae_dir="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/vae"
export embeddings_dir="/mnt/c/AI_LLM_projects/ai_warehouse/models/stable-diffusion/embeddings"
export controlnet_dir="/mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet"

# ============================================================================
# WebUI 參數配置
# ============================================================================

export COMMANDLINE_ARGS="--ckpt-dir $ckpt_dir \
--lora-dir $lora_dir \
--vae-dir $vae_dir \
--embeddings-dir $embeddings_dir \
--no-half-vae \
--opt-sdp-attention \
--opt-sub-quad-attention \
--api \
--autolaunch \
--skip-python-version-check \
--skip-torch-cuda-test \
--skip-install"

# ============================================================================
# 環境變數設定
# ============================================================================

# 使用 conda 環境的 Python (假設 conda ai_env 已經在啟動腳本中激活)
export python_cmd="python"
export GIT="git"

# 跳過 torch 安裝（使用 conda ai_env 的 PyTorch 2.7）
export TORCH_COMMAND=""
export SKIP_INSTALL=1

# 跳過 venv 創建（直接使用 conda 環境）
# 設置為 "-" 來明確禁用 venv（webui.sh 會檢查這個值）
export venv_dir="-"
