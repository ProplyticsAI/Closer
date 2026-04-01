import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { CloaserAgent } from "../src/cloaserAgent.js";

const dataDir = join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });
const dbPath = join(dataDir, "cloaser.db");

const agent = new CloaserAgent(dbPath);
const a = agent.getOrCreateAgent("re-001", "Alex — Real Estate Closer");

const conv = agent.startConversation(a.id, "Buyer discovery");
agent.appendMessage(conv, "user", "We are looking for a bright apartment with terrace. Budget around 900k.");
agent.appendMessage(
  conv,
  "assistant",
  "Noted—terrace and natural light are priorities. I will match listings that fit your range."
);
agent.appendMessage(conv, "user", "Also worried about street noise—quiet block matters.");

agent.ingestConversationLearning(a.id, conv);

const expose = agent.generatePropertyExpose(a.id, {
  title: "Terrace Residence — Mitte",
  address: "Samplestraße 12",
  city: "Berlin",
  region: "Mitte",
  price: "895.000",
  currency: "EUR",
  livingAreaSqm: 118,
  rooms: 4,
  bedrooms: 3,
  bathrooms: 2,
  yearBuilt: 2019,
  energyLabel: "B",
  propertyType: "Apartment",
  highlights: [
    "South-west terrace with skyline glimpses",
    "Open kitchen with stone surfaces",
    "Underfloor heating throughout",
  ],
  description:
    "A calm, high-floor home where morning light fills the living space and the terrace becomes a second room for most of the year.",
});

const speaking = agent.getSpeakingAgentContext(a.id, { latestExposeMarkdown: expose.markdown });

console.log("--- Exposé (excerpt) ---\n");
console.log(expose.markdown.slice(0, 1200));
console.log("\n--- Speaking agent briefing (JSON) ---\n");
console.log(JSON.stringify(speaking, null, 2));

agent.close();
