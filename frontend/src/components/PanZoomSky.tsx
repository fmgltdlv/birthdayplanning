import { useMemo } from 'react';
import type { CapsuleEntry } from '../types';
import { usePanZoom } from '../hooks/usePanZoom';
import { layoutBubbles } from '../utils/bubbleLayout';
import { BubbleField } from './BubbleField';

interface PanZoomSkyProps {
  entries: CapsuleEntry[];
  onSelect: (entry: CapsuleEntry) => void;
}

export function PanZoomSky({ entries, onSelect }: PanZoomSkyProps) {
  const layout = useMemo(() => layoutBubbles(entries), [entries]);
  const { viewportRef, overview, transform, handlers } = usePanZoom({
    worldWidth: layout.worldWidth,
    worldHeight: layout.worldHeight,
    styles: layout.styles,
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
          width: layout.worldWidth,
          height: layout.worldHeight,
          transform,
          transformOrigin: '0 0',
        }}
      >
        <BubbleField
          entries={entries}
          layouts={layout.styles}
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
