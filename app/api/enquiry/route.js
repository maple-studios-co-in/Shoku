import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Public demo/sales enquiry form. Leads land in the platform audit log
// (action "lead.enquiry") so the superadmin sees them at /super/audit.
export async function POST(req) {
  const ip = clientIp(req);
  if (!rateLimit(`enquiry:${ip}`, { limit: 5, windowMs: 3_600_000 }).ok) {
    return NextResponse.json({ error: "Too many requests — please try again in a while." }, { status: 429 });
  }

  let b;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = String(b.name || "").trim().slice(0, 80);
  const email = String(b.email || "").trim().toLowerCase().slice(0, 120);
  const phone = String(b.phone || "").trim().slice(0, 24);
  const cafe = String(b.cafe || "").trim().slice(0, 120);
  const message = String(b.message || "").trim().slice(0, 1000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please tell us your name and a valid email." }, { status: 400 });
  }

  await logAudit({
    session: { user: { email } }, // actorEmail = the lead's email
    action: "lead.enquiry",
    target: cafe || email,
    meta: { name, phone: phone || "—", message: message.slice(0, 300) || "—" },
  });

  return NextResponse.json({ ok: true });
}
