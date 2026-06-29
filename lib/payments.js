import crypto from "crypto";

// Razorpay adapter — dependency-free (REST + HMAC). Env-keyed; degrades gracefully
// when unconfigured so the app still runs (callers fall back to the mock flow).
//   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET   — from the Razorpay dashboard
//   RAZORPAY_WEBHOOK_SECRET                 — set when you configure the webhook
const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export function isPaymentsConfigured() {
  return Boolean(KEY_ID && KEY_SECRET);
}

// The key id is publishable (used by the browser Checkout widget).
export function publicKeyId() {
  return KEY_ID;
}

// Create a Razorpay order. `amount` is in the smallest unit (paise for INR).
export async function createRazorpayOrder({ amount, currency = "INR", receipt, notes }) {
  if (!isPaymentsConfigured()) throw new Error("Payments not configured");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"),
    },
    body: JSON.stringify({ amount, currency, receipt, notes, payment_capture: 1 }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Razorpay order failed (${res.status}): ${txt.slice(0, 200)}`);
  }
  return res.json();
}

// Verify the checkout-handler signature: HMAC_SHA256("orderId|paymentId", key_secret).
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!KEY_SECRET || !orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

// Verify a webhook payload signature against the raw request body.
export function verifyWebhookSignature(rawBody, signature) {
  if (!WEBHOOK_SECRET || !rawBody || !signature) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
