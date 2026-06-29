"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

/* ----------------------------- Cart ----------------------------- */
const CartCtx = createContext(null);

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

function lineKey(item, opts) {
  return [item.id, opts?.size, opts?.milk].join("|");
}

function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [ready, setReady] = useState(false);
  const [table, setTableState] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shoku.cart");
      if (saved) setLines(JSON.parse(saved));
      const t = localStorage.getItem("shoku.table");
      if (t) setTableState(JSON.parse(t));
    } catch {}
    setReady(true);
  }, []);

  function setTable(t) {
    setTableState(t);
    try {
      if (t) localStorage.setItem("shoku.table", JSON.stringify(t));
      else localStorage.removeItem("shoku.table");
    } catch {}
  }

  useEffect(() => {
    if (ready) localStorage.setItem("shoku.cart", JSON.stringify(lines));
  }, [lines, ready]);

  function add(item, opts = {}, qty = 1) {
    const size = opts.size || item.sizes?.[0]?.name || "Regular";
    const milk = opts.milk || null;
    const sizeObj = item.sizes?.find((s) => s.name === size);
    const unit = (sizeObj ? sizeObj.price : item.price) + (opts.milkPrice || 0);
    const key = lineKey(item, { size, milk });
    setLines((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      return [...prev, { key, id: item.id, name: item.name, img: item.img, size, milk, unit, qty }];
    });
  }

  function setQty(key, qty) {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty } : l))
    );
  }

  function clear() {
    setLines([]);
  }

  // Total quantity of an item across all its variants (for the menu steppers).
  function qtyOf(itemId) {
    return lines.filter((l) => l.id === itemId).reduce((s, l) => s + l.qty, 0);
  }

  // Decrement the default variant of an item (falls back to any variant).
  function dec(item) {
    const size = item.sizes?.[0]?.name || "Regular";
    const key = lineKey(item, { size, milk: null });
    const line = lines.find((l) => l.key === key) || lines.find((l) => l.id === item.id);
    if (line) setQty(line.key, line.qty - 1);
  }

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);

  return (
    <CartCtx.Provider value={{ lines, add, dec, setQty, clear, qtyOf, count, subtotal, ready, table, setTable }}>
      {children}
    </CartCtx.Provider>
  );
}

/* ----------------------------- Brand (white-label) ----------------------------- */
const BrandCtx = createContext(null);

export function useBrand() {
  const ctx = useContext(BrandCtx);
  if (!ctx) throw new Error("useBrand must be used inside <Providers>");
  return ctx;
}

export function hexToChannels(hex) {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(" ");
}

const DEFAULTS = {
  name: "Shoku",
  brandHex: "#3A6B4D",
  darkHex: "#244635",
  font: "Inter",
  subdomain: "shoku.app",
  aiAssistant: true,
  aiCards: true,
  aiUpsell: true,
  aiLoyalty: false,
};

function applyTheme(brand) {
  const root = document.documentElement;
  root.style.setProperty("--brand", hexToChannels(brand.brandHex));
  root.style.setProperty("--brand-dark", hexToChannels(brand.darkHex));
  const [r, g, b] = hexToChannels(brand.brandHex).split(" ").map(Number);
  const tint = [r, g, b].map((c) => Math.round(c + (255 - c) * 0.85)).join(" ");
  root.style.setProperty("--brand-tint", tint);
}

function BrandProvider({ children }) {
  const [brand, setBrand] = useState(DEFAULTS);

  useEffect(() => {
    // instant paint from cache, then sync authoritative value from the DB
    try {
      const cached = localStorage.getItem("shoku.brand");
      if (cached) setBrand((b) => ({ ...b, ...JSON.parse(cached) }));
    } catch {}
    fetch("/api/brand")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setBrand((b) => ({ ...b, ...d })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    applyTheme(brand);
    try {
      localStorage.setItem("shoku.brand", JSON.stringify(brand));
    } catch {}
  }, [brand]);

  // Persist to the backend (admin "Publish").
  async function saveBrand(next) {
    setBrand(next);
    try {
      await fetch("/api/brand", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      return true;
    } catch {
      return false;
    }
  }

  return (
    <BrandCtx.Provider value={{ brand, setBrand, saveBrand, DEFAULTS }}>{children}</BrandCtx.Provider>
  );
}

export function Providers({ children }) {
  return (
    <SessionProvider>
      <BrandProvider>
        <CartProvider>{children}</CartProvider>
      </BrandProvider>
    </SessionProvider>
  );
}
