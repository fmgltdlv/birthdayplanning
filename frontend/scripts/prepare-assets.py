"""Compress photos over 1 MB and build a collage background."""
from __future__ import annotations

import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

MAX_BYTES = 1024 * 1024
ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"
COLLAGE_PATH = PUBLIC_DIR / "collage-bg.jpg"
COLLAGE_WIDTH = 2800
COLLAGE_HEIGHT = 1800
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
COLLAGE_SEED = 20260531
BG_RGB = (198, 220, 245)  # light sky blue
BG_VIGNETTE_RGB = (170, 200, 235)
POLAROID = (248, 244, 236)


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
    if file_size(path) > MAX_BYTES:
        img = Image.open(path)
        out = path.with_suffix(".jpeg") if path.suffix.lower() == ".png" else path
        save_jpeg_under_limit(img, out, MAX_BYTES)
        if out != path and path.exists():
            path.unlink()
        final = out if out.exists() else path
        print(f"  compressed {final.name}: {file_size(final) / 1024:.0f} KB")
        return True
    return False


def load_images() -> list[Image.Image]:
    paths = sorted(
        p
        for p in ASSETS_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    )
    return [Image.open(p).convert("RGB") for p in paths]


def _fit_cover(img: Image.Image, w: int, h: int) -> Image.Image:
    ratio = img.width / img.height
    target = w / h
    if ratio > target:
        new_h = h
        new_w = int(h * ratio)
    else:
        new_w = w
        new_h = int(w / ratio)
    scaled = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - w) // 2
    top = (new_h - h) // 2
    return scaled.crop((left, top, left + w, top + h))


def _make_polaroid(
    img: Image.Image,
    photo_w: int,
    photo_h: int,
    border: int,
    bottom_extra: int,
) -> Image.Image:
    photo = _fit_cover(img, photo_w, photo_h)
    frame_w = photo_w + border * 2
    frame_h = photo_h + border + bottom_extra
    frame = Image.new("RGB", (frame_w, frame_h), POLAROID)
    frame.paste(photo, (border, border))
    return frame


def _tile_with_shadow(
    frame: Image.Image,
    angle: float,
    shadow_offset: tuple[int, int] = (10, 14),
) -> Image.Image:
    rotated = frame.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True, fillcolor=BG_RGB)
    shadow = Image.new("RGBA", rotated.size, (0, 0, 0, 0))
    mask = rotated.convert("L").point(lambda p: 200 if p < 250 else 0)
    shadow_layer = Image.new("RGBA", rotated.size, (0, 0, 0, 95))
    shadow_layer.putalpha(mask)
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(12))
    ox, oy = shadow_offset
    canvas = Image.new("RGBA", (rotated.width + ox + 8, rotated.height + oy + 8), (*BG_RGB, 0))
    canvas.paste(shadow_layer, (ox, oy), shadow_layer)
    canvas.paste(rotated.convert("RGBA"), (0, 0))
    return canvas


def _paste_rgba(base: Image.Image, tile: Image.Image, cx: int, cy: int) -> None:
    x = cx - tile.width // 2
    y = cy - tile.height // 2
    base.paste(tile, (x, y), tile)


def _gradient_wash(canvas: Image.Image) -> Image.Image:
    w, h = canvas.size
    wash = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(wash)
    for i in range(0, h, 4):
        t = i / h
        warm = int(18 * (1 - abs(t - 0.35) * 2))
        draw.rectangle((0, i, w, i + 3), fill=(255, 140, 66, max(0, warm)))
    for i in range(0, w, 4):
        t = i / w
        cool = int(14 * (1 - abs(t - 0.72) * 2))
        draw.rectangle((i, 0, i + 3, h), fill=(77, 171, 247, max(0, cool)))
    return Image.alpha_composite(canvas.convert("RGBA"), wash).convert("RGB")


def _vignette(img: Image.Image) -> Image.Image:
    w, h = img.size
    vignette = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(vignette)
    draw.ellipse((-w * 0.15, -h * 0.2, w * 1.15, h * 1.25), fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(80))
    dark = Image.new("RGB", (w, h), BG_VIGNETTE_RGB)
    return Image.composite(img, dark, vignette)


