import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePos, allocateInvoiceNo, gstSplit } from "@/lib/pos";
import { createOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Recent POS bills (reprint / void drawer).
export async function GET() {
  const gate = await requirePos();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const orders = await prisma.order.findMany({
    where: { tenantId: gate.tenantId, source: "pos" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: true },
  });
  return NextResponse.json(orders.map((o) => ({
    id: o.id, invoiceNo: o.invoiceNo, total: o.total, paymentMethod: o.paymentMethod,
    createdAt: o.createdAt, items: o.items.map((i) => ({ name: i.name, qty: i.qty })),
  })));
}

// Ring up a counter sale.
// body: { lines:[{id,qty,unit?,size?,milk?}], paymentMethod:"cash|upi|card", customerPhone?, discountCode? }
export async function POST(req) {
  const gate = await requirePos();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { session, tenantId } = gate;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const method = ["cash", "upi", "card"].includes(body.paymentMethod) ? body.paymentMethod : "cash";

  // Optional loyalty link: match a customer by phone within this tenant.
  let customer = null;
  const phone = String(body.customerPhone || "").replace(/[^\d+]/g, "");
  if (phone.length >= 10) {
    customer = await prisma.user.findFirst({ where: { tenantId, phone: { endsWith: phone.slice(-10) } } });
  }

  const result = await createOrder(
    session,
    { lines: body.lines, discountCode: body.discountCode || null, payment: method, fulfilment: "pickup" },
    {
      paymentStatus: "paid",
      buyerId: customer?.id,             // undefined → staff user (walk-in)
      skipLoyalty: !customer,            // walk-ins earn nothing
      extraData: { source: "pos", paymentMethod: method, staffId: session.user.id },
    }
  );
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });

  // Assign the sequential GST invoice number + tax split now the totals exist.
  const invoiceNo = await allocateInvoiceNo(tenantId);
  const { cgst, sgst } = gstSplit(result.order.tax);
  const order = await prisma.order.update({
    where: { id: result.order.id },
    data: { invoiceNo, cgst, sgst, status: "preparing" },
  });

  return NextResponse.json({
    id: order.id, invoiceNo, total: order.total, tax: order.tax, cgst, sgst,
    customer: customer ? { name: customer.name, points: true } : null,
  });
}
