import type { CapsuleEntry } from '../types';

export interface BubbleStyle {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

export interface BubbleLayoutResult {
  styles: BubbleStyle[];
  worldWidth: number;
  worldHeight: number;
}

const CELL = 148;
const PAD = 96;
const OVERVIEW_DOT = 10;

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
 * Grid layout on an expandable world canvas (pixel coordinates).
 */
export function layoutBubbles(entries: CapsuleEntry[]): BubbleLayoutResult {
  const n = entries.length;
  if (n === 0) {
    return { styles: [], worldWidth: 800, worldHeight: 600 };
  }

  const cols = Math.ceil(Math.sqrt(n * 1.2));
  const rows = Math.ceil(n / cols);
  const maxPx = Math.max(44, Math.min(88, Math.floor(300 / cols)));

  const worldWidth = PAD * 2 + cols * CELL;
  const worldHeight = PAD * 2 + rows * CELL;

  const styles = entries.map((entry, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const h = hashString(entry.id);
    const h2 = hashString(entry.id + 'j');

    const jitterX = ((h % 17) - 8) * 6;
    const jitterY = ((h2 % 15) - 7) * 6;

    const left =
      PAD + col * CELL + CELL * 0.5 - bubbleSize(entry, maxPx) / 2 + jitterX;
    const top =
      PAD + row * CELL + CELL * 0.5 - bubbleSize(entry, maxPx) / 2 + jitterY;
    const size = bubbleSize(entry, maxPx);

    return {
      left,
      top,
      size,
      delay: (h % 24) * 0.12,
      duration: 12 + (h2 % 14),
    };
  });

  return { styles, worldWidth, worldHeight };
}

export function layoutBounds(styles: BubbleStyle[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (styles.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of styles) {
    minX = Math.min(minX, s.left);
    minY = Math.min(minY, s.top);
    maxX = Math.max(maxX, s.left + s.size);
    maxY = Math.max(maxY, s.top + s.size);
  }
  return { minX, minY, maxX, maxY };
}

/** Scale that fits all bubble bounds inside the viewport with padding. */
export function fitAllScale(
  viewportW: number,
  viewportH: number,
  bounds: ReturnType<typeof layoutBounds>,
  padding = 48,
): number {
  const contentW = bounds.maxX - bounds.minX + padding * 2;
  const contentH = bounds.maxY - bounds.minY + padding * 2;
  if (contentW <= 0 || contentH <= 0) return 1;
  return Math.min(viewportW / contentW, viewportH / contentH, 1);
}

export function overviewDotSize(): number {
  return OVERVIEW_DOT;
}

export function notePreview(text: string | null, max = 48): string {
  if (!text) return '…';
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
