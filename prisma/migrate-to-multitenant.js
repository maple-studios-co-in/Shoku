/* eslint-disable */
// One-off: adopt an existing single-tenant Shoku database into multi-tenant.
// Run ONCE on your live DB after `prisma db push` with the new schema:
//   node prisma/migrate-to-multitenant.js
//
// It creates a platform superadmin + a default tenant, then backfills tenantId
// on all existing rows so your current café keeps working as "tenant #1".

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const SLUG = process.env.DEFAULT_TENANT_SLUG || "cbtl";

async function main() {
  // 1. Platform superadmin
  let sa = await prisma.user.findFirst({ where: { email: "super@shoku.app", role: "superadmin" } });
  if (!sa) {
    const pw = await bcrypt.hash("password", 10);
    sa = await prisma.user.create({ data: { email: "super@shoku.app", name: "Shoku Admin", role: "superadmin", tenantId: null, password: pw, points: 0 } });
    console.log("✓ created superadmin: super@shoku.app / password (change this!)");
  }

  // 2. Default tenant
  let t = await prisma.tenant.findUnique({ where: { slug: SLUG } });
  if (!t) {
    t = await prisma.tenant.create({
      data: { name: "The Coffee Bean & Tea Leaf", slug: SLUG, storeName: "CBTL", brandHex: "#7AB04A", darkHex: "#36511F", plan: "enterprise" },
    });
    console.log(`✓ created default tenant: ${SLUG}`);
  }

  // 3. Backfill categories (set tenantId + key)
  const cats = await prisma.category.findMany({ where: { tenantId: null } });
  for (const c of cats) {
    await prisma.category.update({ where: { id: c.id }, data: { tenantId: t.id, key: c.key || c.id } });
  }

  // 4. Backfill items / orders / discounts
  const it = await prisma.item.updateMany({ where: { tenantId: null }, data: { tenantId: t.id } });
  const or = await prisma.order.updateMany({ where: { tenantId: null }, data: { tenantId: t.id } });
  const di = await prisma.discount.updateMany({ where: { tenantId: null }, data: { tenantId: t.id } });

  // 5. Backfill users (existing admins become owners of the default tenant)
  const users = await prisma.user.findMany({ where: { tenantId: null, NOT: { role: "superadmin" } } });
  for (const u of users) {
    await prisma.user.update({ where: { id: u.id }, data: { tenantId: t.id, role: u.role === "admin" ? "owner" : u.role } });
  }

  console.log(`✓ backfilled: ${cats.length} categories, ${it.count} items, ${or.count} orders, ${di.count} discounts, ${users.length} users → ${SLUG}`);
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
