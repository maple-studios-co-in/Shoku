"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/AdminUI";

const SAMPLE = { name: "Aanya Sharma", tier: "Gold", points: 740, toReward: 60 };

function clientPersonalize(t, fromName) {
  return String(t || "")
    .replace(/\{name\}/gi, SAMPLE.name.split(" ")[0])
    .replace(/\{brand\}/gi, fromName || "your café")
    .replace(/\{tier\}/gi, SAMPLE.tier)
    .replace(/\{points\}/gi, String(SAMPLE.points))
    .replace(/\{toReward\}/gi, String(SAMPLE.toReward));
}

function StatusDot({ s }) {
  const c = { sent: "bg-green-500", demo: "bg-amber-400", failed: "bg-red-500", queued: "bg-slate-300" }[s] || "bg-slate-300";
  return <span className={`inline-block h-2 w-2 rounded-full ${c}`} title={s} />;
}

export default function MarketingPage() {
  const [data, setData] = useState(null);
  const [seg, setSeg] = useState({ segments: [], goals: [] });
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("all");
  const [template, setTemplate] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("compose");

  const load = () => {
    fetch("/api/campaigns").then((r) => (r.ok ? r.json() : null)).then(setData).catch(() => {});
    fetch("/api/campaigns/segments").then((r) => (r.ok ? r.json() : null)).then((d) => d && setSeg(d)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const fromName = data?.fromName || "your café";
  const segCount = seg.segments.find((s) => s.key === segment)?.count ?? 0;

  async function suggest(goal) {
    setAiBusy(true);
    const g = seg.goals.find((x) => x.key === goal);
    if (g?.segment) setSegment(g.segment);
    if (!name) setName(g?.label || "Campaign");
    try {
      const r = await fetch("/api/campaigns/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, segmentLabel: seg.segments.find((s) => s.key === (g?.segment || segment))?.label }),
      });
      const d = await r.json();
      if (d.copy) setTemplate(d.copy);
    } catch {}
    setAiBusy(false);
  }

  async function send() {
    if (!template.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, segment, template }),
      });
      const d = await r.json();
      if (r.ok) {
        setResult(d);
        setTemplate("");
        setName("");
        load();
      } else setResult({ error: d.error || "Failed" });
    } catch {
      setResult({ error: "Network error" });
    }
    setBusy(false);
  }

  if (!data) return <div className="text-sm text-muted">Loading marketing…</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WhatsApp marketing</h1>
          <p className="text-sm text-muted">Reach loyal customers with personalized, AI-drafted messages.</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${data.mode === "demo" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
          {data.mode === "demo" ? "● Demo mode — messages are logged, not sent" : `● Live · ${data.mode}`}
        </span>
      </header>

      <div className="mb-4 flex gap-1 rounded-xl bg-canvas p-1 text-[13px] font-semibold">
        {[["compose", "Compose"], ["history", "History"], ["settings", "Settings"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 rounded-lg px-3 py-2 ${tab === k ? "bg-white shadow-sm" : "text-muted"}`}>{l}</button>
        ))}
      </div>

      {tab === "compose" && (
        <div className="space-y-4">
          <SectionCard title="AI quick-start">
            <div className="flex flex-wrap gap-2 p-4">
              {seg.goals.map((g) => (
                <button key={g.key} onClick={() => suggest(g.key)} disabled={aiBusy}
                  className="rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold hover:border-brand hover:text-brand-dark disabled:opacity-50">
                  ✨ {g.label}
                </button>
              ))}
              {aiBusy && <span className="self-center text-[12px] text-muted">drafting…</span>}
            </div>
          </SectionCard>

          <SectionCard title="Campaign">
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-[12px] font-bold text-muted">Campaign name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend win-back"
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-bold text-muted">Audience</label>
                <div className="flex flex-wrap gap-2">
                  {seg.segments.map((s) => (
                    <button key={s.key} onClick={() => setSegment(s.key)}
                      className={`rounded-xl border px-3 py-2 text-left text-[12.5px] ${segment === s.key ? "border-brand bg-brand-tint" : "border-line bg-white"}`}>
                      <div className="font-bold">{s.emoji} {s.label}</div>
                      <div className="text-[11px] text-muted">{s.count} {s.count === 1 ? "person" : "people"}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[12px] font-bold text-muted">Message</label>
                  <span className="text-[11px] text-muted">Tokens: {"{name} {brand} {tier} {points} {toReward}"}</span>
                </div>
                <textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={4} placeholder="Hi {name}, ..."
                  className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
              </div>

              {template && (
                <div className="rounded-xl bg-[#e7f6e1] p-3.5">
                  <div className="mb-1 text-[11px] font-bold text-brand-dark">Preview · as {SAMPLE.name}</div>
                  <div className="whitespace-pre-wrap rounded-lg bg-white p-3 text-[13px] shadow-sm">{clientPersonalize(template, fromName)}</div>
                </div>
              )}

              {result && (
                <div className={`rounded-xl px-3.5 py-2.5 text-[13px] ${result.error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                  {result.error ? result.error : `${result.sent} message${result.sent === 1 ? "" : "s"} ${result.mode === "demo" ? "logged (demo)" : "sent"} to the “${seg.segments.find((s) => s.key === segment)?.label || segment}” segment.`}
                </div>
              )}

              <button onClick={send} disabled={busy || !template.trim() || segCount === 0}
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white disabled:opacity-50">
                {busy ? "Sending…" : `Send to ${segCount} ${segCount === 1 ? "customer" : "customers"}`}
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          <SectionCard title="Campaigns">
            <div className="divide-y divide-line">
              {data.campaigns.length === 0 && <div className="p-6 text-center text-sm text-muted">No campaigns yet.</div>}
              {data.campaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3.5 text-[13px]">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-[12px] text-muted">{c.segment} · {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  </div>
                  <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-bold">{c.sentCount} sent</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Recent messages">
            <div className="divide-y divide-line">
              {data.messages.length === 0 && <div className="p-6 text-center text-sm text-muted">No messages yet.</div>}
              {data.messages.map((m) => (
                <div key={m.id} className="flex items-start gap-3 p-3.5 text-[13px]">
                  <StatusDot s={m.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{m.toName || m.to}</span>
                      <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-bold uppercase text-muted">{m.kind}</span>
                    </div>
                    <div className="truncate text-[12.5px] text-muted">{m.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "settings" && <Settings onSaved={load} />}
    </div>
  );
}

function Settings({ onSaved }) {
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch("/api/wa/settings").then((r) => (r.ok ? r.json() : null)).then(setS).catch(() => {});
  }, []);

  if (!s) return <div className="text-sm text-muted">Loading settings…</div>;

  const set = (k, v) => setS({ ...s, [k]: v });
  const setCfg = (k, v) => setS({ ...s, config: { ...s.config, [k]: v } });

  async function save() {
    setMsg("");
    const r = await fetch("/api/wa/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    const d = await r.json();
    setMsg(r.ok ? `Saved · now in ${d.mode} mode` : d.error || "Failed");
    onSaved?.();
  }

  async function runNudges() {
    setRunning(true);
    setMsg("");
    const r = await fetch("/api/cron/nudges", { method: "POST" });
    const d = await r.json();
    setMsg(r.ok ? `Nudges run · ${d.totalSent} sent` : d.error || "Failed");
    setRunning(false);
    onSaved?.();
  }

  const P = s.provider || "";

  return (
    <div className="space-y-4">
      <SectionCard title="Sender">
        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-[12px] font-bold text-muted">Business name (shown in messages)</label>
            <input value={s.fromName} onChange={(e) => set("fromName", e.target.value)}
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-canvas px-3.5 py-3 text-[13px]">
            <div><div className="font-semibold">Auto order updates</div><div className="text-[12px] text-muted">Order confirmation & ready alerts</div></div>
            <input type="checkbox" checked={s.triggers} onChange={(e) => set("triggers", e.target.checked)} className="h-5 w-5 accent-[#3A6B4D]" />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-canvas px-3.5 py-3 text-[13px]">
            <div><div className="font-semibold">Loyalty nudges</div><div className="text-[12px] text-muted">Reward-close & win-back reminders</div></div>
            <input type="checkbox" checked={s.nudges} onChange={(e) => set("nudges", e.target.checked)} className="h-5 w-5 accent-[#3A6B4D]" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Provider">
        <div className="space-y-4 p-4">
          <p className="text-[12.5px] text-muted">Leave on <b>Demo</b> to preview the flow without sending. Add a provider to go live for this café.</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[["", "Demo"], ["meta", "Meta Cloud"], ["twilio", "Twilio"], ["bsp", "Indian BSP"]].map(([v, l]) => (
              <button key={v} onClick={() => set("provider", v)}
                className={`rounded-xl border px-3 py-2.5 text-[12.5px] font-semibold ${P === v ? "border-brand bg-brand-tint" : "border-line bg-white"}`}>{l}</button>
            ))}
          </div>

          {P === "meta" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone number ID" v={s.config.phoneId} on={(v) => setCfg("phoneId", v)} />
              <Field label="Access token" v={s.config.token} on={(v) => setCfg("token", v)} />
            </div>
          )}
          {P === "twilio" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Account SID" v={s.config.sid} on={(v) => setCfg("sid", v)} />
              <Field label="Auth token" v={s.config.token} on={(v) => setCfg("token", v)} />
              <Field label="From number" v={s.config.from} on={(v) => setCfg("from", v)} />
            </div>
          )}
          {P === "bsp" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="API endpoint URL" v={s.config.url} on={(v) => setCfg("url", v)} />
              <Field label="API key" v={s.config.apiKey} on={(v) => setCfg("apiKey", v)} />
            </div>
          )}

          {P !== "" && (
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={s.enabled} onChange={(e) => set("enabled", e.target.checked)} className="h-5 w-5 accent-[#3A6B4D]" />
              Enable live sending for this café
            </label>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={save} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white">Save settings</button>
            <button onClick={runNudges} disabled={running} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-bold disabled:opacity-50">{running ? "Running…" : "Run nudges now"}</button>
            {msg && <span className="text-[12.5px] font-semibold text-brand-dark">{msg}</span>}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function Field({ label, v, on }) {
  return (
    <div>
      <label className="mb-1 block text-[12px] font-bold text-muted">{label}</label>
      <input value={v || ""} onChange={(e) => on(e.target.value)}
        className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand" />
    </div>
  );
}
