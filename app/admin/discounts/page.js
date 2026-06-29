"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/AdminUI";

export default function AdminDiscountsPage() {
  const [rows, setRows] = useState([]);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState(10);
  const [err, setErr] = useState("");

  function load() {
    fetch("/api/discounts").then((r) => (r.ok ? r.json() : [])).then(setRows).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setErr("");
    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, percent: Number(percent) }),
    });
    if (!res.ok) { const d = await res.json(); setErr(d.error || "Failed"); return; }
    setCode(""); setPercent(10); load();
  }

  async function toggle(d) {
    setRows((arr) => arr.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x)));
    await fetch(`/api/discounts/${d.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !d.active }) });
  }
  async function remove(d) {
    if (!confirm(`Delete ${d.code}?`)) return;
    const res = await fetch(`/api/discounts/${d.id}`, { method: "DELETE" });
    if (res.ok) setRows((arr) => arr.filter((x) => x.id !== d.id));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
        <p className="text-sm text-muted">Promo codes customers can apply at checkout.</p>
      </header>

      <SectionCard title="Create a code" className="mb-6">
        <div className="flex flex-wrap items-end gap-3 p-5">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-ink/70">Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER25"
              className="w-44 rounded-lg border border-line px-3 py-2.5 text-[13px] uppercase outline-none focus:border-brand" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-ink/70">Percent off</label>
            <input type="number" value={percent} onChange={(e) => setPercent(e.target.value)} min={1} max={90}
              className="w-28 rounded-lg border border-line px-3 py-2.5 text-[13px] outline-none focus:border-brand" />
          </div>
          <button onClick={create} className="rounded-xl bg-brand px-5 py-2.5 text-[13px] font-bold text-white">Create</button>
          {err && <span className="text-[13px] font-medium text-red-600">{err}</span>}
        </div>
      </SectionCard>

      <SectionCard title="Active & past codes">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Code</th><th className="px-5 py-3">Discount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-muted">No codes yet.</td></tr>}
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-bold tracking-wide">{d.code}</td>
                  <td className="px-5 py-3">{d.percent}% off</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${d.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{d.active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggle(d)} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold">{d.active ? "Disable" : "Enable"}</button>
                      <button onClick={() => remove(d)} className="rounded-lg px-2 py-1.5 text-[12px] font-bold text-red-500">Delete</button>
                    </div>
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
