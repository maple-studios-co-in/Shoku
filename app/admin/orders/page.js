"use client";

import { useEffect, useState } from "react";
import { SectionCard, StatusBadge, formatINR } from "@/components/AdminUI";

const FILTERS = ["all", "preparing", "ready", "completed", "cancelled"];
const NEXT = { preparing: "ready", ready: "completed" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch(`/api/admin/orders?status=${filter}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filter]);

  async function setStatus(id, status) {
    setOrders((arr) => arr.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
    if (filter !== "all") load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-sm text-muted">Track and advance every order.</p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold capitalize ${
              filter === f ? "bg-brand text-white" : "border border-line bg-white text-muted"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Placed</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-5 py-8 text-center text-muted">Loading…</td></tr>}
              {!loading && orders.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-muted">No orders here.</td></tr>}
              {!loading && orders.map((o) => (
                <tr key={o.id} className="border-b border-line align-top last:border-0">
                  <td className="px-5 py-3 font-semibold">#{o.id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium">{o.customer}</div>
                    <div className="text-[11px] text-muted">{o.email}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {o.items.map((i, k) => (
                      <div key={k}>{i.qty}× {i.name}{i.milk ? ` · ${i.milk}` : ""}</div>
                    ))}
                  </td>
                  <td className="px-5 py-3 capitalize text-muted">{o.fulfilment}{o.table ? ` · ${o.table}` : ""}</td>
                  <td className="px-5 py-3 font-bold">{formatINR(o.total)}</td>
                  <td className="px-5 py-3 text-muted">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3">
                    {NEXT[o.status] ? (
                      <button onClick={() => setStatus(o.id, NEXT[o.status])} className="rounded-lg bg-brand-tint px-3 py-1.5 text-[12px] font-bold text-brand-dark">
                        Mark {NEXT[o.status]}
                      </button>
                    ) : (
                      <span className="text-[12px] text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
