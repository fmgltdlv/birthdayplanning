import type { CapsuleEntry } from '../types';

export type TypeFilter = 'all' | 'note' | 'photo';
export type SortKey = 'newest' | 'oldest' | 'author';

export interface FilterState {
  query: string;
  type: TypeFilter;
  sort: SortKey;
}

export function filterAndSortEntries(
  entries: CapsuleEntry[],
  { query, type, sort }: FilterState,
): CapsuleEntry[] {
  const q = query.trim().toLowerCase();

  let list = entries.filter((e) => {
    if (type !== 'all' && e.type !== type) return false;
    if (!q) return true;
    const author = (e.authorName ?? '').toLowerCase();
    const body = (e.body ?? '').toLowerCase();
    return author.includes(q) || body.includes(q);
  });

  list = [...list].sort((a, b) => {
    if (sort === 'author') {
      const aa = (a.authorName ?? 'Anonymous').toLowerCase();
      const bb = (b.authorName ?? 'Anonymous').toLowerCase();
      if (aa !== bb) return aa.localeCompare(bb);
      return b.createdAt - a.createdAt;
    }
    if (sort === 'oldest') return a.createdAt - b.createdAt;
    return b.createdAt - a.createdAt;
  });

  return list;
}
