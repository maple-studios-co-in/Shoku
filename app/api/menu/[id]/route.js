import { NextResponse } from "next/server";
import { prisma, parseItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(parseItem(item));
}
