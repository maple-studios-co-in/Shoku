"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard, Stat, StatusBadge, BarChart, formatINR } from "@/components/AdminUI";

export default function OverviewPage() {
  const [s, setS] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : null)).then(setS).catch(() => {});
  }, []);

  if (!s) return <div className="text-sm text-muted">Loading dashboard…</div>;

  const maxTop = Math.max(1, ...s.topItems.map((t) => t.qty));

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted">Live performance across your store.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue" value={formatINR(s.revenue)} sub="all time" icon="💰" />
        <Stat label="Orders" value={s.count} sub="all time" icon="🧾" />
        <Stat label="Avg order value" value={formatINR(s.aov)} icon="📈" />
        <Stat label="Customers" value={s.customers} sub={`${s.itemsLive} items live`} icon="👥" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Revenue · last 14 days" className="lg:col-span-2">
          <div className="p-4">
            <BarChart data={s.series} valueKey="revenue" />
          </div>
        </SectionCard>

        <SectionCard title="Top sellers">
          <div className="p-4">
            {s.topItems.length === 0 && <div className="text-sm text-muted">No sales yet.</div>}
            {s.topItems.map((t) => (
              <div key={t.name} className="mb-3 last:mb-0">
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted">{t.qty} sold</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-canvas">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(t.qty / maxTop) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent orders" action={<Link href="/admin/orders" className="text-xs font-bold text-brand">View all →</Link>} className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {s.recent.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3">{o.customer}</td>
                  <td className="px-5 py-3 text-muted">{o.items}</td>
                  <td className="px-5 py-3 capitalize text-muted">{o.fulfilment}</td>
                  <td className="px-5 py-3 font-bold">{formatINR(o.total)}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
