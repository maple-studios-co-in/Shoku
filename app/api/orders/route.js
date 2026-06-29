import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, tenantId: session.user.tenantId ?? undefined },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return NextResponse.json(orders);
}

// Direct checkout (mock-paid). The Razorpay flow lives under /api/payments/razorpay.
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await createOrder(session, body, { paymentStatus: "paid" });
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status || 400 });

  const { order } = result;
  return NextResponse.json({ id: order.id, total: order.total, status: order.status });
}
