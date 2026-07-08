/* eslint-disable */
// Reset the platform superadmin password on the live server.
// Run from the app directory (e.g. /var/www/pista):
//   NEW_PASSWORD='your-new-strong-password' node scripts/reset-superadmin.js
// Creates the superadmin if it doesn't exist yet.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const EMAIL = process.env.SUPERADMIN_EMAIL || "super@shoku.app";
const NEW_PASSWORD = process.env.NEW_PASSWORD;

async function main() {
  if (!NEW_PASSWORD || NEW_PASSWORD.length < 8) {
    console.error("Set NEW_PASSWORD (min 8 chars):  NEW_PASSWORD='...' node scripts/reset-superadmin.js");
    process.exit(1);
  }
  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  const existing = await prisma.user.findFirst({ where: { email: EMAIL, role: "superadmin" } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { password: hash } });
    console.log(`✓ Password reset for superadmin ${EMAIL}`);
  } else {
    await prisma.user.create({
      data: { email: EMAIL, name: "Shoku Admin", role: "superadmin", tenantId: null, password: hash, points: 0 },
    });
    console.log(`✓ Superadmin ${EMAIL} did not exist — created with the new password`);
  }
  console.log("  Log in at the platform apex domain (e.g. https://getshoku.com/login), NOT a café subdomain.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
