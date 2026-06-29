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
