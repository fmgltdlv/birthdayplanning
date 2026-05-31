-- Birthday planner plans (JSON document per plan)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  secret TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_plans_updated_at ON plans (updated_at);
