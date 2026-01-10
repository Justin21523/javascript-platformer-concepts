#!/usr/bin/env python3
"""
SD WebUI Batch Asset Generator for JavaScript Platformer Game
遊戲素材批次生成器

Usage:
    python sd_batch_generator.py --character slime --action idle --frames 10
    python sd_batch_generator.py --effect explosion --frames 12
    python sd_batch_generator.py --projectile fireball --frames 6

Requirements:
    pip install requests pillow
"""

import argparse
import requests
import json
import base64
from pathlib import Path
import time
from datetime import datetime

class GameAssetGenerator:
    def __init__(self, webui_url="http://127.0.0.1:7860", project_root="../assets"):
        self.api_url = f"{webui_url}/sdapi/v1"
        self.project_root = Path(project_root)
        self.temp_output = Path("temp_generated")
        self.temp_output.mkdir(exist_ok=True)

    def generate_character_animation(self, character_name, action, frame_count=10, seed=-1):
        """生成角色動畫序列"""

        output_dir = self.project_root / "sprites" / "enemies" / character_name / action
        output_dir.mkdir(parents=True, exist_ok=True)

        prompt = self._build_character_prompt(character_name, action)
        negative_prompt = self._build_negative_prompt()

        print(f"\n{'='*70}")
        print(f"🎮 Generating Character Animation")
        print(f"{'='*70}")
        print(f"Character: {character_name}")
        print(f"Action: {action}")
        print(f"Frames: {frame_count}")
        print(f"Output: {output_dir}")
        print(f"Seed: {seed if seed != -1 else 'Random (will be locked after first frame)'}")
        print(f"{'='*70}\n")

        generated_seed = seed
        success_count = 0

        for frame_num in range(1, frame_count + 1):
            print(f"[Frame {frame_num}/{frame_count}] Generating...")

            result = self._generate_image(
                prompt=prompt,
                negative_prompt=negative_prompt,
                seed=generated_seed,
                width=768,
                height=768,
                model="AnythingXL_v50"
            )

            if result:
                img_data, info = result

                # Lock seed after first frame
                if frame_num == 1 and seed == -1:
                    generated_seed = info["seed"]
                    print(f"  🔒 Seed locked: {generated_seed}")

                # Save image
                filename = f"{action}({frame_num}).png"
                filepath = output_dir / filename

                with open(filepath, "wb") as f:
                    f.write(img_data)

                success_count += 1
                print(f"  ✅ Saved: {filename}")
            else:
                print(f"  ❌ Failed to generate frame {frame_num}")

            time.sleep(0.5)

        print(f"\n{'='*70}")
        print(f"✅ Animation Complete: {success_count}/{frame_count} frames generated")
        print(f"📁 Output directory: {output_dir}")
        print(f"🔑 Seed used: {generated_seed}")
        print(f"{'='*70}\n")

        return generated_seed

    def generate_effect_animation(self, effect_type, effect_name, frame_count=8, seed=-1):
        """生成特效動畫序列"""

        output_dir = self.project_root / "effects" / effect_type / effect_name
        output_dir.mkdir(parents=True, exist_ok=True)

        prompt = self._build_effect_prompt(effect_name)
        negative_prompt = self._build_negative_prompt()

        print(f"\n{'='*70}")
        print(f"✨ Generating Effect Animation")
        print(f"{'='*70}")
        print(f"Effect: {effect_name}")
        print(f"Type: {effect_type}")
        print(f"Frames: {frame_count}")
        print(f"Output: {output_dir}")
        print(f"{'='*70}\n")

        generated_seed = seed
        success_count = 0

        for frame_num in range(1, frame_count + 1):
            print(f"[Frame {frame_num}/{frame_count}] Generating...")

            result = self._generate_image(
                prompt=prompt,
                negative_prompt=negative_prompt,
                seed=generated_seed if frame_num == 1 else -1,  # Each frame slightly different
                width=512,
                height=512,
                model="AnythingXL_v50"
            )

            if result:
                img_data, info = result

                if frame_num == 1:
                    generated_seed = info["seed"]

                filename = f"{effect_name}({frame_num}).png"
                filepath = output_dir / filename

                with open(filepath, "wb") as f:
                    f.write(img_data)

                success_count += 1
                print(f"  ✅ Saved: {filename}")
            else:
                print(f"  ❌ Failed to generate frame {frame_num}")

            time.sleep(0.5)

        print(f"\n✅ Effect Complete: {success_count}/{frame_count} frames\n")
        return generated_seed

    def generate_projectile(self, projectile_name, animated=False, frame_count=4, seed=-1):
        """生成發射物"""

        output_dir = self.project_root / "projectiles" / projectile_name
        output_dir.mkdir(parents=True, exist_ok=True)

        prompt = self._build_projectile_prompt(projectile_name)
        negative_prompt = self._build_negative_prompt()

        print(f"\n{'='*70}")
        print(f"🎯 Generating Projectile")
        print(f"{'='*70}")
        print(f"Projectile: {projectile_name}")
        print(f"Animated: {animated}")
        print(f"Frames: {frame_count if animated else 1}")
        print(f"{'='*70}\n")

        generated_seed = seed
        frames_to_generate = frame_count if animated else 1

        for frame_num in range(1, frames_to_generate + 1):
            print(f"[Frame {frame_num}/{frames_to_generate}] Generating...")

            result = self._generate_image(
                prompt=prompt,
                negative_prompt=negative_prompt,
                seed=generated_seed,
                width=512,
                height=256,
                model="AnythingXL_v50"
            )

            if result:
                img_data, info = result

                if frame_num == 1 and seed == -1:
                    generated_seed = info["seed"]

                if animated:
                    filename = f"{projectile_name}({frame_num}).png"
                else:
                    filename = f"{projectile_name}.png"

                filepath = output_dir / filename

                with open(filepath, "wb") as f:
                    f.write(img_data)

                print(f"  ✅ Saved: {filename}")

            time.sleep(0.5)

        print(f"\n✅ Projectile Complete\n")
        return generated_seed

    def _generate_image(self, prompt, negative_prompt, seed, width, height, model="AnythingXL_v50"):
        """Generate single image via SD WebUI API"""

        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "seed": seed,
            "steps": 28,
            "cfg_scale": 7,
            "width": width,
            "height": height,
            "sampler_name": "DPM++ 2M Karras",
            "override_settings": {
                "sd_model_checkpoint": model,
            },
            "save_images": False,
        }

        try:
            response = requests.post(f"{self.api_url}/txt2img", json=payload, timeout=300)

            if response.status_code == 200:
                result = response.json()
                img_data = base64.b64decode(result["images"][0])
                info = json.loads(result["info"])
                return img_data, info
            else:
                print(f"  ❌ API Error: {response.status_code} - {response.text}")
                return None
        except requests.exceptions.ConnectionError:
            print(f"  ❌ Cannot connect to WebUI at {self.api_url}")
            print(f"     Make sure SD WebUI is running with --api flag")
            return None
        except Exception as e:
            print(f"  ❌ Exception: {e}")
            return None

    def _build_character_prompt(self, character, action):
        """Build character prompt"""

        character_descriptions = {
            "slime": "cute blue slime character, jelly body, simple rounded shape, glossy surface",
            "skeleton": "skeleton warrior enemy, white bones, simple armor pieces, cartoon skull",
            "bat": "cute purple bat creature, small body, large wings, cartoonish",
            "ghost": "white ghost character, floating, translucent, simple face, cute",
            "goblin": "green goblin enemy, small size, pointed ears, mischievous",
        }

        action_descriptions = {
            "idle": "idle stance, breathing animation, subtle movement, neutral pose",
            "walk": "walking cycle, side view, clear leg movement, balanced",
            "run": "running animation, fast motion, dynamic pose",
            "attack": "attack motion, aggressive stance, weapon swing or lunge",
            "hurt": "taking damage, recoiling, pain expression",
            "death": "defeated animation, falling down, fading effect",
            "jump": "jumping motion, mid-air pose",
        }

        char_desc = character_descriptions.get(character, f"{character} enemy character")
        action_desc = action_descriptions.get(action, f"{action} animation")

        return f"""masterpiece, best quality, game character sprite, {char_desc},
{action_desc}, full body view, cartoon style, thick black outline,
bright vibrant colors, transparent background, clean design, kawaii style,
soft cel shading, professional game asset, centered composition,
high contrast, clean edges, no shadows on ground"""

    def _build_effect_prompt(self, effect_name):
        """Build effect prompt"""

        effect_descriptions = {
            "slash": "sword slash effect, blue energy trail, arc motion, speed lines",
            "explosion": "cartoon explosion, bright orange and yellow, radial burst, smoke clouds",
            "hit-impact": "hit impact effect, white spark burst, star shapes, impact lines",
            "smoke": "smoke cloud effect, grey and white puffs, dissipating particles",
            "sparkle": "sparkle particles, shiny stars, glowing points, magical effect",
            "fireball": "fireball projectile, orange flames, trailing fire, glowing core",
        }

        effect_desc = effect_descriptions.get(effect_name, f"{effect_name} effect")

        return f"""game VFX sprite, {effect_desc}, animation frame,
transparent background, high contrast, bright colors, glowing effect,
cel shading, clean design, no character, centered, professional game art,
particle effect, dynamic motion, high detail"""

    def _build_projectile_prompt(self, projectile_name):
        """Build projectile prompt"""

        projectile_descriptions = {
            "arrow": "wooden arrow projectile, sharp tip, feather fletching, side view",
            "fireball": "fireball projectile, orange flames, glowing core, trailing fire",
            "bullet": "energy bullet, glowing, simple rounded shape, blue color",
            "magic-orb": "magic orb projectile, purple energy, glowing sphere, sparkles",
            "laser": "laser beam, bright blue, straight line, glowing edges",
        }

        proj_desc = projectile_descriptions.get(projectile_name, f"{projectile_name} projectile")

        return f"""game projectile sprite, {proj_desc}, side view, horizontal orientation,
transparent background, clean design, bright colors, high contrast,
professional game asset, centered, no character, cel shading, glowing effect"""

    def _build_negative_prompt(self):
        """Universal negative prompt"""
        return """pixel art, pixelated, 8-bit, retro style, mosaic, low resolution,
blurry, realistic, photograph, photorealistic, 3d render, complex background,
landscape, scenery, signature, watermark, text, logo, artist name,
grainy, noise, jpeg artifacts, worst quality, low quality, normal quality,
multiple characters, speech bubble, frame border"""

    def check_webui_connection(self):
        """Check if WebUI is running"""
        try:
            response = requests.get(f"{self.api_url}/sd-models", timeout=5)
            if response.status_code == 200:
                models = response.json()
                print(f"✅ Connected to SD WebUI")
                print(f"📦 Available models: {len(models)}")
                for model in models:
                    print(f"   - {model['title']}")
                return True
            else:
                print(f"❌ WebUI responded with status {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to SD WebUI at {self.api_url}")
            print(f"   Make sure:")
            print(f"   1. SD WebUI is running")
            print(f"   2. Started with --api flag")
            print(f"   3. Accessible at http://127.0.0.1:7860")
            return False
        except Exception as e:
            print(f"❌ Error checking connection: {e}")
            return False

