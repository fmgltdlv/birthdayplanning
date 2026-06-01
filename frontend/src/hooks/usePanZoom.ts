import { useCallback, useEffect, useRef, useState } from 'react';
import { fitAllScale, layoutBounds, type BubbleStyle } from '../utils/bubbleLayout';

const MAX_SCALE = 2.5;
const OVERVIEW_THRESHOLD = 0.55;

export function isOverviewZoom(scale: number, minScale: number): boolean {
  const range = 1 - minScale;
  if (range <= 0.08) return scale <= minScale + 0.02;
  const t = (scale - minScale) / range;
  return t < OVERVIEW_THRESHOLD;
}

function clampPan(
  panX: number,
  panY: number,
  scale: number,
  viewW: number,
  viewH: number,
  worldW: number,
  worldH: number,
): { x: number; y: number } {
  const scaledW = worldW * scale;
  const scaledH = worldH * scale;
  const slack = 80;

  let minX: number;
  let maxX: number;
  if (scaledW <= viewW) {
    minX = maxX = (viewW - scaledW) / 2;
  } else {
    minX = viewW - scaledW - slack;
    maxX = slack;
  }

  let minY: number;
  let maxY: number;
  if (scaledH <= viewH) {
    minY = maxY = (viewH - scaledH) / 2;
  } else {
    minY = viewH - scaledH - slack;
    maxY = slack;
  }

  return {
    x: Math.min(maxX, Math.max(minX, panX)),
    y: Math.min(maxY, Math.max(minY, panY)),
  };
}

export function computeInitialTransform(
  viewW: number,
  viewH: number,
  worldW: number,
  worldH: number,
  styles: BubbleStyle[],
): { scale: number; pan: { x: number; y: number } } {
  const bounds = layoutBounds(styles);
  const fit = fitAllScale(viewW, viewH, bounds);
  const scale = Math.min(1, fit * 1.15);
  const scaledW = worldW * scale;
  const scaledH = worldH * scale;
  const x = (viewW - scaledW) / 2;
  const y = (viewH - scaledH) / 2;
  const pan = clampPan(x, y, scale, viewW, viewH, worldW, worldH);
  return { scale, pan };
}

interface UsePanZoomOptions {
  worldWidth: number;
  worldHeight: number;
  styles: BubbleStyle[];
}

export function usePanZoom({
  worldWidth,
  worldHeight,
  styles,
}: UsePanZoomOptions) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const needsInitialRef = useRef(true);
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const pinchRef = useRef<{
    startDist: number;
    startScale: number;
    startPan: { x: number; y: number };
    centerX: number;
    centerY: number;
    worldX: number;
    worldY: number;
  } | null>(null);

  const bounds = layoutBounds(styles);
  const minScale =
    viewSize.w > 0 && viewSize.h > 0
      ? fitAllScale(viewSize.w, viewSize.h, bounds)
      : 0.35;

  const overview = isOverviewZoom(scale, minScale);

  const applyPan = useCallback(
    (x: number, y: number, s: number) => {
      if (viewSize.w <= 0 || viewSize.h <= 0) {
        setPan({ x, y });
        return;
      }
      const c = clampPan(x, y, s, viewSize.w, viewSize.h, worldWidth, worldHeight);
      setPan(c);
    },
    [viewSize, worldWidth, worldHeight],
  );

  const zoomAt = useCallback(
    (clientX: number, clientY: number, nextScale: number) => {
      const el = viewportRef.current;
      if (!el || viewSize.w <= 0) return;
      const rect = el.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const clamped = Math.min(MAX_SCALE, Math.max(minScale, nextScale));
      const wx = (mx - pan.x) / scale;
      const wy = (my - pan.y) / scale;
      const nx = mx - wx * clamped;
      const ny = my - wy * clamped;
      setScale(clamped);
      applyPan(nx, ny, clamped);
    },
    [pan, scale, minScale, viewSize, applyPan],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setViewSize({ w, h });

      if (needsInitialRef.current && w > 0 && h > 0) {
        needsInitialRef.current = false;
        const { scale: s, pan: p } = computeInitialTransform(
          w,
          h,
          worldWidth,
          worldHeight,
          styles,
        );
        setScale(s);
        setPan(p);
      }
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [worldWidth, worldHeight, styles]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      zoomAt(e.clientX, e.clientY, scale * factor);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scale, zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('.bubble')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && e.isPrimary === false) return;

    if (pinchRef.current && e.pointerType === 'touch') {
      return;
    }

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    applyPan(drag.panX + dx, drag.panY + dy, scale);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    const el = viewportRef.current;
    if (!el) return;
    const [a, b] = [e.touches[0]!, e.touches[1]!];
    const rect = el.getBoundingClientRect();
    const cx = (a.clientX + b.clientX) / 2 - rect.left;
    const cy = (a.clientY + b.clientY) / 2 - rect.top;
    const dist = Math.hypot(
      a.clientX - b.clientX,
      a.clientY - b.clientY,
    );
    pinchRef.current = {
      startDist: dist,
      startScale: scale,
      startPan: { ...pan },
      centerX: cx,
      centerY: cy,
      worldX: (cx - pan.x) / scale,
      worldY: (cy - pan.y) / scale,
    };
    dragRef.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !pinchRef.current) return;
    e.preventDefault();
    const [a, b] = [e.touches[0]!, e.touches[1]!];
    const dist = Math.hypot(
      a.clientX - b.clientX,
      a.clientY - b.clientY,
    );
    const p = pinchRef.current;
    const nextScale = Math.min(
      MAX_SCALE,
      Math.max(minScale, p.startScale * (dist / p.startDist)),
    );
    const nx = p.centerX - p.worldX * nextScale;
    const ny = p.centerY - p.worldY * nextScale;
    setScale(nextScale);
    applyPan(nx, ny, nextScale);
  };

  const onTouchEnd = () => {
    pinchRef.current = null;
  };

  return {
    viewportRef,
    pan,
    scale,
    minScale,
    overview,
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
