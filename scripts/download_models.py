#!/usr/bin/env python3
"""
自動下載 SD 模型
Automatic Model Downloader for SD WebUI

下載 ControlNet、VAE 等必備模型到客製化路徑

Usage:
    python download_models.py --all
    python download_models.py --controlnet
    python download_models.py --vae
"""

import argparse
import sys
import urllib.request
import os
from pathlib import Path

class ModelDownloader:
    def __init__(self):
        self.base_path = Path("/mnt/c/AI_LLM_projects/ai_warehouse/models")
        self.controlnet_path = self.base_path / "controlnet"
        self.vae_path = self.base_path / "stable-diffusion" / "vae"

        # 模型定義
        self.models = {
            "controlnet": [
                {
                    "name": "OpenPoseXL2 (必備)",
                    "filename": "OpenPoseXL2.safetensors",
                    "url": "https://huggingface.co/thibaud/controlnet-openpose-sdxl-1.0/resolve/main/OpenPoseXL2.safetensors",
                    "size": "5GB",
                    "priority": 1,
                },
                {
                    "name": "Canny (強烈建議)",
                    "filename": "sai_xl_canny_256lora.safetensors",
                    "url": "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_canny_256lora.safetensors",
                    "size": "774MB",
                    "priority": 2,
                },
                {
                    "name": "Depth (建議)",
                    "filename": "sai_xl_depth_256lora.safetensors",
                    "url": "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_depth_256lora.safetensors",
                    "size": "774MB",
                    "priority": 3,
                },
                {
                    "name": "Lineart (建議)",
                    "filename": "sai_xl_sketch_256lora.safetensors",
                    "url": "https://huggingface.co/lllyasviel/sd_control_collection/resolve/main/sai_xl_sketch_256lora.safetensors",
                    "size": "774MB",
                    "priority": 3,
                },
            ],
            "vae": [
                {
                    "name": "SDXL VAE (必備)",
                    "filename": "sdxl_vae.safetensors",
                    "url": "https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors",
                    "size": "335MB",
                    "priority": 1,
                },
            ],
        }

    def ensure_directories(self):
        """確保目錄存在"""
        self.controlnet_path.mkdir(parents=True, exist_ok=True)
        self.vae_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Directories ready")
        print(f"   ControlNet: {self.controlnet_path}")
        print(f"   VAE:        {self.vae_path}")
        print()

    def download_file(self, url, filepath, model_name, size):
        """下載單一檔案"""

        # 檢查檔案是否已存在
        if filepath.exists():
            file_size_mb = filepath.stat().st_size / (1024 * 1024)
            print(f"⏭️  Skipping {model_name} (already exists, {file_size_mb:.1f} MB)")
            return True

        print(f"📥 Downloading {model_name} ({size})...")
        print(f"   URL: {url}")
        print(f"   Destination: {filepath}")
        print(f"   This may take a while...")
        print()

        try:
            def progress_hook(block_num, block_size, total_size):
                """顯示下載進度"""
                if total_size > 0:
                    downloaded = block_num * block_size
                    percent = min(downloaded * 100 / total_size, 100)
                    downloaded_mb = downloaded / (1024 * 1024)
                    total_mb = total_size / (1024 * 1024)

                    # 每 5% 輸出一次
                    if block_num % 100 == 0:
                        print(f"   Progress: {percent:.1f}% ({downloaded_mb:.1f}/{total_mb:.1f} MB)", end='\r')

            urllib.request.urlretrieve(url, filepath, reporthook=progress_hook)
            print()  # 換行

            # 驗證檔案大小
            file_size_mb = filepath.stat().st_size / (1024 * 1024)
            print(f"✅ Downloaded successfully: {filepath.name} ({file_size_mb:.1f} MB)")
            print()
            return True

        except Exception as e:
            print(f"❌ Failed to download {model_name}")
            print(f"   Error: {e}")
            print()
            return False

    def download_controlnet(self, priority_only=False):
        """下載 ControlNet 模型"""
        print("="*70)
        print("📦 Downloading ControlNet Models")
        print("="*70)
        print()

        success_count = 0
        fail_count = 0

        models = self.models["controlnet"]
        if priority_only:
            models = [m for m in models if m["priority"] == 1]

        for model in models:
            filepath = self.controlnet_path / model["filename"]

            if self.download_file(
                url=model["url"],
                filepath=filepath,
                model_name=model["name"],
                size=model["size"]
            ):
                success_count += 1
            else:
                fail_count += 1

        print("="*70)
        print(f"ControlNet Download Summary: {success_count} success, {fail_count} failed")
        print("="*70)
        print()

        return fail_count == 0

    def download_vae(self):
        """下載 VAE 模型"""
        print("="*70)
        print("🖼️  Downloading VAE Model")
        print("="*70)
        print()

        model = self.models["vae"][0]
        filepath = self.vae_path / model["filename"]

        success = self.download_file(
            url=model["url"],
            filepath=filepath,
            model_name=model["name"],
            size=model["size"]
        )

        print("="*70)
        print(f"VAE Download: {'✅ Success' if success else '❌ Failed'}")
        print("="*70)
        print()

        return success

    def download_all(self, priority_only=False):
        """下載所有模型"""
        print()
        print("="*70)
        print("🚀 Starting Model Download")
        print("="*70)
        print()

        if priority_only:
            print("ℹ️  Priority mode: Only downloading essential models")
            print()

        self.ensure_directories()

        # 下載順序：先 VAE (小)，再 ControlNet
        vae_success = self.download_vae()
        controlnet_success = self.download_controlnet(priority_only=priority_only)

        # 總結
        print()
        print("="*70)
        print("📊 Download Complete")
        print("="*70)
        print()

        if vae_success and controlnet_success:
            print("✅ All downloads completed successfully!")
            print()
            print("Next steps:")
            print("1. Verify downloads: python verify_sd_paths.py")
            print("2. Start WebUI and check models appear in dropdown")
            print("3. Start generating assets!")
        else:
            print("⚠️  Some downloads failed")
            print()
            print("Troubleshooting:")
            print("1. Check internet connection")
            print("2. Try again - script will skip existing files")
            print("3. Download manually from:")
            print("   https://huggingface.co/")

        print()
        print("="*70)

        return vae_success and controlnet_success

    def list_models(self):
        """列出所有可下載的模型"""
        print("="*70)
        print("📋 Available Models")
        print("="*70)
        print()

        print("ControlNet Models:")
        for i, model in enumerate(self.models["controlnet"], 1):
            priority = "⭐" * model["priority"]
            exists = "✅" if (self.controlnet_path / model["filename"]).exists() else "❌"
            print(f"  {i}. {exists} {model['name']:<30} {model['size']:<8} {priority}")

        print()
        print("VAE Models:")
        for i, model in enumerate(self.models["vae"], 1):
            priority = "⭐" * model["priority"]
            exists = "✅" if (self.vae_path / model["filename"]).exists() else "❌"
            print(f"  {i}. {exists} {model['name']:<30} {model['size']:<8} {priority}")

        print()
        print("Legend:")
        print("  ✅ = Already downloaded")
        print("  ❌ = Not downloaded")
        print("  ⭐ = Priority (more stars = higher priority)")
        print()

