import type { ExposeResult, PropertyListing } from "../types.js";
import type { LearnedContext } from "../learnedContext.js";

function bulletList(items: string[] | undefined, fallback: string): string {
  const list = (items?.length ? items : [fallback]).map((s) => s.trim()).filter(Boolean);
  return list.map((s) => `- ${s}`).join("\n");
}

function formatFacts(listing: PropertyListing): string {
  const rows: [string, string][] = [];
  if (listing.propertyType) rows.push(["Type", listing.propertyType]);
  if (listing.livingAreaSqm != null) rows.push(["Living area", `${listing.livingAreaSqm} m²`]);
  if (listing.plotSqm != null) rows.push(["Plot", `${listing.plotSqm} m²`]);
  if (listing.rooms != null) rows.push(["Rooms", String(listing.rooms)]);
  if (listing.bedrooms != null) rows.push(["Bedrooms", String(listing.bedrooms)]);
  if (listing.bathrooms != null) rows.push(["Bathrooms", String(listing.bathrooms)]);
  if (listing.yearBuilt != null) rows.push(["Year built", String(listing.yearBuilt)]);
  if (listing.energyLabel) rows.push(["Energy", listing.energyLabel]);
  if (!rows.length) return "_Details on request._";
  const header = "| | |\n|---|---|";
  const body = rows.map(([k, v]) => `| **${k}** | ${v} |`).join("\n");
  return `${header}\n${body}`;
}

/**
 * Produces a polished Markdown exposé suitable for PDF/HTML export or LLM refinement.
 * Pass `learned` to weave in buyer-specific reassurance (from prior conversations).
 */
export function generateExpose(
  listing: PropertyListing,
  options?: { learned?: LearnedContext; locale?: "en" }
): ExposeResult {
  const learned = options?.learned;
  const loc = options?.locale ?? "en";
  const currency = listing.currency ?? "EUR";
  const place = [listing.address, listing.city, listing.region].filter(Boolean).join(" · ");

  const headline =
    loc === "en"
      ? `## ${listing.title}\n\n**${listing.price} ${currency}**${place ? `  \n_${place}_` : ""}`
      : `## ${listing.title}`;

  const lifestyle =
    listing.description?.trim() ||
    (loc === "en"
      ? "A thoughtfully composed home where light, proportion, and everyday flow come together. The layout invites both calm evenings and lively weekends—whether you work from a quiet corner or host friends in generous living spaces."
      : "");

  const buyerHook =
    learned?.buyerSignals.length || learned?.objectionsHandled.length
      ? [
          "### Why it could fit you",
          "",
          learned.buyerSignals.length
            ? `**From what you have shared:**  \n${learned.buyerSignals.slice(0, 5).map((s) => `- ${s}`).join("\n")}`
            : "",
          learned.objectionsHandled.length
            ? `\n**We have addressed:**  \n${learned.objectionsHandled.slice(0, 4).map((s) => `- ${s}`).join("\n")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  const factsHeader = loc === "en" ? "### At a glance" : "### Facts";
  const highlightsHeader = loc === "en" ? "### Highlights" : "### Highlights";
  const storyHeader = loc === "en" ? "### The story of this home" : "### Story";
  const locationHeader = loc === "en" ? "### Location & lifestyle" : "### Location";
  const cta =
    loc === "en"
      ? [
          "---",
          "",
          "### Next step",
          "",
          "Reply with a time that suits you—we will arrange a private viewing and answer every question so you can decide with confidence.",
        ].join("\n")
      : "";

  const md = [
    headline,
    "",
    factsHeader,
    "",
    formatFacts(listing),
    "",
    highlightsHeader,
    "",
    bulletList(
      listing.highlights,
      loc === "en"
        ? "Generous proportions and quality finishes throughout"
        : "Quality throughout"
    ),
    "",
    storyHeader,
    "",
    lifestyle,
    "",
    buyerHook,
    "",
    locationHeader,
    "",
    place
      ? `_Prime context in **${listing.city ?? "this area"}**—connectivity, amenities, and neighborhood character tailored to how you actually live._`
      : "_Location details available on enquiry._",
    "",
    cta,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const wordCount = md.split(/\s+/).filter(Boolean).length;

  return {
    markdown: md,
    meta: {
      wordCount,
      generatedAt: new Date().toISOString(),
    },
  };
}
