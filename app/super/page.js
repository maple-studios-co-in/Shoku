"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard, Stat, BarChart, formatINR } from "@/components/AdminUI";

const PLAN_COLORS = { starter: "#9ca3af", growth: "#3A6B4D", enterprise: "#244635" };

export default function PlatformOverview() {
  const [a, setA] = useState(null);

  useEffect(() => {
    fetch("/api/super/analytics").then((r) => (r.ok ? r.json() : null)).then(setA).catch(() => {});
  }, []);

  if (!a) return <div className="text-sm text-muted">Loading platform analytics…</div>;

  const t = a.totals;
  const planTotal = Object.values(a.mrrByPlan).reduce((s, n) => s + n, 0) || 1;
  const planRows = Object.entries(a.mrrByPlan).sort((x, y) => y[1] - x[1]);
  const growth = a.forecast.momGrowth;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform analytics</h1>
          <p className="text-sm text-muted">AI-assisted overview across all cafés on Shoku.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/super/audit" className="rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-bold">Audit log</Link>
          <Link href="/super/cafes" className="rounded-xl bg-brand px-4 py-2.5 text-[13px] font-bold text-white">Manage cafés →</Link>
        </div>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="MRR" value={formatINR(t.mrr)} sub={`${formatINR(t.arr)} ARR`} icon="💳" />
        <Stat label="Cafés" value={t.cafes} sub={`${t.active} active · ${t.trial} trial`} icon="🏪" />
        <Stat label="Order revenue" value={formatINR(t.revenue)} sub={`${t.orders} orders`} icon="💰" />
        <Stat label="Customers" value={a.customers} icon="👥" />
      </div>

      {/* AI insights */}
      <div className="mt-6">
        <SectionCard
          title="AI insights — what changed & why"
          action={<span className="rounded-full bg-brand-tint px-2.5 py-1 text-[11px] font-bold text-brand-dark">{a.narrative.source === "ai" ? "AI" : "Auto"}</span>}
        >
          <div className="p-4">
            <ul className="space-y-2.5">
              {a.narrative.lines.map((l, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug">
                  <span className="mt-0.5 text-brand">✦</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Revenue trend"
          action={
            <span className={`text-[12px] font-bold ${growth >= 0 ? "text-brand-dark" : "text-red-500"}`}>
              {growth >= 0 ? "▲" : "▼"} {Math.abs(Math.round(growth * 100))}% MoM
            </span>
          }
        >
          <div className="p-4">
            <BarChart data={a.months} valueKey="revenue" money />
            <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
              <span className="text-[12.5px] font-semibold text-muted">Forecast · next month</span>
              <span className="text-[15px] font-extrabold text-brand-dark">{formatINR(a.forecast.nextMonth)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="New cafés / month">
          <div className="p-4">
            <BarChart data={a.months} valueKey="cafes" money={false} />
            <div className="mt-3 flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
              <span className="text-[12.5px] font-semibold text-muted">Orders this period</span>
              <span className="text-[15px] font-extrabold text-brand-dark">{a.months.reduce((s, m) => s + m.orders, 0)}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* MRR by plan + at-risk */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="MRR by plan">
          <div className="p-4">
            {planRows.length === 0 && <div className="text-sm text-muted">No paying cafés yet.</div>}
            {planRows.map(([plan, val]) => (
              <div key={plan} className="mb-3 last:mb-0">
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-semibold capitalize">{plan}</span>
                  <span className="text-muted">{formatINR(val)} <span className="text-[11px]">({Math.round((val / planTotal) * 100)}%)</span></span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-canvas">
                  <div className="h-full rounded-full" style={{ width: `${(val / planTotal) * 100}%`, background: PLAN_COLORS[plan] || "#3A6B4D" }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="At-risk cafés"
          action={<span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-bold text-muted">{a.atRisk.length}</span>}
        >
          <div className="p-4">
            {a.atRisk.length === 0 && <div className="text-sm text-muted">No cafés flagged — retention looks healthy. 💚</div>}
            {a.atRisk.map((c) => (
              <div key={c.slug} className="flex items-center justify-between border-b border-line py-2.5 text-[13px] last:border-0">
                <div>
                  <div className="font-semibold">{c.name} <span className="text-muted">· {c.slug}</span></div>
                  <div className="text-[12px] text-muted">{c.reason}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${c.severity === "high" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                  {c.severity === "high" ? "high" : "watch"}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top cafés */}
      <div className="mt-6">
        <SectionCard title="Top cafés by revenue">
          <div className="p-4">
            {a.topCafes.length === 0 && <div className="text-sm text-muted">No cafés yet.</div>}
            {a.topCafes.map((c) => {
              const max = Math.max(1, ...a.topCafes.map((x) => x.revenue));
              return (
                <div key={c.slug} className="mb-3 last:mb-0">
                  <div className="mb-1 flex justify-between text-[13px]">
                    <span className="font-semibold">{c.name} <span className="text-muted">· {c.plan}</span></span>
                    <span className="text-muted">{formatINR(c.revenue)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-canvas">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(c.revenue / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
