import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import { createRazorpayOrder, isPaymentsConfigured, publicKeyId } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPaymentsConfigured()) return NextResponse.json({ error: "Payments not configured" }, { status: 503 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Create the local order first (pending). Its server-computed total IS the
  // charge amount — so the gateway can never be asked for a different figure.
  const result = await createOrder(session, body, { paymentStatus: "pending" });
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });
  const { order } = result;

  try {
    const rzp = await createRazorpayOrder({
      amount: order.total * 100, // paise
      currency: "INR",
      receipt: order.id,
      notes: { orderId: order.id, tenantId: order.tenantId || "" },
    });
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzp.id } });
    return NextResponse.json({
      keyId: publicKeyId(),
      razorpayOrderId: rzp.id,
      amount: rzp.amount,
      currency: rzp.currency,
      orderId: order.id,
    });
  } catch {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "failed" } }).catch(() => {});
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  }
}
