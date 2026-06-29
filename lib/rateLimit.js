// Simple in-memory fixed-window rate limiter.
//
// Process-local: fine for a single instance and dev. For multi-instance prod,
// back this with a shared store (Upstash/Redis) using the same interface.
const buckets = new Map();

export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();

  // Opportunistic prune so the Map can't grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((b.reset - now) / 1000) };
  }
  b.count++;
  return { ok: true, remaining: limit - b.count, retryAfter: 0 };
}

// Best-effort client IP from a Request (route handlers) or NextAuth req object.
export function clientIp(req) {
  const h = req?.headers;
  const get = (k) => (typeof h?.get === "function" ? h.get(k) : h?.[k]);
  const xff = get("x-forwarded-for") || "";
  return (String(xff).split(",")[0] || get("x-real-ip") || "unknown").trim() || "unknown";
}
