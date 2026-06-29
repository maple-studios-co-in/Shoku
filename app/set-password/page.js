"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function SetPasswordInner() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [state, setState] = useState({ loading: true, valid: false, email: "", cafe: "" });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/accept?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setState({ loading: false, valid: !!d.valid, email: d.email || "", cafe: d.cafe || "" }))
      .catch(() => setState({ loading: false, valid: false, email: "", cafe: "" }));
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/invite/accept", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setSaving(false); setError(data.error || "Something went wrong."); return; }
    await signIn("credentials", { redirect: false, email: data.email, password });
    router.push("/admin");
  }

  if (state.loading) return <div className="grid min-h-screen place-items-center text-sm text-muted">Loading…</div>;

  if (!state.valid) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
        <h1 className="text-xl font-bold">Invite link invalid</h1>
        <p className="mt-2 text-sm text-muted">This link is invalid or has expired. Ask Shoku to send a new one.</p>
        <Link href="/login" className="mt-5 font-bold text-brand-dark">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex items-center gap-2.5 text-xl font-extrabold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">P</span> Shoku
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Set your password</h1>
      <p className="mt-1 text-sm text-muted">Welcome to <b>{state.cafe}</b> — set a password for <b>{state.email}</b> to access your dashboard.</p>

      <form onSubmit={submit} className="mt-7 flex flex-col gap-3.5">
        <label className="text-sm font-semibold">
          New password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters"
            className="mt-1.5 w-full rounded-xl border border-line px-3.5 py-3 text-[15px] font-normal outline-none focus:border-brand" />
        </label>
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</div>}
        <button disabled={saving} className="mt-1 rounded-xl bg-brand py-3.5 text-[15px] font-bold text-white disabled:opacity-50">
          {saving ? "Setting…" : "Set password & sign in"}
        </button>
      </form>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordInner />
    </Suspense>
  );
}
