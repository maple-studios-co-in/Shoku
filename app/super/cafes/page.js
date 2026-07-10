"use client";

import { useEffect, useState } from "react";
import { SectionCard, formatINR } from "@/components/AdminUI";

const BASE = process.env.NEXT_PUBLIC_BASE_DOMAIN || "pista.maplestudios.co.in";
const BLANK = { name: "", slug: "", plan: "growth", address: "", ownerName: "", ownerEmail: "", ownerPassword: "", brandHex: "#3A6B4D", darkHex: "#244635", seedMenu: true };

export default function CafesPage() {
  const [rows, setRows] = useState([]);
  const [creating, setCreating] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [invite, setInvite] = useState(null);
  const [managing, setManaging] = useState(null); // tenant row being configured
  const [aiDefaults, setAiDefaults] = useState(null); // platform-wide LLM config

  function load() {
    fetch("/api/super/tenants").then((r) => (r.ok ? r.json() : [])).then(setRows).catch(() => {});
  }
  useEffect(() => {
    load();
    fetch("/api/super/ai").then((r) => (r.ok ? r.json() : null)).then(setAiDefaults).catch(() => {});
  }, []);

  function autoSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  }

  async function create() {
    setErr("");
    if (!creating.name || !creating.slug || !creating.ownerEmail) {
      setErr("Fill café name, subdomain and owner email.");
      return;
    }
    if (creating.ownerPassword && creating.ownerPassword.length < 6) {
      setErr("Password must be 6+ characters, or leave it blank to send an invite link.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/super/tenants", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(creating),
    });
    setSaving(false);
    const d = await res.json();
    if (!res.ok) { setErr(d.error || "Failed"); return; }
    setCreating(null);
    if (d.inviteUrl) setInvite({ slug: d.slug, url: d.inviteUrl });
    load();
  }

  async function setStatus(t, status) {
    setRows((arr) => arr.map((x) => (x.id === t.id ? { ...x, status } : x)));
    await fetch(`/api/super/tenants/${t.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function saveManage(patch) {
    setSaving(true);
    const res = await fetch(`/api/super/tenants/${managing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setSaving(false);
    if (res.ok) { setManaging(null); load(); }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cafés</h1>
          <p className="text-sm text-muted">{rows.length} on the platform.</p>
        </div>
        <button onClick={() => setCreating({ ...BLANK })} className="rounded-xl bg-brand px-4 py-2.5 text-[13px] font-bold text-white">+ New café</button>
      </header>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Café</th><th className="px-5 py-3">Subdomain</th><th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">AI</th>
                <th className="px-5 py-3">Items</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Revenue</th>
                <th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={9} className="px-5 py-8 text-center text-muted">No cafés yet — create your first.</td></tr>}
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">
                    <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ background: t.brandHex }} />
                    {t.name}
                  </td>
                  <td className="px-5 py-3">
                    <a href={`https://${t.slug}.${BASE}`} target="_blank" rel="noreferrer" className="text-brand-dark underline">{t.slug}.{BASE}</a>
                  </td>
                  <td className="px-5 py-3 capitalize text-muted">{t.plan}</td>
                  <td className="px-5 py-3"><AIBadge t={t} defaults={aiDefaults} /></td>
                  <td className="px-5 py-3">{t.items}</td>
                  <td className="px-5 py-3">{t.orders}</td>
                  <td className="px-5 py-3 font-bold">{formatINR(t.revenue)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${t.status === "active" ? "bg-green-50 text-green-700" : t.status === "suspended" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setManaging(t)} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold">Manage</button>
                      {t.status === "suspended" ? (
                        <button onClick={() => setStatus(t, "active")} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold">Activate</button>
                      ) : (
                        <button onClick={() => setStatus(t, "suspended")} className="rounded-lg px-3 py-1.5 text-[12px] font-bold text-red-500">Suspend</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onClick={() => setCreating(null)}>
          <div className="w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">Provision a new café</h2>
            <p className="mt-1 text-[12px] text-muted">Creates the tenant, default menu categories and an owner login.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <F label="Café name" full>
                <input className={inp} value={creating.name}
                  onChange={(e) => setCreating({ ...creating, name: e.target.value, slug: creating.slug || autoSlug(e.target.value) })} />
              </F>
              <F label="Subdomain">
                <input className={inp} value={creating.slug} onChange={(e) => setCreating({ ...creating, slug: autoSlug(e.target.value) })} />
              </F>
              <F label="Plan">
                <select className={inp} value={creating.plan} onChange={(e) => setCreating({ ...creating, plan: e.target.value })}>
                  <option value="starter">Starter</option><option value="growth">Growth</option><option value="enterprise">Enterprise</option>
                </select>
              </F>
              <F label="Store address" full><input className={inp} value={creating.address} onChange={(e) => setCreating({ ...creating, address: e.target.value })} placeholder="e.g. Koramangala, Bengaluru" /></F>
              <F label="Brand colour">
                <div className="flex items-center gap-2">
                  <input type="color" value={creating.brandHex} onChange={(e) => setCreating({ ...creating, brandHex: e.target.value })} className="h-9 w-10 cursor-pointer rounded-lg border border-line bg-transparent p-0.5" />
                  <span className="text-[12px] font-semibold uppercase text-muted">{creating.brandHex}</span>
                </div>
              </F>
              <F label="Heading colour">
                <div className="flex items-center gap-2">
                  <input type="color" value={creating.darkHex} onChange={(e) => setCreating({ ...creating, darkHex: e.target.value })} className="h-9 w-10 cursor-pointer rounded-lg border border-line bg-transparent p-0.5" />
                  <span className="text-[12px] font-semibold uppercase text-muted">{creating.darkHex}</span>
                </div>
              </F>
              <F label="Owner name"><input className={inp} value={creating.ownerName} onChange={(e) => setCreating({ ...creating, ownerName: e.target.value })} /></F>
              <F label="Owner email"><input className={inp} type="email" value={creating.ownerEmail} onChange={(e) => setCreating({ ...creating, ownerEmail: e.target.value })} /></F>
              <F label="Owner password (optional)" full><input className={inp} type="text" value={creating.ownerPassword} onChange={(e) => setCreating({ ...creating, ownerPassword: e.target.value })} placeholder="Leave blank to send an invite link instead" /></F>
              <label className="flex items-center gap-2 text-[13px] font-semibold sm:col-span-2"><input type="checkbox" checked={creating.seedMenu} onChange={(e) => setCreating({ ...creating, seedMenu: e.target.checked })} /> Pre-load a starter menu (recommended)</label>
            </div>
            {creating.slug && <p className="mt-3 text-[12px] text-muted">Storefront will be <b>{creating.slug}.{BASE}</b> (needs the subdomain DNS + cert).</p>}
            {err && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{err}</div>}
            <div className="mt-5 flex gap-3">
              <button onClick={create} disabled={saving} className="flex-1 rounded-xl bg-brand py-3 text-[14px] font-bold text-white disabled:opacity-50">{saving ? "Creating…" : "Create café"}</button>
              <button onClick={() => setCreating(null)} className="rounded-xl border border-line px-5 py-3 text-[14px] font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {managing && <ManageDrawer t={managing} saving={saving} defaults={aiDefaults} onClose={() => setManaging(null)} onSave={saveManage} />}

      {invite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={() => setInvite(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">Café created 🎉</h2>
            <p className="mt-1 text-[13px] text-muted">Send this set-password link to the <b>{invite.slug}</b> owner so they can finish setup:</p>
            <div className="mt-3 break-all rounded-lg bg-canvas px-3 py-2 font-mono text-[12px]">{invite.url}</div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => navigator.clipboard?.writeText(invite.url)} className="flex-1 rounded-xl bg-brand py-3 text-[14px] font-bold text-white">Copy link</button>
              <button onClick={() => setInvite(null)} className="rounded-xl border border-line px-5 py-3 text-[14px] font-semibold">Done</button>
            </div>
            <p className="mt-3 text-[12px] text-muted">Then run <code>./scripts/add-cafe.sh {invite.slug}</code> on the server to put the subdomain live.</p>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = "w-full rounded-lg border border-line px-3 py-2.5 text-[13px] outline-none focus:border-brand";
function F({ label, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-[12px] font-semibold text-ink/70">{label}</label>
      {children}
    </div>
  );
}

// Provider presets the superadmin can assign per café. "default" clears all
// overrides so the café rides on the platform env key. Each provider carries a
// curated model list ([id, label]) — first entry is the recommended default;
// the drawer always offers "Custom model…" for anything newer.
const PROVIDER_PRESETS = [
  { key: "default", label: "Platform default", base: "", model: "", hint: "", models: [] },
  {
    key: "groq", label: "Groq", base: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", hint: "gsk_…",
    models: [
      ["llama-3.3-70b-versatile", "Llama 3.3 70B — best overall (recommended)"],
      ["llama-3.1-8b-instant", "Llama 3.1 8B — fastest & cheapest"],
      ["openai/gpt-oss-120b", "GPT-OSS 120B — strong reasoning"],
      ["moonshotai/kimi-k2-instruct", "Kimi K2 — long context"],
    ],
  },
  {
    key: "openai", label: "OpenAI", base: "https://api.openai.com/v1", model: "gpt-4o-mini", hint: "sk-…",
    models: [
      ["gpt-4o-mini", "GPT-4o mini — fast & affordable (recommended)"],
      ["gpt-4o", "GPT-4o — flagship"],
      ["gpt-4.1-mini", "GPT-4.1 mini"],
      ["gpt-4.1", "GPT-4.1"],
    ],
  },
  {
    key: "anthropic", label: "Anthropic (Claude)", base: "https://api.anthropic.com", model: "claude-opus-4-8", hint: "sk-ant-…",
    models: [
      ["claude-opus-4-8", "Claude Opus 4.8 — recommended"],
      ["claude-sonnet-5", "Claude Sonnet 5 — speed + quality"],
      ["claude-haiku-4-5", "Claude Haiku 4.5 — fastest & cheapest"],
      ["claude-fable-5", "Claude Fable 5 — most capable (premium)"],
    ],
  },
  { key: "custom", label: "Custom (OpenAI-compatible)", base: "", model: "", hint: "", models: [] },
];

function presetFromRow(t) {
  if (!t.aiBaseUrl && !t.aiModel && !t.aiKeySet) return "default";
  const base = (t.aiBaseUrl || "").toLowerCase();
  if (base.includes("groq")) return "groq";
  if (base.includes("anthropic")) return "anthropic";
  if (!base || base.includes("api.openai.com")) return "openai";
  return "custom";
}

// At-a-glance provider/key status shown in the cafés table.
function AIBadge({ t, defaults }) {
  const preset = presetFromRow(t);
  if (preset === "default") {
    return defaults?.enabled ? (
      <div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">Platform</span>
        <div className="mt-1 text-[11px] text-muted">{defaults.defaultModel}</div>
      </div>
    ) : (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Rules only</span>
    );
  }
  const label = { groq: "Groq", openai: "OpenAI", anthropic: "Claude", custom: "Custom" }[preset];
  return (
    <div>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${t.aiKeySet ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
        {label}{t.aiKeySet ? " · own key" : " · no key"}
      </span>
      {t.aiModel && <div className="mt-1 text-[11px] text-muted">{t.aiModel}</div>}
    </div>
  );
}

// Per-café control: plan, POS add-on, and AI provider (preset/key/model/base URL).
function ManageDrawer({ t, saving, defaults, onClose, onSave }) {
  const [plan, setPlan] = useState(t.plan);
  const [pos, setPos] = useState(!!t.posEnabled);
  const [provider, setProvider] = useState(presetFromRow(t));
  const [model, setModel] = useState(t.aiModel || "");
  // A saved model that isn't in the preset's list opens in "Custom model…" mode.
  const [customModel, setCustomModel] = useState(() => {
    const p = PROVIDER_PRESETS.find((x) => x.key === presetFromRow(t));
    return !!(t.aiModel && p?.models?.length && !p.models.some(([id]) => id === t.aiModel));
  });
  const [baseUrl, setBaseUrl] = useState(t.aiBaseUrl || "");
  const [apiKey, setApiKey] = useState(""); // write-only; blank = leave unchanged
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const preset = PROVIDER_PRESETS.find((p) => p.key === provider);
  const modelList = preset?.models || [];

  function pickProvider(key) {
    setProvider(key);
    setTestResult(null);
    setCustomModel(false);
    const p = PROVIDER_PRESETS.find((x) => x.key === key);
    if (key === "default") { setModel(""); setBaseUrl(""); }
    else if (key !== "custom") { setModel(p.model); setBaseUrl(p.base); }
  }

  function pickModel(value) {
    setTestResult(null);
    if (value === "__custom") { setCustomModel(true); setModel(""); }
    else { setCustomModel(false); setModel(value); }
  }

  async function test() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/super/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          provider === "default"
            ? {} // pure platform config
            : { tenantId: t.id, apiKey: apiKey.trim(), baseUrl, model }
        ),
      });
      setTestResult(await res.json());
    } catch {
      setTestResult({ ok: false, error: "Request failed — is the server running?" });
    } finally {
      setTesting(false);
    }
  }

  const submit = () => {
    const patch = { plan, posEnabled: pos };
    if (provider === "default") {
      Object.assign(patch, { aiApiKey: "", aiModel: "", aiBaseUrl: "" });
    } else {
      patch.aiModel = model;
      patch.aiBaseUrl = baseUrl;
      if (apiKey.trim()) patch.aiApiKey = apiKey.trim();
    }
    onSave(patch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold">{t.name}</h2>
        <p className="mt-1 text-[12px] text-muted">Plan, add-ons and AI configuration for this café.</p>

        <div className="mt-4 grid gap-4">
          <div>
            <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">Plan &amp; add-ons</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Plan">
                <select className={inp} value={plan} onChange={(e) => setPlan(e.target.value)}>
                  <option value="starter">Starter</option><option value="growth">Growth</option><option value="enterprise">Enterprise</option>
                </select>
              </F>
              <label className="flex items-center gap-2 self-end pb-1 text-[13px] font-semibold">
                <input type="checkbox" checked={pos} onChange={(e) => setPos(e.target.checked)} /> POS add-on (₹1,499/mo)
              </label>
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-[12px] font-bold uppercase tracking-wide text-muted">AI provider</h3>
            <p className="mb-2 text-[12px] text-muted">
              <b>Platform default</b> uses the shared key{defaults?.enabled ? <> (<code>{defaults.defaultModel}</code>)</> : " (currently not configured — chatbot falls back to rules)"}.
              Assign a café-specific provider &amp; key to bill AI usage to their own account.
            </p>
            <div className="grid gap-3">
              <F label="Provider">
                <select className={inp} value={provider} onChange={(e) => pickProvider(e.target.value)}>
                  {PROVIDER_PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
              </F>
              {provider !== "default" && (
                <>
                  <F label="API key">
                    <input className={inp} type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                      placeholder={t.aiKeySet ? "•••••• (set — type to replace)" : `${preset?.hint || "key"}  (required)`} />
                  </F>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <F label="Model">
                      {modelList.length > 0 ? (
                        <>
                          <select className={inp} value={customModel ? "__custom" : model} onChange={(e) => pickModel(e.target.value)}>
                            {modelList.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                            <option value="__custom">Custom model…</option>
                          </select>
                          {customModel && (
                            <input className={`${inp} mt-2`} autoFocus value={model} onChange={(e) => setModel(e.target.value)}
                              placeholder="exact model id, e.g. a newly released one" />
                          )}
                        </>
                      ) : (
                        <input className={inp} value={model} onChange={(e) => setModel(e.target.value)} placeholder={preset?.model || "model id"} />
                      )}
                    </F>
                    <F label="Base URL">
                      <input className={inp} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder={preset?.base || "https://…"} />
                    </F>
                  </div>
                </>
              )}

              <div className="flex items-center gap-3">
                <button onClick={test} disabled={testing} className="rounded-xl border border-line px-4 py-2 text-[12.5px] font-bold disabled:opacity-50">
                  {testing ? "Testing…" : "Test connection"}
                </button>
                {testResult && (
                  <span className={`text-[12px] font-semibold ${testResult.ok ? "text-green-700" : "text-red-500"}`}>
                    {testResult.ok
                      ? `✓ Connected — ${testResult.provider} · ${testResult.model}`
                      : `✗ ${testResult.error || "Failed"}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={submit} disabled={saving} className="flex-1 rounded-xl bg-brand py-3 text-[14px] font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
          <button onClick={onClose} className="rounded-xl border border-line px-5 py-3 text-[14px] font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
}
