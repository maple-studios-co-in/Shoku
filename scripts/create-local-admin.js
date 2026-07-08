/* eslint-disable */
// Create (or update) YOUR OWN local admin accounts for testing, without
// touching the seeded/original credentials. Local dev only.
//
//   node scripts/create-local-admin.js                            (defaults below)
//   ADMIN_EMAIL=me@dev.local ADMIN_PASSWORD='MyPass123' node scripts/create-local-admin.js
//
// Creates two accounts with the same password:
//   1. a platform superadmin  → /super console
//   2. an owner of the default café (cbtl) → /admin dashboard

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const EMAIL = process.env.ADMIN_EMAIL || "dev-admin@local.test";
const PASSWORD = process.env.ADMIN_PASSWORD || "DevAdmin@123";
const TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || "cbtl";

async function upsertByEmail({ email, name, role, tenantId, hash }) {
  const found = await prisma.user.findFirst({ where: { email, tenantId: tenantId ?? null } });
  if (found) {
    await prisma.user.update({ where: { id: found.id }, data: { password: hash, role } });
    return "updated";
  }
  await prisma.user.create({ data: { email, name, role, tenantId: tenantId ?? null, password: hash, points: 0, waOptIn: true } });
  return "created";
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to run in production. This script is for local dev only.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(PASSWORD, 10);

  // 1. Platform superadmin (global, no tenant)
  const a = await upsertByEmail({ email: EMAIL, name: "Local Dev Superadmin", role: "superadmin", tenantId: null, hash });

  // 2. Owner of the default café — separate email because login resolves
  //    superadmin first for the same email on the apex host.
  const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
  let b = "skipped (tenant not found — run `npm run setup` first)";
  const ownerEmail = EMAIL.replace("@", "+owner@");
  if (tenant) b = await upsertByEmail({ email: ownerEmail, name: "Local Dev Owner", role: "owner", tenantId: tenant.id, hash });

  console.log("Done.");
  console.log(`  Superadmin (${a}): ${EMAIL} / ${PASSWORD}  → http://localhost:3000/super`);
  console.log(`  Café owner (${b}): ${ownerEmail} / ${PASSWORD}  → http://localhost:3000/admin`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
