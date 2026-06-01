import type { FilterState, SortKey, TypeFilter } from '../utils/filterEntries';

interface FilterBarProps {
  filter: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  resultCount: number;
  totalCount: number;
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
}: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="Search and filter">
      <input
        type="search"
        className="filter-search"
        placeholder="Search by name or message…"
        value={filter.query}
        onChange={(e) => onChange({ query: e.target.value })}
      />

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
          <span>Sort</span>
          <select
            value={filter.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
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
        Showing {resultCount} of {totalCount}
      </p>
    </section>
  );
}
