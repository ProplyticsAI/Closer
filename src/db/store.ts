import Database from "better-sqlite3";
import { CREATE_SQL, SCHEMA_VERSION } from "./schema.js";

export function openDatabase(path: string): Database.Database {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(CREATE_SQL);

  const row = db
    .prepare("SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1")
    .get() as { version: number } | undefined;
  if (!row) {
    db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(SCHEMA_VERSION);
  } else if (row.version !== SCHEMA_VERSION) {
    throw new Error(
      `Database schema version ${row.version} != package ${SCHEMA_VERSION}. Migrate or use a new file.`
    );
  }

  return db;
}
