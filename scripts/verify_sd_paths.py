#!/usr/bin/env python3
"""
SD WebUI 路徑驗證腳本
Verify that all custom model paths are correctly configured

Usage:
    python verify_sd_paths.py
    python verify_sd_paths.py --check-webui
"""

import argparse
import sys
from pathlib import Path
import requests
from typing import Dict, List

class SDPathVerifier:
    def __init__(self):
        self.base_path = Path("/mnt/c/AI_LLM_projects/ai_warehouse/models")
        self.errors = []
        self.warnings = []
        self.successes = []

    def verify_directory(self, path: Path, name: str, required: bool = True) -> bool:
        """Verify a directory exists"""
        if not path.exists():
            if required:
                self.errors.append(f"❌ {name}: Directory not found at {path}")
                return False
            else:
                self.warnings.append(f"⚠️  {name}: Directory not found (optional)")
                return False

        if not path.is_dir():
            self.errors.append(f"❌ {name}: Path exists but is not a directory: {path}")
            return False

        return True

    def count_files(self, path: Path, extensions: List[str]) -> int:
        """Count files with specific extensions"""
        count = 0
        for ext in extensions:
            count += len(list(path.glob(f"*{ext}")))
        return count

    def verify_checkpoints(self) -> bool:
        """Verify checkpoint models"""
        print("\n" + "="*70)
        print("📦 Checking Checkpoint Models")
        print("="*70)

        ckpt_path = self.base_path / "stable-diffusion" / "checkpoints"

        if not self.verify_directory(ckpt_path, "Checkpoints", required=True):
            return False

        # Count models
        count = self.count_files(ckpt_path, [".safetensors", ".ckpt"])

        if count == 0:
            self.errors.append("❌ No checkpoint models found")
            return False

        # List models
        print(f"\n✅ Found {count} checkpoint model(s):\n")

        for model_file in sorted(ckpt_path.glob("*.safetensors")):
            size_mb = model_file.stat().st_size / (1024 * 1024)
            print(f"   📄 {model_file.name:<40} ({size_mb:>7.1f} MB)")

            # Check recommended model
            if "AnythingXL" in model_file.name or "anything" in model_file.name.lower():
                print(f"      ⭐ Recommended for project")

        for model_file in sorted(ckpt_path.glob("*.ckpt")):
            size_mb = model_file.stat().st_size / (1024 * 1024)
            print(f"   📄 {model_file.name:<40} ({size_mb:>7.1f} MB)")

        self.successes.append(f"✅ Checkpoints: {count} models found")
        return True

    def verify_lora(self) -> bool:
        """Verify LoRA models"""
        print("\n" + "="*70)
        print("🎨 Checking LoRA Models")
        print("="*70)

        lora_path = self.base_path / "stable-diffusion" / "lora"

        if not self.verify_directory(lora_path, "LoRA", required=False):
            print("\n⚠️  No LoRA directory found (optional)")
            print("   You can create it later and download LoRAs from:")
            print("   - https://civitai.com/models (search 'game asset lora')")
            return True

        count = self.count_files(lora_path, [".safetensors", ".pt"])

        if count == 0:
            self.warnings.append("⚠️  No LoRA models found (optional)")
            print("\n⚠️  No LoRA models found")
            print("   Recommended LoRAs for game assets:")
            print("   - Game Icon Institute")
            print("   - Flat Color Anime")
            print("   - Character Sheet Helper")
        else:
            print(f"\n✅ Found {count} LoRA model(s):\n")
            for lora_file in sorted(lora_path.glob("*.safetensors")):
                size_mb = lora_file.stat().st_size / (1024 * 1024)
                print(f"   📄 {lora_file.name:<40} ({size_mb:>6.1f} MB)")

            self.successes.append(f"✅ LoRA: {count} models found")

        return True

    def verify_vae(self) -> bool:
        """Verify VAE models"""
        print("\n" + "="*70)
        print("🖼️  Checking VAE Models")
        print("="*70)

        vae_path = self.base_path / "stable-diffusion" / "vae"

        if not self.verify_directory(vae_path, "VAE", required=False):
            print("\n⚠️  No VAE directory found (optional)")
            print("   Download SDXL VAE from:")
            print("   https://huggingface.co/stabilityai/sdxl-vae/blob/main/sdxl_vae.safetensors")
            return True

        count = self.count_files(vae_path, [".safetensors", ".pt"])

        if count == 0:
            self.warnings.append("⚠️  No VAE models found (recommended)")
            print("\n⚠️  No VAE models found")
            print("   Recommended: sdxl_vae.safetensors")
        else:
            print(f"\n✅ Found {count} VAE model(s):\n")
            for vae_file in sorted(vae_path.glob("*.safetensors")):
                size_mb = vae_file.stat().st_size / (1024 * 1024)
                print(f"   📄 {vae_file.name:<40} ({size_mb:>6.1f} MB)")

                if "sdxl" in vae_file.name.lower():
                    print(f"      ⭐ Recommended for SDXL models")

            self.successes.append(f"✅ VAE: {count} models found")

        return True

    def verify_controlnet(self) -> bool:
        """Verify ControlNet models"""
        print("\n" + "="*70)
        print("🎯 Checking ControlNet Models")
        print("="*70)

        cn_path = self.base_path / "controlnet"

        if not self.verify_directory(cn_path, "ControlNet", required=False):
            print("\n⚠️  No ControlNet directory found")
            print("   Create with: mkdir -p /mnt/c/AI_LLM_projects/ai_warehouse/models/controlnet")
            print("\n   Recommended ControlNet models for SDXL:")
            print("   - OpenPoseXL2.safetensors (pose control)")
            print("   - sai_xl_canny_256lora.safetensors (edge detection)")
            print("   - sai_xl_depth_256lora.safetensors (depth map)")
            return True

        count = self.count_files(cn_path, [".safetensors", ".pth"])

        if count == 0:
            self.warnings.append("⚠️  No ControlNet models found (recommended)")
            print("\n⚠️  No ControlNet models found")
            print("   Download from:")
            print("   https://huggingface.co/lllyasviel/sd_control_collection")
        else:
            print(f"\n✅ Found {count} ControlNet model(s):\n")

            recommended = ["openpose", "canny", "depth", "sketch"]

            for cn_file in sorted(cn_path.glob("*.safetensors")):
                size_mb = cn_file.stat().st_size / (1024 * 1024)
                print(f"   📄 {cn_file.name:<40} ({size_mb:>6.1f} MB)")

                # Check if it's recommended
                for rec in recommended:
                    if rec in cn_file.name.lower():
                        print(f"      ⭐ Essential for character pose control")
                        break

            self.successes.append(f"✅ ControlNet: {count} models found")

        return True

    def verify_webui_connection(self, url: str = "http://127.0.0.1:7860") -> bool:
        """Verify WebUI is running and accessible"""
        print("\n" + "="*70)
        print("🌐 Checking WebUI Connection")
        print("="*70)

        try:
            # Test basic connection
            response = requests.get(f"{url}", timeout=5)
            if response.status_code == 200:
                print(f"\n✅ WebUI is accessible at {url}")
            else:
                self.warnings.append(f"⚠️  WebUI responded with status {response.status_code}")
                print(f"\n⚠️  WebUI responded with status {response.status_code}")
                return False

            # Test API endpoint
            api_url = f"{url}/sdapi/v1/sd-models"
            response = requests.get(api_url, timeout=5)

            if response.status_code == 200:
                models = response.json()
                print(f"✅ API is working")
                print(f"\n📦 Available models in WebUI ({len(models)}):\n")

                for model in models:
                    title = model.get('title', 'Unknown')
                    model_name = model.get('model_name', '')
                    print(f"   ✓ {title}")

                    # Check if custom models are loaded
                    if any(name in title.lower() for name in ['anything', 'disney', 'pixar']):
                        print(f"     🎉 Custom model detected!")

                self.successes.append("✅ WebUI API: Connected")
                return True
            else:
                self.errors.append(f"❌ API not accessible (status {response.status_code})")
                print(f"\n❌ API endpoint not accessible")
                print(f"   Make sure WebUI is started with --api flag")
                return False

        except requests.exceptions.ConnectionError:
            self.warnings.append("⚠️  WebUI not running")
            print(f"\n⚠️  Cannot connect to WebUI at {url}")
            print(f"   WebUI might not be running")
            print(f"\n   To start WebUI:")
            print(f"   cd stable-diffusion-webui && bash webui-user.sh")
            return False
        except Exception as e:
            self.errors.append(f"❌ Error checking WebUI: {e}")
            print(f"\n❌ Error: {e}")
            return False

    def print_summary(self):
        """Print verification summary"""
        print("\n" + "="*70)
        print("📊 Verification Summary")
        print("="*70)

        if self.successes:
            print("\n✅ Success:\n")
            for success in self.successes:
                print(f"   {success}")

        if self.warnings:
            print("\n⚠️  Warnings:\n")
            for warning in self.warnings:
                print(f"   {warning}")

        if self.errors:
            print("\n❌ Errors:\n")
            for error in self.errors:
                print(f"   {error}")
            print("\n❌ Verification failed. Please fix the errors above.")
            return False
        else:
            if self.warnings:
                print("\n✅ Verification completed with warnings (optional components)")
            else:
                print("\n✅ All verifications passed!")
            return True

    def run_full_verification(self, check_webui: bool = False):
        """Run all verifications"""
        print("="*70)
        print("🔍 SD WebUI Path Verification")
        print("="*70)
        print(f"\nBase path: {self.base_path}")

        # Verify base path exists
        if not self.base_path.exists():
            print(f"\n❌ Base path does not exist: {self.base_path}")
            print(f"   Please create the directory structure first")
            return False

        # Run verifications
        self.verify_checkpoints()
        self.verify_lora()
        self.verify_vae()
        self.verify_controlnet()

        if check_webui:
            self.verify_webui_connection()

        # Print summary
        return self.print_summary()

