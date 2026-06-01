export interface CommentRow {
  id: string;
  entry_id: string;
  author_name: string;
  body: string;
  created_at: number;
}

export interface Comment {
  id: string;
  entryId: string;
  authorName: string;
  body: string;
  createdAt: number;
}

function rowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    entryId: row.entry_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function listCommentsForEntry(
  db: D1Database,
  entryId: string,
): Promise<Comment[]> {
  const { results } = await db
    .prepare(
      `SELECT id, entry_id, author_name, body, created_at
       FROM comments
       WHERE entry_id = ?
       ORDER BY created_at ASC`,
    )
    .bind(entryId)
    .all<CommentRow>();

  return (results ?? []).map(rowToComment);
}

export async function insertComment(
  db: D1Database,
  id: string,
  entryId: string,
  authorName: string,
  body: string,
): Promise<Comment> {
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `INSERT INTO comments (id, entry_id, author_name, body, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, entryId, authorName, body, now)
    .run();

  return {
    id,
    entryId,
    authorName,
    body,
    createdAt: now,
  };
}
