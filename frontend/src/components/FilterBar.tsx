import type { FilterState, SortKey, TypeFilter } from '../utils/filterEntries';

interface FilterBarProps {
  filter: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  resultCount: number;
  totalCount: number;
  onRefresh: () => void;
  embedded?: boolean;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'author', label: 'By name' },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'note', label: 'Notes' },
  { value: 'photo', label: 'Photos' },
];

export function FilterBar({
  filter,
  onChange,
  resultCount,
  totalCount,
  onRefresh,
  embedded = false,
}: FilterBarProps) {
  return (
    <section
      className={embedded ? 'filter-bar filter-bar-embedded' : 'filter-bar'}
      aria-label="Search and filter"
    >
      <div className="filter-top">
        <input
          type="search"
          className="filter-search"
          placeholder="Search name or message…"
          value={filter.query}
          onChange={(e) => onChange({ query: e.target.value })}
        />
        <button type="button" className="btn-icon" onClick={onRefresh} aria-label="Refresh">
          ↻
        </button>
      </div>

      <div className="filter-row">
        <div className="filter-chips" role="group" aria-label="Type">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={filter.type === opt.value ? 'chip active' : 'chip'}
              onClick={() => onChange({ type: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label className="filter-sort">
          <span className="sr-only">Sort</span>
          <select
            value={filter.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
            aria-label="Sort order"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="filter-count">
        {resultCount} of {totalCount} memories
      </p>
    </section>
  );
}
