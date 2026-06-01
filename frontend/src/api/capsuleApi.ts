import type { CapsuleEntry } from '../types';

export type MediaSize = 'full' | 'thumb';

function apiBase(): string {
  return import.meta.env.VITE_API_BASE ?? '';
}

export function mediaUrl(entryId: string, size: MediaSize = 'full'): string {
  const base = `${apiBase()}/api/media/${encodeURIComponent(entryId)}`;
  return size === 'thumb' ? `${base}?size=thumb` : base;
}

export async function fetchEntries(): Promise<CapsuleEntry[]> {
  const res = await fetch(`${apiBase()}/api/entries`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Could not load capsule');
  }
  const data = (await res.json()) as { entries: CapsuleEntry[] };
  return data.entries;
}

export async function postNote(
  text: string,
  authorName: string,
): Promise<CapsuleEntry> {
  const res = await fetch(`${apiBase()}/api/entries/note`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      authorName: authorName.trim() || undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Could not save note');
  }
  const data = (await res.json()) as { entry: CapsuleEntry };
  return data.entry;
}

export async function postPhoto(
  full: File,
  thumb: File,
  authorName: string,
  caption: string,
): Promise<CapsuleEntry> {
  const form = new FormData();
  form.append('file', full);
  form.append('thumb', thumb);
  if (authorName.trim()) form.append('authorName', authorName.trim());
  if (caption.trim()) form.append('caption', caption.trim());

  const res = await fetch(`${apiBase()}/api/entries/photo`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Could not upload photo');
  }
  const data = (await res.json()) as { entry: CapsuleEntry };
  return data.entry;
}
