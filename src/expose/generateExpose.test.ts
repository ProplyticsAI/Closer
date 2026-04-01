import test from "node:test";
import assert from "node:assert/strict";
import { generateExpose } from "./generateExpose.js";

test("generateExpose includes title and price", () => {
  const { markdown } = generateExpose({
    title: "Waterfront Loft",
    price: "1.250.000",
    city: "Berlin",
    highlights: ["Floor-to-ceiling glass", "Private terrace"],
  });
  assert.match(markdown, /Waterfront Loft/);
  assert.match(markdown, /1\.250\.000/);
  assert.match(markdown, /Floor-to-ceiling glass/);
});

test("generateExpose weaves learned buyer signals", () => {
  const { markdown } = generateExpose(
    {
      title: "Garden House",
      price: "890.000",
    },
    {
      learned: {
        buyerSignals: ["Needs quiet office nook"],
        objectionsHandled: [],
        toneNotes: [],
        tags: {},
      },
    }
  );
  assert.match(markdown, /Needs quiet office nook/);
});
