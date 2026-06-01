export interface EntryRow {
  id: string;
  type: 'note' | 'photo';
  author_name: string | null;
  body: string | null;
  r2_key: string | null;
  r2_key_thumb: string | null;
  mime_type: string | null;
  created_at: number;
}

export interface Entry {
  id: string;
  type: 'note' | 'photo';
  authorName: string | null;
  body: string | null;
  mimeType: string | null;
  createdAt: number;
  hasMedia: boolean;
  hasThumb: boolean;
}

const SELECT_COLS = `id, type, author_name, body, r2_key, r2_key_thumb, mime_type, created_at`;

export function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    type: row.type,
    authorName: row.author_name,
    body: row.body,
    mimeType: row.mime_type,
    createdAt: row.created_at,
    hasMedia: row.type === 'photo' && !!row.r2_key,
    hasThumb: row.type === 'photo' && !!row.r2_key_thumb,
  };
}

export async function listEntries(db: D1Database, limit = 100): Promise<Entry[]> {
  const { results } = await db
    .prepare(
      `SELECT ${SELECT_COLS}
       FROM entries
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<EntryRow>();

  return (results ?? []).map(rowToEntry);
}

export async function getEntry(db: D1Database, id: string): Promise<EntryRow | null> {
  return db
    .prepare(`SELECT ${SELECT_COLS} FROM entries WHERE id = ?`)
    .bind(id)
    .first<EntryRow>();
}

export async function insertNote(
  db: D1Database,
  id: string,
  authorName: string | null,
  body: string,
): Promise<Entry> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO entries (id, type, author_name, body, created_at)
       VALUES (?, 'note', ?, ?, ?)`,
    )
    .bind(id, authorName, body, now)
    .run();

  return {
    id,
    type: 'note',
    authorName,
    body,
    mimeType: null,
    createdAt: now,
    hasMedia: false,
    hasThumb: false,
  };
}

export async function insertPhoto(
  db: D1Database,
  id: string,
  authorName: string | null,
  body: string | null,
  r2Key: string,
  r2KeyThumb: string | null,
  mimeType: string,
): Promise<Entry> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO entries (id, type, author_name, body, r2_key, r2_key_thumb, mime_type, created_at)
       VALUES (?, 'photo', ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, authorName, body, r2Key, r2KeyThumb, mimeType, now)
    .run();

  return {
    id,
    type: 'photo',
    authorName,
    body,
    mimeType,
    createdAt: now,
    hasMedia: true,
    hasThumb: !!r2KeyThumb,
  };
}
