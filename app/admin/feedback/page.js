"use client";

import { useEffect, useState } from "react";
import { SectionCard, Stat } from "@/components/AdminUI";

function Stars({ n }) {
  return (
    <span style={{ color: "#e8a33d", letterSpacing: 1 }}>
      {"★".repeat(n)}<span style={{ color: "#d9e4cc" }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function AdminFeedbackPage() {
  const [d, setD] = useState(null);

  useEffect(() => {
    fetch("/api/admin/feedback").then((r) => (r.ok ? r.json() : null)).then(setD).catch(() => {});
  }, []);

  if (!d) return <div className="text-sm text-muted">Loading…</div>;
  const maxBar = Math.max(1, ...d.distribution);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Guest feedback</h1>
        <p className="text-sm text-muted">What customers think, captured after each order.</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Average rating" value={d.count ? `${d.avg} ★` : "—"} icon="⭐" />
        <Stat label="Responses" value={d.count} icon="💬" />
        <Stat label="5-star share" value={d.count ? `${Math.round((d.distribution[4] / d.count) * 100)}%` : "—"} icon="🌟" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <SectionCard title="Rating breakdown">
          <div className="p-5">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="mb-2.5 flex items-center gap-3 last:mb-0">
                <span className="w-8 text-[12px] font-semibold text-muted">{star}★</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-canvas">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(d.distribution[star - 1] / maxBar) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-[12px] text-muted">{d.distribution[star - 1]}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent feedback">
          <div className="max-h-[460px] overflow-y-auto">
            {d.items.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted">No feedback yet.</div>}
            {d.items.map((f) => (
              <div key={f.id} className="border-b border-line px-5 py-3.5 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-semibold">{f.name}</span>
                  <Stars n={f.rating} />
                </div>
                {f.comment && <p className="mt-1 text-[13px] text-ink/80">{f.comment}</p>}
                <div className="mt-1 text-[11px] text-muted">{new Date(f.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
