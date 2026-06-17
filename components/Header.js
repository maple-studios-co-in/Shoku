"use client";

import Link from "next/link";
import { useBrand, useCart } from "./Providers";
import { BRAND } from "@/lib/menu";

export default function Header({ showSearch = true }) {
  const { brand } = useBrand();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white px-4 pb-3 pt-3 border-b border-line">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-base font-extrabold text-white">
          {brand.name?.[0] || "P"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wide text-muted">Pickup from</div>
          <div className="truncate text-sm font-semibold">{BRAND.store} ▾</div>
        </div>
        <Link
          href="/cart"
          className="relative grid h-10 w-10 place-items-center rounded-full bg-canvas text-lg"
        >
          🛍️
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>

      {showSearch && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-canvas px-3.5 py-2.5 text-sm text-muted">
          🔍 Search coffee, tea, snacks…
        </div>
      )}
    </header>
  );
}
