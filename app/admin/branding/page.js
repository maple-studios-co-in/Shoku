"use client";

import { useState } from "react";
import { useBrand } from "@/components/Providers";
import { SectionCard, formatINR } from "@/components/AdminUI";

const FONTS = ["Inter", "Poppins", "Playfair", "DM Sans"];

export default function BrandingPage() {
  const { brand, setBrand, saveBrand, DEFAULTS } = useBrand();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (patch) => { setBrand({ ...brand, ...patch }); setSaved(false); };

  async function publish() {
    setSaving(true);
    await saveBrand(brand);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branding</h1>
          <p className="text-sm text-muted">Make the customer app yours. Changes preview live.</p>
        </div>
        <button onClick={publish} disabled={saving} className="rounded-xl bg-brand-dark px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-50">
          {saving ? "Publishing…" : saved ? "Published ✓" : "Publish changes"}
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <SectionCard title="Identity">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Brand name"><input className={inp} value={brand.name} onChange={(e) => update({ name: e.target.value })} /></Field>
              <Field label="Subdomain"><input className={inp} value={brand.subdomain || ""} onChange={(e) => update({ subdomain: e.target.value })} /></Field>
              <Field label="Primary colour"><ColorRow value={brand.brandHex} onChange={(v) => update({ brandHex: v })} /></Field>
              <Field label="Heading / dark colour"><ColorRow value={brand.darkHex} onChange={(v) => update({ darkHex: v })} /></Field>
            </div>
          </SectionCard>

          <SectionCard title="Typeface">
            <div className="flex flex-wrap gap-2 p-5">
              {FONTS.map((f) => (
                <button key={f} onClick={() => update({ font: f })}
                  className={`rounded-lg border-[1.5px] px-3.5 py-2 text-[13px] font-semibold ${brand.font === f ? "border-brand bg-brand-tint text-brand-dark" : "border-line text-muted"}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="border-t border-line px-5 py-3">
              <button onClick={() => update(DEFAULTS)} className="text-[12.5px] font-semibold text-brand">↺ Reset to Shoku defaults</button>
            </div>
          </SectionCard>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Live preview</div>
          <div className="mx-auto w-60 overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="flex items-center gap-2 px-3 py-3">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-xs font-extrabold text-white">{brand.name?.[0] || "P"}</div>
              <div className="text-[13px] font-bold">{brand.name}</div>
            </div>
            <div className="mx-3 h-24 rounded-xl bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400)" }} />
            <div className="px-3 py-2.5 text-[12px]">
              <div className="flex justify-between"><span className="font-semibold">Original Ice Blended</span><span className="font-bold">{formatINR(385)}</span></div>
            </div>
            <div className="m-3 rounded-xl bg-brand py-2.5 text-center text-[12px] font-bold text-white">Order now</div>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted">Colours re-theme the whole app instantly.</p>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full rounded-lg border border-line px-3 py-2.5 text-[13px] outline-none focus:border-brand";
function Field({ label, children }) {
  return <div><label className="mb-1.5 block text-xs font-semibold text-ink/70">{label}</label>{children}</div>;
}
function ColorRow({ value, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-line bg-transparent p-0.5" />
      <span className="text-[13px] font-semibold uppercase text-muted">{value}</span>
    </div>
  );
}
