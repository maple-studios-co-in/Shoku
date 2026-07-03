import { describe, it, expect } from "vitest";
import { formatINR } from "./menu.js";

describe("formatINR", () => {
  it("prefixes the rupee sign", () => {
    expect(formatINR(320)).toBe("₹320");
  });
  it("groups large numbers in the Indian system", () => {
    expect(formatINR(100000)).toBe("₹1,00,000");
  });
  it("handles zero and string input", () => {
    expect(formatINR(0)).toBe("₹0");
    expect(formatINR("450")).toBe("₹450");
  });
});

import { resolveUnitPrice } from "./menu.js";

describe("resolveUnitPrice (server-authoritative pricing)", () => {
  const item = { price: 295, sizes: '[{"name":"Regular","price":295},{"name":"Large","price":335}]' };

  it("ignores any client-sent price and uses the catalog size price", () => {
    expect(resolveUnitPrice(item, "Regular", null).unit).toBe(295);
    expect(resolveUnitPrice(item, "Large", null).unit).toBe(335);
  });
  it("falls back to the first catalog size for unknown sizes", () => {
    const r = resolveUnitPrice(item, "Venti-Mega", null);
    expect(r.size).toBe("Regular");
    expect(r.unit).toBe(295);
  });
  it("adds the milk surcharge only for known milks", () => {
    expect(resolveUnitPrice(item, "Regular", "Oat milk").unit).toBe(335);
    expect(resolveUnitPrice(item, "Regular", "Unicorn milk")).toEqual({ size: "Regular", milk: null, unit: 295 });
  });
  it("survives malformed sizes JSON via the base price", () => {
    expect(resolveUnitPrice({ price: 180, sizes: "not-json" }, "Large", null).unit).toBe(180);
    expect(resolveUnitPrice({ price: 180, sizes: null }, null, null).unit).toBe(180);
  });
});
