/** SQLite DDL for Cloaser + conversation learning. Versioned for future migrations. */
export const SCHEMA_VERSION = 1;

export const CREATE_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  persona_prompt TEXT NOT NULL DEFAULT '',
  learned_context_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT,
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  source_conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, id);
CREATE INDEX IF NOT EXISTS idx_learnings_agent ON learnings(agent_id, created_at);
`;
