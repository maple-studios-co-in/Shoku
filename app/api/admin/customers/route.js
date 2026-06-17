import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: { select: { total: true, createdAt: true } } },
  });

  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      points: u.points,
      createdAt: u.createdAt,
      orders: u.orders.length,
      spend: u.orders.reduce((s, o) => s + o.total, 0),
      lastOrder: u.orders.length ? u.orders.reduce((a, b) => (a > b.createdAt ? a : b.createdAt), u.orders[0].createdAt) : null,
    }))
  );
}