def main():
    parser = argparse.ArgumentParser(
        description="Verify SD WebUI custom model paths",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Verify all paths
  python verify_sd_paths.py

  # Verify paths and check WebUI connection
  python verify_sd_paths.py --check-webui

  # Verify with custom WebUI URL
  python verify_sd_paths.py --check-webui --url http://192.168.1.100:7860
        """
    )

    parser.add_argument("--check-webui", action="store_true",
                       help="Also check if WebUI is running and accessible")
    parser.add_argument("--url", type=str, default="http://127.0.0.1:7860",
                       help="WebUI URL (default: http://127.0.0.1:7860)")

    args = parser.parse_args()

    verifier = SDPathVerifier()
    success = verifier.run_full_verification(check_webui=args.check_webui)

    print("\n" + "="*70)

    if not success:
        print("❌ Verification failed")
        print("\nNext steps:")
        print("1. Fix any errors listed above")
        print("2. Ensure model directories exist")
        print("3. Download required models (see PROMPT_LIBRARY.md)")
        print("4. Re-run this script")
        print("="*70 + "\n")
        sys.exit(1)
    else:
        print("✅ Verification successful")
        print("\nNext steps:")
        print("1. Start WebUI: cd stable-diffusion-webui && bash webui-user.sh")
        print("2. Verify custom models appear in dropdown")
        print("3. Run: python verify_sd_paths.py --check-webui")
        print("4. Start generating assets!")
        print("="*70 + "\n")
        sys.exit(0)

if __name__ == "__main__":
    main()
