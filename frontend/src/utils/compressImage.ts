const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 2048;
const OUTPUT_TYPE = 'image/jpeg';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif)$/i;

export function isLikelyImage(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXT.test(file.name);
}

function isHeic(file: File): boolean {
  if (/image\/heic|image\/heif/i.test(file.type)) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

/** Convert HEIC/HEIF to JPEG in-browser when the OS does not decode it. */
async function normalizeImageFile(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  try {
    const { default: heic2any } = await import('heic2any');
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob as Blob], `${base}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}


interface DecodedImage {
  width: number;
  height: number;
  draw(
    ctx: CanvasRenderingContext2D,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ): void;
  dispose(): void;
}

async function decodeImageFile(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw(ctx, dx, dy, dw, dh) {
          ctx.drawImage(bitmap, dx, dy, dw, dh);
        },
        dispose: () => bitmap.close(),
      };
    } catch {
      /* try Image fallback */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode-failed'));
      el.src = url;
    });
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw(ctx, dx, dy, dw, dh) {
        ctx.drawImage(img, dx, dy, dw, dh);
      },
      dispose: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error(
      `Could not read "${file.name || 'photo'}". Try a JPEG from your library, or take a new photo.`,
    );
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Compression failed'));
      },
      OUTPUT_TYPE,
      quality,
    );
  });
}

function scaleDimensions(
  width: number,
  height: number,
  maxDim: number,
): { width: number; height: number } {
  if (width <= maxDim && height <= maxDim) {
    return { width, height };
  }
  const ratio = Math.min(maxDim / width, maxDim / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function rasterizeToJpeg(
  source: File,
  maxDim: number,
  maxBytes: number,
  label: string,
): Promise<File> {
  if (source.type === 'image/gif' && source.size <= maxBytes) {
    return source;
  }

  const normalized = await normalizeImageFile(source);
  const decoded = await decodeImageFile(normalized);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    decoded.dispose();
    throw new Error('Could not process image');
  }

  let quality = 0.88;
  let dim = maxDim;

  try {
    for (let attempt = 0; attempt < 12; attempt++) {
      const { width, height } = scaleDimensions(decoded.width, decoded.height, dim);
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#06080f';
      ctx.fillRect(0, 0, width, height);
      decoded.draw(ctx, 0, 0, width, height);

      const blob = await canvasToBlob(canvas, quality);
      if (blob.size <= maxBytes) {
        const base = source.name.replace(/\.[^.]+$/, '') || 'photo';
        return new File([blob], `${base}.jpg`, {
          type: OUTPUT_TYPE,
          lastModified: Date.now(),
        });
      }

      if (quality > 0.5) {
        quality -= 0.08;
      } else {
        dim = Math.round(dim * 0.85);
        quality = 0.82;
      }
    }
    throw new Error(`${label} could not be compressed below ${formatBytes(maxBytes)}.`);
  } finally {
    decoded.dispose();
  }
}

/** Resize and compress on-device so uploads stay ≤ 5 MB. */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!isLikelyImage(file)) {
    throw new Error('Please choose a photo (JPEG, PNG, HEIC, etc.).');
  }

  if (file.size <= MAX_BYTES && file.type === OUTPUT_TYPE) {
    return file;
  }

  return rasterizeToJpeg(file, MAX_DIMENSION, MAX_BYTES, 'Photo');
}

const THUMB_MAX_DIM = 360;
const THUMB_TARGET_BYTES = 400 * 1024;

export async function createThumbnailFromFile(source: File): Promise<File> {
  return rasterizeToJpeg(source, THUMB_MAX_DIM, THUMB_TARGET_BYTES, 'Thumbnail');
}

export async function preparePhotoUpload(
  raw: File,
): Promise<{ full: File; thumb: File }> {
  if (!isLikelyImage(raw)) {
    throw new Error('Please choose a photo (JPEG, PNG, HEIC, etc.).');
  }
  const full = await compressImageForUpload(raw);
  const thumb = await createThumbnailFromFile(full);
  return { full, thumb };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
