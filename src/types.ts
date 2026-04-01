/** Role in a conversation turn */
export type MessageRole = "user" | "assistant" | "system";

/** Single message for learning and speaking-agent context */
export interface ConversationMessage {
  role: MessageRole;
  content: string;
  createdAt: string;
}

/** Structured property input for exposé generation */
export interface PropertyListing {
  title: string;
  address?: string;
  city?: string;
  region?: string;
  price: string;
  currency?: string;
  livingAreaSqm?: number;
  plotSqm?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  energyLabel?: string;
  highlights?: string[];
  description?: string;
  /** e.g. "apartment", "villa", "penthouse" */
  propertyType?: string;
}

/** Persisted agent configuration (persona + learned preferences) */
export interface CloaserAgentRecord {
  id: string;
  name: string;
  personaPrompt: string;
  /** JSON: learned buyer signals, objections handled, tone notes */
  learnedContextJson: string;
  createdAt: string;
  updatedAt: string;
}

/** What a voice/speaking layer can load for a session */
export interface SpeakingAgentContext {
  agentId: string;
  agentName: string;
  personaPrompt: string;
  /** Bullet summary for TTS system prompt or RAG */
  briefingBullets: string[];
  /** Recent conversation snippets the model should honor */
  recentUserPreferences: string[];
  /** Full exposé text if generated this session (optional) */
  latestExposeMarkdown?: string;
}

/** Result of generating an exposé */
export interface ExposeResult {
  markdown: string;
  meta: {
    wordCount: number;
    generatedAt: string;
  };
}
