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

/** Stable pseudo-random bubble positions (percent) per entry. */
export function bubbleStyleFor(entry: CapsuleEntry, index: number): BubbleStyle {
  const h = hashString(entry.id);
  const h2 = hashString(entry.id + String(index));

  const size =
    entry.type === 'photo' ? 88 + (h % 48) : 72 + (h % 40);

  return {
    left: 8 + (h % 72),
    top: 6 + (h2 % 78),
    size,
    delay: (h % 20) * 0.15,
    duration: 14 + (h2 % 10),
  };
}

export function notePreview(text: string | null, max = 48): string {
  if (!text) return '…';
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
