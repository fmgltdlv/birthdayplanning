"""Compress photos over 1 MB and build a collage background."""
from __future__ import annotations

import math
import sys
from pathlib import Path

from PIL import Image

MAX_BYTES = 1024 * 1024
ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"
COLLAGE_PATH = PUBLIC_DIR / "collage-bg.jpg"
COLLAGE_WIDTH = 2400
COLLAGE_HEIGHT = 1600
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def file_size(path: Path) -> int:
    return path.stat().st_size


def save_jpeg_under_limit(img: Image.Image, path: Path, max_bytes: int) -> None:
    """Write JPEG at or below max_bytes by lowering quality and/or size."""
    work = img.convert("RGB")
    scale = 1.0

    while scale >= 0.25:
        w = max(1, int(work.width * scale))
        h = max(1, int(work.height * scale))
        resized = work if scale == 1.0 else work.resize((w, h), Image.Resampling.LANCZOS)

        for quality in range(88, 35, -4):
            resized.save(path, "JPEG", quality=quality, optimize=True)
            if file_size(path) <= max_bytes:
                return

        scale *= 0.85

    resized.save(path, "JPEG", quality=35, optimize=True)


def compress_if_needed(path: Path) -> bool:
    if file_size(path) <= MAX_BYTES:
        return False

    img = Image.open(path)
    out = path.with_suffix(".jpeg") if path.suffix.lower() == ".png" else path
    save_jpeg_under_limit(img, out, MAX_BYTES)

    if out != path and path.exists():
        path.unlink()

    final = out if out.exists() else path
    print(f"  compressed {final.name}: {file_size(final) / 1024:.0f} KB")
    return True


def load_images() -> list[Image.Image]:
    paths = sorted(
        p
        for p in ASSETS_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    )
    images: list[Image.Image] = []
    for p in paths:
        img = Image.open(p).convert("RGB")
        images.append(img)
    return images


def build_collage(images: list[Image.Image]) -> Image.Image:
    n = len(images)
    cols = math.ceil(math.sqrt(n * COLLAGE_WIDTH / COLLAGE_HEIGHT))
    rows = math.ceil(n / cols)
    cell_w = COLLAGE_WIDTH // cols
    cell_h = COLLAGE_HEIGHT // rows
    collage = Image.new("RGB", (COLLAGE_WIDTH, COLLAGE_HEIGHT), (20, 16, 12))

    for i, img in enumerate(images):
        row, col = divmod(i, cols)
        fitted = Image.new("RGB", (cell_w, cell_h), (20, 16, 12))
        img_ratio = img.width / img.height
        cell_ratio = cell_w / cell_h
        if img_ratio > cell_ratio:
            new_h = cell_h
            new_w = int(new_h * img_ratio)
        else:
            new_w = cell_w
            new_h = int(new_w / img_ratio)
        scaled = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        x = (cell_w - new_w) // 2
        y = (cell_h - new_h) // 2
        fitted.paste(scaled, (x, y))
        collage.paste(fitted, (col * cell_w, row * cell_h))

    return collage


def main() -> int:
    if not ASSETS_DIR.is_dir():
        print(f"Missing assets dir: {ASSETS_DIR}", file=sys.stderr)
        return 1

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    print("Compressing images over 1 MB…")
    for path in sorted(ASSETS_DIR.iterdir()):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS:
            if file_size(path) > MAX_BYTES:
                compress_if_needed(path)

    images = load_images()
    if not images:
        print("No images found.", file=sys.stderr)
        return 1

    print(f"Building collage from {len(images)} photos…")
    collage = build_collage(images)
    save_jpeg_under_limit(collage, COLLAGE_PATH, MAX_BYTES * 2)
    print(f"  collage: {COLLAGE_PATH} ({file_size(COLLAGE_PATH) / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
