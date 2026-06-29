"use client";

import { useEffect, useState } from "react";
import { useBrand } from "@/components/Providers";
import { SectionCard } from "@/components/AdminUI";

const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN || "pista.maplestudios.co.in";

export default function AdminTablesPage() {
  const { brand } = useBrand();
  const [tables, setTables] = useState([]);
  const [label, setLabel] = useState("");
  const [qrOf, setQrOf] = useState(null);

  function load() {
    fetch("/api/tables").then((r) => (r.ok ? r.json() : [])).then(setTables).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  const tableUrl = (id) => `https://${brand.subdomain || "your-cafe"}.${BASE}/?table=${id}`;
  const qrSrc = (id) => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(tableUrl(id))}`;

  async function add() {
    const l = label.trim();
    if (!l) return;
    const res = await fetch("/api/tables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: l }) });
    if (res.ok) { setLabel(""); load(); }
  }
  async function toggle(t) {
    setTables((a) => a.map((x) => (x.id === t.id ? { ...x, active: !x.active } : x)));
    await fetch(`/api/tables/${t.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !t.active }) });
  }
  async function remove(t) {
    if (!confirm(`Remove ${t.label}?`)) return;
    const res = await fetch(`/api/tables/${t.id}`, { method: "DELETE" });
    if (res.ok) load();
  }
  function bulkAdd() {
    const n = parseInt(prompt("How many tables to create (T1…Tn)?", "8") || "0", 10);
    if (!n) return;
    (async () => {
      const start = tables.length + 1;
      for (let i = 0; i < n; i++) {
        await fetch("/api/tables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: `T${start + i}` }) });
      }
      load();
    })();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tables</h1>
          <p className="text-sm text-muted">Create tables and print a QR for each — scans open the menu with the table attached.</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Table name (e.g. T4)"
            className="w-40 rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-brand" onKeyDown={(e) => e.key === "Enter" && add()} />
          <button onClick={add} className="rounded-xl bg-brand px-4 py-2 text-[13px] font-bold text-white">Add</button>
          <button onClick={bulkAdd} className="rounded-xl border border-line px-3 py-2 text-[13px] font-semibold">Bulk</button>
        </div>
      </header>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Table</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Ordering link</th><th className="px-5 py-3">Active</th><th className="px-5 py-3">QR</th><th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tables.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No tables yet — add your first.</td></tr>}
              {tables.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">{t.label}</td>
                  <td className="px-5 py-3 text-muted">{t.orders}</td>
                  <td className="px-5 py-3"><a href={tableUrl(t.id)} target="_blank" rel="noreferrer" className="text-brand-dark underline">open</a></td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggle(t)} className={`relative h-6 w-10 rounded-full ${t.active ? "bg-brand" : "bg-gray-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${t.active ? "right-1" : "left-1"}`} /></button>
                  </td>
                  <td className="px-5 py-3"><button onClick={() => setQrOf(t)} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold">Show QR</button></td>
                  <td className="px-5 py-3"><button onClick={() => remove(t)} className="text-[12px] font-bold text-red-500">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {qrOf && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6" onClick={() => setQrOf(null)}>
          <div className="rounded-3xl bg-white p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">{qrOf.label}</h2>
            <p className="mb-3 mt-1 text-[12px] text-muted">Print &amp; place on the table — diners scan to order.</p>
            <img src={qrSrc(qrOf.id)} alt={`QR for ${qrOf.label}`} className="mx-auto rounded-xl border border-line" width={220} height={220} />
            <div className="mt-3 flex gap-2">
              <button onClick={() => window.open(qrSrc(qrOf.id), "_blank")} className="flex-1 rounded-xl bg-brand py-2.5 text-[13px] font-bold text-white">Open / print</button>
              <button onClick={() => setQrOf(null)} className="rounded-xl border border-line px-4 py-2.5 text-[13px] font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
