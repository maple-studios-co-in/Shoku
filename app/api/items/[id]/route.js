import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma, parseItem } from "@/lib/db";

export const dynamic = "force-dynamic";

// Partial update — used by quick toggles (live / price).
export async function PATCH(req, { params }) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const data = {};
  if ("live" in body) data.live = !!body.live;
  if ("price" in body) data.price = Math.max(0, Number(body.price) || 0);

  const item = await prisma.item.update({ where: { id: params.id }, data, include: { category: true } });
  return NextResponse.json(parseItem(item));
}

// Full update from the menu editor.
export async function PUT(req, { params }) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const price = Math.max(0, Number(b.price) || 0);
  const sizes = Array.isArray(b.sizes) && b.sizes.length ? b.sizes : [{ name: "Regular", price }];

  const item = await prisma.item.update({
    where: { id: params.id },
    data: {
      name: b.name,
      categoryId: b.categoryId,
      price,
      img: b.img,
      desc: b.desc || "",
      veg: b.veg !== false,
      kcal: Number(b.kcal) || 0,
      caffeine: Number(b.caffeine) || 0,
      protein: Number(b.protein) || 0,
      sugar: Number(b.sugar) || 0,
      signature: !!b.signature,
      origin: b.origin || "",
      ingredients: JSON.stringify(b.ingredients || []),
      allergens: JSON.stringify(b.allergens || []),
      tags: JSON.stringify(b.tags || []),
      sizes: JSON.stringify(sizes),
      aiTip: b.aiTip || "",
      live: b.live !== false,
    },
    include: { category: true },
  });
  return NextResponse.json(parseItem(item));
}

export async function DELETE(_req, { params }) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const refs = await prisma.orderItem.count({ where: { itemId: params.id } });
  if (refs > 0) {
    return NextResponse.json(
      { error: "This item appears in past orders. Toggle it off (hide) instead of deleting." },
      { status: 409 }
    );
  }
  await prisma.item.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