def main():
    parser = argparse.ArgumentParser(
        description="Download SD models for game asset generation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Download all models
  python download_models.py --all

  # Download only essential models (OpenPose + VAE)
  python download_models.py --priority

  # Download only ControlNet models
  python download_models.py --controlnet

  # Download only VAE model
  python download_models.py --vae

  # List available models
  python download_models.py --list
        """
    )

    parser.add_argument("--all", action="store_true",
                       help="Download all models (ControlNet + VAE)")
    parser.add_argument("--priority", action="store_true",
                       help="Download only essential models (OpenPose + VAE)")
    parser.add_argument("--controlnet", action="store_true",
                       help="Download only ControlNet models")
    parser.add_argument("--vae", action="store_true",
                       help="Download only VAE model")
    parser.add_argument("--list", action="store_true",
                       help="List all available models")

    args = parser.parse_args()

    downloader = ModelDownloader()

    # 如果沒有參數，顯示幫助
    if not any([args.all, args.priority, args.controlnet, args.vae, args.list]):
        parser.print_help()
        print()
        print("💡 Recommended for first time:")
        print("   python download_models.py --priority")
        print()
        return

    # 執行對應操作
    if args.list:
        downloader.list_models()
    elif args.all:
        downloader.download_all(priority_only=False)
    elif args.priority:
        downloader.download_all(priority_only=True)
    elif args.controlnet:
        downloader.ensure_directories()
        downloader.download_controlnet(priority_only=False)
    elif args.vae:
        downloader.ensure_directories()
        downloader.download_vae()

if __name__ == "__main__":
    main()
