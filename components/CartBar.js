"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./Providers";
import { formatINR } from "@/lib/menu";

// Prominent, live cart bar that appears above the bottom nav whenever the
// cart has items — gives instant feedback when a customer taps "+".
export default function CartBar() {
  const { count, subtotal } = useCart();
  const pathname = usePathname();

  if (count === 0) return null;
  // Hide where it would clash with the page's own bottom UI
  if (["/cart", "/checkout", "/ai"].some((p) => pathname.startsWith(p))) return null;

  return (
    <Link
      href="/cart"
      className="fixed inset-x-0 bottom-[64px] z-40 mx-auto flex max-w-[480px] items-center gap-3 rounded-t-2xl bg-brand px-4 py-3.5 text-white shadow-pop"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-sm font-bold">{count}</span>
      <span className="text-sm font-semibold">{count === 1 ? "item" : "items"} in bag</span>
      <span className="ml-auto text-[15px] font-bold">{formatINR(subtotal)} · View bag →</span>
    </Link>
  );
}
