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

export default function App() {
  const [entries, setEntries] = useState<CapsuleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CapsuleEntry | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
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

  const showBubbles = !loading && !error && filtered.length > 0;

  return (
    <div className="app">
      <div className="sky" aria-hidden>
        {showBubbles && (
          <BubbleField entries={filtered} onSelect={setSelected} />
        )}
      </div>

      <div className="ui-layer">
        <header className="header">
          <p className="eyebrow">Booty Bear</p>
          <h1>Time Capsule</h1>
          <p className="tagline">Memories floating all around · tap a bubble</p>
        </header>

        <FilterBar
          filter={filter}
          onChange={(patch) => setFilter((f) => ({ ...f, ...patch }))}
          resultCount={filtered.length}
          totalCount={entries.length}
          onRefresh={() => void refresh()}
        />

        {loading && (
          <p className="status-banner">Opening the capsule…</p>
        )}
        {error && <p className="status-banner error">{error}</p>}
        {!loading && !error && entries.length === 0 && (
          <p className="status-banner empty">
            The sky is empty — tap <strong>+</strong> to leave the first memory.
          </p>
        )}
        {!loading && !error && entries.length > 0 && filtered.length === 0 && (
          <p className="status-banner empty">
            No bubbles match — try another search or filter.
          </p>
        )}

        {filtered.length > 0 && (
          <button
            type="button"
            className="btn-browse-toggle"
            onClick={() => setListOpen((o) => !o)}
          >
            {listOpen ? 'Hide list' : 'Browse list'}
          </button>
        )}

        {listOpen && filtered.length > 0 && (
          <EntryList entries={filtered} onSelect={setSelected} />
        )}
      </div>

      <UploadPanel
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
    </div>
  );
}
