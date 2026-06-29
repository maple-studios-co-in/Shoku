"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useCart } from "@/components/Providers";
import { QUICK_PROMPTS, promptText } from "@/lib/ai";
import { formatINR } from "@/lib/menu";

function RecCard({ rec }) {
  const { add } = useCart();
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-card">
      <Link href={`/item/${rec.item.id}`}>
        <img src={rec.item.img} alt={rec.item.name} className="h-12 w-12 rounded-xl object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/item/${rec.item.id}`} className="block text-[13px] font-semibold leading-tight">
          {rec.item.name}
        </Link>
        <div className="text-[11px] text-muted">{formatINR(rec.item.price)} · {rec.item.kcal} kcal</div>
        <div className="mt-0.5 text-[11px] font-semibold text-brand">↳ {rec.why}</div>
      </div>
      <button
        onClick={() => add({ ...rec.item, sizes: [{ name: "Regular", price: rec.item.price }] })}
        className="grid h-8 w-8 place-items-center rounded-lg bg-brand-tint text-lg font-bold text-brand-dark active:scale-90"
      >
        +
      </button>
    </div>
  );
}

export default function AIPage() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      lead: "Hi! ✨ I'm Shoku AI.",
      text: "Tell me your mood, the time of day, or what you're craving — I know the whole menu, including caffeine, calories and what's good right now.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function ask(text) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { from: "me", text: q }]);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { from: "bot", lead: "On it ✨", text: data.intro, picks: data.picks }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Sorry, I couldn't reach the menu just now — try again?" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="bg-gradient-to-b from-brand to-brand-dark px-4 pb-4 pt-4 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-xl">✨</div>
          <div>
            <div className="text-[11px] font-bold tracking-wider opacity-80">SHOKU AI ASSISTANT</div>
            <h1 className="text-xl font-bold tracking-tight">What are you craving?</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`fade-up flex flex-col ${m.from === "me" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-3 text-[13.5px] leading-relaxed ${
              m.from === "me" ? "rounded-br-sm bg-brand text-white" : "rounded-bl-sm bg-canvas text-ink"
            }`}>
              {m.lead && <span className="mb-0.5 block font-bold">{m.lead}</span>}
              {m.text}
            </div>
            {m.picks && (
              <div className="mt-2 flex w-[85%] flex-col gap-2">
                {m.picks.map((rec) => (
                  <RecCard key={rec.item.id} rec={rec} />
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && <div className="text-xs text-muted">Shoku AI is thinking…</div>}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {QUICK_PROMPTS.map((p) => (
          <button key={p.id} onClick={() => ask(promptText(p.id))}
            className="rounded-full border border-line bg-brand-tint px-3.5 py-2 text-[12.5px] font-semibold text-brand-dark active:scale-95">
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="sticky bottom-0 flex gap-2 border-t border-line bg-white px-3.5 py-3"
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about the menu…"
          className="flex-1 rounded-full bg-canvas px-4 py-2.5 text-[13px] outline-none placeholder:text-muted" />
        <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-lg text-white active:scale-90">↑</button>
      </form>
    </AppShell>
  );
}