def build_collage(images: list[Image.Image]) -> Image.Image:
    """Scattered polaroid-style tiles with rotation and overlap."""
    rng = random.Random(COLLAGE_SEED)
    base = Image.new("RGB", (COLLAGE_WIDTH, COLLAGE_HEIGHT), BG_RGB)

    # Soft color blobs behind the photos
    blobs = Image.new("RGBA", (COLLAGE_WIDTH, COLLAGE_HEIGHT), (0, 0, 0, 0))
    blob_draw = ImageDraw.Draw(blobs)
    blob_colors = [
        (255, 140, 66, 38),
        (181, 101, 240, 32),
        (77, 171, 247, 30),
        (81, 207, 102, 24),
    ]
    for _ in range(6):
        cx = rng.randint(-200, COLLAGE_WIDTH + 200)
        cy = rng.randint(-100, COLLAGE_HEIGHT + 100)
        r = rng.randint(280, 520)
        blob_draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=rng.choice(blob_colors))
    blobs = blobs.filter(ImageFilter.GaussianBlur(90))
    base = Image.alpha_composite(base.convert("RGBA"), blobs).convert("RGB")

    placements: list[dict] = []
    anchors = [
        (0.22, 0.28),
        (0.48, 0.18),
        (0.76, 0.26),
        (0.14, 0.52),
        (0.38, 0.48),
        (0.62, 0.44),
        (0.86, 0.5),
        (0.28, 0.72),
        (0.52, 0.68),
        (0.74, 0.76),
        (0.18, 0.88),
        (0.44, 0.9),
        (0.68, 0.9),
        (0.9, 0.82),
        (0.5, 0.38),
    ]
    size_tiers = [1.35, 1.15, 1.0, 0.88, 0.78]

    for i, img in enumerate(images):
        ax, ay = anchors[i % len(anchors)]
        jitter_x = rng.uniform(-0.07, 0.07)
        jitter_y = rng.uniform(-0.06, 0.06)
        cx = int((ax + jitter_x) * COLLAGE_WIDTH)
        cy = int((ay + jitter_y) * COLLAGE_HEIGHT)

        tier = size_tiers[i % len(size_tiers)]
        if i % 5 == 0:
            tier *= 1.12
        long_edge = int(rng.uniform(300, 420) * tier)
        aspect = img.width / img.height
        if aspect >= 1:
            photo_w, photo_h = long_edge, int(long_edge / aspect)
        else:
            photo_h, photo_w = long_edge, int(long_edge * aspect)

        border = rng.randint(10, 16)
        bottom_extra = rng.randint(22, 38)
        angle = rng.uniform(-10, 10)
        if abs(angle) < 2:
            angle = rng.choice([-1, 1]) * rng.uniform(4, 10)

        frame = _make_polaroid(img, photo_w, photo_h, border, bottom_extra)
        tile = _tile_with_shadow(frame, angle)
        area = tile.width * tile.height
        placements.append({"tile": tile, "cx": cx, "cy": cy, "area": area, "angle": angle})

    # Larger pieces underneath, smaller on top
    placements.sort(key=lambda p: p["area"], reverse=True)
    for p in placements:
        _paste_rgba(base, p["tile"], p["cx"], p["cy"])

    out = _gradient_wash(base)
    out = ImageEnhance.Color(out).enhance(1.08)
    out = ImageEnhance.Contrast(out).enhance(1.04)
    out = _vignette(out)
    return out.filter(ImageFilter.GaussianBlur(0.6))


def main() -> int:
    if not ASSETS_DIR.is_dir():
        print(f"Missing assets dir: {ASSETS_DIR}", file=sys.stderr)
        return 1

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    print("Compressing images over 1 MB…")
    for path in sorted(ASSETS_DIR.iterdir()):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS:
            compress_if_needed(path)

    images = load_images()
    if not images:
        print("No images found.", file=sys.stderr)
        return 1

    print(f"Building artsy collage from {len(images)} photos…")
    collage = build_collage(images)
    save_jpeg_under_limit(collage, COLLAGE_PATH, MAX_BYTES * 2)
    print(f"  collage: {COLLAGE_PATH} ({file_size(COLLAGE_PATH) / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
