import { describe, it, expect } from "vitest";
import { gstSplit, formatInvoiceNo } from "./posMath.js";

describe("gstSplit", () => {
  it("splits an even tax equally", () => {
    expect(gstSplit(50)).toEqual({ cgst: 25, sgst: 25 });
  });
  it("gives sgst the extra rupee on odd amounts (sum preserved)", () => {
    const { cgst, sgst } = gstSplit(51);
    expect(cgst).toBe(25);
    expect(sgst).toBe(26);
    expect(cgst + sgst).toBe(51);
  });
  it("handles zero and missing values", () => {
    expect(gstSplit(0)).toEqual({ cgst: 0, sgst: 0 });
    expect(gstSplit(undefined)).toEqual({ cgst: 0, sgst: 0 });
  });
});

describe("formatInvoiceNo", () => {
  it("zero-pads to five digits with prefix and year", () => {
    expect(formatInvoiceNo("INV", 2026, 42)).toBe("INV-2026-00042");
    expect(formatInvoiceNo("CB", 2026, 12345)).toBe("CB-2026-12345");
  });
});
