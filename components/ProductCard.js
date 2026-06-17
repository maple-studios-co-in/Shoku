"use client";

import Link from "next/link";
import { useCart } from "./Providers";
import { formatINR } from "@/lib/menu";

function VegBadge({ veg }) {
  return (
    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-muted">
      <span
        className="inline-grid h-3 w-3 place-items-center rounded-sm border-[1.5px]"
        style={{ borderColor: veg ? "#2e9e54" : "#c0392b" }}
      >
        <span
          className="h-[5px] w-[5px] rounded-full"
          style={{ background: veg ? "#2e9e54" : "#c0392b" }}
        />
      </span>
      {veg ? "Veg" : "Non-veg"}
    </span>
  );
}

// Full-width list row
export function ListItem({ item }) {
  const { add } = useCart();
  return (
    <div className="flex items-center gap-3 border-b border-line py-3.5">
      <Link href={`/item/${item.id}`} className="shrink-0">
        <img src={item.img} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/item/${item.id}`} className="block">
          <div className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight">
            {item.name}
            {item.signature && (
              <span className="rounded-full bg-brand-tint px-1.5 py-0.5 text-[9px] font-bold text-brand-dark">
                ★ SIGNATURE
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.desc}</p>
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <VegBadge veg={item.veg} />
            <div className="text-[11px] text-muted">{item.kcal} kcal · {item.caffeine}mg caffeine</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{formatINR(item.price)}</span>
            <button
              onClick={() => add(item)}
              className="rounded-lg border border-brand bg-brand-tint px-4 py-1.5 text-xs font-bold text-brand-dark active:scale-95"
            >
              ADD +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Horizontal rail card
export function RailCard({ item, badge }) {
  const { add } = useCart();
  return (
    <div className="w-40 shrink-0 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <Link href={`/item/${item.id}`} className="block">
        <div className="relative h-28">
          <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
          {badge && (
            <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-brand-dark shadow-card">
              {badge}
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/item/${item.id}`} className="line-clamp-2 block min-h-[34px] text-[13px] font-semibold leading-tight">
          {item.name}
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold">{formatINR(item.price)}</span>
          <button
            onClick={() => add(item)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-lg leading-none text-white active:scale-90"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
