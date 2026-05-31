import type { CapsuleEntry } from '../types';
import { mediaUrl } from '../api/capsuleApi';

interface EntryCardProps {
  entry: CapsuleEntry;
}

function formatWhen(ts: number): string {
  return new Date(ts * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function EntryCard({ entry }: EntryCardProps) {
  const byline = entry.authorName ? `— ${entry.authorName}` : null;

  return (
    <article className={`entry entry-${entry.type}`}>
      <header className="entry-meta">
        <span className="entry-type">{entry.type === 'photo' ? '📷 Memory' : '✉️ Note'}</span>
        <time dateTime={new Date(entry.createdAt * 1000).toISOString()}>
          {formatWhen(entry.createdAt)}
        </time>
      </header>

      {entry.type === 'photo' && entry.hasMedia && (
        <div className="entry-photo-wrap">
          <img
            src={mediaUrl(entry.id)}
            alt={entry.body ?? 'Capsule photo'}
            loading="lazy"
            className="entry-photo"
          />
        </div>
      )}

      {entry.body && (
        <p className="entry-body">
          {entry.body}
          {byline && <span className="entry-author">{byline}</span>}
        </p>
      )}

      {!entry.body && byline && <p className="entry-author-only">{byline}</p>}
    </article>
  );
}
