import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const [orders, customers, itemsLive] = await Promise.all([
    prisma.order.findMany({ include: { items: true } }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.item.count({ where: { live: true } }),
  ]);

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const count = orders.length;
  const aov = count ? Math.round(revenue / count) : 0;

  // 14-day revenue + order series
  const days = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ t: d.getTime(), label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const od = new Date(o.createdAt);
    od.setHours(0, 0, 0, 0);
    const day = days.find((x) => x.t === od.getTime());
    if (day) {
      day.revenue += o.total;
      day.orders += 1;
    }
  }

  // top items
  const itemMap = {};
  for (const o of orders) for (const li of o.items) itemMap[li.name] = (itemMap[li.name] || 0) + li.qty;
  const topItems = Object.entries(itemMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  const statusBreakdown = {};
  for (const o of orders) statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;

  const recent = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { user: true, items: true },
  });

  return NextResponse.json({
    revenue,
    count,
    aov,
    customers,
    itemsLive,
    series: days.map(({ label, revenue, orders }) => ({ label, revenue, orders })),
    topItems,
    statusBreakdown,
    recent: recent.map((r) => ({
      id: r.id,
      total: r.total,
      status: r.status,
      fulfilment: r.fulfilment,
      createdAt: r.createdAt,
      customer: r.user?.name || r.user?.email || "Guest",
      items: r.items.reduce((s, i) => s + i.qty, 0),
    })),
  });
}