def main():
    parser = argparse.ArgumentParser(
        description="Generate game assets using Stable Diffusion WebUI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate character animations
  python sd_batch_generator.py --type character --name slime --action idle --frames 10
  python sd_batch_generator.py --type character --name skeleton --action walk --frames 8 --seed 123456

  # Generate effects
  python sd_batch_generator.py --type effect --name explosion --category explosion --frames 12
  python sd_batch_generator.py --type effect --name slash --category combat --frames 8

  # Generate projectiles
  python sd_batch_generator.py --type projectile --name arrow --animated --frames 4
  python sd_batch_generator.py --type projectile --name bullet

  # Check WebUI connection
  python sd_batch_generator.py --check
        """
    )

    parser.add_argument("--type", choices=["character", "effect", "projectile"], help="Asset type")
    parser.add_argument("--name", type=str, help="Asset name")
    parser.add_argument("--action", type=str, help="Character action (idle, walk, attack, death)")
    parser.add_argument("--category", type=str, help="Effect category (combat, explosion, smoke, pickup)")
    parser.add_argument("--frames", type=int, default=10, help="Number of frames")
    parser.add_argument("--animated", action="store_true", help="Generate animated projectile")
    parser.add_argument("--seed", type=int, default=-1, help="Seed value (-1 for random)")
    parser.add_argument("--url", type=str, default="http://127.0.0.1:7860", help="WebUI URL")
    parser.add_argument("--project-root", type=str, default="../assets", help="Project assets root")
    parser.add_argument("--check", action="store_true", help="Check WebUI connection and exit")

    args = parser.parse_args()

    generator = GameAssetGenerator(webui_url=args.url, project_root=args.project_root)

    # Check connection mode
    if args.check:
        generator.check_webui_connection()
        return

    # Validate required arguments
    if not args.type:
        parser.print_help()
        return

    if not args.name:
        print("❌ Error: --name is required")
        parser.print_help()
        return

    # Check WebUI connection first
    if not generator.check_webui_connection():
        return

    print()

    # Generate based on type
    if args.type == "character":
        if not args.action:
            print("❌ Error: --action is required for character type")
            return

        generator.generate_character_animation(
            character_name=args.name,
            action=args.action,
            frame_count=args.frames,
            seed=args.seed
        )

    elif args.type == "effect":
        if not args.category:
            print("❌ Error: --category is required for effect type")
            return

        generator.generate_effect_animation(
            effect_type=args.category,
            effect_name=args.name,
            frame_count=args.frames,
            seed=args.seed
        )

    elif args.type == "projectile":
        generator.generate_projectile(
            projectile_name=args.name,
            animated=args.animated,
            frame_count=args.frames if args.animated else 1,
            seed=args.seed
        )

    print("\n🎉 Generation complete! Don't forget to:")
    print("   1. Remove backgrounds using batch_remove_bg.py")
    print("   2. Verify frame consistency")
    print("   3. Update config JSON files if needed\n")

if __name__ == "__main__":
    main()
