const MAX_BYTES = 15 * 1024 * 1024; // 15 MB

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

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Please upload a JPEG, PNG, WebP, or GIF image.';
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be 15 MB or smaller.';
  }
  return null;
}

export function r2KeyFor(id: string, mimeType: string): string {
  const ext = EXT_BY_MIME[mimeType] ?? 'bin';
  return `photos/${id}.${ext}`;
}

export async function putToR2(
  bucket: R2Bucket,
  key: string,
  file: File,
): Promise<void> {
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
}
