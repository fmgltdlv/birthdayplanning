import { useMemo } from 'react';
import type { CapsuleEntry } from '../types';
import { usePanZoom } from '../hooks/usePanZoom';
import { layoutBubbles } from '../utils/bubbleLayout';
import { BubbleField } from './BubbleField';

interface PanZoomSkyProps {
  entries: CapsuleEntry[];
  onSelect: (entry: CapsuleEntry) => void;
}

interface PanZoomControllerProps {
  entries: CapsuleEntry[];
  worldWidth: number;
  worldHeight: number;
  focusX: number;
  focusY: number;
  layouts: ReturnType<typeof layoutBubbles>['styles'];
  onSelect: (entry: CapsuleEntry) => void;
}

function PanZoomController({
  entries,
  worldWidth,
  worldHeight,
  focusX,
  focusY,
  layouts,
  onSelect,
}: PanZoomControllerProps) {
  const {
    viewportRef,
    pan,
    scale,
    viewSize,
    visibleCount,
    overview,
    transform,
    handlers,
  } = usePanZoom({
    worldWidth,
    worldHeight,
    focusX,
    focusY,
    styles: layouts,
  });

  return (
    <div
      ref={viewportRef}
      className={`pan-zoom-viewport${overview ? ' pan-zoom-viewport--overview' : ''}`}
      aria-label="Memory sky — drag to pan, scroll or pinch to zoom"
      {...handlers}
    >
      <div
        className="pan-zoom-world"
        style={{
          width: worldWidth,
          height: worldHeight,
          transform,
          transformOrigin: '0 0',
        }}
      >
        <BubbleField
          entries={entries}
          layouts={layouts}
          overview={overview}
          viewW={viewSize.w}
          viewH={viewSize.h}
          scale={scale}
          pan={pan}
          onSelect={onSelect}
        />
      </div>
      {overview && entries.length > 0 && (
        <div className="count-focus" aria-live="polite">
          <p className="count-focus-total">
            <span className="count-focus-number">
              {entries.length.toLocaleString()}
            </span>
            <span className="count-focus-label">memories in the sky</span>
          </p>
          <p className="count-focus-detail">
            ~{visibleCount.toLocaleString()} in view · zoom in to read one
          </p>
        </div>
      )}
    </div>
  );
}

export function PanZoomSky({ entries, onSelect }: PanZoomSkyProps) {
  const layout = useMemo(() => layoutBubbles(entries), [entries]);
  const layoutKey = `${layout.worldWidth}-${layout.worldHeight}-${layout.styles.length}-${entries[0]?.id ?? ''}`;

  return (
    <PanZoomController
      key={layoutKey}
      entries={entries}
      worldWidth={layout.worldWidth}
      worldHeight={layout.worldHeight}
      focusX={layout.focusX}
      focusY={layout.focusY}
      layouts={layout.styles}
      onSelect={onSelect}
    />
  );
}
