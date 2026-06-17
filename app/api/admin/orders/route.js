import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const status = new URL(req.url).searchParams.get("status");
  const where = status && status !== "all" ? { status } : {};
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: true, items: true },
  });

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      subtotal: o.subtotal,
      total: o.total,
      status: o.status,
      fulfilment: o.fulfilment,
      payment: o.payment,
      createdAt: o.createdAt,
      customer: o.user?.name || o.user?.email || "Guest",
      email: o.user?.email,
      items: o.items.map((i) => ({ name: i.name, qty: i.qty, size: i.size, milk: i.milk })),
    }))
  );
}
