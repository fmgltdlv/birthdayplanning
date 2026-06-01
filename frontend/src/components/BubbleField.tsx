import { useMemo } from 'react';
import type { CapsuleEntry } from '../types';
import { mediaUrl } from '../api/capsuleApi';
import {
  bubbleHueClass,
  notePreview,
  overviewDotSize,
  type BubbleStyle,
} from '../utils/bubbleLayout';
import { visibleBubbleIndices } from '../utils/viewportBubbles';

interface BubbleFieldProps {
  entries: CapsuleEntry[];
  layouts: BubbleStyle[];
  overview: boolean;
  viewW: number;
  viewH: number;
  scale: number;
  pan: { x: number; y: number };
  onSelect: (entry: CapsuleEntry) => void;
}

export function BubbleField({
  entries,
  layouts,
  overview,
  viewW,
  viewH,
  scale,
  pan,
  onSelect,
}: BubbleFieldProps) {
  const dot = overviewDotSize();

  const indices = useMemo(() => {
    if (viewW <= 0 || viewH <= 0) {
      return entries.map((_, i) => i);
    }
    const margin = overview ? 80 : 160;
    const visible = visibleBubbleIndices(
      layouts,
      viewW,
      viewH,
      scale,
      pan,
      margin,
    );
    return visible.length > 0 ? visible : entries.map((_, i) => i);
  }, [entries, layouts, viewW, viewH, scale, pan, overview]);

  return (
    <div className="bubble-field" aria-label="Memory bubbles">
      {indices.map((index) => {
        const entry = entries[index]!;
        const style = layouts[index]!;
        const isPhoto = entry.type === 'photo' && entry.hasMedia;
        const size = overview ? dot : style.size;
        const centerOffset = overview ? (style.size - dot) / 2 : 0;

        return (
          <button
            key={entry.id}
            type="button"
            className={`bubble ${bubbleHueClass(entry.id)} ${entry.type === 'photo' ? 'bubble-photo' : 'bubble-note'}${overview ? ' bubble-overview' : ''}`}
            style={{
              left: style.left + centerOffset,
              top: style.top + centerOffset,
              width: size,
              height: size,
              ...(overview
                ? {}
                : {
                    animationDelay: `${style.delay}s`,
                    animationDuration: `${style.duration}s`,
                  }),
            }}
            onClick={() => onSelect(entry)}
            title={
              overview
                ? `${entry.type === 'photo' ? 'Photo' : 'Note'} · ${entry.authorName ?? 'Anonymous'}`
                : (entry.authorName ?? 'Anonymous')
            }
            aria-label={
              overview
                ? `${entry.type} memory by ${entry.authorName ?? 'someone'}`
                : undefined
            }
          >
            {!overview && isPhoto && (
              <img
                src={mediaUrl(entry.id, entry.hasThumb ? 'thumb' : 'full')}
                alt=""
                className="bubble-img"
                loading="lazy"
              />
            )}
            {!overview && (
              <span className="bubble-inner">
                {!isPhoto && (
                  <span className="bubble-note-text">
                    {notePreview(entry.body, 56)}
                  </span>
                )}
                <span className="bubble-author">{entry.authorName ?? '?'}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
