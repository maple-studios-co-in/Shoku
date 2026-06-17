"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import Header from "@/components/Header";
import { ListItem, RailCard } from "@/components/ProductCard";

export default function MenuPage() {
  const [cat, setCat] = useState("all");
  const [data, setData] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { categories, items } = data;
  const chips = [{ id: "all", label: "All" }, ...categories];
  const picks = items.filter((i) => i.signature || i.rating >= 4.7).slice(0, 6);
  const shownCats = cat === "all" ? categories : categories.filter((c) => c.id === cat);

  return (
    <AppShell>
      <Header />

      <Link href="/ai" className="mx-4 mt-3.5 block">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-4 text-white">
          <div className="pointer-events-none absolute -right-3 -top-3 text-7xl opacity-15">✨</div>
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">✨ Pista AI</div>
          <h3 className="mt-1 text-[17px] font-semibold">Not sure what to order?</h3>
          <p className="mt-0.5 max-w-[230px] text-[12.5px] opacity-90">
            Tell me your mood, time of day or craving — I'll build your perfect cup.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[12.5px] font-bold text-brand-dark">
            Ask Pista AI →
          </span>
        </div>
      </Link>

      <div className="no-scrollbar mt-3.5 flex gap-2 overflow-x-auto px-4 pb-1.5">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
              cat === c.id ? "border-brand bg-brand-tint text-brand-dark" : "border-transparent bg-canvas text-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && <div className="px-4 py-10 text-center text-sm text-muted">Loading menu…</div>}

      {!loading && cat === "all" && picks.length > 0 && (
        <>
          <div className="mb-2.5 mt-4 flex items-baseline justify-between px-4">
            <h3 className="text-base font-bold">✨ Picked for you</h3>
            <span className="text-xs font-semibold text-brand">AI</span>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2">
            {picks.map((item) => (
              <RailCard key={item.id} item={item} badge={item.signature ? "★ Signature" : null} />
            ))}
          </div>
        </>
      )}

      {!loading &&
        shownCats.map((c) => (
          <div key={c.id}>
            <div className="mb-1 mt-4 px-4">
              <h3 className="text-base font-bold">{c.label}</h3>
            </div>
            <div className="px-4 pb-2">
              {items
                .filter((i) => i.category === c.id)
                .map((item) => (
                  <ListItem key={item.id} item={item} />
                ))}
            </div>
          </div>
        ))}

      <div className="h-28" />
    </AppShell>
  );
}
