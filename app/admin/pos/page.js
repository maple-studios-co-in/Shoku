"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/menu";

export default function PosPage() {
  const [enabled, setEnabled] = useState(null); // null = loading
  const [settings, setSettings] = useState({});
  const [data, setData] = useState({ categories: [], items: [] });
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [ticket, setTicket] = useState([]); // {id,name,unit,qty}
  const [pay, setPay] = useState("cash");
  const [phone, setPhone] = useState("");
  const [promo, setPromo] = useState("");
  const [billing, setBilling] = useState(false);
  const [done, setDone] = useState(null); // {id, invoiceNo, total, customer}
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    fetch("/api/pos/settings").then((r) => (r.ok ? r.json() : null)).then((s) => {
      setSettings(s || {});
      setEnabled(!!s?.posEnabled);
    }).catch(() => setEnabled(false));
    fetch("/api/menu").then((r) => r.json()).then(setData).catch(() => {});
    loadRecent();
    const onKey = (e) => { if (e.key === "/" && document.activeElement?.tagName !== "INPUT") { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const loadRecent = () => fetch("/api/pos/orders").then((r) => (r.ok ? r.json() : [])).then(setRecent).catch(() => {});

  const items = useMemo(() => {
    let list = data.items || [];
    if (cat !== "all") list = list.filter((i) => i.category === cat);
    if (q.trim()) list = list.filter((i) => i.name.toLowerCase().includes(q.trim().toLowerCase()));
    return list;
  }, [data, cat, q]);

  const add = (item) => {
    setTicket((t) => {
      const f = t.find((l) => l.id === item.id);
      if (f) return t.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l));
      return [...t, { id: item.id, name: item.name, unit: item.price, qty: 1 }];
    });
  };
  const setQty = (id, qty) => setTicket((t) => (qty <= 0 ? t.filter((l) => l.id !== id) : t.map((l) => (l.id === id ? { ...l, qty } : l))));
  const subtotal = ticket.reduce((s, l) => s + l.unit * l.qty, 0);
  const tax = Math.round((subtotal * (settings.gstRate ?? 5)) / 100);

  async function bill() {
    if (!ticket.length || billing) return;
    setBilling(true);
    setError("");
    try {
      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: ticket.map((l) => ({ id: l.id, qty: l.qty })), paymentMethod: pay, customerPhone: phone || null, discountCode: promo || null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Billing failed");
      setDone(d);
      setTicket([]); setPhone(""); setPromo("");
      loadRecent();
      window.open(`/print/invoice/${d.id}`, "_blank", "width=420,height=640");
      if (settings.kotAutoPrint) window.open(`/print/kot/${d.id}`, "_blank", "width=420,height=640");
    } catch (e) {
      setError(e.message);
    } finally {
      setBilling(false);
    }
  }

  if (enabled === null) return <div className="p-8 text-sm text-muted">Loading POS…</div>;
  if (!enabled)
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <div className="text-4xl">💵</div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">POS isn’t enabled yet</h1>
        <p className="mt-2 text-sm text-muted">Counter billing, KOT printing, GST invoices and day-end reports are part of the Shoku POS add-on. Contact Shoku to enable it for your café.</p>
      </div>
    );

  const chips = [{ id: "all", label: "All" }, ...(data.categories || [])];

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col gap-0 lg:flex-row">
      {/* LEFT — item grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">POS Billing</h1>
          <Link href="/admin/pos/day-end" className="ml-auto rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-bold text-ink">Day-end report</Link>
        </div>
        <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search items…  (press "/")'
          className="mb-3 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          {chips.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold ${cat === c.id ? "border-brand bg-brand-tint text-brand-dark" : "border-line bg-white text-muted"}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((i) => (
            <button key={i.id} onClick={() => add(i)}
              className="rounded-2xl border border-line bg-white p-3 text-left shadow-card transition active:scale-[.97]">
              <img src={i.img} alt="" className="mb-2 h-20 w-full rounded-xl object-cover" />
              <div className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-tight">{i.name}</div>
              <div className="mt-1 text-sm font-bold">{formatINR(i.price)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT — ticket */}
      <div className="flex w-full flex-col border-t border-line bg-white lg:w-[380px] lg:border-l lg:border-t-0">
        <div className="border-b border-line px-4 py-3 text-sm font-bold">Current sale</div>
        <div className="flex-1 overflow-y-auto px-4">
          {ticket.length === 0 && <div className="py-10 text-center text-sm text-muted">Tap items to add</div>}
          {ticket.map((l) => (
            <div key={l.id} className="flex items-center gap-2 border-b border-line py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">{l.name}</div>
                <div className="text-[12px] text-muted">{formatINR(l.unit)}</div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-brand bg-brand-tint px-2 py-1">
                <button onClick={() => setQty(l.id, l.qty - 1)} className="w-4 font-bold text-brand-dark">−</button>
                <span className="min-w-4 text-center text-sm font-bold text-brand-dark">{l.qty}</span>
                <button onClick={() => setQty(l.id, l.qty + 1)} className="w-4 font-bold text-brand-dark">+</button>
              </div>
              <div className="w-16 text-right text-sm font-bold">{formatINR(l.unit * l.qty)}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-line p-4">
          <div className="mb-2 flex gap-2">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Customer phone (loyalty, optional)"
              className="flex-1 rounded-xl border border-line px-3 py-2 text-[13px] outline-none focus:border-brand" />
            <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo"
              className="w-24 rounded-xl border border-line px-3 py-2 text-[13px] uppercase outline-none focus:border-brand" />
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {["cash", "upi", "card"].map((m) => (
              <button key={m} onClick={() => setPay(m)}
                className={`rounded-xl border px-3 py-2.5 text-[13px] font-bold uppercase ${pay === m ? "border-brand bg-brand-tint text-brand-dark" : "border-line text-muted"}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="mb-1 flex justify-between text-[13px] text-muted"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
          <div className="mb-2 flex justify-between text-[13px] text-muted"><span>GST ({settings.gstRate ?? 5}%)</span><span>{formatINR(tax)}</span></div>
          {error && <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-600">{error}</div>}
          {done && !ticket.length && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-brand-tint px-3 py-2 text-[12.5px] font-semibold text-brand-dark">
              ✓ {done.invoiceNo} · {formatINR(done.total)}{done.customer ? " · loyalty credited" : ""}
              <span className="ml-auto flex gap-2">
                <a href={`/print/invoice/${done.id}`} target="_blank" className="underline">Invoice</a>
                <a href={`/print/kot/${done.id}`} target="_blank" className="underline">KOT</a>
              </span>
            </div>
          )}
          <button onClick={bill} disabled={!ticket.length || billing}
            className="w-full rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white active:scale-[.98] disabled:opacity-40">
            {billing ? "Billing…" : `Bill — ${formatINR(subtotal + tax)}`}
          </button>

          {recent.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted">Recent bills</div>
              {recent.map((r) => (
                <div key={r.id} className="flex items-center gap-2 py-1 text-[12.5px]">
                  <span className="font-semibold">{r.invoiceNo}</span>
                  <span className="text-muted">{formatINR(r.total)} · {r.paymentMethod}</span>
                  <a href={`/print/invoice/${r.id}`} target="_blank" className="ml-auto font-bold text-brand">Reprint</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
