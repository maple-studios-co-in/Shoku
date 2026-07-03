# POS Phase 1 — Counter Billing + KOT + GST + Day-End

**Status:** draft spec · **Route:** A (software-only add-on, per unit-economics doc)
**Target user:** single-outlet café — owner or counter staff on any tablet/laptop browser.
**Pricing:** +₹1,499/mo add-on (or bundled into Growth); gated per tenant.

---

## 1. Scope

**In:** fast counter-billing screen, KOT + customer-invoice printing (80mm thermal via browser print), GST-compliant invoices with per-tenant numbering, cash/UPI/card payment recording, day-end (Z) report, staff role.
**Out (later phases):** offline mode, inventory/recipes, hardware bundle, Petpooja import, table-course management, multi-terminal sync.

## 2. What already exists (build on, don't duplicate)

- **Menu + items** per tenant (categories, prices, sizes, veg) — the POS item grid is a re-skin of `/api/menu`.
- **Order model + server-side totals** (`lib/orders.js` `createOrder`) — POS orders reuse it; totals stay computed in one place.
- **Admin auth** (`requireAdmin` gate, owner/staff roles in the User model) — POS lives under `/admin/pos`.
- **Order status flow** (`preparing → ready → completed`) + admin orders screen — KOT ties into it.

## 3. Data model changes (Prisma)

```prisma
model Tenant {
  // POS add-on
  posEnabled   Boolean @default(false)
  gstin        String?            // 15-char GSTIN, printed on invoices
  gstRate      Int     @default(5) // % (5 = restaurant service norm; configurable)
  invoicePrefix String @default("INV")
  invoiceSeq   Int     @default(0) // last issued number (atomic increment)
}

model Order {
  source        String  @default("online") // online | pos
  paymentMethod String? // cash | upi | card  (POS orders)
  invoiceNo     String? // "INV-2026-00042" — assigned at POS billing
  cgst          Int     @default(0) // paise-free INR, split shown on invoice
  sgst          Int     @default(0)
  staffId       String? // user who billed it
}
```

Notes: invoice numbering must be **sequential and gap-averse per tenant** (GST expectation) → allocate via a transaction that increments `invoiceSeq`. Existing `tax` field stays; `cgst/sgst` are its display split.

## 4. API

| Route | Method | Gate | Purpose |
|---|---|---|---|
| `/api/pos/orders` | POST | requireAdmin + posEnabled | create POS order: lines, paymentMethod, optional customer phone → reuses `createOrder` (`source:"pos"`, `paymentStatus:"paid"`), allocates invoiceNo, computes CGST/SGST |
| `/api/pos/day-end?date=` | GET | requireAdmin | Z-report JSON: orders count, gross, discounts, GST collected, by-payment-method split, top items, by-staff |
| `/api/pos/settings` | GET/PUT | requireAdmin (owner only for PUT) | gstin, gstRate, invoicePrefix |

Customer phone (optional at billing) links the sale to a User → **loyalty accrues on counter sales too** — the differentiator no budget billing app has, and it feeds the WhatsApp marketing engine.

## 5. UI

### 5.1 `/admin/pos` — the billing screen
Two-pane, keyboard-first, big touch targets (min 44px):
- **Left:** category chips + item grid (image, name, price); search box with `/` shortcut; tap = add, long-press/click qty = stepper.
- **Right:** ticket — lines with qty steppers, per-line void; discount (₹ or %, owner-PIN above threshold); customer phone field (optional, loyalty); payment method toggle **Cash / UPI / Card**; giant **BILL — ₹XXX** button.
- On bill: order saved → print dialog opens with the **invoice** → “New sale” resets in one tap.
- Non-blocking toasts; last-5-bills drawer for reprint/void (void = superadmin-audited, logs to `lib/audit`).

### 5.2 Printing (the pragmatic Phase-1 answer)
Browser `window.print()` onto a **print-optimized 80mm CSS layout** (`@media print`, 72mm content width, monospace, large density). Works with any thermal printer installed as a system printer (USB/network) — no drivers we ship, no Bluetooth pain.
- **Invoice:** café name/address/GSTIN, invoice no, date/time, lines, subtotal, CGST/SGST split, total, payment method, loyalty points earned, footer message.
- **KOT:** separate print route `/admin/pos/kot/[orderId]` — big item names + qty + modifiers only (no prices), auto-fired after billing when `kotAutoPrint` is on.
- Known Phase-1 limit (documented honestly): one print dialog per document. **Phase 1.5:** a tiny local “print bridge” (Node/Go daemon speaking ESC/POS over LAN) removes the dialogs; spec separately.

### 5.3 `/admin/pos/day-end` — Z-report
Date picker (default today) → tiles: gross sales, bills count, avg bill; tables: payment-method split, GST collected (CGST/SGST), top 10 items, by-staff. **Print** (A4 + 80mm CSS) and **CSV export**. “Close day” button snapshots the report row (immutable audit copy).

### 5.4 Admin settings
In `/admin/settings`: POS section — enable toggle (superadmin sets `posEnabled` per plan/add-on), GSTIN, GST rate, invoice prefix, KOT auto-print.

## 6. Roles

- **owner** — everything incl. settings, voids, day-end close.
- **staff** — bill + print + view today only; no settings, no void above threshold. (Role exists in the User model; staff accounts created from `/admin` — small addition to the customers/team screen.)

## 7. Acceptance criteria (Phase 1 done =)

1. A staff login can ring up a 3-item sale with a % discount, take cash, and print a GST invoice in **≤ 20 seconds**.
2. Invoice shows GSTIN, sequential invoice number, correct CGST/SGST split; numbers survive restarts (DB-allocated).
3. KOT prints without prices; kitchen sees it before the customer pays (auto-fire).
4. Counter sale with a phone number credits loyalty points; the customer sees them in the diner app.
5. Day-end totals reconcile: Σ(payment-method splits) = gross; report is printable + exportable.
6. POS routes 403 for tenants without `posEnabled`; all queries tenant-scoped (existing pattern).
7. Vitest coverage: invoice-number allocation (concurrency), GST split math, day-end aggregation.

## 8. Build plan (sequenced, ~3 weeks of focused work)

| # | Chunk | Touches |
|---|---|---|
| 1 | Schema + migrations + `posEnabled` gating | prisma, lib/admin |
| 2 | `/api/pos/orders` reusing `createOrder` + invoice allocator + GST split | lib/orders, new route |
| 3 | Billing screen UI | `/admin/pos` page |
| 4 | Print CSS: invoice + KOT routes | print layouts |
| 5 | Day-end API + screen + CSV | route + page |
| 6 | Settings + staff-role touches + audit on voids | settings, admin |
| 7 | Tests + docs + demo script update | vitest, docs/DEMO |

## 9. Metrics to watch after launch (feeds the Route-B decision)

- **Attach rate** (% of cafés adding POS) — the pivotal number per unit-economics §4.
- Bills/day/café (habit depth), % counter sales with phone captured (loyalty link rate), churn of POS vs non-POS cohort after 2 quarters.
