import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperadmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

async function metaFor(kind) {
  const d = await prisma.pitchDeck.findFirst({
    where: { kind },
    orderBy: { createdAt: "desc" },
    select: { version: true, filename: true, size: true, createdAt: true, uploadedBy: true },
  });
  if (!d) return { custom: false, version: null, filename: null, size: null, uploadedAt: null, uploadedBy: null };
  return { custom: true, version: d.version, filename: d.filename, size: d.size, uploadedAt: d.createdAt, uploadedBy: d.uploadedBy };
}

export async function GET() {
  const [pdf, pptx] = await Promise.all([metaFor("pdf"), metaFor("pptx")]);
  return NextResponse.json({ pdf, pptx, downloadUrl: "/api/pitch/download", sourceUrl: "/api/pitch/source" });
}

export async function POST(req) {
  const gate = await requireSuperadmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file received." }, { status: 400 });

  const name = file.name || "deck";
  const mime = (file.type || "").toLowerCase();
  const lower = name.toLowerCase();

  // Determine kind from the explicit field, then mime/extension.
  let kind = String(form.get("kind") || "").toLowerCase();
  if (kind !== "pdf" && kind !== "pptx") {
    if (lower.endsWith(".pptx") || mime.includes("presentationml")) kind = "pptx";
    else kind = "pdf";
  }

  if (kind === "pdf" && !(/pdf/.test(mime) || lower.endsWith(".pdf"))) {
    return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
  }
  if (kind === "pptx" && !(mime.includes("presentationml") || lower.endsWith(".pptx"))) {
    return NextResponse.json({ error: "Please upload a .pptx file." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length === 0) return NextResponse.json({ error: "File is empty." }, { status: 400 });
  const cap = kind === "pptx" ? 25 : 15;
  if (buf.length > cap * 1024 * 1024) return NextResponse.json({ error: `File too large (max ${cap}MB).` }, { status: 400 });

  const last = await prisma.pitchDeck.findFirst({ where: { kind }, orderBy: { version: "desc" }, select: { version: true } });
  const version = (last?.version || 0) + 1;

  await prisma.pitchDeck.create({
    data: { kind, version, filename: name, mime: kind === "pptx" ? PPTX_MIME : "application/pdf", size: buf.length, data: buf, uploadedBy: gate.session.user.email },
  });
  await logAudit({ session: gate.session, action: "pitch.upload", target: `${kind} v${version}`, meta: { kind, size: buf.length, filename: name } });

  return NextResponse.json({ ok: true, kind, version, size: buf.length });
}
