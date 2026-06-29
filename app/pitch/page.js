"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export default function PitchPage() {
  const { data: session } = useSession();
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState("");
  const pdfRef = useRef(null);
  const pptxRef = useRef(null);
  const isAdmin = session?.user?.role === "superadmin";

  const load = () => fetch("/api/pitch").then((r) => (r.ok ? r.json() : null)).then(setMeta).catch(() => {});
  useEffect(() => { load(); }, []);

  async function onUpload(e, kind) {
    const f = e.target.files?.[0];
    if (!f) return;
    setStatus(`Uploading ${kind.toUpperCase()}…`);
    const fd = new FormData();
    fd.append("file", f);
    fd.append("kind", kind);
    const r = await fetch("/api/pitch", { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    setStatus(r.ok ? `${kind.toUpperCase()} uploaded → v${d.version} ✓` : d.error || "Upload failed");
    if (pdfRef.current) pdfRef.current.value = "";
    if (pptxRef.current) pptxRef.current.value = "";
    if (r.ok) load();
  }

  const pdf = meta?.pdf;
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="deck">
      <nav className="bar">
        <div className="brand"><img src="/shoku-mark.svg" alt="" className="dot" /> Shoku</div>
        <div className="spacer" />
        {pdf?.custom && <span className="ver">v{pdf.version}</span>}
        <a className="btn ghost" href="/api/pitch/download?inline=1" target="_blank" rel="noreferrer">View PDF</a>
        <a className="btn" href="/api/pitch/download">Download PDF</a>
        <button className="btn ghost" onClick={() => window.print()}>Print</button>
        {isAdmin && (
          <>
            <a className="btn ghost" href="/api/pitch/source">Source .pptx</a>
            <input ref={pdfRef} type="file" accept="application/pdf" onChange={(e) => onUpload(e, "pdf")} hidden />
            <input ref={pptxRef} type="file" accept=".pptx" onChange={(e) => onUpload(e, "pptx")} hidden />
            <button className="btn up" onClick={() => pdfRef.current?.click()}>Upload PDF</button>
            <button className="btn up" onClick={() => pptxRef.current?.click()}>Upload .pptx</button>
          </>
        )}
      </nav>
      {pdf?.custom && (
        <div className="updated">Updated to v{pdf.version} · {fmtDate(pdf.uploadedAt)}{pdf.uploadedBy ? ` · ${pdf.uploadedBy}` : ""}</div>
      )}
      {isAdmin && status && <div className="status">{status}</div>}

      <main className="stage">
        {/* 1 — TITLE */}
        <section className="slide dark title">
          <div className="logo"><img src="/shoku-mark.svg" alt="" className="dot big" /></div>
          <div className="eyebrow light">Seed pitch · 2026</div>
          <h1>Shoku</h1>
          <p className="lede">AI-powered, white-label online ordering for cafés &amp; restaurant chains.</p>
          <p className="tag">Your café. Your customers. Your app. <em>Zero commission.</em></p>
          <p className="sub">Every café gets its own branded ordering app — menu, loyalty, analytics and an AI ordering assistant — for a flat SaaS fee, not a 20–30% aggregator tax.</p>
        </section>

        {/* 2 — PROBLEM */}
        <section className="slide">
          <div className="eyebrow">The problem</div>
          <h2>Cafés are taxed ~30% — and don&apos;t even own their customers.</h2>
          <div className="stats3">
            <div><b>16–30%</b><span>commission on every order — pure margin erosion for thin-margin cafés.</span></div>
            <div><b>0</b><span>customer contact, data or relationship — the aggregator owns it all.</span></div>
            <div><b>None</b><span>of their own loyalty, retention or upsell — they rent an audience.</span></div>
          </div>
        </section>

        {/* 3 — WHY NOW */}
        <section className="slide tintbg">
          <div className="eyebrow">Why now</div>
          <h2>Four curves are crossing at once.</h2>
          <div className="grid2">
            {[
              ["Commission fatigue is peaking", "NRAI #Logout, a CCI probe and low-commission entrants show operators revolting against the 30% model."],
              ["AI is finally cheap & good enough", "Conversational ordering, food intelligence and personalization now run at café scale and cost."],
              ["Direct-to-consumer is normal", "QR menus and café-owned apps are expected post-pandemic — customers happily order direct."],
              ["India’s SaaS rails are ready", "UPI, cheap cloud and PWAs let a tiny team run a national, multi-tenant platform."],
            ].map(([h, p]) => (
              <div className="card" key={h}><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </section>

        {/* 4 — SOLUTION */}
        <section className="slide">
          <div className="eyebrow">The solution</div>
          <h2>Each café’s own AI ordering app — the rails, not the middleman.</h2>
          <ul className="bullets">
            <li>A white-label ordering app per café — fully branded, on its own subdomain, live in days.</li>
            <li>Flat SaaS subscription, no commission — the café keeps 100% of order value.</li>
            <li>Menu management, admin dashboard, analytics, customer accounts, loyalty &amp; discounts built in.</li>
            <li>An AI layer no aggregator gives the café: chat ordering, food intelligence, smart upsell, AI loyalty.</li>
          </ul>
          <p className="kicker">We’re not another marketplace — we’re the OS that lets a café be its own marketplace.</p>
        </section>

        {/* 5 — PRODUCT */}
        <section className="slide tintbg">
          <div className="eyebrow">The product</div>
          <h2>Two products in one.</h2>
          <div className="grid3">
            {[
              ["Branded storefront", "Logo, colours, menu, cart & checkout on the café’s own subdomain — a mobile-first PWA, no download."],
              ["AI ordering assistant", "A ‘what should I eat?’ chat that recommends dishes, answers questions and builds the cart."],
              ["Food intelligence", "Every item enriched with origin, ingredients, allergens and nutrition — unique to Shoku."],
              ["Loyalty & rewards", "Points, tiers and redeemable rewards (₹-off or free items), redeemed right at checkout."],
              ["Super-admin console", "Shoku provisions, themes and monitors every café tenant from one control plane."],
              ["Table QR & feedback", "Dine-in QR ordering tied to tables, plus post-order ratings into an owner dashboard."],
            ].map(([h, p]) => (
              <div className="card" key={h}><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </section>

        {/* 6 — GROWTH ENGINE */}
        <section className="slide">
          <div className="eyebrow">What’s new <span className="new">NEW</span></div>
          <h2>A built-in growth engine.</h2>
          <div className="grid3">
            {[
              ["WhatsApp marketing", "Personalized campaigns to loyal customers — segmented by tier, spend and recency."],
              ["AI campaign copywriter", "AI drafts each message and personalizes every send with name, tier and points."],
              ["Automated triggers", "Order confirmations, ready alerts, reward nudges and win-back reminders fire automatically."],
              ["AI platform analytics", "Revenue & MRR trends, a next-month forecast and at-risk cafés, with an AI insight summary."],
              ["Sale banners", "Owners upload promo banners that appear instantly atop their live ordering app."],
              ["Loyalty segments", "Target Gold members, lapsed regulars or customers close to a reward in one tap."],
            ].map(([h, p]) => (
              <div className="card" key={h}><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </section>

        {/* 7 — HOW IT WORKS */}
        <section className="slide tintbg">
          <div className="eyebrow">How it works</div>
          <h2>From signup to a live branded app — in days.</h2>
          <div className="steps">
            {[
              ["1", "Onboard", "In the super-admin console: set brand, colours, menu and subdomain."],
              ["2", "Auto-provision", "The café goes live on its own subdomain with a starter menu and loyalty."],
              ["3", "Sell direct", "Customers order via QR or link; AI assists, loyalty rewards, data stays the café’s."],
              ["4", "Grow", "WhatsApp campaigns, banners and analytics drive repeat orders and retention."],
            ].map(([n, h, p]) => (
              <div className="step" key={n}><span className="num">{n}</span><div><h3>{h}</h3><p>{p}</p></div></div>
            ))}
          </div>
        </section>

        {/* 8 — MARKET */}
        <section className="slide">
          <div className="eyebrow">Market size</div>
          <h2>Monetize the operators, not the orders.</h2>
          <div className="stats3">
            <div><b>₹2.7L Cr → ₹11.7L Cr</b><span>India online food ordering &amp; delivery (2024→2030, ~28% CAGR). [≈ $32B→$140B]</span></div>
            <div><b>₹2,100 Cr → ₹7,050 Cr</b><span>India restaurant-tech SaaS — Shoku’s TAM (2024→2030, ~23% CAGR).</span></div>
            <div><b>₹18–54 Cr</b><span>5-yr SOM ARR — 2,000–6,000 outlets at our price points.</span></div>
          </div>
          <p className="note">INR at ~₹84/$. Market figures are industry estimates; SOM is bottoms-up on our pricing.</p>
        </section>

        {/* 9 — BUSINESS MODEL */}
        <section className="slide tintbg">
          <div className="eyebrow">Business model</div>
          <h2>Flat SaaS — zero per-order commission.</h2>
          <div className="grid3 price">
            <div className="card"><h3>Starter</h3><div className="rs">₹4,999<span>/mo</span></div><p>Single café, full storefront + core AI.</p></div>
            <div className="card hi"><h3>Growth</h3><div className="rs">₹12,999<span>/mo</span></div><p>Multi-outlet, advanced analytics, full AI loyalty, WhatsApp marketing &amp; upsell.</p></div>
            <div className="card"><h3>Enterprise</h3><div className="rs">Custom</div><p>Chains, SLAs, custom domains, onboarding &amp; success.</p></div>
          </div>
        </section>

        {/* 10 — COMPETITION */}
        <section className="slide">
          <div className="eyebrow">Competition</div>
          <h2>The only AI-native, commission-free, fully-branded ordering OS.</h2>
          <div className="vs">
            {[
              ["vs Aggregators (Zomato/Swiggy)", "Take 16–30% and own the customer. Shoku: flat SaaS, the café owns everything."],
              ["vs UrbanPiper / Posist / Petpooja", "Strong POS/integration tooling, but aggregator-centric and light on a branded, AI-native storefront."],
              ["vs Olo / Toast (US)", "Validate the white-label SaaS thesis at scale — we bring it to India, AI-first, at far lower price."],
            ].map(([h, p]) => (
              <div className="vsrow" key={h}><b>{h}</b><span>{p}</span></div>
            ))}
          </div>
        </section>

        {/* VS FUDR */}
        <section className="slide">
          <div className="eyebrow">Why we win</div>
          <h2>Shoku vs fudr.in — AI is the moat.</h2>
          <p className="kicker" style={{ marginTop: 0, marginBottom: 22 }}>fudr.in digitizes the table with QR ordering &amp; billing. Shoku is an AI-native platform that owns and grows the customer relationship.</p>
          <div className="grid3">
            {[
              ["AI ordering assistant", "Recommends by mood, diet, time of day and caffeine — a conversation, not a static QR menu."],
              ["Food intelligence", "Auto origin, ingredients, allergens and nutrition on every item — trust and upsell a QR menu can’t carry."],
              ["AI WhatsApp marketing", "AI-written personalized campaigns plus automated win-back and reward nudges — a retention engine, not just ordering."],
              ["AI platform analytics", "Revenue & MRR trends, a next-month forecast and at-risk detection with an AI insight summary."],
              ["True white-label app", "Each café’s own branded PWA on its own subdomain — not a shared marketplace skin."],
              ["Flat SaaS · 0% commission", "Cafés keep 100% of order value and own all their customer data."],
            ].map(([h, p]) => (
              <div className="card" key={h}><h3>{h}</h3><p>{p}</p></div>
            ))}
          </div>
        </section>

        {/* 11 — GTM */}
        <section className="slide tintbg">
          <div className="eyebrow">Go-to-market</div>
          <h2>Win a chain, prove ROI on outlet one, expand.</h2>
          <ul className="bullets">
            <li>ICP: specialty cafés and small/mid coffee &amp; restaurant chains (3–50 outlets) feeling commission pain.</li>
            <li>Beachhead: coffee-led chains — high repeat frequency makes loyalty + AI shine.</li>
            <li>Channels: founder-led sales, café-owner communities, POS/roaster/payment partnerships, referral loops.</li>
            <li>First 100 cafés: hand-picked design partners in 2–3 metros, white-glove onboarding.</li>
          </ul>
        </section>

        {/* 12 — TRACTION */}
        <section className="slide">
          <div className="eyebrow">Status</div>
          <h2>The hard part is already built.</h2>
          <ul className="bullets">
            <li>Product is live, multi-tenant and in production — Next.js, self-hostable.</li>
            <li>Shipped: branded storefronts, café + super-admin consoles, AI assistant, food intelligence, loyalty, table QR, feedback, WhatsApp marketing, sale banners and AI platform analytics.</li>
            <li>Design-partner program in motion — onboarding first café/chain partners to validate ROI &amp; pricing.</li>
            <li>Pre / early-revenue — raising to convert a working product into a repeatable go-to-market.</li>
          </ul>
        </section>

        {/* 13 — FINANCIALS */}
        <section className="slide tintbg">
          <div className="eyebrow">Financial projections</div>
          <h2>SaaS compounding on logos &amp; ARPU.</h2>
          <table className="fin">
            <thead><tr><th></th><th>Year 1</th><th>Year 2</th><th>Year 3</th></tr></thead>
            <tbody>
              <tr><td>Paying outlets</td><td>100</td><td>600</td><td>2,000</td></tr>
              <tr><td>MRR (₹)</td><td>~₹7.5 L</td><td>~₹50 L</td><td>~₹1.8 Cr</td></tr>
              <tr><td>ARR (₹)</td><td>~₹0.9 Cr</td><td>~₹6 Cr</td><td>~₹22 Cr</td></tr>
              <tr><td>Net revenue retention</td><td>—</td><td>110%+</td><td>120%+</td></tr>
            </tbody>
          </table>
          <p className="note">Illustrative — for modeling discussion only.</p>
        </section>

        {/* 14 — TEAM */}
        <section className="slide">
          <div className="eyebrow">Team</div>
          <h2>We shipped what most teams only pitch.</h2>
          <div className="grid2">
            <div className="card"><div className="mono">C</div><h3>Founder / CEO</h3><p>Product &amp; F&amp;B domain lead.</p></div>
            <div className="card"><div className="mono">T</div><h3>Founder / CTO</h3><p>Built the live multi-tenant platform.</p></div>
          </div>
          <p className="note">Bios are placeholder — replace with real founder details.</p>
        </section>

        {/* 15 — ASK */}
        <section className="slide dark ask">
          <div className="eyebrow light">The ask</div>
          <h2 className="lighth">Raising ₹2–4 Cr ($250K–$500K) pre-seed / seed.</h2>
          <ul className="bullets light">
            <li>Use of funds: GTM &amp; founder-led sales 40% · product/AI depth 30% · onboarding &amp; success 20% · infra 10%.</li>
            <li>12–18 mo: 100+ paying outlets, 5–10 chain logos, proven CAC/payback, ROI case studies.</li>
            <li>Unlocks a seed/Series A: a repeatable sales motion + early net revenue retention from land-and-expand.</li>
          </ul>
          <p className="contact">hello@getshoku.com · getshoku.com</p>
        </section>

        <footer className="foot">
          <a className="btn" href="/api/pitch/download">Download the deck (PDF)</a>
        </footer>
      </main>

      <style jsx global>{`
        .deck { --green:#3A6B4D; --dark:#15281e; --dark2:#244635; --ink:#1B1813; --muted:#6F6557; --line:#E4DDD0; --tint:#EAF1EA; --canvas:#F6F2EA;
          background:var(--canvas); min-height:100vh; color:var(--ink);
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
        .deck *{ box-sizing:border-box; }
        .bar{ position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:10px; padding:12px 20px;
          background:rgba(255,255,255,.88); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
        .bar .brand{ font-weight:800; font-size:17px; display:flex; align-items:center; gap:8px; color:var(--ink); }
        .dot{ display:grid; place-items:center; width:28px; height:28px; border-radius:8px; background:var(--green); color:#fff; font-weight:800; font-size:14px; }
        .dot.big{ width:64px; height:64px; border-radius:18px; font-size:30px; }
        .bar .spacer{ flex:1; }
        .ver{ font-size:12px; font-weight:700; color:#fff; background:var(--green); border-radius:999px; padding:3px 9px; }
        .btn{ border:0; cursor:pointer; font-size:13px; font-weight:700; padding:9px 14px; border-radius:11px; background:var(--green); color:#fff; text-decoration:none; }
        .btn.ghost{ background:#fff; color:var(--ink); border:1px solid var(--line); }
        .btn.up{ background:var(--dark); }
        .updated{ text-align:center; font-size:12px; color:#8a9582; padding:8px 10px 0; }
        .status{ position:sticky; top:57px; z-index:19; text-align:center; font-size:13px; font-weight:700; color:var(--dark); background:var(--tint); padding:7px; }
        .stage{ max-width:1060px; margin:0 auto; padding:28px 16px 60px; }
        .slide{ background:#fff; border:1px solid var(--line); border-radius:20px; padding:52px 56px; margin-bottom:26px;
          box-shadow:0 14px 40px rgba(20,40,10,.06); min-height:440px; display:flex; flex-direction:column; justify-content:center; }
        .slide.tintbg{ background:var(--tint); }
        .slide.dark{ background:var(--dark); color:#eaf3e2; border-color:transparent; }
        .eyebrow{ font-size:12px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--green); margin-bottom:14px; display:flex; align-items:center; gap:10px; }
        .eyebrow.light{ color:#bfe39f; }
        .new{ background:var(--green); color:#fff; font-size:10px; letter-spacing:.1em; padding:2px 7px; border-radius:999px; }
        .slide h1{ font-family:Georgia,'Times New Roman',serif; font-size:74px; line-height:1; margin:6px 0 18px; letter-spacing:-.02em; }
        .slide h2{ font-family:Georgia,'Times New Roman',serif; font-size:34px; line-height:1.12; margin:0 0 26px; letter-spacing:-.01em; max-width:18ch; }
        .slide h2.lighth{ color:#fff; }
        .title{ align-items:flex-start; }
        .logo{ margin-bottom:18px; }
        .lede{ font-size:19px; max-width:32ch; margin:0 0 16px; }
        .tag{ font-size:22px; font-weight:700; margin:0 0 18px; } .tag em{ color:var(--green); font-style:italic; }
        .sub{ font-size:14.5px; color:#cfe0c2; max-width:60ch; line-height:1.55; }
        .stats3{ display:grid; grid-template-columns:repeat(3,1fr); gap:26px; }
        .stats3 b{ font-family:Georgia,serif; display:block; font-size:38px; color:var(--green); letter-spacing:-.02em; margin-bottom:8px; }
        .stats3 span{ font-size:14px; color:var(--ink); line-height:1.5; }
        .grid2{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .grid3{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .card{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:20px; }
        .tintbg .card{ background:#fff; }
        .card h3{ font-size:15.5px; margin:0 0 7px; }
        .card p{ font-size:13px; color:#5d6b55; line-height:1.5; margin:0; }
        .price .rs{ font-family:Georgia,serif; font-size:30px; margin:6px 0 8px; } .price .rs span{ font-size:14px; color:#5d6b55; }
        .price .hi{ border:2px solid var(--green); }
        .bullets{ list-style:none; padding:0; margin:0; }
        .bullets li{ position:relative; padding-left:24px; margin-bottom:14px; font-size:15.5px; line-height:1.5; max-width:72ch; }
        .bullets li::before{ content:""; position:absolute; left:2px; top:8px; width:9px; height:9px; border-radius:3px; background:var(--green); }
        .bullets.light li{ color:#e3efd8; }
        .kicker{ margin-top:22px; font-style:italic; font-size:16px; color:var(--dark2); }
        .steps{ display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .step{ display:flex; gap:14px; }
        .step .num{ flex:none; width:38px; height:38px; border-radius:11px; background:var(--green); color:#fff; font-weight:800; display:grid; place-items:center; }
        .step h3{ margin:4px 0 4px; font-size:16px; } .step p{ margin:0; font-size:13.5px; color:#5d6b55; line-height:1.5; }
        .vs{ display:flex; flex-direction:column; gap:14px; }
        .vsrow{ display:grid; grid-template-columns:minmax(220px,1fr) 2fr; gap:18px; align-items:baseline; border-bottom:1px solid var(--line); padding-bottom:14px; }
        .vsrow b{ font-size:15px; } .vsrow span{ font-size:14px; color:#5d6b55; line-height:1.5; }
        .fin{ width:100%; border-collapse:collapse; font-size:15px; }
        .fin th,.fin td{ text-align:left; padding:13px 10px; border-bottom:1px solid var(--line); }
        .fin th{ font-size:13px; color:var(--green); text-transform:uppercase; letter-spacing:.08em; }
        .fin td:first-child{ font-weight:700; }
        .mono{ width:46px; height:46px; border-radius:12px; background:var(--tint); color:var(--dark2); font-weight:800; display:grid; place-items:center; margin-bottom:10px; }
        .note{ margin-top:18px; font-size:12.5px; color:#8a9582; }
        .contact{ margin-top:26px; font-weight:700; color:#bfe39f; font-size:15px; }
        .foot{ text-align:center; padding:14px; }
        @media (max-width:760px){
          .slide{ padding:32px 22px; min-height:auto; }
          .slide h1{ font-size:52px; } .slide h2{ font-size:26px; max-width:none; }
          .grid2,.grid3,.stats3,.steps{ grid-template-columns:1fr; }
          .vsrow{ grid-template-columns:1fr; gap:6px; }
          .bar{ flex-wrap:wrap; } .bar .brand{ font-size:15px; } .btn{ padding:7px 11px; font-size:12px; }
        }
        @media print{
          .bar,.status,.foot{ display:none !important; }
          .deck{ background:#fff; }
          .stage{ max-width:none; padding:0; }
          .slide{ box-shadow:none; border:none; border-radius:0; margin:0; min-height:96vh; page-break-after:always; break-after:page; }
        }
      `}</style>
    </div>
  );
}
