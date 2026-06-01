import type { CapsuleEntry } from '../types';

interface EntryListProps {
  entries: CapsuleEntry[];
  onSelect: (entry: CapsuleEntry) => void;
}

function formatWhen(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function EntryList({ entries, onSelect }: EntryListProps) {
  if (entries.length === 0) return null;

  return (
    <section className="entry-list-panel" aria-label="Quick browse list">
      <h2 className="list-heading">Quick browse</h2>
      <ul className="entry-quick-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="entry-quick-row"
              onClick={() => onSelect(entry)}
            >
              <span className={`row-type row-type-${entry.type}`}>
                {entry.type === 'photo' ? 'Photo' : 'Note'}
              </span>
              <span className="row-author">{entry.authorName ?? 'Anonymous'}</span>
              <span className="row-preview">
                {entry.type === 'note'
                  ? (entry.body ?? '').slice(0, 40) || '—'
                  : entry.body?.slice(0, 40) || 'Image'}
              </span>
              <span className="row-date">{formatWhen(entry.createdAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
