"use client";

import { useEffect, useState } from "react";
import { SectionCard, formatINR } from "@/components/AdminUI";

const inp = "w-full rounded-lg border border-line px-3 py-2.5 text-[13px] outline-none focus:border-brand";

export default function LoyaltyPage() {
  const [earnRate, setEarnRate] = useState(10);
  const [tiers, setTiers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [items, setItems] = useState([]);
  const [savedS, setSavedS] = useState(false);
  const [nr, setNr] = useState({ title: "", type: "discount", cost: 100, amount: 50, itemId: "" });
  const [err, setErr] = useState("");

  function load() {
    fetch("/api/loyalty").then((r) => r.json()).then((d) => { setEarnRate(d.earnRate); setTiers(d.tiers || []); setRewards(d.rewards || []); });
    fetch("/api/menu?all=1").then((r) => r.json()).then((d) => setItems(d.items || []));
  }
  useEffect(() => { load(); }, []);

  async function saveSettings() {
    await fetch("/api/loyalty", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ earnRate: Number(earnRate), tiers }) });
    setSavedS(true);
  }
  function setTier(i, k, v) { setTiers((t) => t.map((x, j) => (j === i ? { ...x, [k]: v } : x))); setSavedS(false); }
  function addTier() { setTiers((t) => [...t, { name: "New tier", min: 0 }]); setSavedS(false); }
  function removeTier(i) { setTiers((t) => t.filter((_, j) => j !== i)); setSavedS(false); }

  async function addReward() {
    setErr("");
    const res = await fetch("/api/loyalty/rewards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nr) });
    if (!res.ok) { const d = await res.json(); setErr(d.error || "Failed"); return; }
    setNr({ title: "", type: "discount", cost: 100, amount: 50, itemId: "" });
    load();
  }
  async function toggleReward(rw) {
    setRewards((a) => a.map((x) => (x.id === rw.id ? { ...x, active: !x.active } : x)));
    await fetch(`/api/loyalty/rewards/${rw.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !rw.active }) });
  }
  async function delReward(rw) {
    if (!confirm(`Delete reward "${rw.title}"?`)) return;
    const res = await fetch(`/api/loyalty/rewards/${rw.id}`, { method: "DELETE" });
    if (res.ok) setRewards((a) => a.filter((x) => x.id !== rw.id));
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6"><h1 className="text-2xl font-bold tracking-tight">Loyalty</h1><p className="text-sm text-muted">Points, tiers and redeemable rewards.</p></header>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Earning & tiers" action={<button onClick={saveSettings} className="rounded-lg bg-brand-dark px-3.5 py-1.5 text-[12px] font-bold text-white">{savedS ? "Saved ✓" : "Save"}</button>}>
          <div className="p-5">
            <label className="mb-1 block text-[12px] font-semibold text-ink/70">Points earned per ₹100 spent</label>
            <input className={inp + " w-28"} type="number" value={earnRate} onChange={(e) => { setEarnRate(e.target.value); setSavedS(false); }} />
            <div className="mb-2 mt-5 flex items-center justify-between">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Tiers</span>
              <button onClick={addTier} className="text-[12px] font-bold text-brand">+ Add tier</button>
            </div>
            {tiers.map((t, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <input className={inp} value={t.name} onChange={(e) => setTier(i, "name", e.target.value)} />
                <input className={inp + " w-28"} type="number" value={t.min} onChange={(e) => setTier(i, "min", Number(e.target.value))} placeholder="min pts" />
                <button onClick={() => removeTier(i)} className="px-2 text-[13px] font-bold text-red-500">✕</button>
              </div>
            ))}
            <p className="mt-1 text-[11.5px] text-muted">A customer's tier is the highest one whose minimum points they've reached.</p>
          </div>
        </SectionCard>

        <SectionCard title="Add a reward">
          <div className="grid gap-3 p-5">
            <input className={inp} placeholder="Reward title (e.g. Free Cappuccino)" value={nr.title} onChange={(e) => setNr({ ...nr, title: e.target.value })} />
            <div className="flex gap-3">
              <select className={inp} value={nr.type} onChange={(e) => setNr({ ...nr, type: e.target.value })}>
                <option value="discount">₹ discount</option>
                <option value="freeItem">Free item</option>
              </select>
              <input className={inp + " w-32"} type="number" value={nr.cost} onChange={(e) => setNr({ ...nr, cost: Number(e.target.value) })} placeholder="cost (pts)" />
            </div>
            {nr.type === "discount" ? (
              <input className={inp} type="number" value={nr.amount} onChange={(e) => setNr({ ...nr, amount: Number(e.target.value) })} placeholder="₹ off" />
            ) : (
              <select className={inp} value={nr.itemId} onChange={(e) => setNr({ ...nr, itemId: e.target.value })}>
                <option value="">Choose free item…</option>
                {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
              </select>
            )}
            {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{err}</div>}
            <button onClick={addReward} className="rounded-xl bg-brand py-2.5 text-[13px] font-bold text-white">Add reward</button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Rewards" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
              <th className="px-5 py-3">Reward</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Cost</th><th className="px-5 py-3">Value</th><th className="px-5 py-3">Active</th><th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {rewards.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No rewards yet.</td></tr>}
              {rewards.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-semibold">{r.title}</td>
                  <td className="px-5 py-3 text-muted">{r.type === "discount" ? "Discount" : "Free item"}</td>
                  <td className="px-5 py-3">{r.cost} pts</td>
                  <td className="px-5 py-3 text-muted">{r.type === "discount" ? formatINR(r.amount) + " off" : r.itemName}</td>
                  <td className="px-5 py-3"><button onClick={() => toggleReward(r)} className={`relative h-6 w-10 rounded-full ${r.active ? "bg-brand" : "bg-gray-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${r.active ? "right-1" : "left-1"}`} /></button></td>
                  <td className="px-5 py-3"><button onClick={() => delReward(r)} className="text-[12px] font-bold text-red-500">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
