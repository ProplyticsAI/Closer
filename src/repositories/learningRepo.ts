import type Database from "better-sqlite3";

export interface LearningRecord {
  id: number;
  agentId: string;
  sourceConversationId: string | null;
  category: string;
  content: string;
  weight: number;
  createdAt: string;
}

export class LearningRepository {
  constructor(private readonly db: Database.Database) {}

  insert(record: Omit<LearningRecord, "id">): number {
    const info = this.db
      .prepare(
        `INSERT INTO learnings (agent_id, source_conversation_id, category, content, weight, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        record.agentId,
        record.sourceConversationId,
        record.category,
        record.content,
        record.weight,
        record.createdAt
      );
    return Number(info.lastInsertRowid);
  }

  listForAgent(agentId: string, limit = 200): LearningRecord[] {
    const rows = this.db
      .prepare(
        `SELECT id, agent_id, source_conversation_id, category, content, weight, created_at
         FROM learnings WHERE agent_id = ? ORDER BY weight DESC, created_at DESC LIMIT ?`
      )
      .all(agentId, limit) as {
      id: number;
      agent_id: string;
      source_conversation_id: string | null;
      category: string;
      content: string;
      weight: number;
      created_at: string;
    }[];
    return rows.map((r) => ({
      id: r.id,
      agentId: r.agent_id,
      sourceConversationId: r.source_conversation_id,
      category: r.category,
      content: r.content,
      weight: r.weight,
      createdAt: r.created_at,
    }));
  }
}
