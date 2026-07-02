"use client";

import { useState } from "react";
import Link from "next/link";

function HBars({ data, color = "#3A6B4D", fmt = (v) => v, max }) {
  const m = max || Math.max(1, ...data.map((d) => d.v));
  return (
    <div className="hbars">
      {data.map((d) => (
        <div className="hrow" key={d.k}>
          <div className="hlabel">{d.k}</div>
          <div className="htrack"><div className="hfill" style={{ width: `${(d.v / m) * 100}%`, background: color }} /></div>
          <div className="hval">{fmt(d.v)}</div>
        </div>
      ))}
    </div>
  );
}

export default function ResearchView({ docs, insights }) {
  const [active, setActive] = useState("__insights");
  const doc = docs.find((d) => d.slug === active);

  return (
    <div className="research">
      <aside className="side">
        <Link href="/" className="brand"><span className="dot">食</span> Shoku <span className="tagline">Research</span></Link>
        <nav>
          <button className={active === "__insights" ? "on" : ""} onClick={() => setActive("__insights")}>📊 Insights overview</button>
          <div className="sep">Reports</div>
          {docs.map((d) => (
            <button key={d.slug} className={active === d.slug ? "on" : ""} onClick={() => setActive(d.slug)}>{d.title}</button>
          ))}
        </nav>
        <Link href="/super" className="back">← Platform</Link>
      </aside>

      <main className="main">
        {active === "__insights" ? (
          <div className="insights">
            <div className="eyebrow">Strategy snapshot · June 2026</div>
            <h1>Research Hub — key insights</h1>
            <p className="lede">Everything we&apos;ve gathered on the India café market, competitors, community sentiment and branding — in one place. Pick a report on the left for the full detail &amp; sources.</p>

            <div className="kpis">
              {insights.kpis.map((k) => (
                <div className="kpi" key={k.l}><div className="v">{k.v}</div><div className="l">{k.l}</div></div>
              ))}
            </div>

            <div className="cards">
              <div className="card">
                <h3>Effective take-rate on order value</h3>
                <p className="note">Aggregators vs ONDC vs us. % of each order kept by the channel.</p>
                <HBars data={insights.takeRate} max={32} color="#C2643C" fmt={(v) => v + "%"} />
              </div>
              <div className="card">
                <h3>Owner pain points — relative loudness</h3>
                <p className="note">From Reddit / forum / NRAI sentiment (illustrative ranking).</p>
                <HBars data={insights.pains} color="#244635" fmt={() => ""} />
              </div>
              <div className="card">
                <h3>India branded coffee outlets</h3>
                <p className="note">2025 → 2030 forecast (World Coffee Portal).</p>
                <HBars data={insights.outlets} color="#3A6B4D" fmt={(v) => v.toLocaleString("en-IN")} />
              </div>
              <div className="card">
                <h3>Open market gaps we target</h3>
                <p className="note">Thin / unowned in India — our wedge.</p>
                <div className="chips">{insights.gaps.map((g) => <span key={g}>{g}</span>)}</div>
                <div className="fund">Food-tech funding H1&apos;25: <b>{insights.funding}</b> — a lean, AI-native wedge beats a capital race.</div>
              </div>
            </div>
            {insights.posKpis && (
              <>
                <div className="eyebrow" style={{ marginTop: 34 }}>POS pivot · unit economics</div>
                <h1 style={{ fontSize: 24 }}>Becoming the café POS — the numbers</h1>
                <div className="kpis">
                  {insights.posKpis.map((k) => (
                    <div className="kpi" key={k.l}><div className="v">{k.v}</div><div className="l">{k.l}</div></div>
                  ))}
                </div>
                <div className="cards">
                  <div className="card">
                    <h3>POS pricing ladder — effective ₹/yr, single outlet</h3>
                    <p className="note">Real-world spend incl. modules/implementation; Rista/Posist are sales-led quotes (midpoints). Full table in the POS deep-dive.</p>
                    <HBars data={insights.posPricing} color="#C2643C" fmt={(v) => "₹" + (v / 1000).toFixed(0) + "k"} />
                  </div>
                  <div className="card">
                    <h3>Shoku gross profit per café / month</h3>
                    <p className="note">Modelled at scenario S2 (~50 cafés), WhatsApp metered. Assumptions &amp; sensitivities in Unit Economics.</p>
                    <HBars data={insights.unitEcon} fmt={(v) => "₹" + v.toLocaleString("en-IN")} />
                  </div>
                </div>
                <p className="src">Route call: software-only POS add-on (billing + KOT + GST + day-end) beats a hardware-led fight at current scale — full argument in the two new reports.</p>
              </>
            )}
            <p className="src">Sources are cited inside each report. Reports: POS deep-dive, unit economics, market trends, competitor analysis, scraped competitor intel, Petpooja pivot, food-tech landscape &amp; gaps, community sentiment, rebrand strategy.</p>
          </div>
        ) : (
          <article className="prose" dangerouslySetInnerHTML={{ __html: doc ? doc.html : "<p>Select a report.</p>" }} />
        )}
      </main>

      <style jsx global>{`
        .research { --green:#3A6B4D; --green-d:#244635; --dark:#15281e; --ink:#1B1813; --muted:#6F6557; --line:#E4DDD0; --tint:#EAF1EA; --canvas:#F6F2EA; --clay:#C2643C;
          display:flex; min-height:100vh; background:var(--canvas); color:var(--ink);
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
        .research *{box-sizing:border-box}
        .research .side { width:248px; flex:none; background:var(--dark); color:#dfeBd5; color:#dfebd5; display:flex; flex-direction:column; padding:16px 12px; position:sticky; top:0; height:100vh; }
        .research .brand { display:flex; align-items:center; gap:8px; color:#fff; font-weight:800; font-size:17px; text-decoration:none; padding:6px 8px 14px; }
        .research .brand .dot { width:28px;height:28px;border-radius:8px;background:var(--green);display:grid;place-items:center;font-size:14px }
        .research .brand .tagline { font-weight:600; font-size:12px; color:#a9c8b4; }
        .research nav { display:flex; flex-direction:column; gap:3px; flex:1; overflow:auto; }
        .research nav button { text-align:left; background:transparent; border:0; color:#cfe0c2; font-size:13px; font-weight:600; padding:9px 10px; border-radius:9px; cursor:pointer; }
        .research nav button:hover { background:rgba(255,255,255,.08); }
        .research nav button.on { background:var(--green); color:#fff; }
        .research nav .sep { font-size:10.5px; text-transform:uppercase; letter-spacing:.1em; color:#80936a; padding:14px 10px 5px; }
        .research .back { color:#a9c8b4; text-decoration:none; font-size:12.5px; font-weight:700; padding:10px 8px 2px; }
        .research .main { flex:1; min-width:0; padding:32px 34px 70px; overflow:auto; }
        .research .eyebrow { font-size:12px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--green); }
        .research .insights h1 { font-family:var(--font-serif,Georgia,serif); font-size:30px; margin:8px 0 8px; }
        .research .lede { color:var(--muted); font-size:14.5px; max-width:74ch; margin:0 0 22px; }
        .research .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:13px; margin-bottom:18px; }
        .research .kpi { background:#fff; border:1px solid var(--line); border-radius:15px; padding:15px; box-shadow:0 8px 22px rgba(20,40,10,.05); }
        .research .kpi .v { font-family:var(--font-serif,Georgia,serif); font-size:21px; color:var(--green-d); line-height:1.1; }
        .research .kpi .l { font-size:11.5px; color:var(--muted); margin-top:6px; }
        .research .cards { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .research .card { background:#fff; border:1px solid var(--line); border-radius:18px; padding:20px; box-shadow:0 8px 22px rgba(20,40,10,.05); }
        .research .card h3 { margin:0 0 2px; font-size:15px; }
        .research .card .note { margin:0 0 14px; font-size:12px; color:var(--muted); }
        .hbars { display:flex; flex-direction:column; gap:9px; }
        .hrow { display:grid; grid-template-columns:140px 1fr 42px; align-items:center; gap:10px; }
        .hlabel { font-size:12px; color:var(--ink); }
        .htrack { background:var(--canvas); border-radius:999px; height:14px; overflow:hidden; }
        .hfill { height:100%; border-radius:999px; min-width:3px; transition:width .4s; }
        .hval { font-size:12px; font-weight:700; text-align:right; font-variant-numeric:tabular-nums; }
        .chips { display:flex; flex-wrap:wrap; gap:8px; }
        .chips span { background:var(--tint); color:var(--green-d); font-size:12px; font-weight:600; padding:6px 11px; border-radius:999px; }
        .fund { margin-top:14px; font-size:12.5px; color:#5d6b55; }
        .src { margin-top:22px; font-size:11.5px; color:var(--muted); }
        /* prose (reports) */
        .research .prose { max-width:860px; line-height:1.65; font-size:15px; }
        .research .prose h1 { font-family:var(--font-serif,Georgia,serif); font-size:32px; margin:0 0 16px; }
        .research .prose h2 { font-family:var(--font-serif,Georgia,serif); font-size:23px; margin:36px 0 12px; padding-top:14px; border-top:1px solid var(--line); }
        .research .prose h3 { font-size:17px; margin:24px 0 8px; }
        .research .prose p { margin:0 0 13px; }
        .research .prose ul,.research .prose ol { margin:0 0 15px; padding-left:22px; }
        .research .prose li { margin:5px 0; }
        .research .prose a { color:var(--green-d); }
        .research .prose code { background:#eef2ea; padding:2px 6px; border-radius:6px; font-size:13px; font-family:ui-monospace,Menlo,monospace; }
        .research .prose pre { background:var(--dark); color:#e8f2dd; padding:15px; border-radius:12px; overflow:auto; }
        .research .prose pre code { background:transparent; color:inherit; }
        .research .prose table { width:100%; border-collapse:collapse; margin:0 0 18px; font-size:13px; display:block; overflow-x:auto; }
        .research .prose th,.research .prose td { border:1px solid var(--line); padding:8px 10px; text-align:left; vertical-align:top; }
        .research .prose th { background:var(--tint); font-weight:700; }
        .research .prose blockquote { margin:0 0 14px; padding:8px 14px; border-left:3px solid var(--green); background:#fff; color:var(--muted); }
        @media(max-width:820px){
          .research { flex-direction:column; }
          .research .side { width:100%; height:auto; position:static; flex-direction:row; flex-wrap:wrap; align-items:center; gap:6px; }
          .research nav { flex-direction:row; flex-wrap:wrap; }
          .research nav .sep { display:none; }
          .research .kpis,.research .cards { grid-template-columns:1fr; }
          .research .hrow { grid-template-columns:110px 1fr 38px; }
        }
      `}</style>
    </div>
  );
}
