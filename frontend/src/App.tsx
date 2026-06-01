import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchEntries } from './api/capsuleApi';
import { BubbleField } from './components/BubbleField';
import { BubbleModal } from './components/BubbleModal';
import { EntryList } from './components/EntryList';
import { FilterBar } from './components/FilterBar';
import { UploadPanel } from './components/UploadPanel';
import type { CapsuleEntry } from './types';
import {
  filterAndSortEntries,
  type FilterState,
} from './utils/filterEntries';

const AUTHOR_KEY = 'capsule-author-name';

function loadAuthor(): string {
  return localStorage.getItem(AUTHOR_KEY) ?? '';
}

export default function App() {
  const [entries, setEntries] = useState<CapsuleEntry[]>([]);
  const [authorName, setAuthorName] = useState(loadAuthor);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CapsuleEntry | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    query: '',
    type: 'all',
    sort: 'newest',
  });

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

  const filtered = useMemo(
    () => filterAndSortEntries(entries, filter),
    [entries, filter],
  );

  const onPosted = (entry: CapsuleEntry) => {
    setEntries((prev) => {
      if (prev.some((e) => e.id === entry.id)) return prev;
      return [entry, ...prev];
    });
  };

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">Booty Bear</p>
        <h1>Time Capsule</h1>
        <p className="tagline">Floating memories · tap a bubble to open</p>
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
        <button type="button" className="btn-refresh" onClick={() => void refresh()}>
          Refresh
        </button>
      </section>

      <FilterBar
        filter={filter}
        onChange={(patch) => setFilter((f) => ({ ...f, ...patch }))}
        resultCount={filtered.length}
        totalCount={entries.length}
      />

      <main className="capsule-main">
        {loading && <p className="status">Opening the capsule…</p>}
        {error && <p className="status error">{error}</p>}
        {!loading && !error && entries.length === 0 && (
          <p className="status empty">
            The capsule is empty — tap + to add the first note or photo.
          </p>
        )}
        {!loading && !error && entries.length > 0 && (
          <>
            <BubbleField entries={filtered} onSelect={setSelected} />
            <EntryList entries={filtered} onSelect={setSelected} />
          </>
        )}
      </main>

      <UploadPanel
        authorName={authorName}
        onPosted={onPosted}
        collapsed={!uploadOpen}
        onToggle={() => setUploadOpen((o) => !o)}
      />

      {uploadOpen && (
        <div
          className="upload-scrim"
          onClick={() => setUploadOpen(false)}
          role="presentation"
        />
      )}

      <BubbleModal entry={selected} onClose={() => setSelected(null)} />

      <footer className="footer">
        <p>Open capsule · Photos compressed on your device before upload</p>
      </footer>
    </div>
  );
}
