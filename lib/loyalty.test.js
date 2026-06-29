import { describe, it, expect } from "vitest";
import { parseTiers, tierFor, DEFAULT_TIERS } from "./loyalty.js";

describe("parseTiers", () => {
  it("parses a valid JSON tier array", () => {
    const tiers = [{ name: "A", min: 0 }, { name: "B", min: 100 }];
    expect(parseTiers(JSON.stringify(tiers))).toEqual(tiers);
  });
  it("falls back to defaults on invalid JSON", () => {
    expect(parseTiers("not json")).toEqual(DEFAULT_TIERS);
  });
  it("falls back to defaults on empty / null", () => {
    expect(parseTiers("[]")).toEqual(DEFAULT_TIERS);
    expect(parseTiers(null)).toEqual(DEFAULT_TIERS);
  });
});

describe("tierFor", () => {
  it("returns the base tier with progress to the next", () => {
    const r = tierFor(0, DEFAULT_TIERS);
    expect(r.name).toBe("Member");
    expect(r.next).toEqual({ name: "Silver", min: 300, toGo: 300 });
  });
  it("picks the correct tier at a boundary", () => {
    expect(tierFor(300, DEFAULT_TIERS).name).toBe("Silver");
    expect(tierFor(2500, DEFAULT_TIERS).name).toBe("Platinum");
  });
  it("has no next tier at the top", () => {
    expect(tierFor(2500, DEFAULT_TIERS).next).toBeNull();
  });
});
