import { describe, it, expect } from "vitest";
import { recommend, promptText, QUICK_PROMPTS } from "./ai.js";

const ITEMS = [
  { id: "1", name: "Matcha Latte", desc: "earthy green tea", tags: ["matcha"], price: 320, kcal: 150, caffeine: 70, veg: true },
  { id: "2", name: "Cold Brew", desc: "smooth coffee", tags: ["coffee"], price: 260, kcal: 20, caffeine: 200, veg: true },
  { id: "3", name: "Almond Croissant", desc: "buttery pastry", tags: ["bakery"], price: 240, kcal: 410, veg: true },
];

describe("recommend", () => {
  it("returns an intro string and capped picks", () => {
    const r = recommend("something light", ITEMS, 2);
    expect(typeof r.intro).toBe("string");
    expect(Array.isArray(r.picks)).toBe(true);
    expect(r.picks.length).toBeLessThanOrEqual(2);
  });
  it("each pick carries an item and a reason", () => {
    const r = recommend("matcha", ITEMS);
    for (const p of r.picks) {
      expect(p.item).toBeTruthy();
      expect(typeof p.why).toBe("string");
    }
  });
  it("is safe with no items", () => {
    expect(recommend("anything", []).picks).toEqual([]);
  });
});

describe("promptText", () => {
  it("resolves a known prompt id to its label", () => {
    const first = QUICK_PROMPTS[0];
    expect(promptText(first.id)).toBe(first.label);
  });
  it("echoes unknown ids", () => {
    expect(promptText("nope")).toBe("nope");
  });
});
