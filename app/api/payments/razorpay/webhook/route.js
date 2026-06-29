import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/payments";
import { markOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Razorpay → server confirmation (backup to client verify). Public endpoint,
// authenticated by the X-Razorpay-Signature HMAC over the raw body.
export async function POST(req) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";
  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let evt;
  try {
    evt = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const entity = evt?.payload?.payment?.entity;
  const rzpOrderId = entity?.order_id;
  const paymentId = entity?.id;

  if (evt?.event === "payment.captured" && rzpOrderId) {
    const order = await prisma.order.findFirst({ where: { razorpayOrderId: rzpOrderId } });
    if (order) await markOrderPaid(order.id, { razorpayPaymentId: paymentId }); // idempotent
  } else if (evt?.event === "payment.failed" && rzpOrderId) {
    await prisma.order.updateMany({
      where: { razorpayOrderId: rzpOrderId, paymentStatus: { not: "paid" } },
      data: { paymentStatus: "failed" },
    });
  }

  return NextResponse.json({ ok: true });
}
