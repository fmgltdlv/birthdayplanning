import type { CapsuleEntry } from '../types';
import { mediaUrl } from '../api/capsuleApi';
import { bubbleStyleFor, notePreview } from '../utils/bubbleLayout';

interface BubbleFieldProps {
  entries: CapsuleEntry[];
  onSelect: (entry: CapsuleEntry) => void;
}

export function BubbleField({ entries, onSelect }: BubbleFieldProps) {
  if (entries.length === 0) {
    return (
      <p className="bubble-empty">
        No memories match your filters. Try clearing search or changing the type filter.
      </p>
    );
  }

  return (
    <div className="bubble-field" aria-label="Memory bubbles">
      {entries.map((entry, index) => {
        const style = bubbleStyleFor(entry, index);
        const isPhoto = entry.type === 'photo' && entry.hasMedia;

        return (
          <button
            key={entry.id}
            type="button"
            className={`bubble ${entry.type === 'photo' ? 'bubble-photo' : 'bubble-note'}`}
            style={{
              left: `${style.left}%`,
              top: `${style.top}%`,
              width: style.size,
              height: style.size,
              animationDelay: `${style.delay}s`,
              animationDuration: `${style.duration}s`,
            }}
            onClick={() => onSelect(entry)}
            title={entry.authorName ?? 'Anonymous'}
          >
            {isPhoto && (
              <img
                src={mediaUrl(entry.id)}
                alt=""
                className="bubble-img"
                loading="lazy"
              />
            )}
            <span className="bubble-inner">
              {!isPhoto && (
                <span className="bubble-note-text">{notePreview(entry.body, 56)}</span>
              )}
              <span className="bubble-author">{entry.authorName ?? '?'}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
