import type { CapsuleEntry } from '../types';
import { mediaUrl } from '../api/capsuleApi';
import { notePreview, overviewDotSize, type BubbleStyle } from '../utils/bubbleLayout';

interface BubbleFieldProps {
  entries: CapsuleEntry[];
  layouts: BubbleStyle[];
  overview: boolean;
  onSelect: (entry: CapsuleEntry) => void;
}

export function BubbleField({
  entries,
  layouts,
  overview,
  onSelect,
}: BubbleFieldProps) {
  const dot = overviewDotSize();

  return (
    <div className="bubble-field" aria-label="Memory bubbles">
      {entries.map((entry, index) => {
        const style = layouts[index]!;
        const isPhoto = entry.type === 'photo' && entry.hasMedia;
        const size = overview ? dot : style.size;
        const centerOffset = overview ? (style.size - dot) / 2 : 0;

        return (
          <button
            key={entry.id}
            type="button"
            className={`bubble ${entry.type === 'photo' ? 'bubble-photo' : 'bubble-note'}${overview ? ' bubble-overview' : ''}`}
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
