"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/menu";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else router.push(next);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5 text-xl font-semibold">
        <img src="/shoku-mark.svg" alt="" className="h-9 w-9" /> <span className="font-serif">shoku</span>
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to order and track your rewards.</p>

      <form onSubmit={submit} className="mt-7 flex flex-col gap-3.5">
        <label className="text-sm font-semibold">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1.5 w-full rounded-xl border border-line px-3.5 py-3 text-[15px] font-normal outline-none focus:border-brand" />
        </label>
        <label className="text-sm font-semibold">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="mt-1.5 w-full rounded-xl border border-line px-3.5 py-3 text-[15px] font-normal outline-none focus:border-brand" />
        </label>
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</div>}
        <button disabled={loading}
          className="mt-1 rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white active:scale-[.98] disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        New here? <Link href="/register" className="font-bold text-brand-dark">Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
