"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useBrand, useCart } from "./Providers";
import { BRAND } from "@/lib/menu";

export default function Header({ showSearch = true, searchValue = "", onSearch = null }) {
  const { brand } = useBrand();
  const { count, location, setLocation } = useCart();

  const locations = brand.locations || [];
  const current = (location && locations.find((l) => l.id === location.id)) || locations[0] || null;

  // Resync the persisted choice when the café's locations change — otherwise a
  // removed outlet stays in the cart and gets recorded on the next order while
  // the header displays a different (fallback) one.
  useEffect(() => {
    if (!locations.length) return;
    if (!location || !locations.find((l) => l.id === location.id)) {
      setLocation({ id: locations[0].id, label: locations[0].label });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand.locations]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 px-4 pb-3 pt-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand font-serif text-lg font-semibold text-white shadow-sm">
          {brand.name?.[0] || "S"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wide text-muted">Pickup from</div>
          {locations.length > 1 ? (
            <div className="relative">
              <select
                value={current?.id || ""}
                onChange={(e) => {
                  const l = locations.find((x) => x.id === e.target.value);
                  if (l) setLocation({ id: l.id, label: l.label });
                }}
                className="w-full appearance-none truncate bg-transparent pr-5 text-sm font-semibold outline-none"
                aria-label="Choose store location"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{brand.storeName ? `${brand.storeName.split("·")[0].trim()} · ${l.label}` : l.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-xs">▾</span>
            </div>
          ) : (
            <div className="truncate text-sm font-semibold">{brand.storeName || BRAND.store}</div>
          )}
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

      {showSearch &&
        (onSearch ? (
          <label className="mt-3 flex items-center gap-2 rounded-full border border-line bg-canvas px-4 py-2.5 text-sm">
            <span aria-hidden="true">🔍</span>
            <input
              type="search"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search coffee, tea, snacks…"
              aria-label="Search the menu"
              className="w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
            />
            {searchValue && (
              <button onClick={() => onSearch("")} aria-label="Clear search" className="shrink-0 px-1 font-bold text-muted">
                ✕
              </button>
            )}
          </label>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-full border border-line bg-canvas px-4 py-2.5 text-sm text-muted">
            🔍 Search coffee, tea, snacks…
          </div>
        ))}
    </header>
  );
}
