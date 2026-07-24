// Food intelligence — pure, rule-based helpers (no LLM required, LLM can refine).
// Classification is conservative: we only auto-tag what ingredients can prove.
// Culturally sensitive tags (halal-safe, vrat) are OWNER-SET only, never inferred.

const has = (ings, words) => {
  const hay = ings.map((s) => String(s).toLowerCase());
  return words.some((w) => hay.some((h) => h.includes(w)));
};

const DAIRY = ["milk", "butter", "cheese", "cream", "ghee", "paneer", "curd", "yogurt", "yoghurt", "mawa", "khoya"];
const EGG = ["egg"];
const MEAT = ["chicken", "mutton", "fish", "prawn", "meat", "bacon", "ham", "pepperoni"];
const HONEY = ["honey"];
const ALLIUM_ROOT = ["onion", "garlic", "potato", "carrot", "beetroot", "radish", "ginger"]; // jain-excluded
const SWEET_CATS = ["dessert", "bake", "cake", "pastry", "sweet"];

// Auto-derivable tags from ingredients + numbers. Returns a sorted string array.
export function classifyDiet(item) {
  const ings = Array.isArray(item.ingredients) ? item.ingredients : [];
  const tags = new Set(Array.isArray(item.diet) ? item.diet.filter((t) => ["halal-safe", "vrat"].includes(t)) : []);

  const meaty = !item.veg || has(ings, MEAT);
  if (!meaty) {
    if (!has(ings, EGG)) tags.add("eggless");
    if (!has(ings, EGG) && !has(ings, DAIRY) && !has(ings, HONEY) && ings.length > 0) tags.add("vegan");
    if (!has(ings, ALLIUM_ROOT) && !has(ings, EGG) && ings.length > 0) tags.add("jain");
  }
  // Diabetic-friendly: measurably low sugar and not a dessert-family item.
  const cat = String(item.categoryLabel || item.categoryKey || "").toLowerCase();
  if ((item.sugar ?? 99) <= 8 && !SWEET_CATS.some((w) => cat.includes(w))) tags.add("diabetic-friendly");
  if ((item.sugar ?? 99) <= 5) tags.add("low-sugar");
  if ((item.protein ?? 0) >= 15) tags.add("high-protein");
  return [...tags].sort();
}

export const DIET_META = {
  jain: { label: "Jain", emoji: "🙏" },
  vegan: { label: "Vegan", emoji: "🌱" },
  eggless: { label: "Eggless", emoji: "🥚" },
  vrat: { label: "Vrat-safe", emoji: "🪔" },
  "halal-safe": { label: "Halal", emoji: "☪️" },
  "diabetic-friendly": { label: "Diabetic-friendly", emoji: "💚" },
  "low-sugar": { label: "Low sugar", emoji: "🍃" },
  "high-protein": { label: "High protein", emoji: "💪" },
};

// Filter chips shown on the menu (order = display order).
export const DIET_FILTERS = ["jain", "vegan", "eggless", "vrat", "halal-safe", "diabetic-friendly", "low-sugar", "high-protein"];

// A gentler alternative in the same category: meaningfully less sugar (and not
// more calories), best match first. Used on the item page.
export function lighterSwap(item, items) {
  if ((item.sugar ?? 0) < 12) return null; // already light — no nag
  return (
    items
      .filter((i) => i.id !== item.id && i.category === item.category && i.live !== false)
      .filter((i) => (i.sugar ?? 99) <= (item.sugar ?? 0) * 0.5 && (i.kcal ?? 99) <= (item.kcal ?? 0) * 1.1)
      .sort((a, b) => (a.sugar ?? 0) - (b.sugar ?? 0))[0] || null
  );
}

// Total caffeine (mg) a diner has ordered today, from their paid orders.
// orders: [{ createdAt, items: [{ itemId, qty }] }] · itemsById: { id: { caffeine } }
export function caffeineToday(orders, itemsById, now = new Date()) {
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  let mg = 0;
  for (const o of orders) {
    if (new Date(o.createdAt) < start) continue;
    for (const l of o.items || []) mg += (itemsById[l.itemId]?.caffeine ?? 0) * (l.qty || 1);
  }
  return mg;
}

// 400mg is the widely-cited adult daily guideline — used for the meter only,
// never as medical advice.
export const CAFFEINE_DAILY_LIMIT = 400;

// Cart pairing: what goes well with what's already in the bag. Rule-based:
// drinks pair with food and vice versa; prefer signature/high-rated, cheap
// add-ons first; never suggest something already in the cart.
export function pairSuggestions(cartLines, items, limit = 3) {
  const inCart = new Set(cartLines.map((l) => l.id));
  const cartItems = cartLines.map((l) => items.find((i) => i.id === l.id)).filter(Boolean);
  if (!cartItems.length) return [];
  const foodish = (i) => /food|bake|snack|dessert|sandwich|croissant|toast|cookie|cake/.test(`${i.categoryKey} ${i.categoryLabel} ${i.name}`.toLowerCase());
  const cartHasFood = cartItems.some(foodish);
  const cartHasDrink = cartItems.some((i) => !foodish(i));
  return items
    .filter((i) => !inCart.has(i.id) && i.live !== false && i.type !== "merch")
    .map((i) => {
      let score = (i.rating ?? 0) + (i.signature ? 1.5 : 0);
      if (cartHasDrink && !cartHasFood && foodish(i)) score += 2;      // drink alone → pitch a bite
      if (cartHasFood && !cartHasDrink && !foodish(i)) score += 2;     // food alone → pitch a drink
      if (i.price <= 250) score += 0.5;                                // easy yes
      return { item: i, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}
