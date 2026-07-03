/* eslint-disable */
// Demo/analytics data: ~30 days of realistic sales for one café.
//   node scripts/seed-demo-data.js [slug=cbtl] [days=30]
// Idempotent-ish: tags orders it created via discountCode=null + a marker in
// tableLabel-free POS rows is impossible, so it simply skips if the café already
// has >150 orders in the window (i.e. already seeded).

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SLUG = process.argv[2] || "cbtl";
const DAYS = parseInt(process.argv[3] || "30", 10);

// weekday hourly weights (cafés: morning + evening peaks)
const HOURS = [
  [8, 4], [9, 8], [10, 7], [11, 5], [12, 6], [13, 6], [14, 4],
  [15, 3], [16, 5], [17, 8], [18, 9], [19, 7], [20, 5], [21, 3],
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const wRand = (pairs) => {
  const tot = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * tot;
  for (const [v, w] of pairs) { r -= w; if (r <= 0) return v; }
  return pairs[0][0];
};

(async () => {
  const tenant = await prisma.tenant.findUnique({ where: { slug: SLUG } });
  if (!tenant) throw new Error(`No tenant '${SLUG}'`);
  const items = await prisma.item.findMany({ where: { tenantId: tenant.id, live: true } });
  const customers = await prisma.user.findMany({ where: { tenantId: tenant.id, role: "customer" } });
  const staff = await prisma.user.findFirst({ where: { tenantId: tenant.id, role: "owner" } });
  if (!items.length || !staff) throw new Error("Need items + an owner user");

  const since = new Date(Date.now() - DAYS * 864e5);
  const existing = await prisma.order.count({ where: { tenantId: tenant.id, createdAt: { gte: since } } });
  if (existing > 150) { console.log(`Already ${existing} orders in window — skipping (delete first to reseed).`); process.exit(0); }

  const locations = JSON.parse(tenant.locations || "[]");
  let made = 0;

  // Allocate invoice numbers via the same atomic increment the live POS uses,
  // so running this against a busy store can't reuse or skip numbers.
  async function nextInvoiceNo(year) {
    const t = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { invoiceSeq: { increment: 1 } },
      select: { invoiceSeq: true },
    });
    return `${tenant.invoicePrefix}-${year}-${String(t.invoiceSeq).padStart(5, "0")}`;
  }

  for (let d = DAYS - 1; d >= 0; d--) {
    const day = new Date(); day.setDate(day.getDate() - d);
    const dow = day.getDay();
    const weekend = dow === 0 || dow === 6;
    // weekend lift + gentle upward trend toward today
    const base = (weekend ? 14 : 9) + Math.round((DAYS - d) / 10) + Math.floor(Math.random() * 4);
    for (let n = 0; n < base; n++) {
      const hour = wRand(HOURS);
      const at = new Date(day); at.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0);
      if (at > new Date()) continue;

      const nLines = wRand([[1, 5], [2, 6], [3, 3], [4, 1]]);
      const chosen = new Map();
      for (let i = 0; i < nLines; i++) {
        const it = pick(items);
        chosen.set(it.id, { it, qty: (chosen.get(it.id)?.qty || 0) + 1 });
      }
      const lines = [...chosen.values()];
      const subtotal = lines.reduce((s, { it, qty }) => s + it.price * qty, 0);
      const tax = Math.round((subtotal * (tenant.gstRate ?? 5)) / 100);
      const reward = Math.round(subtotal * 0.05);
      const total = subtotal + tax - reward;

      const isPos = Math.random() < 0.45; // counter vs online mix
      const method = isPos ? wRand([["cash", 4], ["upi", 5], ["card", 2]]) : null;
      const customer = !isPos || Math.random() < 0.35 ? pick(customers) : null;
      const buyer = customer || staff;
      const { cgst, sgst } = { cgst: Math.floor(tax / 2), sgst: tax - Math.floor(tax / 2) };
      const invoiceNo = isPos ? await nextInvoiceNo(at.getFullYear()) : null;

      await prisma.order.create({
        data: {
          tenantId: tenant.id, userId: buyer.id,
          subtotal, tax, reward, discount: 0, loyaltyDiscount: 0, pointsRedeemed: 0, total,
          fulfilment: isPos ? "pickup" : wRand([["pickup", 6], ["dinein", 4]]),
          payment: method || "upi",
          paymentStatus: "paid",
          source: isPos ? "pos" : "online",
          paymentMethod: method,
          invoiceNo, cgst, sgst,
          staffId: isPos ? staff.id : null,
          locationLabel: locations.length ? pick(locations).label : null,
          status: "completed",
          createdAt: at,
          items: { create: lines.map(({ it, qty }) => ({ itemId: it.id, name: it.name, size: "Regular", milk: null, unit: it.price, qty })) },
        },
      });
      made++;
    }
  }
  const final = await prisma.tenant.findUnique({ where: { id: tenant.id }, select: { invoiceSeq: true } });
  console.log(`✓ created ${made} demo orders over ${DAYS} days for '${SLUG}' (invoiceSeq → ${final.invoiceSeq})`);
  process.exit(0);
})();
