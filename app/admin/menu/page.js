"use client";

import { useEffect, useState } from "react";
import { SectionCard, formatINR } from "@/components/AdminUI";

const BLANK = {
  name: "", categoryId: "ice-blended", price: 0, img: "", desc: "",
  kcal: 0, caffeine: 0, protein: 0, sugar: 0, veg: true, signature: false,
  origin: "", ingredients: "", allergens: "", tags: "", aiTip: "", sizes: null,
};

function toForm(it) {
  return {
    ...it,
    ingredients: (it.ingredients || []).join(", "),
    allergens: (it.allergens || []).join(", "),
    tags: (it.tags || []).join(", "),
  };
}
function fromForm(f) {
  const split = (s) => String(s).split(",").map((x) => x.trim()).filter(Boolean);
  return {
    ...f,
    price: Number(f.price) || 0,
    kcal: Number(f.kcal) || 0,
    caffeine: Number(f.caffeine) || 0,
    protein: Number(f.protein) || 0,
    sugar: Number(f.sugar) || 0,
    ingredients: split(f.ingredients),
    allergens: split(f.allergens),
    tags: split(f.tags),
  };
}

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null); // form object or null
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function load() {
    fetch("/api/menu?all=1").then((r) => r.json()).then((d) => { setItems(d.items || []); setCats(d.categories || []); });
  }
  useEffect(() => { load(); }, []);

  const catLabel = (id) => cats.find((c) => c.id === id)?.label || id;

  async function toggleLive(it) {
    setItems((arr) => arr.map((x) => (x.id === it.id ? { ...x, live: !x.live } : x)));
    await fetch(`/api/items/${it.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ live: !it.live }) });
  }

  async function remove(it) {
    if (!confirm(`Delete "${it.name}"? This can't be undone.`)) return;
    const res = await fetch(`/api/items/${it.id}`, { method: "DELETE" });
    if (res.ok) setItems((arr) => arr.filter((x) => x.id !== it.id));
    else {
      const d = await res.json();
      alert(d.error || "Could not delete.");
    }
  }

  async function save() {
    setErr("");
    if (!editing.name) { setErr("Name is required."); return; }
    setSaving(true);
    const payload = fromForm(editing);
    const isEdit = !!editing.id;
    const res = await fetch(isEdit ? `/api/items/${editing.id}` : "/api/items", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setErr(d.error || "Save failed."); return; }
    setEditing(null);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
          <p className="text-sm text-muted">{items.length} items · add, edit and publish.</p>
        </div>
        <button onClick={() => setEditing({ ...BLANK, categoryId: cats[0]?.id || "ice-blended" })} className="rounded-xl bg-brand px-4 py-2.5 text-[13px] font-bold text-white">+ Add item</button>
      </header>

      <SectionCard>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Live</th>
                <th className="px-5 py-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={it.img} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold">{it.name}{it.signature && <span className="ml-1.5 rounded bg-brand-tint px-1.5 py-0.5 text-[9px] font-bold text-brand-dark">★</span>}</div>
                        <div className="text-[11px] text-muted">{it.kcal} kcal · {it.caffeine}mg</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{catLabel(it.category)}</td>
                  <td className="px-5 py-3 font-bold">{formatINR(it.price)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleLive(it)} className={`relative h-6 w-10 rounded-full ${it.live ? "bg-brand" : "bg-gray-300"}`}>
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${it.live ? "right-1" : "left-1"}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(toForm(it))} className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold">Edit</button>
                      <button onClick={() => remove(it)} className="rounded-lg px-2 py-1.5 text-[12px] font-bold text-red-500">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onClick={() => setEditing(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">{editing.id ? "Edit item" : "New item"}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <F label="Name" full><input className={inp} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></F>
              <F label="Category">
                <select className={inp} value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </F>
              <F label="Price (₹)"><input type="number" className={inp} value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></F>
              <F label="Image URL" full><input className={inp} value={editing.img} onChange={(e) => setEditing({ ...editing, img: e.target.value })} placeholder="https://…" /></F>
              <F label="Description" full><textarea className={inp} rows={2} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></F>
              <F label="Calories"><input type="number" className={inp} value={editing.kcal} onChange={(e) => setEditing({ ...editing, kcal: e.target.value })} /></F>
              <F label="Caffeine (mg)"><input type="number" className={inp} value={editing.caffeine} onChange={(e) => setEditing({ ...editing, caffeine: e.target.value })} /></F>
              <F label="Protein (g)"><input type="number" className={inp} value={editing.protein} onChange={(e) => setEditing({ ...editing, protein: e.target.value })} /></F>
              <F label="Sugar (g)"><input type="number" className={inp} value={editing.sugar} onChange={(e) => setEditing({ ...editing, sugar: e.target.value })} /></F>
              <F label="Origin" full><input className={inp} value={editing.origin} onChange={(e) => setEditing({ ...editing, origin: e.target.value })} /></F>
              <F label="Ingredients (comma-separated)" full><input className={inp} value={editing.ingredients} onChange={(e) => setEditing({ ...editing, ingredients: e.target.value })} /></F>
              <F label="Allergens (comma-separated)" full><input className={inp} value={editing.allergens} onChange={(e) => setEditing({ ...editing, allergens: e.target.value })} /></F>
              <F label="Tags (comma-separated)" full><input className={inp} value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="cold, sweet, vegan…" /></F>
              <F label="AI tip" full><input className={inp} value={editing.aiTip} onChange={(e) => setEditing({ ...editing, aiTip: e.target.value })} /></F>
              <label className="flex items-center gap-2 text-[13px] font-semibold"><input type="checkbox" checked={editing.veg} onChange={(e) => setEditing({ ...editing, veg: e.target.checked })} /> Vegetarian</label>
              <label className="flex items-center gap-2 text-[13px] font-semibold"><input type="checkbox" checked={editing.signature} onChange={(e) => setEditing({ ...editing, signature: e.target.checked })} /> Signature item</label>
            </div>
            {err && <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{err}</div>}
            <div className="mt-5 flex gap-3">
              <button onClick={save} disabled={saving} className="flex-1 rounded-xl bg-brand py-3 text-[14px] font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save item"}</button>
              <button onClick={() => setEditing(null)} className="rounded-xl border border-line px-5 py-3 text-[14px] font-semibold">Cancel</button>
            </div>
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
