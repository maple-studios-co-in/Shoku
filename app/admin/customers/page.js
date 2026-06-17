"use client";

import { useEffect, useState } from "react";
import { SectionCard, Stat, formatINR } from "@/components/AdminUI";

export default function AdminCustomersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers").then((r) => (r.ok ? r.json() : [])).then(setRows).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const customers = rows.filter((r) => r.role === "customer");
  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted">Everyone who's signed up to your store.</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Total users" value={rows.length} icon="👥" />
        <Stat label="Customers" value={customers.length} icon="🙂" />
        <Stat label="Lifetime spend" value={formatINR(totalSpend)} icon="💰" />
      </div>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Spend</th>
                <th className="px-5 py-3">Points</th>
                <th className="px-5 py-3">Last order</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">Loading…</td></tr>}
              {!loading && rows.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">{u.name || "—"}</td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${u.role === "admin" ? "bg-brand-tint text-brand-dark" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3">{u.orders}</td>
                  <td className="px-5 py-3 font-bold">{formatINR(u.spend)}</td>
                  <td className="px-5 py-3 text-muted">{u.points.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-muted">{u.lastOrder ? new Date(u.lastOrder).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
