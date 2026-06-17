import { NextResponse } from "next/server";
import { prisma, parseItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const all = new URL(req.url).searchParams.get("all") === "1";
  const [categories, items] = await Promise.all([
    prisma.category.findMany({ orderBy: { sort: "asc" } }),
    prisma.item.findMany({
      where: all ? {} : { live: true },
      orderBy: [{ sort: "asc" }],
      include: { category: true },
    }),
  ]);
  return NextResponse.json({
    categories: categories.map((c) => ({ id: c.id, label: c.label })),
    items: items.map(parseItem),
  });
}
