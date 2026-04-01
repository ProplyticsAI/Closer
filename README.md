# Cloaser — Real Estate Agent

TypeScript library for a **Cloaser**-style real estate agent that:

1. **Produces high-quality property exposés** as Markdown (headline, facts, highlights, narrative, location, call to action), tuned to persuade while staying factual.
2. **Learns from conversations** by extracting buyer signals and concerns from chat history, merging them into a persisted profile, and storing weighted **learning rows** for analytics or RAG.
3. **Exports context for speaking agents** — a compact briefing (persona, bullets, recent preferences, optional latest exposé) for voice or realtime stacks.

## Quick start

```bash
npm install
npm run build
npm run example
```

The example writes SQLite to `data/cloaser.db` (gitignored), simulates a short buyer conversation, ingests learning, generates an exposé, and prints JSON for a speaking agent.

## API sketch

```ts
import { CloaserAgent } from "cloaser-real-estate-agent";

const agent = new CloaserAgent("./data/cloaser.db");
const a = agent.getOrCreateAgent("agent-1", "Listing closer");

const conv = agent.startConversation(a.id);
agent.appendMessage(conv, "user", "We need a terrace and a quiet street.");
agent.appendMessage(conv, "assistant", "I'll prioritize those in the search.");

agent.ingestConversationLearning(a.id, conv);

const expose = agent.generatePropertyExpose(a.id, {
  title: "City Terrace",
  price: "750.000",
  city: "Munich",
  livingAreaSqm: 95,
  highlights: ["South terrace", "Elevator"],
});

const speaking = agent.getSpeakingAgentContext(a.id, {
  latestExposeMarkdown: expose.markdown,
});
```

## Learning pipeline

- **Heuristic extraction** (`extractLearnedDelta`) scans user turns for budget, needs, objections, and tone. Swap this for an LLM in production for richer structured output.
- **Merged profile** is stored as JSON on the agent (`learned_context_json`).
- **`learnings` table** stores individual rows per signal for downstream **Speaking Agents** (embed, search, or fine-tune).

## License

MIT (add a `LICENSE` file if you need a formal grant).
