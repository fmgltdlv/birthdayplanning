import { useCallback, useEffect, useState } from 'react';
import { fetchEntries } from './api/capsuleApi';
import { EntryCard } from './components/EntryCard';
import { UploadPanel } from './components/UploadPanel';
import type { CapsuleEntry } from './types';

const AUTHOR_KEY = 'capsule-author-name';

function loadAuthor(): string {
  return localStorage.getItem(AUTHOR_KEY) ?? '';
}

export default function App() {
  const [entries, setEntries] = useState<CapsuleEntry[]>([]);
  const [authorName, setAuthorName] = useState(loadAuthor);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const list = await fetchEntries();
      setEntries(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchEntries();
        if (!cancelled) {
          setEntries(list);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load entries');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(AUTHOR_KEY, authorName);
  }, [authorName]);

  const onPosted = (entry: CapsuleEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">Booty Bear</p>
        <h1>Time Capsule</h1>
        <p className="tagline">Notes and memories, sealed for the future</p>
      </header>

      <section className="author-bar">
        <label>
          <span>Your name (optional)</span>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Who is leaving this?"
          />
        </label>
      </section>

      <UploadPanel authorName={authorName} onPosted={onPosted} />

      <section className="feed">
        <div className="feed-header">
          <h2>Inside the capsule</h2>
          <button type="button" className="btn-refresh" onClick={() => void refresh()}>
            Refresh
          </button>
        </div>

        {loading && <p className="status">Opening the capsule…</p>}
        {error && (
          <p className="status error">
            {error}
            <br />
            <small>
              Run migration <code>0002_time_capsule.sql</code> on D1 and redeploy the Worker
              with the R2 binding.
            </small>
          </p>
        )}
        {!loading && !error && entries.length === 0 && (
          <p className="status empty">Nothing here yet — be the first to add a note or photo.</p>
        )}
        <div className="entry-list">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>Open capsule · Anyone with the link can contribute</p>
      </footer>
    </div>
  );
}
