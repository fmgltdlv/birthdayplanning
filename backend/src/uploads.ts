const MAX_BYTES = 5 * 1024 * 1024; // 5 MB full image
const MAX_THUMB_BYTES = 512 * 1024; // 512 KB thumbnail

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function validateImage(file: File, maxBytes = MAX_BYTES): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Please upload a JPEG, PNG, WebP, or GIF image.';
  }
  if (file.size > maxBytes) {
    return maxBytes === MAX_BYTES
      ? 'Image must be 5 MB or smaller.'
      : 'Thumbnail is too large.';
  }
  return null;
}

export function r2KeyFor(id: string, mimeType: string): string {
  const ext = EXT_BY_MIME[mimeType] ?? 'bin';
  return `photos/${id}.${ext}`;
}

export function r2KeyForThumb(id: string): string {
  return `photos/${id}-thumb.jpg`;
}

export async function putToR2(
  bucket: R2Bucket,
  key: string,
  file: File,
): Promise<void> {
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'image/jpeg' },
  });
}

export { MAX_THUMB_BYTES };
