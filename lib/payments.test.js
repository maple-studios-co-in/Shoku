import { describe, it, expect, beforeAll } from "vitest";
import crypto from "crypto";

// payments.js reads keys from env at import time, so configure then import.
let payments;
const SECRET = "test_secret_key";
beforeAll(async () => {
  process.env.RAZORPAY_KEY_ID = "rzp_test_key";
  process.env.RAZORPAY_KEY_SECRET = SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
  payments = await import("./payments.js");
});

const sign = (data) => crypto.createHmac("sha256", SECRET).update(data).digest("hex");

describe("payments adapter", () => {
  it("reports configured when keys are present", () => {
    expect(payments.isPaymentsConfigured()).toBe(true);
    expect(payments.publicKeyId()).toBe("rzp_test_key");
  });

  it("accepts a correctly signed payment", () => {
    const orderId = "order_abc", paymentId = "pay_xyz";
    expect(
      payments.verifyPaymentSignature({ orderId, paymentId, signature: sign(`${orderId}|${paymentId}`) })
    ).toBe(true);
  });

  it("rejects a tampered / wrong signature", () => {
    expect(payments.verifyPaymentSignature({ orderId: "o", paymentId: "p", signature: "deadbeef" })).toBe(false);
    expect(payments.verifyPaymentSignature({ orderId: "o", paymentId: "p", signature: sign("o|DIFFERENT") })).toBe(false);
  });

  it("verifies webhook signatures over the raw body", () => {
    const raw = JSON.stringify({ event: "payment.captured" });
    expect(payments.verifyWebhookSignature(raw, sign(raw))).toBe(true);
    expect(payments.verifyWebhookSignature(raw, "nope")).toBe(false);
  });
});
