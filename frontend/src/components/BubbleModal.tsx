import { useEffect } from 'react';
import type { CapsuleEntry } from '../types';
import { mediaUrl } from '../api/capsuleApi';

interface BubbleModalProps {
  entry: CapsuleEntry | null;
  onClose: () => void;
}

function formatWhen(ts: number): string {
  return new Date(ts * 1000).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

export function BubbleModal({ entry, onClose }: BubbleModalProps) {
  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [entry, onClose]);

  if (!entry) return null;

  const author = entry.authorName ?? 'Anonymous';

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <article
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <header className="modal-header">
          <span className="modal-type">
            {entry.type === 'photo' ? '📷 Photo' : '✉️ Note'}
          </span>
          <h2 id="modal-title">{author}</h2>
          <time dateTime={new Date(entry.createdAt * 1000).toISOString()}>
            {formatWhen(entry.createdAt)}
          </time>
        </header>

        {entry.type === 'photo' && entry.hasMedia && (
          <img
            src={mediaUrl(entry.id, 'full')}
            alt={entry.body ?? 'Capsule photo'}
            className="modal-photo"
          />
        )}

        {entry.body && <p className="modal-body">{entry.body}</p>}
      </article>
    </div>
  );
}
