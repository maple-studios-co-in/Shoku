import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return NextResponse.json(orders);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const lines = Array.isArray(body?.lines) ? body.lines : [];
  if (lines.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

  // Validate items exist and recompute totals server-side.
  const ids = [...new Set(lines.map((l) => l.id))];
  const dbItems = await prisma.item.findMany({ where: { id: { in: ids } } });
  const byId = Object.fromEntries(dbItems.map((i) => [i.id, i]));

  const clean = [];
  for (const l of lines) {
    const it = byId[l.id];
    if (!it) continue;
    const qty = Math.max(1, Math.min(50, Number(l.qty) || 1));
    const unit = Math.max(0, Number(l.unit) || it.price);
    clean.push({ itemId: it.id, name: it.name, size: l.size || "Regular", milk: l.milk || null, unit, qty });
  }
  if (clean.length === 0) return NextResponse.json({ error: "No valid items" }, { status: 400 });

  const subtotal = clean.reduce((s, l) => s + l.unit * l.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const reward = Math.round(subtotal * 0.05);

  // Optional promo code
  let discount = 0;
  let discountCode = null;
  if (body.discountCode) {
    const code = String(body.discountCode).toUpperCase().replace(/\s+/g, "");
    const promo = await prisma.discount.findUnique({ where: { code } });
    if (promo && promo.active) {
      discount = Math.round((subtotal * promo.percent) / 100);
      discountCode = promo.code;
    }
  }

  const total = subtotal + tax - reward - discount;

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      subtotal,
      tax,
      reward,
      discount,
      discountCode,
      total,
      fulfilment: body.fulfilment || "pickup",
      payment: body.payment || "upi",
      items: { create: clean },
    },
  });

  // Award loyalty points (1 point per ₹10 spent).
  await prisma.user.update({
    where: { id: session.user.id },
    data: { points: { increment: Math.floor(total / 10) } },
  });

  return NextResponse.json({ id: order.id, total: order.total, status: order.status });
}
