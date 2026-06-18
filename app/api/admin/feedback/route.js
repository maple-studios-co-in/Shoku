import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const rows = await prisma.feedback.findMany({
    where: { tenantId: gate.tenantId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const count = rows.length;
  const avg = count ? rows.reduce((s, r) => s + r.rating, 0) / count : 0;
  const distribution = [0, 0, 0, 0, 0]; // index 0 = 1 star … 4 = 5 star
  for (const r of rows) distribution[r.rating - 1]++;

  return NextResponse.json({
    count,
    avg: Math.round(avg * 10) / 10,
    distribution,
    items: rows.map((r) => ({ id: r.id, name: r.name || "Guest", rating: r.rating, comment: r.comment, createdAt: r.createdAt })),
  });
}
