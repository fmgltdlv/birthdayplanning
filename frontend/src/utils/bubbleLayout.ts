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
  /** World point where the newest memory sits (viewport should start here). */
  focusX: number;
  focusY: number;
}

const PAD = 96;
const RING_STEP = 58;
const OVERVIEW_DOT = 10;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const BUBBLE_HUE_CLASSES = [
  'bubble-hue-orange',
  'bubble-hue-purple',
  'bubble-hue-blue',
  'bubble-hue-green',
] as const;

export function bubbleHueClass(id: string): (typeof BUBBLE_HUE_CLASSES)[number] {
  return BUBBLE_HUE_CLASSES[hashString(id) % 4]!;
}

function bubbleSize(entry: CapsuleEntry, maxPx: number): number {
  const h = hashString(entry.id);
  const base = entry.type === 'photo' ? 58 : 50;
  return Math.min(maxPx, base + (h % Math.max(8, Math.floor(maxPx * 0.2))));
}

/**
 * Newest entries near the center; older ones spiral outward.
 * Positions align with the original `entries` array order.
 */
export function layoutBubbles(entries: CapsuleEntry[]): BubbleLayoutResult {
  const n = entries.length;
  if (n === 0) {
    return {
      styles: [],
      worldWidth: 800,
      worldHeight: 600,
      focusX: 400,
      focusY: 300,
    };
  }

  const maxPx = Math.max(44, Math.min(88, Math.floor(220 / Math.cbrt(n))));

  const ranked = entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => b.entry.createdAt - a.entry.createdAt);

  const maxRadius =
    n <= 1 ? 0 : RING_STEP * Math.sqrt(n - 1) + RING_STEP * 0.5;
  const worldHalf = maxRadius + PAD + maxPx;
  const worldWidth = Math.ceil(worldHalf * 2);
  const worldHeight = Math.ceil(worldHalf * 2);
  const focusX = worldHalf;
  const focusY = worldHalf;

  const styles: BubbleStyle[] = new Array(n);

  ranked.forEach(({ entry, index }, rank) => {
    const h = hashString(entry.id);
    const h2 = hashString(entry.id + 'j');
    const size = bubbleSize(entry, maxPx);

    const radius = rank === 0 ? 0 : RING_STEP * Math.sqrt(rank);
    const angle =
      rank * GOLDEN_ANGLE + ((h % 360) * Math.PI) / 180 / (rank + 1);
    const jitterX = ((h % 17) - 8) * 5;
    const jitterY = ((h2 % 15) - 7) * 5;

    const cx = focusX + Math.cos(angle) * radius + jitterX;
    const cy = focusY + Math.sin(angle) * radius + jitterY;

    styles[index] = {
      left: cx - size / 2,
      top: cy - size / 2,
      size,
      delay: (h % 24) * 0.12,
      duration: 12 + (h2 % 14),
    };
  });

  return { styles, worldWidth, worldHeight, focusX, focusY };
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
