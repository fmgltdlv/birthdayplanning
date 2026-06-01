import { EntryList } from './EntryList';
import { FilterBar } from './FilterBar';
import type { CapsuleEntry } from '../types';
import type { FilterState } from '../utils/filterEntries';

interface ExplorePanelProps {
  filter: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  entries: CapsuleEntry[];
  filtered: CapsuleEntry[];
  onSelect: (entry: CapsuleEntry) => void;
  onRefresh: () => void;
  onClose: () => void;
}

export function ExplorePanel({
  filter,
  onChange,
  entries,
  filtered,
  onSelect,
  onRefresh,
  onClose,
}: ExplorePanelProps) {
  return (
    <section className="explore-panel">
      <div className="explore-panel-head">
        <h2>Search & browse</h2>
        <button type="button" className="btn-close-panel" onClick={onClose}>
          Close
        </button>
      </div>

      <FilterBar
        filter={filter}
        onChange={onChange}
        resultCount={filtered.length}
        totalCount={entries.length}
        onRefresh={onRefresh}
        embedded
      />

      {filtered.length > 0 ? (
        <EntryList entries={filtered} onSelect={onSelect} />
      ) : (
        <p className="explore-empty">No memories match these filters.</p>
      )}
    </section>
  );
}
