"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/AdminUI";

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const ICON = { create: "🆕", "tenant.create": "🏪", "campaign.send": "📲", suspend: "⛔", "tenant.suspend": "⛔", login: "🔑", "lead.enquiry": "📩", "tenant.ai_config": "✦", "ai.test": "✦" };

export default function AuditLogPage() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    fetch("/api/super/audit").then((r) => (r.ok ? r.json() : [])).then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>
          <p className="text-sm text-muted">Platform actions, most recent first.</p>
        </div>
        <Link href="/super" className="rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-bold">← Overview</Link>
      </header>

      <SectionCard title="Activity">
        <div className="divide-y divide-line">
          {logs === null && <div className="p-4 text-sm text-muted">Loading…</div>}
          {logs && logs.length === 0 && <div className="p-6 text-center text-sm text-muted">No activity recorded yet.</div>}
          {logs &&
            logs.map((l) => (
              <div key={l.id} className="flex items-start gap-3 p-3.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-canvas text-sm">{ICON[l.action] || "•"}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px]">
                    <span className="font-semibold">{l.actorEmail || "system"}</span>{" "}
                    <span className="text-muted">{l.action}</span>
                    {l.target && <span className="font-semibold"> · {l.target}</span>}
                  </div>
                  {l.meta && (
                    <div className="mt-0.5 truncate text-[12px] text-muted">{Object.entries(l.meta).map(([k, v]) => `${k}: ${v}`).join(" · ")}</div>
                  )}
                </div>
                <div className="shrink-0 text-[11.5px] text-muted">{timeAgo(l.createdAt)}</div>
              </div>
            ))}
        </div>
      </SectionCard>
    </div>
  );
}
