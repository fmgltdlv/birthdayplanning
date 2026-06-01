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

function bubbleSize(entry: CapsuleEntry, maxPx: number): number {
  const h = hashString(entry.id);
  const base = entry.type === 'photo' ? 58 : 50;
  return Math.min(maxPx, base + (h % Math.max(8, Math.floor(maxPx * 0.2))));
}

/**
 * Grid-based layout so bubbles stay spread out and avoid overlapping.
 */
export function layoutBubbles(entries: CapsuleEntry[]): BubbleStyle[] {
  const n = entries.length;
  if (n === 0) return [];

  const cols = Math.ceil(Math.sqrt(n * 1.2));
  const rows = Math.ceil(n / cols);
  const cellW = 86 / cols;
  const cellH = 76 / rows;
  const maxPx = Math.max(44, Math.min(88, Math.floor(300 / cols)));

  return entries.map((entry, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const h = hashString(entry.id);
    const h2 = hashString(entry.id + 'j');

    const jitterX = ((h % 17) - 8) * (cellW * 0.04);
    const jitterY = ((h2 % 15) - 7) * (cellH * 0.04);

    const left = 7 + col * cellW + cellW * 0.5 + jitterX;
    const top = 10 + row * cellH + cellH * 0.5 + jitterY;
    const size = bubbleSize(entry, maxPx);

    return {
      left,
      top,
      size,
      delay: (h % 24) * 0.12,
      duration: 12 + (h2 % 14),
    };
  });
}

export function notePreview(text: string | null, max = 48): string {
  if (!text) return '…';
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
