import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperadmin } from "@/lib/admin";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

function safe(name) {
  return String(name || "Shoku-Pitch-Deck.pptx").replace(/[^\w.\- ]+/g, "_");
}

// Editable .pptx source — superadmin only.
export async function GET() {
  const gate = await requireSuperadmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const src = await prisma.pitchDeck.findFirst({ where: { kind: "pptx" }, orderBy: { createdAt: "desc" } });
  if (src?.data) {
    return new Response(src.data, {
      headers: {
        "Content-Type": src.mime || PPTX_MIME,
        "Content-Disposition": `attachment; filename="${safe(src.filename)}"`,
        "Content-Length": String(src.size || src.data.length),
        "Cache-Control": "no-store",
      },
    });
  }
  try {
    const buf = await readFile(path.join(process.cwd(), "public", "pitch-deck.pptx"));
    return new Response(buf, {
      headers: { "Content-Type": PPTX_MIME, "Content-Disposition": 'attachment; filename="Shoku-Pitch-Deck.pptx"' },
    });
  } catch {
    return NextResponse.json({ error: "No source uploaded yet." }, { status: 404 });
  }
}
