"use client";

import { useEffect, useRef, useState } from "react";
import { SectionCard } from "@/components/AdminUI";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", link: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = () => fetch("/api/banners?manage=1").then((r) => (r.ok ? r.json() : [])).then(setBanners).catch(() => {});
  useEffect(() => { load(); }, []);

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2_000_000) {
      setErr("Image is larger than 2MB — use a smaller file or paste a hosted URL.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((s) => ({ ...s, imageUrl: reader.result }));
    reader.readAsDataURL(f);
  }

  async function add() {
    setErr("");
    if (!form.imageUrl) {
      setErr("Add an image — upload a file or paste an image URL.");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setErr(d.error || "Failed");
      return;
    }
    setForm({ title: "", subtitle: "", imageUrl: "", link: "" });
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function toggle(b) {
    await fetch(`/api/banners/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !b.active }) });
    load();
  }
  async function remove(b) {
    await fetch(`/api/banners/${b.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Sale banners</h1>
        <p className="text-sm text-muted">Promo banners shown at the top of your live menu app.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Add a banner">
          <div className="space-y-3.5 p-4">
            <div className="rounded-xl border-2 border-dashed border-line p-4 text-center">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" className="mx-auto max-h-36 rounded-lg object-cover" />
              ) : (
                <div className="py-6 text-[13px] text-muted">Upload an image (16:9 works best)</div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="mt-3 block w-full text-[12px]" />
            </div>
            <div className="text-center text-[11px] font-semibold uppercase text-muted">or paste a URL</div>
            <input value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…/banner.jpg" className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Headline (optional)"
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtext (optional)"
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
            <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Tap link (optional, e.g. /menu)"
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
            {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-[12.5px] text-red-600">{err}</div>}
            <button onClick={add} disabled={busy} className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white disabled:opacity-50">
              {busy ? "Adding…" : "Add banner"}
            </button>
          </div>
        </SectionCard>

        <SectionCard title={`Live banners (${banners.length})`}>
          <div className="space-y-3 p-4">
            {banners.length === 0 && <div className="py-6 text-center text-sm text-muted">No banners yet.</div>}
            {banners.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-xl border border-line">
                <div className="relative">
                  <img src={b.imageUrl} alt="" className={`h-28 w-full object-cover ${b.active ? "" : "opacity-40 grayscale"}`} />
                  {(b.title || b.subtitle) && (
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/55 to-transparent p-3 text-white">
                      {b.title && <div className="text-sm font-bold">{b.title}</div>}
                      {b.subtitle && <div className="text-[11px] opacity-90">{b.subtitle}</div>}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-[12.5px]">
                  <button onClick={() => toggle(b)} className={`font-bold ${b.active ? "text-green-600" : "text-muted"}`}>
                    {b.active ? "● Active" : "○ Hidden"}
                  </button>
                  <button onClick={() => remove(b)} className="font-bold text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
