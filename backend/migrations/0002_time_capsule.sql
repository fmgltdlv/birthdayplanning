-- Time capsule entries (notes and photo metadata; files live in R2)
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('note', 'photo')),
  author_name TEXT,
  body TEXT,
  r2_key TEXT,
  mime_type TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries (created_at DESC);
