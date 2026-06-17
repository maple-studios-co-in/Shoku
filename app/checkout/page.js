"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppShell from "@/components/AppShell";
import { useCart } from "@/components/Providers";
import { BRAND, formatINR } from "@/lib/menu";

const FULFILMENT = [
  { id: "pickup", label: "🥡 Pickup" },
  { id: "dinein", label: "🍽️ Dine-in" },
  { id: "delivery", label: "🛵 Delivery" },
];
const PAYMENTS = [
  { id: "upi", label: "💳 UPI · GPay / PhonePe" },
  { id: "card", label: "🏦 Card ending 4218" },
  { id: "wallet", label: "💰 Pista Wallet · ₹240" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const { lines, subtotal, clear } = useCart();
  const [ful, setFul] = useState("pickup");
  const [pay, setPay] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(null);
  const [promoMsg, setPromoMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login?next=/checkout");
  }, [status, router]);

  const taxes = Math.round(subtotal * 0.05);
  const reward = Math.round(subtotal * 0.05);
  const discount = applied ? Math.round((subtotal * applied.percent) / 100) : 0;
  const total = subtotal + taxes - reward - discount;

  async function applyPromo() {
    const code = promo.trim();
    if (!code) return;
    setPromoMsg("");
    const res = await fetch("/api/discounts/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (data.valid) {
      setApplied({ code: data.code, percent: data.percent });
      setPromoMsg(`${data.code} applied — ${data.percent}% off!`);
    } else {
      setApplied(null);
      setPromoMsg("That code isn't valid.");
    }
  }

  async function placeOrder() {
    if (!lines.length || placing) return;
    setPlacing(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, fulfilment: ful, payment: pay, discountCode: applied?.code || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) return router.replace("/login?next=/checkout");
        throw new Error(data.error || "Could not place order");
      }
      clear();
      router.push(`/success?id=${encodeURIComponent(data.id)}`);
    } catch (e) {
      setError(e.message);
      setPlacing(false);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return <AppShell nav={false}><div className="grid min-h-[60vh] place-items-center text-sm text-muted">Loading…</div></AppShell>;
  }

  return (
    <AppShell nav={false}>
      <div className="pb-28">
        <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
          <button onClick={() => router.push("/cart")} className="grid h-10 w-10 place-items-center rounded-full bg-canvas text-lg">←</button>
          <h1 className="text-[17px] font-bold">Checkout</h1>
        </div>

        <Card title="How would you like it?"><Seg options={FULFILMENT} value={ful} onChange={setFul} /></Card>

        <Card title={ful === "delivery" ? "Delivery" : "Pickup time"}>
          <Seg options={[{ id: "asap", label: "ASAP · 12 min" }, { id: "sched", label: "Schedule" }]} value="asap" onChange={() => {}} />
          <div className="flex items-center gap-2 border-t border-line px-3.5 py-3 text-[13.5px] font-semibold">
            📍 {BRAND.address}<span className="ml-auto text-xs font-bold text-brand">Change</span>
          </div>
        </Card>

        <Card title="Payment">
          {PAYMENTS.map((p, i) => (
            <button key={p.id} onClick={() => setPay(p.id)}
              className={`flex w-full items-center gap-3 px-3.5 py-3 text-left text-[13.5px] font-semibold ${i ? "border-t border-line" : ""}`}>
              {p.label}
              <span className="ml-auto grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-brand">
                {pay === p.id && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </span>
            </button>
          ))}
        </Card>

        <Card title="Promo code">
          <div className="flex gap-2 p-3.5">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME10"
              className="flex-1 rounded-xl border border-line px-3.5 py-2.5 text-[13px] uppercase outline-none focus:border-brand"
            />
            <button onClick={applyPromo} className="rounded-xl bg-brand-tint px-4 text-[13px] font-bold text-brand-dark">Apply</button>
          </div>
          {promoMsg && (
            <div className={`px-3.5 pb-3 text-[12px] font-semibold ${applied ? "text-[#2e9e54]" : "text-[#b24a18]"}`}>{promoMsg}</div>
          )}
        </Card>

        <div className="px-4 pt-2">
          <Row label="Subtotal" value={formatINR(subtotal)} />
          <Row label="Taxes & charges" value={formatINR(taxes)} />
          <Row label="✨ AI loyalty reward" value={`−${formatINR(reward)}`} green />
          {discount > 0 && <Row label={`Promo ${applied.code} (−${applied.percent}%)`} value={`−${formatINR(discount)}`} green />}
          <div className="mt-1.5 flex justify-between border-t border-dashed border-line pt-3 text-base font-extrabold">
            <span>Total</span><span>{formatINR(total)}</span>
          </div>
          {error && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</div>}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[480px] items-center gap-3.5 border-t border-line bg-white px-4 py-3">
        <div className="text-xs text-muted">Pay<b className="block text-[17px] text-ink">{formatINR(total)}</b></div>
        <button onClick={placeOrder} disabled={!lines.length || placing}
          className="flex-1 rounded-xl bg-brand py-3.5 text-center text-[15px] font-bold text-white active:scale-[.98] disabled:opacity-40">
          {placing ? "Placing order…" : "Place order"}
        </button>
      </div>
    </AppShell>
  );
}

function Card({ title, children }) {
  return (
    <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-line">
      <div className="border-b border-line px-3.5 py-3 text-[13px] font-bold">{title}</div>
      {children}
    </div>
  );
}
function Seg({ options, value, onChange }) {
  return (
    <div className="flex gap-2 p-3.5">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className={`flex-1 rounded-xl border-[1.5px] px-1.5 py-3 text-center text-[12.5px] font-semibold transition-colors ${
            value === o.id ? "border-brand bg-brand-tint text-brand-dark" : "border-line text-muted"
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
function Row({ label, value, green }) {
  return (
    <div className="flex justify-between py-1.5 text-[13.5px] text-ink/80">
      <span>{label}</span>
      <span className={green ? "font-semibold text-[#2e9e54]" : ""}>{value}</span>
    </div>
  );
}
