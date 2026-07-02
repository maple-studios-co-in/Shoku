# Unit Economics & Pricing Model — SaaS today, POS tomorrow

**Date:** June 2026 · **Status:** working model — every figure is either **[cited]**, **[actual]** (from our stack), or **[assumption]** with a range. Replace assumptions as real data lands.

---

## 0. TL;DR

- At current pricing, a Shoku café is **~85–90% gross margin** — our marginal costs are near zero because the AI is rule-based, WhatsApp is pay-per-message, and hosting is shared. **[modelled below]**
- The whole business case is therefore **CAC and churn**, not COGS. Inbound-led CAC pays back in ~1–2 months; field-sales CAC in ~4–8 months.
- Adding a **software-only POS (Route A)** barely changes COGS but should cut churn (billing = daily habit) and raises defensible ARPU.
- A **hardware-led POS (Route B)** roughly triples CAC and adds inventory/logistics/support costs that only clear at funded-startup scale. The numbers favour Route A now.

## 1. Our cost base — three options (pick/confirm one)

We haven't fixed our infra budget yet, so the model runs on three scenarios:

| Cost line (per month) | **S1 Lean (today)** | **S2 Growth (~50 cafés)** | **S3 Scale (~300 cafés)** |
|---|---|---|---|
| Hosting | shared VPS slice **₹800** [actual-ish: app shares one VPS] | dedicated 8GB VPS + Postgres **₹3,500** | 2× app + managed PG + R2/CDN **₹15,000** |
| DB/backups | R2 free tier **₹0** [actual] | R2 + snapshots **₹300** | **₹1,500** |
| AI (recommender) | rule-based **₹0** [actual — lib/ai.js is heuristic] | LLM-assisted copy ~₹0.4/req × 10k **₹4,000** | **₹20,000** |
| Monitoring/errors | none **₹0** | Sentry team **₹2,200** | **₹5,000** |
| **Platform total** | **₹800** | **₹10,000** | **₹41,500** |
| **÷ cafés → per-café platform cost** | ₹80–800 (1–10 cafés) | **₹200** | **₹140** |

Per-café *variable* costs (all scenarios):

| Line | Cost | Source |
|---|---|---|
| WhatsApp marketing msg | **₹0.86–0.88 + 18% GST ≈ ₹1.02** | Meta India rate, Jan 2026 ([AiSensy](https://m.aisensy.com/blog/whatsapp-per-message-pricing-update-effective-january-1-2026/), [Blueticks](https://blueticks.co/blog/whatsapp-business-api-pricing-2026)) |
| WhatsApp utility msg (order updates) | **₹0.13 + GST ≈ ₹0.15**; service-window replies **free** | same |
| Payment gateway | Razorpay ~**2%** of order value — **pass-through** to café (industry norm) | [assumption] |
| Support | **₹150–400/café/mo** [assumption: 0.5–1.5 hr @ ₹300/hr blended] | needs your input |

## 2. Per-café P&L (monthly)

Assume a Growth-plan café sending 2,000 marketing + 1,500 utility messages/mo (an active marketer):

| | **Starter ₹4,999** | **Growth ₹12,999** |
|---|---|---|
| Revenue | 4,999 | 12,999 |
| Platform share (S2) | −200 | −200 |
| WhatsApp (mkt+util) | −500 (light use) | −2,265 |
| Support | −250 | −400 |
| **Gross profit** | **₹4,049** | **₹10,134** |
| **Gross margin** | **81%** | **78%** |

> Sensitivity: WhatsApp is the only cost that scales with usage — a heavy campaigner (10k mkt msgs) burns ₹10k/mo. **Action:** meter it — include N messages in the plan, bill overage at ₹1.25/msg (margin-safe vs Meta's ₹1.02). This single decision protects the whole margin structure.

## 3. CAC, LTV, payback

| | **Inbound/product-led** | **Field sales (POS-style)** |
|---|---|---|
| CAC [assumption] | ₹3,000–8,000 (demo + onboarding) | ₹15,000–30,000 (rep visits, hardware demo) |
| Payback @ Growth GP ₹10k/mo | **0.3–0.8 mo** | **1.5–3 mo** |
| Payback @ Starter GP ₹4k/mo | 0.7–2 mo | 3.7–7.5 mo |

LTV @ blended GP ₹7,000/mo across churn scenarios:

| Monthly churn | Avg life | LTV | LTV:CAC (inbound ₹5.5k) | LTV:CAC (field ₹22.5k) |
|---|---|---|---|---|
| 2% (sticky, POS-like) | 50 mo | **₹3.5L** | 64× | 15× |
| 4% (good SaaS) | 25 mo | ₹1.75L | 32× | 8× |
| 7% (weak — "nice-to-have" tool) | 14 mo | ₹1.0L | 18× | 4.4× |

**The strategic read:** churn moves LTV 3.5× across plausible range. A POS module's real value isn't its ARPU — it's that **billing is a daily habit** that drags churn from the 7% "marketing tool" zone toward the 2% "operating system" zone. That's the argument *for* the POS.

## 4. The POS delta (Route A vs Route B)

| | **Route A: software POS add-on** | **Route B: hardware-led full POS** |
|---|---|---|
| New COGS | ~₹0 (print via café's ESC/POS printer) | hardware BOM **₹15–40k/outlet** ([BillBoox](https://billboox.com/blog/restaurant-pos-software-price-in-india)) — financed or margin-crushing |
| CAC | unchanged (upsell to installed base ≈ ₹0) | field sales ₹15–30k + install visit |
| Support | +₹100–200/café (printer issues) | 24×7 expectation, on-ground — ₹500–1,500/café |
| ARPU | +₹1,000–2,000/mo add-on | +₹1,500–3,000/mo + 1.5–2% txn fee possible |
| Payback | immediate (upsell) | 6–14 mo, capital-heavy |
| Churn effect | ↓ (daily-habit anchor) | ↓↓ (hardware lock-in) |
| Who it beats | budget billing apps + over-priced Petpooja for cafés | Petpooja head-on — their funded moat |

**Verdict the numbers give:** Route A dominates at our scale — near-zero incremental COGS/CAC, immediate payback, and it buys most of the churn benefit. Route B's extra lock-in doesn't cover its CAC+hardware+support load until there's a funded field-sales org and thousands of outlets. Revisit when Phase-1 attach rate is known.

## 5. Suggested pricing after Phase-1 POS

| Plan | Price | Includes |
|---|---|---|
| Starter | ₹4,999/mo | storefront + AI + loyalty + QR + **1,000 WA msgs** |
| Growth | ₹12,999/mo | + marketing engine, analytics, **5,000 WA msgs** |
| **POS add-on** | **+₹1,499/mo** | billing + KOT + GST invoices + day-end reports |
| WA overage | ₹1.25/msg | margin-safe vs Meta ₹1.02 |

Effective competitor framing: Shoku Growth+POS = **₹14,498/mo ≈ ₹1.74L/yr** vs (Petpooja ₹25k + Reelo ₹30k + own-app dev ₹3L+ + 2% txn) — the "one bill replaces four" story.

## 6. What we still need from ops (to de-assume this doc)

1. Actual VPS bill share + expected next-tier cost → confirms S1/S2.
2. Real support minutes per café per month (track for 4 weeks).
3. WhatsApp volumes once a real BSP is connected (currently demo mode = ₹0 **[actual]**).
4. First 5 real sales: what did each cost to close? → real CAC.
5. POS Phase-1 attach rate + effect on churn after 2 quarters → the Route B trigger metric.
