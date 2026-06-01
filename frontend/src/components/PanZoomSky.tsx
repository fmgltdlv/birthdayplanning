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
  layouts: ReturnType<typeof layoutBubbles>['styles'];
  onSelect: (entry: CapsuleEntry) => void;
}

function PanZoomController({
  entries,
  worldWidth,
  worldHeight,
  layouts,
  onSelect,
}: PanZoomControllerProps) {
  const { viewportRef, overview, transform, handlers } = usePanZoom({
    worldWidth,
    worldHeight,
    styles: layouts,
  });

  return (
    <div
      ref={viewportRef}
      className="pan-zoom-viewport"
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
          onSelect={onSelect}
        />
      </div>
      {overview && entries.length > 0 && (
        <p className="overview-hint" aria-live="polite">
          Overview · {entries.length} memories — zoom in to explore
        </p>
      )}
    </div>
  );
}

export function PanZoomSky({ entries, onSelect }: PanZoomSkyProps) {
  const layout = useMemo(() => layoutBubbles(entries), [entries]);
  const layoutKey = `${layout.worldWidth}-${layout.worldHeight}-${layout.styles.length}`;

  return (
    <PanZoomController
      key={layoutKey}
      entries={entries}
      worldWidth={layout.worldWidth}
      worldHeight={layout.worldHeight}
      layouts={layout.styles}
      onSelect={onSelect}
    />
  );
}
