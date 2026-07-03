import { prisma } from "./db";
import { requireAdmin } from "./admin";
import { gstSplit, formatInvoiceNo } from "./posMath";

export { gstSplit };

// Gate for POS routes: café admin AND the POS add-on enabled for the tenant.
export async function requirePos() {
  const gate = await requireAdmin();
  if (gate.error) return gate;
  const tenant = await prisma.tenant.findUnique({ where: { id: gate.tenantId } });
  if (!tenant?.posEnabled) return { error: "POS is not enabled for this café.", status: 403 };
  return { ...gate, tenant };
}

// Sequential per-tenant invoice number, allocated atomically so concurrent
// billing terminals can't collide. Format: PREFIX-YYYY-00042
export async function allocateInvoiceNo(tenantId) {
  const t = await prisma.tenant.update({
    where: { id: tenantId },
    data: { invoiceSeq: { increment: 1 } },
    select: { invoiceSeq: true, invoicePrefix: true },
  });
  return formatInvoiceNo(t.invoicePrefix, new Date().getFullYear(), t.invoiceSeq);
}

// Day-end (Z) aggregation for one tenant + calendar date.
export async function dayEnd(tenantId, dateStr) {
  const day = dateStr ? new Date(dateStr + "T00:00:00") : new Date(new Date().toDateString());
  const next = new Date(day.getTime() + 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: { tenantId, createdAt: { gte: day, lt: next } },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });
  const sum = (arr, f) => arr.reduce((s, o) => s + f(o), 0);
  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const byMethod = {};
  for (const o of paid) {
    const m = o.source === "pos" ? o.paymentMethod || "cash" : "online";
    byMethod[m] = (byMethod[m] || 0) + o.total;
  }
  const itemCount = {};
  for (const o of paid) for (const it of o.items) itemCount[it.name] = (itemCount[it.name] || 0) + it.qty;
  const topItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, qty]) => ({ name, qty }));
  return {
    date: day.toISOString().slice(0, 10),
    bills: paid.length,
    gross: sum(paid, (o) => o.total),
    subtotal: sum(paid, (o) => o.subtotal),
    discounts: sum(paid, (o) => o.discount + o.loyaltyDiscount),
    tax: sum(paid, (o) => o.tax),
    cgst: sum(paid, (o) => o.cgst),
    sgst: sum(paid, (o) => o.sgst),
    posBills: paid.filter((o) => o.source === "pos").length,
    onlineBills: paid.filter((o) => o.source !== "pos").length,
    avgBill: paid.length ? Math.round(sum(paid, (o) => o.total) / paid.length) : 0,
    byMethod,
    topItems,
    pending: orders.length - paid.length,
  };
}
