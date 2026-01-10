#!/usr/bin/env python3
"""
Batch Background Removal for Game Assets
批次移除背景工具

Removes backgrounds from generated images and makes them transparent
使用 rembg 移除背景並轉換為透明 PNG

Installation:
    pip install rembg pillow

Usage:
    python batch_remove_bg.py --input ../assets/sprites/enemies/slime/idle
    python batch_remove_bg.py --input ../assets/effects/explosion/small --output ../assets/effects/explosion/small_transparent
    python batch_remove_bg.py --recursive --input ../assets/sprites/enemies
"""

import argparse
from pathlib import Path
from rembg import remove
from PIL import Image
import sys

def process_image(input_path, output_path, resize=None):
    """Process single image to remove background"""

    try:
        print(f"  Processing: {input_path.name}...", end=" ")

        # Read input image
        with open(input_path, "rb") as f:
            input_data = f.read()

        # Remove background
        output_data = remove(input_data)

        # Open as PIL Image
        img = Image.open(output_data)

        # Resize if specified
        if resize:
            width, height = resize
            img = img.resize((width, height), Image.Resampling.LANCZOS)
            print(f"[Resized to {width}x{height}]", end=" ")

        # Save with transparency
        img.save(output_path, "PNG", optimize=True)

        print("✅")
        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def process_directory(input_dir, output_dir=None, recursive=False, resize=None):
    """Process all PNG images in directory"""

    input_dir = Path(input_dir)

    if not input_dir.exists():
        print(f"❌ Input directory does not exist: {input_dir}")
        return

    # Use same directory if output not specified
    if output_dir is None:
        output_dir = input_dir
        print(f"⚠️  Warning: Will overwrite original files in {input_dir}")
        response = input("Continue? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return
    else:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*70}")
    print(f"🖼️  Batch Background Removal")
    print(f"{'='*70}")
    print(f"Input:  {input_dir}")
    print(f"Output: {output_dir}")
    print(f"Recursive: {recursive}")
    if resize:
        print(f"Resize: {resize[0]}x{resize[1]}")
    print(f"{'='*70}\n")

    # Find all PNG files
    if recursive:
        png_files = list(input_dir.rglob("*.png"))
    else:
        png_files = list(input_dir.glob("*.png"))

    if not png_files:
        print(f"❌ No PNG files found in {input_dir}")
        return

    print(f"Found {len(png_files)} PNG files\n")

    success_count = 0
    fail_count = 0

    for png_file in png_files:
        # Calculate relative path for recursive mode
        if recursive and output_dir != input_dir:
            rel_path = png_file.relative_to(input_dir)
            output_path = output_dir / rel_path
            output_path.parent.mkdir(parents=True, exist_ok=True)
        else:
            output_path = output_dir / png_file.name

        if process_image(png_file, output_path, resize):
            success_count += 1
        else:
            fail_count += 1

    print(f"\n{'='*70}")
    print(f"✅ Processing Complete")
    print(f"{'='*70}")
    print(f"Success: {success_count}/{len(png_files)}")
    print(f"Failed:  {fail_count}/{len(png_files)}")
    print(f"Output:  {output_dir}")
    print(f"{'='*70}\n")

def main():
    parser = argparse.ArgumentParser(
        description="Remove backgrounds from game asset images",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process single directory
  python batch_remove_bg.py --input ../assets/sprites/enemies/slime/idle

  # Process with custom output directory
  python batch_remove_bg.py --input temp_generated --output ../assets/sprites/enemies/slime/idle

  # Process recursively (all subdirectories)
  python batch_remove_bg.py --recursive --input ../assets/sprites/enemies

  # Process with resize
  python batch_remove_bg.py --input temp --output assets --resize 64 64

  # Process in-place (overwrite originals)
  python batch_remove_bg.py --input ../assets/effects/explosion/small --in-place
        """
    )

    parser.add_argument("--input", "-i", type=str, required=True, help="Input directory")
    parser.add_argument("--output", "-o", type=str, help="Output directory (default: same as input)")
    parser.add_argument("--recursive", "-r", action="store_true", help="Process subdirectories recursively")
    parser.add_argument("--resize", nargs=2, type=int, metavar=("WIDTH", "HEIGHT"), help="Resize images to WIDTHxHEIGHT")
    parser.add_argument("--in-place", action="store_true", help="Overwrite original files (same as not specifying --output)")

    args = parser.parse_args()

    # Check if rembg is installed
    try:
        import rembg
    except ImportError:
        print("❌ Error: rembg is not installed")
        print("\nInstall with:")
        print("  pip install rembg pillow")
        print("\nFor faster processing (optional):")
        print("  pip install rembg[gpu]")
        sys.exit(1)

    # Parse resize
    resize = None
    if args.resize:
        resize = tuple(args.resize)

    # Process directory
    output = None if args.in_place else args.output
    process_directory(
        input_dir=args.input,
        output_dir=output,
        recursive=args.recursive,
        resize=resize
    )

if __name__ == "__main__":
    main()
