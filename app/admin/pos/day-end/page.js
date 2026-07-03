"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/menu";

const today = () => new Date().toISOString().slice(0, 10);

export default function DayEndPage() {
  const [date, setDate] = useState(today());
  const [r, setR] = useState(null);
  const [err, setErr] = useState("");

  const load = (d) =>
    fetch(`/api/pos/day-end?date=${d}`)
      .then((res) => (res.ok ? res.json() : res.json().then((e) => Promise.reject(e.error))))
      .then(setR)
      .catch((e) => setErr(String(e)));
  useEffect(() => { load(date); }, [date]);

  function exportCsv() {
    if (!r) return;
    const rows = [
      ["Date", r.date], ["Bills", r.bills], ["Gross", r.gross], ["Subtotal", r.subtotal],
      ["Discounts", r.discounts], ["GST", r.tax], ["CGST", r.cgst], ["SGST", r.sgst],
      ["POS bills", r.posBills], ["Online bills", r.onlineBills], ["Avg bill", r.avgBill],
      [], ["Payment method", "Amount"],
      ...Object.entries(r.byMethod),
      [], ["Top item", "Qty"],
      ...r.topItems.map((t) => [t.name, t.qty]),
    ];
    const csv = rows.map((row) => (row || []).map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `shoku-dayend-${r.date}.csv`;
    a.click();
  }

  if (err) return <div className="p-8 text-sm text-red-600">{err}</div>;

  return (
    <div className="mx-auto max-w-3xl p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">Day-end report</h1>
        <div className="ml-auto flex items-center gap-2">
          <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none" />
          <button onClick={() => window.print()} className="rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-bold">Print</button>
          <button onClick={exportCsv} className="rounded-xl bg-brand px-3.5 py-2 text-[13px] font-bold text-white">CSV</button>
          <Link href="/admin/pos" className="rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-bold">← POS</Link>
        </div>
      </div>

      {!r ? (
        <div className="p-8 text-sm text-muted">Loading…</div>
      ) : (
        <>
          <div className="hidden print:block"><h1 className="text-xl font-bold">Day-end · {r.date}</h1></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Gross sales", formatINR(r.gross)], ["Bills", r.bills], ["Avg bill", formatINR(r.avgBill)], ["GST collected", formatINR(r.tax)]].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                <div className="font-serif text-xl font-semibold">{v}</div>
                <div className="mt-1 text-[12px] text-muted">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <h3 className="mb-2 text-sm font-bold">Payment split</h3>
              {Object.entries(r.byMethod).length === 0 && <div className="text-[13px] text-muted">No paid bills.</div>}
              {Object.entries(r.byMethod).map(([m, v]) => (
                <div key={m} className="flex justify-between border-b border-line py-1.5 text-[13.5px]">
                  <span className="uppercase">{m}</span><b>{formatINR(v)}</b>
                </div>
              ))}
              <div className="mt-2 flex justify-between text-[12.5px] text-muted"><span>POS / online bills</span><span>{r.posBills} / {r.onlineBills}</span></div>
              <div className="flex justify-between text-[12.5px] text-muted"><span>Discounts given</span><span>{formatINR(r.discounts)}</span></div>
              <div className="flex justify-between text-[12.5px] text-muted"><span>CGST / SGST</span><span>{formatINR(r.cgst)} / {formatINR(r.sgst)}</span></div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
              <h3 className="mb-2 text-sm font-bold">Top items</h3>
              {r.topItems.length === 0 && <div className="text-[13px] text-muted">—</div>}
              {r.topItems.map((t) => (
                <div key={t.name} className="flex justify-between border-b border-line py-1.5 text-[13.5px]">
                  <span className="truncate pr-2">{t.name}</span><b>×{t.qty}</b>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
