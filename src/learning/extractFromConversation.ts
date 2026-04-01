import type { ConversationMessage } from "../types.js";
import type { LearnedContext } from "../learnedContext.js";

const USER_HINT_PATTERNS: { category: keyof LearnedContext; regex: RegExp }[] = [
  { category: "buyerSignals", regex: /\b(need|prefer|looking for|must have|important|priority)\b.*$/i },
  { category: "buyerSignals", regex: /\b(budget|price range|afford|financ|mortgage)\b/i },
  { category: "buyerSignals", regex: /\b(family|kids|school|commute|office|remote)\b/i },
  { category: "objectionsHandled", regex: /\b(worried|concern|too (?:small|big|expensive|far)|but|however)\b/i },
  { category: "toneNotes", regex: /\b(please|formal|casual|simple|detailed)\b/i },
];

function trimSentence(s: string, max = 220): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

/**
 * Heuristic extraction from user turns. Replace with an LLM call in production
 * for richer structured learning.
 */
export function extractLearnedDelta(messages: ConversationMessage[]): Partial<LearnedContext> {
  const buyerSignals: string[] = [];
  const objectionsHandled: string[] = [];
  const toneNotes: string[] = [];

  for (const m of messages) {
    if (m.role !== "user") continue;
    const text = m.content;
    for (const { category, regex } of USER_HINT_PATTERNS) {
      if (regex.test(text)) {
        const line = trimSentence(text);
        if (category === "buyerSignals") buyerSignals.push(line);
        else if (category === "objectionsHandled") objectionsHandled.push(line);
        else toneNotes.push(line);
      }
    }
  }

  const dedupe = (arr: string[]) => [...new Set(arr)];

  return {
    buyerSignals: dedupe(buyerSignals).slice(0, 12),
    objectionsHandled: dedupe(objectionsHandled).slice(0, 12),
    toneNotes: dedupe(toneNotes).slice(0, 8),
  };
}
