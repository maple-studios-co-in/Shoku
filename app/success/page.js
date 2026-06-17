"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { BRAND } from "@/lib/menu";

function SuccessInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const shortId = id ? id.slice(-6).toUpperCase() : "—";
  return (
    <div className="px-7 py-16 text-center">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-brand-tint text-4xl text-brand-dark">✓</div>
      <h1 className="text-2xl font-bold tracking-tight">Order placed!</h1>
      <p className="mt-2 text-[13.5px] text-muted">Thanks! Your {BRAND.name} order is being prepared.</p>
      <div className="mx-auto mt-6 max-w-xs rounded-2xl bg-canvas p-4 text-[13px]">
        <div className="text-[15px] font-bold">☕ Ready in ~12 min</div>
        <div className="mt-1 text-muted">Pickup · {BRAND.address}</div>
        <div className="mt-1 text-muted">Order #PS-{shortId}</div>
      </div>
      <div className="mt-7 flex flex-col items-center gap-3">
        <Link href="/menu" className="inline-block rounded-xl bg-brand px-7 py-3.5 text-[15px] font-bold text-white">Back to menu</Link>
        <Link href="/account" className="text-sm font-semibold text-brand">View your orders →</Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <AppShell nav={false}>
      <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm text-muted">Loading…</div>}>
        <SuccessInner />
      </Suspense>
    </AppShell>
  );
}
