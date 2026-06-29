import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getCurrentTenant } from "@/lib/tenant";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!rateLimit(`register:${clientIp(req)}`, { limit: 5, windowMs: 60_000 }).ok) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { name, email, password } = body || {};
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  if (String(password).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

  const tenant = await getCurrentTenant();
  if (!tenant) return NextResponse.json({ error: "No store found." }, { status: 400 });

  const existing = await prisma.user.findFirst({ where: { email: email.toLowerCase(), tenantId: tenant.id } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name || null, email: email.toLowerCase(), password: hash, tenantId: tenant.id, role: "customer" },
  });
  return NextResponse.json({ ok: true, id: user.id });
}
