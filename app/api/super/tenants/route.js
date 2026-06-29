import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireSuperadmin } from "@/lib/admin";
import { prisma, parseItem } from "@/lib/db";
import { RESERVED, BASE_DOMAIN } from "@/lib/tenant";
import { STARTER_CATEGORIES, STARTER_ITEMS } from "@/lib/starterMenu";
import { DEFAULT_TIERS } from "@/lib/loyalty";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

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
  if (!ownerEmail) return NextResponse.json({ error: "Owner email is required." }, { status: 400 });
  if (ownerPassword && ownerPassword.length < 6) return NextResponse.json({ error: "Password must be 6+ characters (or leave blank for an invite)." }, { status: 400 });

  const tenant = await prisma.tenant.create({
    data: {
      name, slug, plan: b.plan || "growth",
      storeName: b.storeName || name,
      address: b.address || null,
      brandHex: b.brandHex || "#3A6B4D",
      darkHex: b.darkHex || "#244635",
      tiers: JSON.stringify(DEFAULT_TIERS),
    },
  });

  // Categories
  await prisma.category.createMany({
    data: STARTER_CATEGORIES.map((c) => ({ id: `${tenant.id}-${c.key}`, tenantId: tenant.id, key: c.key, label: c.label, sort: c.sort })),
  });

  // Optional starter menu (default on)
  if (b.seedMenu !== false) {
    let sort = 0;
    await prisma.item.createMany({
      data: STARTER_ITEMS.map((it) => ({
        id: `${slug}-${it.k}`, tenantId: tenant.id, categoryId: `${tenant.id}-${it.catKey}`,
        name: it.name, price: it.price, img: it.img, desc: it.desc, veg: it.veg,
        kcal: it.kcal, caffeine: it.caffeine, protein: it.protein, sugar: it.sugar,
        signature: !!it.signature, rating: it.rating || 4.5, reviews: it.reviews || 0, origin: it.origin || "",
        ingredients: JSON.stringify(it.ingredients || []), allergens: JSON.stringify(it.allergens || []),
        tags: JSON.stringify(it.tags || []), sizes: JSON.stringify(it.sizes || [{ name: "Regular", price: it.price }]),
        aiTip: it.aiTip || "", sort: sort++,
      })),
    });
  }

  // Default loyalty rewards
  const rewardData = [{ tenantId: tenant.id, title: "₹75 off your order", type: "discount", cost: 200, amount: 75 }];
  if (b.seedMenu !== false) rewardData.push({ tenantId: tenant.id, title: "Free Café Latte", type: "freeItem", cost: 150, itemId: `${slug}-cafe-latte`, itemName: "Café Latte" });
  await prisma.reward.createMany({ data: rewardData });

  // Default tables (T1–T6) so dine-in QR ordering works out of the box
  await prisma.table.createMany({ data: Array.from({ length: 6 }, (_, i) => ({ tenantId: tenant.id, label: `T${i + 1}` })) });

  // Owner account: with a password, or an invite link to set their own.
  let inviteUrl = null;
  if (ownerPassword) {
    const hash = await bcrypt.hash(ownerPassword, 10);
    await prisma.user.create({ data: { name: b.ownerName || "Owner", email: ownerEmail, password: hash, role: "owner", tenantId: tenant.id, points: 0 } });
  } else {
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const placeholder = await bcrypt.hash(crypto.randomUUID(), 10);
    await prisma.user.create({
      data: {
        name: b.ownerName || "Owner", email: ownerEmail, password: placeholder, role: "owner", tenantId: tenant.id, points: 0,
        inviteToken: token, inviteExpires: new Date(Date.now() + 7 * 86400000),
      },
    });
    inviteUrl = `https://${slug}.${BASE_DOMAIN}/set-password?token=${token}`;
  }

  await logAudit({ session: gate.session, action: "tenant.create", target: tenant.slug, meta: { plan: tenant.plan, name: tenant.name } });

  return NextResponse.json({ id: tenant.id, slug: tenant.slug, inviteUrl });
}
