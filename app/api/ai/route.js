import { NextResponse } from "next/server";
import { prisma, parseItem } from "@/lib/db";
import { getCurrentTenant } from "@/lib/tenant";
import { recommend } from "@/lib/ai";
import { llmComplete } from "@/lib/llm";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let query = "";
  let history = [];
  try {
    const body = await req.json();
    query = body?.query || "";
    history = Array.isArray(body?.history) ? body.history.slice(-6) : [];
  } catch {}

  const tenant = await getCurrentTenant();
  if (!tenant)
    return NextResponse.json({ intro: "No menu available.", picks: [] });

  const items = (
    await prisma.item.findMany({
      where: { tenantId: tenant.id, live: true },
      include: { category: true },
    })
  ).map(parseItem);

  // Real LLM first; rule-based recommender as offline fallback.
  const ai = await llmRecommend(query, history, items, tenant);
  if (ai) return NextResponse.json(ai);

  const { intro, picks } = recommend(query, items);
  return NextResponse.json({
    intro,
    picks: picks.map(({ item, why }) => ({
      why,
      item: {
        id: item.id,
        name: item.name,
        img: item.img,
        price: item.price,
        kcal: item.kcal,
      },
    })),
  });
}

async function llmRecommend(query, history, items, tenant) {
  const menu = items.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price,
    kcal: i.kcal,
    caffeine: i.caffeine,
    protein: i.protein,
    tags: i.tags,
    category: i.categoryKey || i.category?.key,
  }));

  const system = `You are Shoku AI, a warm, concise café menu assistant.
You may ONLY recommend items that exist in the MENU json below — never invent items.
Always reply with strict JSON: {"intro": string, "picks": [{"id": item id, "why": string}]}.
- "intro": 1-2 sentences that directly respond to what the user actually said.
- "picks": up to 3 items that genuinely fit the request. If nothing fits, return [] and say so in intro.
- "why": a short reason (under 8 words) tied to the user's request.
MENU: ${JSON.stringify(menu)}`;

  const convo = history
    .map((h) => `${h.from === "me" ? "User" : "Assistant"}: ${h.text}`)
    .join("\n");
  const user = (convo ? convo + "\n" : "") + "User: " + query;

  const out = await llmComplete(system, user, {
    json: true,
    max: 400,
    temperature: 0.7,
    tenant,
  });
  if (!out || !Array.isArray(out.picks)) return null;

  const byId = new Map(items.map((i) => [String(i.id), i]));
  const picks = out.picks
    .map((p) => ({
      item: byId.get(String(p.id)),
      why: String(p.why || "").slice(0, 60),
    }))
    .filter((p) => p.item)
    .slice(0, 3)
    .map(({ item, why }) => ({
      why,
      item: {
        id: item.id,
        name: item.name,
        img: item.img,
        price: item.price,
        kcal: item.kcal,
      },
    }));

  return { intro: String(out.intro || "Here's what I'd suggest:"), picks };
}
