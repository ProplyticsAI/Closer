import type Database from "better-sqlite3";
import type { CloaserAgentRecord } from "../types.js";

function rowToAgent(row: {
  id: string;
  name: string;
  persona_prompt: string;
  learned_context_json: string;
  created_at: string;
  updated_at: string;
}): CloaserAgentRecord {
  return {
    id: row.id,
    name: row.name,
    personaPrompt: row.persona_prompt,
    learnedContextJson: row.learned_context_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class AgentRepository {
  constructor(private readonly db: Database.Database) {}

  getById(id: string): CloaserAgentRecord | undefined {
    const row = this.db
      .prepare(
        `SELECT id, name, persona_prompt, learned_context_json, created_at, updated_at
         FROM agents WHERE id = ?`
      )
      .get(id) as Parameters<typeof rowToAgent>[0] | undefined;
    return row ? rowToAgent(row) : undefined;
  }

  upsert(agent: CloaserAgentRecord): void {
    this.db
      .prepare(
        `INSERT INTO agents (id, name, persona_prompt, learned_context_json, created_at, updated_at)
         VALUES (@id, @name, @persona_prompt, @learned_context_json, @created_at, @updated_at)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           persona_prompt = excluded.persona_prompt,
           learned_context_json = excluded.learned_context_json,
           updated_at = excluded.updated_at`
      )
      .run({
        id: agent.id,
        name: agent.name,
        persona_prompt: agent.personaPrompt,
        learned_context_json: agent.learnedContextJson,
        created_at: agent.createdAt,
        updated_at: agent.updatedAt,
      });
  }

  updateLearnedContext(id: string, learnedContextJson: string, updatedAt: string): void {
    this.db
      .prepare(`UPDATE agents SET learned_context_json = ?, updated_at = ? WHERE id = ?`)
      .run(learnedContextJson, updatedAt, id);
  }
}
