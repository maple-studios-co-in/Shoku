import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/payments";
import { markOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { razorpayOrderId, razorpayPaymentId, signature, orderId } = body || {};

  if (!verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature })) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // The signature is valid; bind it to the caller's own pending order.
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id, razorpayOrderId },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const res = await markOrderPaid(order.id, { razorpayPaymentId });
  if (res.error) return NextResponse.json({ error: res.error }, { status: res.status || 400 });
  return NextResponse.json({ ok: true, id: order.id });
}
