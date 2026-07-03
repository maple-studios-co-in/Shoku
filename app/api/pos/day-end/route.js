import { NextResponse } from "next/server";
import { requirePos, dayEnd } from "@/lib/pos";

export const dynamic = "force-dynamic";

// Z-report for a calendar day (?date=YYYY-MM-DD, default today).
export async function GET(req) {
  const gate = await requirePos();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const date = new URL(req.url).searchParams.get("date") || undefined;
  return NextResponse.json(await dayEnd(gate.tenantId, date));
}
