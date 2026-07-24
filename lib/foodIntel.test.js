import { describe, it, expect } from "vitest";
import { classifyDiet, lighterSwap, caffeineToday, pairSuggestions } from "./foodIntel.js";

const base = { veg: true, sugar: 20, protein: 2, kcal: 300, categoryLabel: "Hot Coffee" };

describe("classifyDiet", () => {
  it("tags eggless + jain for a veg item with safe ingredients", () => {
    const t = classifyDiet({ ...base, ingredients: ["espresso", "water"] });
    expect(t).toContain("eggless");
    expect(t).toContain("jain");
  });
  it("blocks jain when onion/garlic/root veg present", () => {
    const t = classifyDiet({ ...base, ingredients: ["potato", "spices"] });
    expect(t).not.toContain("jain");
  });
  it("vegan only when no dairy/egg/honey", () => {
    expect(classifyDiet({ ...base, ingredients: ["oat milk", "espresso"] })).not.toContain("vegan");
    expect(classifyDiet({ ...base, ingredients: ["soy", "espresso"] })).toContain("vegan");
  });
  it("never auto-tags for non-veg", () => {
    const t = classifyDiet({ ...base, veg: false, ingredients: ["chicken"] });
    expect(t).not.toContain("eggless");
    expect(t).not.toContain("jain");
  });
  it("diabetic-friendly needs low sugar and non-dessert category", () => {
    expect(classifyDiet({ ...base, sugar: 4, ingredients: ["espresso"] })).toContain("diabetic-friendly");
    expect(classifyDiet({ ...base, sugar: 4, categoryLabel: "Desserts", ingredients: ["flour"] })).not.toContain("diabetic-friendly");
  });
  it("preserves owner-set cultural tags, never infers them", () => {
    expect(classifyDiet({ ...base, diet: ["halal-safe"], ingredients: ["espresso"] })).toContain("halal-safe");
    expect(classifyDiet({ ...base, ingredients: ["espresso"] })).not.toContain("halal-safe");
  });
});

describe("lighterSwap", () => {
  const menu = [
    { id: "a", category: "c1", sugar: 30, kcal: 300 },
    { id: "b", category: "c1", sugar: 5, kcal: 120, live: true },
    { id: "c", category: "c2", sugar: 1, kcal: 50 },
  ];
  it("suggests a same-category item with ≤half the sugar", () => {
    expect(lighterSwap(menu[0], menu)?.id).toBe("b");
  });
  it("stays quiet for already-light items", () => {
    expect(lighterSwap(menu[1], menu)).toBeNull();
  });
});

describe("caffeineToday", () => {
  it("sums only today's orders", () => {
    const today = new Date(); const yest = new Date(Date.now() - 864e5);
    const orders = [
      { createdAt: today, items: [{ itemId: "x", qty: 2 }] },
      { createdAt: yest, items: [{ itemId: "x", qty: 5 }] },
    ];
    expect(caffeineToday(orders, { x: { caffeine: 95 } }, today)).toBe(190);
  });
});

describe("pairSuggestions", () => {
  const items = [
    { id: "latte", categoryKey: "hot", categoryLabel: "Hot Coffee", name: "Latte", rating: 4.5, price: 300, live: true },
    { id: "croissant", categoryKey: "food", categoryLabel: "Food", name: "Croissant", rating: 4.6, price: 180, live: true },
    { id: "tee", categoryKey: "merch", name: "Tee", type: "merch", rating: 5, price: 500, live: true },
  ];
  it("suggests food for a drink-only cart, never merch or in-cart items", () => {
    const s = pairSuggestions([{ id: "latte" }], items);
    expect(s[0].id).toBe("croissant");
    expect(s.find((i) => i.id === "tee")).toBeUndefined();
    expect(s.find((i) => i.id === "latte")).toBeUndefined();
  });
  it("empty cart → no suggestions", () => {
    expect(pairSuggestions([], items)).toEqual([]);
  });
});
