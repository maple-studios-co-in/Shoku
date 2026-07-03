import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const FIELDS = { gstin: true, gstRate: true, invoicePrefix: true, kotAutoPrint: true };

export async function GET() {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const t = await prisma.tenant.findUnique({
    where: { id: gate.tenantId },
    select: { posEnabled: true, gstin: true, gstRate: true, invoicePrefix: true, kotAutoPrint: true },
  });
  return NextResponse.json(t);
}

// Owner-editable POS settings. posEnabled itself is superadmin-controlled (plan/add-on).
export async function PUT(req) {
  const gate = await requireAdmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });
  if (gate.session.user.role !== "owner")
    return NextResponse.json({ error: "Owner only" }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const data = {};
  if (typeof body.gstin === "string") data.gstin = body.gstin.trim().toUpperCase().slice(0, 15) || null;
  if (Number.isInteger(body.gstRate) && body.gstRate >= 0 && body.gstRate <= 28) data.gstRate = body.gstRate;
  if (typeof body.invoicePrefix === "string" && body.invoicePrefix.trim()) data.invoicePrefix = body.invoicePrefix.trim().toUpperCase().slice(0, 8);
  if (typeof body.kotAutoPrint === "boolean") data.kotAutoPrint = body.kotAutoPrint;
  if (!Object.keys(data).every((k) => FIELDS[k]) || Object.keys(data).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const t = await prisma.tenant.update({ where: { id: gate.tenantId }, data, select: { gstin: true, gstRate: true, invoicePrefix: true, kotAutoPrint: true } });
  return NextResponse.json(t);
}
