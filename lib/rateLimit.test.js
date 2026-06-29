import { describe, it, expect } from "vitest";
import { rateLimit, clientIp } from "./rateLimit.js";

describe("rateLimit", () => {
  it("allows requests up to the limit, then blocks", () => {
    const key = "test:allow-block";
    expect(rateLimit(key, { limit: 2, windowMs: 10_000 }).ok).toBe(true);
    expect(rateLimit(key, { limit: 2, windowMs: 10_000 }).ok).toBe(true);
    const blocked = rateLimit(key, { limit: 2, windowMs: 10_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });
  it("tracks separate keys independently", () => {
    expect(rateLimit("test:a", { limit: 1, windowMs: 10_000 }).ok).toBe(true);
    expect(rateLimit("test:b", { limit: 1, windowMs: 10_000 }).ok).toBe(true);
  });
});

describe("clientIp", () => {
  it("reads the first x-forwarded-for entry (plain headers)", () => {
    expect(clientIp({ headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } })).toBe("1.2.3.4");
  });
  it("supports Headers-style get()", () => {
    const headers = new Map([["x-forwarded-for", "9.9.9.9"]]);
    expect(clientIp({ headers })).toBe("9.9.9.9");
  });
  it("returns 'unknown' when absent", () => {
    expect(clientIp({ headers: {} })).toBe("unknown");
  });
});
