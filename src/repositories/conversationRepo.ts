import type Database from "better-sqlite3";
import type { ConversationMessage, MessageRole } from "../types.js";

export interface ConversationRecord {
  id: string;
  agentId: string;
  title: string | null;
  startedAt: string;
  updatedAt: string;
}

export class ConversationRepository {
  constructor(private readonly db: Database.Database) {}

  create(conversation: ConversationRecord): void {
    this.db
      .prepare(
        `INSERT INTO conversations (id, agent_id, title, started_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        conversation.id,
        conversation.agentId,
        conversation.title,
        conversation.startedAt,
        conversation.updatedAt
      );
  }

  appendMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    createdAt: string
  ): void {
    this.db
      .prepare(
        `INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)`
      )
      .run(conversationId, role, content, createdAt);
    this.db
      .prepare(`UPDATE conversations SET updated_at = ? WHERE id = ?`)
      .run(createdAt, conversationId);
  }

  listMessages(conversationId: string, limit = 500): ConversationMessage[] {
    const rows = this.db
      .prepare(
        `SELECT role, content, created_at FROM messages
         WHERE conversation_id = ?
         ORDER BY id ASC
         LIMIT ?`
      )
      .all(conversationId, limit) as { role: MessageRole; content: string; created_at: string }[];
    return rows.map((r) => ({
      role: r.role,
      content: r.content,
      createdAt: r.created_at,
    }));
  }

  listRecentConversations(agentId: string, limit = 20): ConversationRecord[] {
    const rows = this.db
      .prepare(
        `SELECT id, agent_id, title, started_at, updated_at FROM conversations
         WHERE agent_id = ?
         ORDER BY updated_at DESC
         LIMIT ?`
      )
      .all(agentId, limit) as {
      id: string;
      agent_id: string;
      title: string | null;
      started_at: string;
      updated_at: string;
    }[];
    return rows.map((r) => ({
      id: r.id,
      agentId: r.agent_id,
      title: r.title,
      startedAt: r.started_at,
      updatedAt: r.updated_at,
    }));
  }
}
