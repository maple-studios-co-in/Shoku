import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public: used at checkout to validate a promo code.
export async function POST(req) {
  let code = "";
  try {
    code = String((await req.json())?.code || "").toUpperCase().replace(/\s+/g, "");
  } catch {}
  if (!code) return NextResponse.json({ valid: false });
  const d = await prisma.discount.findUnique({ where: { code } });
  if (!d || !d.active) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, code: d.code, percent: d.percent });
}
