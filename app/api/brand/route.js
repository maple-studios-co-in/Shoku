import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getBrand() {
  let brand = await prisma.brand.findUnique({ where: { id: "default" } });
  if (!brand) brand = await prisma.brand.create({ data: { id: "default" } });
  return brand;
}

export async function GET() {
  return NextResponse.json(await getBrand());
}

export async function PUT(req) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const allowed = ["name", "brandHex", "darkHex", "font", "subdomain", "aiAssistant", "aiCards", "aiUpsell", "aiLoyalty"];
  const data = {};
  for (const k of allowed) if (k in body) data[k] = body[k];

  const brand = await prisma.brand.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
  return NextResponse.json(brand);
}
