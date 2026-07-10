import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { getTenantLLMConfig, llmEnabled, providerFor, testLLM } from "@/lib/llm";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Platform-wide AI defaults, for display on the super dashboard. Never
// returns any key material.
export async function GET() {
  const gate = await requireSuperadmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const cfg = getTenantLLMConfig(null);
  return NextResponse.json({
    enabled: llmEnabled(),
    defaultModel: cfg.model,
    defaultBaseUrl: cfg.base,
    defaultProvider: providerFor(cfg),
  });
}

// Test an AI config without saving it.
// Body: { tenantId?, apiKey?, baseUrl?, model? } — blanks fall back to the
// tenant's saved config, then to the platform defaults.
export async function POST(req) {
  const gate = await requireSuperadmin();
  if (gate.error) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let saved = {};
  if (b.tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { id: b.tenantId } });
    if (tenant) saved = getTenantLLMConfig(tenant);
  }

  const result = await testLLM({
    key: String(b.apiKey || "").trim() || saved.key,
    base: String(b.baseUrl || "").trim() || saved.base,
    model: String(b.model || "").trim() || saved.model,
  });

  await logAudit({
    session: gate.session,
    action: "ai.test",
    target: b.tenantId || "platform",
    meta: { ok: result.ok, provider: result.provider, model: result.model },
  });

  return NextResponse.json(result);
}
