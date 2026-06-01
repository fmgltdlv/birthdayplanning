const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 2048;
const OUTPUT_TYPE = 'image/jpeg';

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
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

/** Resize and compress on-device so uploads stay ≤ 5 MB. */
export async function compressImageForUpload(file: File): Promise<File> {
  if (file.size <= MAX_BYTES && file.type === OUTPUT_TYPE) {
    return file;
  }

  if (file.type === 'image/gif') {
    if (file.size <= MAX_BYTES) return file;
    throw new Error('GIF must be under 5 MB. Try a shorter clip or another format.');
  }

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image');

  let quality = 0.88;
  let dim = MAX_DIMENSION;

  for (let attempt = 0; attempt < 12; attempt++) {
    const { width, height } = scaleDimensions(
      img.naturalWidth,
      img.naturalHeight,
      dim,
    );
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#2c2419';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_BYTES) {
      const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
      return new File([blob], `${base}.jpg`, { type: OUTPUT_TYPE, lastModified: Date.now() });
    }

    if (quality > 0.5) {
      quality -= 0.08;
    } else {
      dim = Math.round(dim * 0.85);
      quality = 0.82;
    }
  }

  throw new Error('Could not compress image below 5 MB. Try a smaller photo.');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
