// Shoku AI — a lightweight, rule-based recommender. It scores items (passed in
// from the database) against the user's intent and explains why each fits.
// Runs server-side in /api/ai. Swap recommend() for a real LLM later — the
// return contract { intro, picks:[{item, why}] } stays the same.

export const QUICK_PROMPTS = [
  { id: "cold", emoji: "🧊", label: "Cold & refreshing" },
  { id: "pickme", emoji: "⚡", label: "Need a pick-me-up" },
  { id: "sweet", emoji: "🍫", label: "Something sweet" },
  { id: "vegan", emoji: "🌱", label: "Vegan options" },
  { id: "protein", emoji: "💪", label: "High protein" },
  { id: "light", emoji: "🔥", label: "Under 150 kcal" },
  { id: "lowcaf", emoji: "🌙", label: "Low caffeine" },
];

function buildIntent(raw) {
  const q = (raw || "").toLowerCase();
  const has = (...words) => words.some((w) => q.includes(w));
  const rules = [];
  let intro = "Here are my top picks:";

  if (has("cold", "iced", "refresh", "ice blended", "summer", "hot day")) {
    rules.push({ tag: "cold", w: 3 }, { tag: "refreshing", w: 2 });
    intro = "Cold and refreshing it is — these are my favourites:";
  }
  if (has("pick-me-up", "pick me up", "energy", "awake", "caffeine", "strong", "tired")) {
    rules.push({ field: "caffeine", dir: 1, w: 3 });
    intro = "Need an energy boost? Highest-caffeine picks first:";
  }
  if (has("sweet", "dessert", "treat", "chocolate", "indulg")) {
    rules.push({ tag: "sweet", w: 3 }, { tag: "treat", w: 2 });
    intro = "A little treat — here's what I'd go for:";
  }
  if (has("vegan", "plant", "dairy free", "dairy-free", "no milk")) {
    rules.push({ tag: "vegan", w: 4 });
    intro = "Fully plant-based options:";
  }
  if (has("protein", "filling", "full", "breakfast", "meal")) {
    rules.push({ field: "protein", dir: 1, w: 3 }, { tag: "high-protein", w: 2 });
    intro = "Most protein / most filling first:";
  }
  if (has("light", "low cal", "low-cal", "under 150", "diet", "healthy", "few calories")) {
    rules.push({ field: "kcal", dir: -1, w: 3 }, { tag: "low-cal", w: 2 });
    intro = "Lightest on calories:";
  }
  if (has("low caffeine", "less caffeine", "decaf", "evening", "night", "sleep", "kids")) {
    rules.push({ field: "caffeine", dir: -1, w: 3 }, { tag: "low-caffeine", w: 2 });
    intro = "Easy on the caffeine — good for later in the day:";
  }
  if (has("hot", "warm", "cosy", "cozy", "winter")) {
    rules.push({ tag: "hot", w: 3 });
    intro = "Something warm:";
  }
  if (has("tea")) rules.push({ field: "isTea", w: 3 });
  if (has("coffee")) rules.push({ field: "isCoffee", w: 2 });

  if (rules.length === 0) {
    rules.push({ tag: "signature", w: 2 }, { field: "rating", dir: 1, w: 2 });
    intro = "Not sure? These are our crowd favourites:";
  }
  return { rules, intro, q };
}

function scoreItem(item, rules) {
  const tags = item.tags || [];
  let score = 0;
  for (const r of rules) {
    if (r.tag && tags.includes(r.tag)) score += r.w;
    if (r.field === "caffeine") score += ((r.dir > 0 ? item.caffeine : 200 - item.caffeine) / 50) * r.w;
    if (r.field === "kcal") score += ((r.dir > 0 ? item.kcal : 450 - item.kcal) / 120) * r.w;
    if (r.field === "protein") score += (item.protein / 4) * r.w;
    if (r.field === "rating") score += (item.rating || 0) * r.w * 0.4;
    const ck = item.categoryKey || item.category;
    if (r.field === "isTea" && ck === "tea") score += r.w;
    if (r.field === "isCoffee" && (ck === "hot-coffee" || ck === "ice-blended")) score += r.w;
  }
  return score;
}

function reasonFor(item, q) {
  const tags = item.tags || [];
  const bits = [];
  if (/cold|iced|refresh/.test(q) && tags.includes("cold")) bits.push("cold & refreshing");
  if (/protein|filling|breakfast/.test(q)) bits.push(`${item.protein}g protein`);
  if (/light|low cal|under 150|healthy|diet/.test(q)) bits.push(`just ${item.kcal} kcal`);
  if (/caffeine|energy|awake|pick/.test(q) && item.caffeine >= 90) bits.push(`${item.caffeine}mg caffeine`);
  if (/low caffeine|decaf|evening|night/.test(q)) bits.push(item.caffeine === 0 ? "caffeine-free" : `only ${item.caffeine}mg caffeine`);
  if (/vegan|plant|dairy/.test(q) && tags.includes("vegan")) bits.push("100% plant-based");
  if (/sweet|treat|chocolate|dessert/.test(q) && tags.includes("sweet")) bits.push("sweet treat");
  if (bits.length === 0) bits.push(item.signature ? "our signature" : `rated ${item.rating}★`);
  return bits.slice(0, 2).join(" · ");
}

// items: array of parsed item objects (from the DB)
export function recommend(query, items, limit = 3) {
  const { rules, intro, q } = buildIntent(query);
  const picks = (items || [])
    .map((item) => ({ item, score: scoreItem(item, rules) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => ({ item, why: reasonFor(item, q) }));
  return { intro, picks };
}

export function promptText(id) {
  return QUICK_PROMPTS.find((p) => p.id === id)?.label || id;
}
