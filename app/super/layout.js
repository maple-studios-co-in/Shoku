"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const NAV = [
  { href: "/super", label: "Analytics", icon: "📈" },
  { href: "/super/cafes", label: "Cafés", icon: "🏪" },
  { href: "/super/audit", label: "Audit log", icon: "🧭" },
  { href: "/pitch", label: "Pitch deck", icon: "📑" },
  { href: "/research", label: "Research", icon: "🔬" },
  { href: "/guide", label: "Guide", icon: "📖" },
];

export default function SuperLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login?next=/super");
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="grid min-h-screen place-items-center bg-canvas text-sm text-muted">Loading…</div>;
  }

  if (session?.user?.role !== "superadmin") {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-8 text-center">
        <div>
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-50 text-3xl">🔒</div>
          <h1 className="text-lg font-bold">Shoku staff only</h1>
          <p className="mt-1 text-sm text-muted">This is the platform console.</p>
          <Link href="/" className="mt-5 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white">Home</Link>
        </div>
      </div>
    );
  }

  const active = (href) => (href === "/super" ? pathname === "/super" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-canvas md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-brand-dark text-white md:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          <img src="/shoku-mark.svg" alt="Shoku" className="h-9 w-9 rounded-lg" />
          <div>
            <div className="text-sm font-bold leading-tight">Shoku Platform</div>
            <div className="text-[11px] text-white/60">Super-admin</div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold ${active(n.href) ? "bg-white/15" : "text-white/70 hover:bg-white/10"}`}>
              <span className="text-base">{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold text-white/70 hover:bg-white/10">↩︎ Sign out</button>
        </div>
      </aside>

      <div className="sticky top-0 z-30 border-b border-line bg-brand-dark px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2.5">
          <img src="/shoku-mark.svg" alt="Shoku" className="h-8 w-8 rounded-lg" />
          <div className="text-sm font-bold">Shoku Platform</div>
          <div className="ml-auto flex gap-3 text-xs font-semibold">
            {NAV.map((n) => <Link key={n.href} href={n.href} className={active(n.href) ? "" : "text-white/60"}>{n.label}</Link>)}
          </div>
        </div>
      </div>

      <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
