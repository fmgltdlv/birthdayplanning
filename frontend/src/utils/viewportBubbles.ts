import type { BubbleStyle } from './bubbleLayout';

export const TARGET_INITIAL_VISIBLE = 50;
export const OVERVIEW_VISIBLE_COUNT = 80;
const MAX_INITIAL_SCALE = 2.5;

export interface ViewportRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Viewport bounds in world (pixel) coordinates. */
export function worldViewport(
  viewW: number,
  viewH: number,
  scale: number,
  pan: { x: number; y: number },
  margin = 0,
): ViewportRect {
  return {
    x: -pan.x / scale - margin,
    y: -pan.y / scale - margin,
    w: viewW / scale + margin * 2,
    h: viewH / scale + margin * 2,
  };
}

function bubbleCenter(style: BubbleStyle): { x: number; y: number } {
  return { x: style.left + style.size / 2, y: style.top + style.size / 2 };
}

function centerInViewport(
  cx: number,
  cy: number,
  vp: ViewportRect,
): boolean {
  return (
    cx >= vp.x &&
    cx <= vp.x + vp.w &&
    cy >= vp.y &&
    cy <= vp.y + vp.h
  );
}

export function countVisibleBubbles(
  styles: BubbleStyle[],
  viewW: number,
  viewH: number,
  scale: number,
  pan: { x: number; y: number },
): number {
  if (viewW <= 0 || viewH <= 0 || styles.length === 0) return 0;
  const vp = worldViewport(viewW, viewH, scale, pan);
  let n = 0;
  for (const s of styles) {
    const { x, y } = bubbleCenter(s);
    if (centerInViewport(x, y, vp)) n++;
  }
  return n;
}

export function visibleBubbleIndices(
  styles: BubbleStyle[],
  viewW: number,
  viewH: number,
  scale: number,
  pan: { x: number; y: number },
  margin = 120,
): number[] {
  if (viewW <= 0 || viewH <= 0) return [];
  const vp = worldViewport(viewW, viewH, scale, pan, margin);
  const out: number[] = [];
  for (let i = 0; i < styles.length; i++) {
    const { x, y } = bubbleCenter(styles[i]!);
    if (centerInViewport(x, y, vp)) out.push(i);
  }
  return out;
}

export function panToWorldCenter(
  viewW: number,
  viewH: number,
  worldX: number,
  worldY: number,
  scale: number,
): { x: number; y: number } {
  return {
    x: viewW / 2 - worldX * scale,
    y: viewH / 2 - worldY * scale,
  };
}

/**
 * Pick scale/pan so ~TARGET_INITIAL_VISIBLE bubbles are on screen, centered on focus.
 */
export function computeScaleForVisibleCount(
  styles: BubbleStyle[],
  viewW: number,
  viewH: number,
  focusX: number,
  focusY: number,
  targetVisible: number,
  minScale: number,
): { scale: number; pan: { x: number; y: number } } {
  const target = Math.min(targetVisible, styles.length);

  if (target <= 0 || styles.length === 0) {
    return { scale: 1, pan: { x: 0, y: 0 } };
  }

  let lo = minScale;
  let hi = MAX_INITIAL_SCALE;
  let best = {
    scale: lo,
    pan: panToWorldCenter(viewW, viewH, focusX, focusY, lo),
  };

  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    const pan = panToWorldCenter(viewW, viewH, focusX, focusY, mid);
    const visible = countVisibleBubbles(styles, viewW, viewH, mid, pan);
    best = { scale: mid, pan };

    if (visible > target) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return best;
}
