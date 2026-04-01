import crypto from "node:crypto";
import type Database from "better-sqlite3";
import { openDatabase } from "./db/store.js";
import { AgentRepository } from "./repositories/agentRepo.js";
import { ConversationRepository } from "./repositories/conversationRepo.js";
import { LearningRepository } from "./repositories/learningRepo.js";
import {
  emptyLearnedContext,
  mergeLearnedContext,
  parseLearnedContext,
  serializeLearnedContext,
} from "./learnedContext.js";
import { extractLearnedDelta } from "./learning/extractFromConversation.js";
import { generateExpose } from "./expose/generateExpose.js";
import type {
  CloaserAgentRecord,
  ConversationMessage,
  ExposeResult,
  PropertyListing,
  SpeakingAgentContext,
} from "./types.js";

const DEFAULT_PERSONA = `You are an elite real estate closer: warm, precise, and trustworthy.
You present properties with vivid, honest detail. You address doubts directly and invite the next step.
You never invent facts; you highlight strengths and frame trade-offs clearly.`;

/**
 * Cloaser Agent: generates high-quality exposés and persists conversation-derived learning
 * for downstream speaking / voice agents.
 */
export class CloaserAgent {
  private readonly db: Database.Database;
  private readonly agents: AgentRepository;
  private readonly conversations: ConversationRepository;
  private readonly learnings: LearningRepository;

  constructor(dbOrPath: string | Database.Database) {
    this.db = typeof dbOrPath === "string" ? openDatabase(dbOrPath) : dbOrPath;
    this.agents = new AgentRepository(this.db);
    this.conversations = new ConversationRepository(this.db);
    this.learnings = new LearningRepository(this.db);
  }

  close(): void {
    this.db.close();
  }

  getOrCreateAgent(id: string, name: string, personaPrompt = DEFAULT_PERSONA): CloaserAgentRecord {
    const now = new Date().toISOString();
    const existing = this.agents.getById(id);
    if (existing) return existing;

    const record: CloaserAgentRecord = {
      id,
      name,
      personaPrompt,
      learnedContextJson: serializeLearnedContext(emptyLearnedContext()),
      createdAt: now,
      updatedAt: now,
    };
    this.agents.upsert(record);
    return record;
  }

  startConversation(agentId: string, title?: string): string {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    this.conversations.create({
      id,
      agentId,
      title: title ?? null,
      startedAt: now,
      updatedAt: now,
    });
    return id;
  }

  appendMessage(conversationId: string, role: ConversationMessage["role"], content: string): void {
    const now = new Date().toISOString();
    this.conversations.appendMessage(conversationId, role, content, now);
  }

  listConversationMessages(conversationId: string): ConversationMessage[] {
    return this.conversations.listMessages(conversationId);
  }

  /**
   * Generate a buyer-facing exposé; optionally uses merged learned context from the agent.
   */
  generatePropertyExpose(agentId: string, listing: PropertyListing): ExposeResult {
    const agent = this.agents.getById(agentId);
    const learned = agent ? parseLearnedContext(agent.learnedContextJson) : emptyLearnedContext();
    return generateExpose(listing, { learned });
  }

  /**
   * After a conversation, extract signals, merge into the agent profile, and store weighted learnings.
   */
  ingestConversationLearning(agentId: string, conversationId: string): CloaserAgentRecord {
    const agent = this.agents.getById(agentId);
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);

    const messages = this.conversations.listMessages(conversationId);
    const delta = extractLearnedDelta(messages);
    const base = parseLearnedContext(agent.learnedContextJson);
    const merged = mergeLearnedContext(base, delta);
    const now = new Date().toISOString();

    this.agents.updateLearnedContext(agentId, serializeLearnedContext(merged), now);

    for (const s of delta.buyerSignals ?? []) {
      this.learnings.insert({
        agentId,
        sourceConversationId: conversationId,
        category: "buyer_signal",
        content: s,
        weight: 1,
        createdAt: now,
      });
    }
    for (const s of delta.objectionsHandled ?? []) {
      this.learnings.insert({
        agentId,
        sourceConversationId: conversationId,
        category: "objection",
        content: s,
        weight: 0.9,
        createdAt: now,
      });
    }

    const updated = this.agents.getById(agentId);
    if (!updated) throw new Error("Agent missing after update");
    return updated;
  }

  /**
   * Payload for a TTS / realtime speaking agent: persona + bullets + optional latest exposé.
   */
  getSpeakingAgentContext(
    agentId: string,
    options?: { latestExposeMarkdown?: string }
  ): SpeakingAgentContext {
    const agent = this.agents.getById(agentId);
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);

    const learned = parseLearnedContext(agent.learnedContextJson);
    const briefingBullets: string[] = [
      `Persona: ${agent.personaPrompt.slice(0, 280)}${agent.personaPrompt.length > 280 ? "…" : ""}`,
      ...learned.buyerSignals.slice(0, 6).map((s) => `Buyer signal: ${s}`),
      ...learned.objectionsHandled.slice(0, 4).map((s) => `Addressed concern: ${s}`),
      ...learned.toneNotes.slice(0, 3).map((s) => `Tone: ${s}`),
    ];

    return {
      agentId: agent.id,
      agentName: agent.name,
      personaPrompt: agent.personaPrompt,
      briefingBullets,
      recentUserPreferences: learned.buyerSignals,
      latestExposeMarkdown: options?.latestExposeMarkdown,
    };
  }

  exportLearningsJson(agentId: string): string {
    const rows = this.learnings.listForAgent(agentId, 500);
    return JSON.stringify({ agentId, learnings: rows }, null, 2);
  }
}

export function createCloaserAgent(dbPath: string): CloaserAgent {
  return new CloaserAgent(dbPath);
}
