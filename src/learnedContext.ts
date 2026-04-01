/** Structured JSON stored on the agent row and merged over time */

export interface LearnedContext {
  /** Short notes inferred from the buyer (e.g. "needs home office", "schools priority") */
  buyerSignals: string[];
  /** Objection themes the agent has addressed */
  objectionsHandled: string[];
  /** Tone or style preferences */
  toneNotes: string[];
  /** Arbitrary key-value facts for integrations */
  tags: Record<string, string>;
}

export function emptyLearnedContext(): LearnedContext {
  return {
    buyerSignals: [],
    objectionsHandled: [],
    toneNotes: [],
    tags: {},
  };
}

export function parseLearnedContext(json: string): LearnedContext {
  try {
    const raw = JSON.parse(json) as Partial<LearnedContext>;
    return {
      buyerSignals: Array.isArray(raw.buyerSignals) ? raw.buyerSignals : [],
      objectionsHandled: Array.isArray(raw.objectionsHandled) ? raw.objectionsHandled : [],
      toneNotes: Array.isArray(raw.toneNotes) ? raw.toneNotes : [],
      tags: raw.tags && typeof raw.tags === "object" ? raw.tags : {},
    };
  } catch {
    return emptyLearnedContext();
  }
}

export function serializeLearnedContext(ctx: LearnedContext): string {
  return JSON.stringify(ctx);
}

export function mergeLearnedContext(base: LearnedContext, delta: Partial<LearnedContext>): LearnedContext {
  const uniq = (a: string[]) => [...new Set(a.map((s) => s.trim()).filter(Boolean))];
  return {
    buyerSignals: uniq([...base.buyerSignals, ...(delta.buyerSignals ?? [])]),
    objectionsHandled: uniq([...base.objectionsHandled, ...(delta.objectionsHandled ?? [])]),
    toneNotes: uniq([...base.toneNotes, ...(delta.toneNotes ?? [])]),
    tags: { ...base.tags, ...(delta.tags ?? {}) },
  };
}
