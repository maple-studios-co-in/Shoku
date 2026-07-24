// Backfill dietary tags for all items (rule-based, conservative).
// Idempotent — safe to re-run; owner-set cultural tags (halal-safe, vrat) survive.
//   node scripts/classify-diet.js [tenantSlug]
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Mirror of lib/foodIntel.classifyDiet (kept dependency-free for plain node).
const has = (ings, words) => words.some((w) => ings.some((h) => h.includes(w)));
const DAIRY = ["milk", "butter", "cheese", "cream", "ghee", "paneer", "curd", "yogurt", "yoghurt", "mawa", "khoya"];
const EGG = ["egg"]; const MEAT = ["chicken", "mutton", "fish", "prawn", "meat", "bacon", "ham", "pepperoni"];
const HONEY = ["honey"]; const ALLIUM_ROOT = ["onion", "garlic", "potato", "carrot", "beetroot", "radish", "ginger"];
const SWEET = ["dessert", "bake", "cake", "pastry", "sweet"];

function classify(item, catLabel) {
  let ings = [];
  try { ings = JSON.parse(item.ingredients || "[]").map((s) => String(s).toLowerCase()); } catch {}
  let prev = [];
  try { prev = JSON.parse(item.diet || "[]"); } catch {}
  const tags = new Set(prev.filter((t) => ["halal-safe", "vrat"].includes(t)));
  const meaty = !item.veg || has(ings, MEAT);
  if (!meaty) {
    if (!has(ings, EGG)) tags.add("eggless");
    if (!has(ings, EGG) && !has(ings, DAIRY) && !has(ings, HONEY) && ings.length > 0) tags.add("vegan");
    if (!has(ings, ALLIUM_ROOT) && !has(ings, EGG) && ings.length > 0) tags.add("jain");
  }
  const cat = String(catLabel || "").toLowerCase();
  if ((item.sugar ?? 99) <= 8 && !SWEET.some((w) => cat.includes(w))) tags.add("diabetic-friendly");
  if ((item.sugar ?? 99) <= 5) tags.add("low-sugar");
  if ((item.protein ?? 0) >= 15) tags.add("high-protein");
  return [...tags].sort();
}

(async () => {
  const slug = process.argv[2];
  const where = slug ? { tenant: { slug } } : {};
  const items = await prisma.item.findMany({ where, include: { category: true } });
  let changed = 0;
  for (const it of items) {
    const tags = classify(it, it.category?.label);
    const next = JSON.stringify(tags);
    if (next !== it.diet) { await prisma.item.update({ where: { id: it.id }, data: { diet: next } }); changed++; }
  }
  console.log(`✓ classified ${items.length} items, updated ${changed}${slug ? ` ('${slug}')` : ""}`);
  process.exit(0);
})();
