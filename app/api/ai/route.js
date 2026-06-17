import { NextResponse } from "next/server";
import { prisma, parseItem } from "@/lib/db";
import { recommend } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let query = "";
  try {
    query = (await req.json())?.query || "";
  } catch {}
  const items = (
    await prisma.item.findMany({ where: { live: true }, include: { category: true } })
  ).map(parseItem);

  const { intro, picks } = recommend(query, items);
  return NextResponse.json({
    intro,
    picks: picks.map(({ item, why }) => ({
      why,
      item: { id: item.id, name: item.name, img: item.img, price: item.price, kcal: item.kcal },
    })),
  });
}
