import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireSuperadmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { RESERVED } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = [
  { key: "ice-blended", label: "Ice Blended", sort: 1 },
  { key: "hot-coffee", label: "Hot Coffee", sort: 2 },
  { key: "tea", label: "Tea", sort: 3 },
  { key: "food", label: "Food", sort: 4 },
];

export async function GET() {
  const gate = await requireSuperadmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true, users: true, items: true } } },
  });
  const revAgg = await prisma.order.groupBy({ by: ["tenantId"], _sum: { total: true } });
  const rev = Object.fromEntries(revAgg.map((r) => [r.tenantId, r._sum.total || 0]));

  return NextResponse.json(
    tenants.map((t) => ({
      id: t.id, name: t.name, slug: t.slug, status: t.status, plan: t.plan,
      brandHex: t.brandHex, createdAt: t.createdAt,
      orders: t._count.orders, users: t._count.users, items: t._count.items,
      revenue: rev[t.id] || 0,
    }))
  );
}

export async function POST(req) {
  const gate = await requireSuperadmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const name = String(b.name || "").trim();
  const slug = String(b.slug || "").trim().toLowerCase();
  const ownerEmail = String(b.ownerEmail || "").trim().toLowerCase();
  const ownerPassword = String(b.ownerPassword || "");

  if (!name || !slug) return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
  if (!/^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/.test(slug)) return NextResponse.json({ error: "Slug must be lowercase letters, numbers and hyphens." }, { status: 400 });
  if (RESERVED.has(slug)) return NextResponse.json({ error: "That subdomain is reserved." }, { status: 400 });
  if (await prisma.tenant.findUnique({ where: { slug } })) return NextResponse.json({ error: "That subdomain is taken." }, { status: 409 });
  if (!ownerEmail || ownerPassword.length < 6) return NextResponse.json({ error: "Owner email and a 6+ char password are required." }, { status: 400 });

  const tenant = await prisma.tenant.create({
    data: {
      name, slug, plan: b.plan || "growth", storeName: name,
      brandHex: b.brandHex || "#7AB04A",
      darkHex: b.darkHex || "#36511F",
    },
  });

  // Seed default (empty) categories so the owner can start adding items.
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ id: `${tenant.id}-${c.key}`, tenantId: tenant.id, key: c.key, label: c.label, sort: c.sort })),
  });

  // Create the café owner account.
  const hash = await bcrypt.hash(ownerPassword, 10);
  await prisma.user.create({
    data: { name: b.ownerName || "Owner", email: ownerEmail, password: hash, role: "owner", tenantId: tenant.id, points: 0 },
  });

  return NextResponse.json({ id: tenant.id, slug: tenant.slug });
}
