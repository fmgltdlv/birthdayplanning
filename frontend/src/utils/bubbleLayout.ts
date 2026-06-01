import type { CapsuleEntry } from '../types';

export interface BubbleStyle {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Stable pseudo-random bubble positions (percent) across the full viewport. */
export function bubbleStyleFor(entry: CapsuleEntry, index: number): BubbleStyle {
  const h = hashString(entry.id);
  const h2 = hashString(entry.id + String(index));

  const size =
    entry.type === 'photo'
      ? 72 + (h % 56)
      : 56 + (h % 44);

  return {
    left: 4 + (h % 88),
    top: 8 + (h2 % 82),
    size,
    delay: (h % 24) * 0.12,
    duration: 12 + (h2 % 14),
  };
}

export function notePreview(text: string | null, max = 48): string {
  if (!text) return '…';
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
