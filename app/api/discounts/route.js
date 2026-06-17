import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(discounts);
}

export async function POST(req) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const code = String(b.code || "").toUpperCase().replace(/\s+/g, "");
  const percent = Math.max(1, Math.min(90, Number(b.percent) || 0));
  if (!code) return NextResponse.json({ error: "Code is required." }, { status: 400 });
  if (await prisma.discount.findUnique({ where: { code } }))
    return NextResponse.json({ error: "That code already exists." }, { status: 409 });

  const d = await prisma.discount.create({ data: { code, percent, active: b.active !== false } });
  return NextResponse.json(d);
}
