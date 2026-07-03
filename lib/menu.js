// Static, presentation-only helpers. The actual menu now lives in the
// database (see prisma/schema.prisma + prisma/seed.js) and is served via
// /api/menu. These constants are brand/store chrome that don't change per item.

export const BRAND = {
  name: "Shoku",
  tagline: "Order smarter",
  store: "Shoku Cafe · Indiranagar",
  address: "100 Ft Rd, Indiranagar, Bengaluru",
};

export const MILK_OPTIONS = [
  { name: "Whole milk", price: 0 },
  { name: "Oat milk", price: 40 },
  { name: "Almond milk", price: 40 },
  { name: "Skimmed milk", price: 0 },
];

export function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

// Server-authoritative line pricing. Resolves the unit price for an order line
// strictly from the catalog (sizes JSON + MILK_OPTIONS) — client-sent prices are
// never trusted. Unknown size falls back to the first catalog size / base price;
// unknown milk is dropped.
export function resolveUnitPrice(item, wantSize, wantMilk) {
  let sizes = [];
  try {
    const parsed = typeof item.sizes === "string" ? JSON.parse(item.sizes || "[]") : item.sizes;
    if (Array.isArray(parsed)) sizes = parsed.filter((s) => s && s.name && Number.isFinite(Number(s.price)));
  } catch {}
  const size = sizes.find((s) => s.name === wantSize) || sizes[0] || null;
  const sizeName = size?.name || "Regular";
  const base = size ? Number(size.price) : Number(item.price) || 0;
  const milkOpt = wantMilk ? MILK_OPTIONS.find((m) => m.name === wantMilk) : null;
  return {
    size: sizeName,
    milk: milkOpt ? milkOpt.name : null,
    unit: Math.max(0, base + (milkOpt?.price || 0)),
  };
}
