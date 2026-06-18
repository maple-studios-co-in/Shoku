import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tenantId = session.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const rating = Math.max(1, Math.min(5, Number(b.rating) || 0));
  if (!rating) return NextResponse.json({ error: "Rating is required." }, { status: 400 });

  const fb = await prisma.feedback.create({
    data: {
      tenantId,
      userId: session.user.id,
      orderId: b.orderId || null,
      name: session.user.name || null,
      rating,
      comment: (b.comment || "").slice(0, 500) || null,
    },
  });
  return NextResponse.json({ ok: true, id: fb.id });
}
