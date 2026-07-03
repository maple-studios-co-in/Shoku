import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { imageFor } from "@/lib/foodImages";
import { generateMenuImage } from "@/lib/imageGen";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // AI image gen can be slow

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
const yes = (v) => ["y", "yes", "true", "1"].includes(String(v ?? "").toLowerCase().trim());

// Bulk menu import (from the CSV importer in /admin/menu).
// body: { items: [{name, category, price, desc?, veg?, kcal?, caffeine?, protein?, sugar?, tags?, signature?}], generateImages?: bool }
export async function POST(req) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const tenant = await prisma.tenant.findUnique({ where: { id: gate.tenantId } });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const rows = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
  if (!rows.length) return NextResponse.json({ error: "No items to import" }, { status: 400 });

  const wantAI = !!body.generateImages && !!(tenant.aiApiKey || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY);

  // Ensure categories exist (created in row order after existing ones).
  const existingCats = await prisma.category.findMany({ where: { tenantId: tenant.id } });
  const catByKey = new Map(existingCats.map((c) => [c.key || slugify(c.label), c]));
  let catSort = existingCats.length;

  let created = 0, updated = 0, aiImages = 0;
  const errors = [];

  for (const [i, r] of rows.entries()) {
    const name = String(r.name || "").trim();
    const price = Math.round(Number(r.price));
    const catLabel = String(r.category || "Menu").trim() || "Menu";
    if (!name || !Number.isFinite(price) || price <= 0) {
      errors.push(`Row ${i + 1}: needs a name and a positive price`);
      continue;
    }

    const catKey = slugify(catLabel);
    let cat = catByKey.get(catKey);
    if (!cat) {
      cat = await prisma.category.create({
        data: { id: `${tenant.id}-${catKey}`, tenantId: tenant.id, key: catKey, label: catLabel, sort: catSort++ },
      });
      catByKey.set(catKey, cat);
    }

    // Image: AI when enabled (best-effort), else curated pool by keyword.
    let img = null;
    if (wantAI) {
      img = await generateMenuImage(tenant, name, String(r.desc || ""));
      if (img) aiImages++;
    }
    if (!img) img = imageFor(name, catLabel);

    // Same name in a DIFFERENT category is a distinct item — disambiguate the id
    // instead of silently overwriting (e.g. "Latte" in Hot Coffee vs Iced).
    let id = `${tenant.slug}-${slugify(name)}`;
    const clash = await prisma.item.findUnique({ where: { id } });
    if (clash && clash.categoryId !== cat.id) id = `${tenant.slug}-${catKey}-${slugify(name)}`;
    const data = {
      tenantId: tenant.id, categoryId: cat.id, name, price, img,
      desc: String(r.desc || "").slice(0, 300),
      veg: r.veg === undefined ? true : yes(r.veg),
      kcal: Math.max(0, Math.round(Number(r.kcal)) || 0),
      caffeine: Math.max(0, Math.round(Number(r.caffeine)) || 0),
      protein: Math.max(0, Math.round(Number(r.protein)) || 0),
      sugar: Math.max(0, Math.round(Number(r.sugar)) || 0),
      signature: yes(r.signature),
      tags: JSON.stringify(String(r.tags || "").split("|").map((t) => t.trim()).filter(Boolean)),
      sizes: JSON.stringify([{ name: "Regular", price }]),
      ingredients: "[]", allergens: "[]", live: true,
    };
    const existing = await prisma.item.findUnique({ where: { id } });
    if (existing) { await prisma.item.update({ where: { id }, data }); updated++; }
    else { await prisma.item.create({ data: { id, ...data } }); created++; }
  }

  return NextResponse.json({ created, updated, aiImages, errors, aiAvailable: wantAI });
}
