import test from "node:test";
import assert from "node:assert/strict";
import { extractLearnedDelta } from "./extractFromConversation.js";

test("extractLearnedDelta picks buyer signals from user lines", () => {
  const delta = extractLearnedDelta([
    { role: "user", content: "We need a home office and good schools nearby.", createdAt: "t1" },
    { role: "assistant", content: "I understand.", createdAt: "t2" },
  ]);
  assert.ok(delta.buyerSignals?.some((s) => /home office/i.test(s)));
});
