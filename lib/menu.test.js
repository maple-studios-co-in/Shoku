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
