import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

function safe(name) {
  return String(name || "Shoku-Pitch-Deck.pdf").replace(/[^\w.\- ]+/g, "_");
}

export async function GET(req) {
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  const disp = inline ? "inline" : "attachment";

  const deck = await prisma.pitchDeck.findFirst({ where: { kind: "pdf" }, orderBy: { createdAt: "desc" } });
  if (deck?.data) {
    return new Response(deck.data, {
      headers: {
        "Content-Type": deck.mime || "application/pdf",
        "Content-Disposition": `${disp}; filename="${safe(deck.filename)}"`,
        "Content-Length": String(deck.size || deck.data.length),
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const buf = await readFile(path.join(process.cwd(), "public", "pitch-deck.pdf"));
    return new Response(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disp}; filename="Shoku-Pitch-Deck.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "No deck available yet." }, { status: 404 });
  }
}
