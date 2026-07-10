"use client";

import { useEffect } from "react";
import { CONTACT } from "@/lib/contact";

// Brand ensō — an archimedean ink spiral generated at load (visual kin of the
// landing page's hand-drawn ramen swirl, at a fraction of the bytes).
function spiralPath(turns = 2.6, points = 220) {
  let d = "";
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const a = t * turns * 2 * Math.PI - Math.PI / 2;
    const r = 10 + t * 76;
    d += (i ? "L" : "M") + (100 + r * Math.cos(a)).toFixed(1) + " " + (100 + r * Math.sin(a)).toFixed(1) + " ";
  }
  return d;
}
const SPIRAL = spiralPath();

function Enso({ className = "" }) {
  return (
    <svg className={`enso ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <path d={SPIRAL} fill="none" strokeLinecap="round" pathLength="1" />
    </svg>
  );
}

// Guest-side plates use real product screenshots shipped in /public/img.
const GUEST_PLATES = [
  ["/img/snap-menu.webp", "Fig. 01 — The branded storefront", "Your menu, your colours, your subdomain. Signature picks, veg marks, calories & caffeine on every item."],
  ["/img/snap-ai.webp", "Fig. 02 — AI ordering, mid-conversation", "A guest describes a craving; Shoku AI reasons over the whole menu and builds the cart — the upsell a printed menu never could."],
  ["/img/snap-pay.webp", "Fig. 03 — Cart & checkout", "Cart to UPI in two taps. Loyalty points accrue automatically; the order lands tagged to the table."],
  ["/img/snap-scan.png", "Fig. 04 — The table QR", "Scan, browse, order. No app install, no aggregator in the middle — just your café and your regular."],
];

export default function BrochurePage() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <div className="br">
      <nav className="bnav">
        <a className="brand" href="/"><img src="/shoku-mark.svg" alt="" /> <span>shoku<i>食</i></span></a>
        <div className="links">
          <a href="#guests">For guests</a><a href="#console">For operators</a><a href="#reach">Contact</a>
        </div>
        <a className="btn ghost" href="/pitch-deck.pdf" target="_blank" rel="noreferrer">Pitch deck ↓</a>
        <a className="btn cta" href="/#contact">Enquire →</a>
      </nav>

      {/* ---------- COVER ---------- */}
      <header className="cover">
        <Enso className="cover-enso" />
        <div className="cover-in reveal in">
          <div className="eyebrow">食 · Product brochure</div>
          <h1>Own your table.<br /><em>See it in pictures.</em></h1>
          <p className="lede">A short visual tour of Shoku — the branded ordering app your guests see, and the AI-powered console you run the business from.</p>
          <div className="cover-chips">
            <span>02 chapters</span><span>·</span><span>5-minute read</span><span>·</span><span>Zero commission, always</span>
          </div>
          <a className="scroll-hint" href="#guests">Begin ↓</a>
        </div>
      </header>

      {/* ---------- CHAPTER 01 — GUESTS ---------- */}
      <section className="chap" id="guests">
        <div className="chap-head reveal">
          <span className="chap-no">01</span>
          <div>
            <div className="eyebrow">Chapter one</div>
            <h2>What your guests see —<br /><em>a storefront they want to open.</em></h2>
          </div>
        </div>
        <div className="plates">
          {GUEST_PLATES.map(([img, fig, cap], i) => (
            <figure className="plate reveal" key={fig} style={{ transitionDelay: `${(i % 2) * 90}ms` }}>
              <div className="plate-stage"><img src={img} alt={fig} loading="lazy" /></div>
              <figcaption><b>{fig}</b><span>{cap}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- CHAPTER 02 — CONSOLE ---------- */}
      <section className="chap dark" id="console">
        <Enso className="chap-enso" />
        <div className="chap-head reveal">
          <span className="chap-no light">02</span>
          <div>
            <div className="eyebrow light">Chapter two</div>
            <h2 className="light-h">Behind the counter —<br /><em>the console you run it from.</em></h2>
          </div>
        </div>

        {/* Plate A — revenue dashboard */}
        <div className="crow reveal">
          <div className="ccopy">
            <b>Fig. 05 — Revenue, live</b>
            <p>MRR, orders and average order value at a glance — with an AI forecast for next month, not just a chart of last month.</p>
          </div>
          <div className="win">
            <div className="win-bar"><i /><i /><i /><span>shoku console · /super</span></div>
            <div className="win-body">
              <div className="kpis">
                <div className="kpi"><span>Revenue · June</span><b>₹4,28,540</b><em>▲ 18%</em></div>
                <div className="kpi"><span>Orders</span><b>1,286</b><em>▲ 11%</em></div>
                <div className="kpi"><span>Avg order</span><b>₹333</b><em>▲ 6%</em></div>
                <div className="kpi"><span>Repeat rate</span><b>41%</b><em>▲ 4pt</em></div>
              </div>
              <div className="chart">
                {[34, 41, 38, 52, 47, 58, 63, 57, 70, 78, 84, 92].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} className={i > 9 ? "fc" : ""} />
                ))}
              </div>
              <div className="chart-note">✦ AI forecast: <b>₹4.9L next month</b> — weekends carry 58% of revenue</div>
            </div>
          </div>
        </div>

        {/* Plate B — AI insights */}
        <div className="crow rev reveal">
          <div className="ccopy">
            <b>Fig. 06 — AI insights, in plain English</b>
            <p>No dashboards to decode. Shoku reads your numbers and tells you what changed, who&rsquo;s at risk, and what to do about it.</p>
          </div>
          <div className="win">
            <div className="win-bar"><i /><i /><i /><span>shoku console · AI insights</span></div>
            <div className="win-body">
              <div className="ins-tag">✦ What changed this month</div>
              <ul className="ins">
                <li><span>▲</span>Weekend matcha sales up <b>32%</b> — consider a Saturday matcha flight.</li>
                <li><span>◔</span><b>12 regulars</b> haven&rsquo;t visited in 45+ days — a win-back campaign is drafted and ready.</li>
                <li><span>☀</span>Iced drinks trending up as temperatures rise — pin the cold rail to the top.</li>
              </ul>
              <div className="ins-foot">Generated by Shoku AI · reviewed in 30 seconds</div>
            </div>
          </div>
        </div>

        {/* Plate C — cafés & products */}
        <div className="crow reveal">
          <div className="ccopy">
            <b>Fig. 07 — Cafés &amp; menu, managed in minutes</b>
            <p>Provision a new café with its own subdomain, brand colours and starter menu. Add a product and it&rsquo;s live — nutrition, tags and AI knowledge included.</p>
          </div>
          <div className="win">
            <div className="win-bar"><i /><i /><i /><span>shoku console · cafés</span></div>
            <div className="win-body">
              <div className="tbl">
                <div className="trow th"><span>Café</span><span>Plan</span><span>Status</span></div>
                <div className="trow"><span><i className="dot" style={{ background: "#3a6b4d" }} />Brew &amp; Bloom</span><span>Growth</span><span className="pill ok">Active</span></div>
                <div className="trow"><span><i className="dot" style={{ background: "#2b5d8a" }} />Blue Tokai</span><span>Growth</span><span className="pill ok">Active</span></div>
                <div className="trow"><span><i className="dot" style={{ background: "#c2643c" }} />Chai &amp; Co.</span><span>Starter</span><span className="pill warm">Onboarding</span></div>
              </div>
              <div className="addp">
                <span className="addp-lab">＋ Add product</span>
                <div className="addp-row"><b>Yuzu Cold Brew</b><span>₹280</span><span className="pill tint">cold</span><span className="pill tint">signature</span><span className="addp-btn">Add to menu</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Plate D — WhatsApp marketing */}
        <div className="crow rev reveal">
          <div className="ccopy">
            <b>Fig. 08 — WhatsApp marketing that writes itself</b>
            <p>Pick a segment, and the AI drafts a personal message per guest — win-backs, reward nudges, new-menu drops. You just press send.</p>
          </div>
          <div className="win">
            <div className="win-bar"><i /><i /><i /><span>shoku console · campaigns</span></div>
            <div className="win-body">
              <div className="seg"><span className="pill tint on">Lapsed 90 days · 214 guests</span><span className="pill tint">Near reward · 87</span><span className="pill tint">VIPs · 42</span></div>
              <div className="wa">
                <span className="wa-ic">✆</span>
                <div className="wa-bub">Hi Priya, we miss you at <b>Brew &amp; Bloom</b> ☕ It&rsquo;s been a while — here&rsquo;s 15% off your usual Hojicha Latte this week.</div>
              </div>
              <div className="wa-stats"><span>Delivered <b>96%</b></span><span>Read <b>71%</b></span><span>Came back <b>1 in 4</b></span><span className="addp-btn">Send campaign</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BACK COVER ---------- */}
      <section className="back" id="reach">
        <Enso className="back-enso" />
        <div className="back-in reveal">
          <div className="mk">食</div>
          <h2>For live demos &amp; sales enquiries,<br />reach out to us at</h2>
          <a className="back-mail" href={`mailto:${CONTACT.email}?subject=Shoku%20live%20demo`}>{CONTACT.email}</a>
          <div className="back-tel">or call us directly — <a href={`tel:${CONTACT.phoneHref}`}>{CONTACT.phone}</a></div>
          <div className="back-cta">
            <a className="btn white lg" href="/#contact">Enquire on the website →</a>
            <a className="btn outline lg" href="/pitch-deck.pdf" target="_blank" rel="noreferrer">Download pitch deck</a>
          </div>
          <div className="back-foot">© 2026 Shoku · getshoku.com · 食 Own your table</div>
        </div>
      </section>

      <style jsx global>{`
        .br{
          --paper:#f6f2ea; --cream:#fbf7ef; --ink:#1b1813; --mut:#6f6557; --line:#e4ddd0;
          --matcha:#3a6b4d; --matcha-d:#244635; --matcha-dd:#15281e; --clay:#c2643c; --mist:#a9c8b4; --tint:#eaf1ea;
          --serif:var(--font-serif,"Fraunces",Georgia,serif); --sans:var(--font-sans,"Inter",system-ui,sans-serif);
          color:var(--ink); background:var(--paper); font-family:var(--sans); line-height:1.6; overflow-x:hidden;
        }
        .br *{ box-sizing:border-box; }
        .br a{ text-decoration:none; color:inherit; }
        .br em{ font-style:italic; color:var(--clay); }
        .br .reveal{ opacity:0; transform:translateY(20px); transition:opacity .7s ease, transform .7s cubic-bezier(.2,.7,.3,1); }
        .br .reveal.in{ opacity:1; transform:none; }
        .br .eyebrow{ display:inline-block; font-size:12px; font-weight:700; letter-spacing:.18em; text-transform:uppercase; color:var(--matcha); margin-bottom:14px; }
        .br .eyebrow.light{ color:var(--mist); }
        .br .btn{ display:inline-flex; align-items:center; gap:8px; font-weight:600; font-size:14px; padding:12px 20px; border-radius:999px; transition:transform .15s, background .2s, border-color .2s; }
        .br .btn.cta{ background:var(--matcha); color:#fff; box-shadow:0 10px 26px rgba(36,70,53,.26); }
        .br .btn.cta:hover{ background:var(--matcha-d); transform:translateY(-1px); }
        .br .btn.ghost{ border:1px solid var(--line); background:rgba(255,255,255,.6); }
        .br .btn.ghost:hover{ border-color:var(--matcha); color:var(--matcha-d); }
        .br .btn.white{ background:var(--paper); color:var(--matcha-d); }
        .br .btn.outline{ border:1px solid rgba(255,255,255,.35); color:#fff; }
        .br .btn.outline:hover{ border-color:#fff; }
        .br .btn.lg{ padding:15px 26px; font-size:15px; }

        .br .enso{ position:absolute; pointer-events:none; }
        .br .enso path{ stroke:var(--matcha); stroke-width:2.1; opacity:.14; stroke-dasharray:1; stroke-dashoffset:1; transition:stroke-dashoffset 1.8s cubic-bezier(.6,.1,.2,1) .2s; }
        .br .in .enso path, .br .cover-enso path{ stroke-dashoffset:0; }
        .br .cover-enso path{ animation:brdraw 2s cubic-bezier(.6,.1,.2,1) .2s both; }
        @keyframes brdraw{ from{ stroke-dashoffset:1; } to{ stroke-dashoffset:0; } }

        /* NAV */
        .br .bnav{ position:sticky; top:0; z-index:100; display:flex; align-items:center; gap:18px; padding:14px 34px; background:rgba(246,242,234,.85); backdrop-filter:blur(14px); border-bottom:1px solid var(--line); }
        .br .brand{ display:flex; align-items:center; gap:10px; font-family:var(--serif); font-weight:600; font-size:22px; }
        .br .brand img{ width:28px; height:28px; }
        .br .brand i{ font-style:normal; color:var(--clay); font-size:17px; }
        .br .bnav .links{ display:flex; gap:24px; margin-left:14px; margin-right:auto; font-size:14px; font-weight:500; color:var(--mut); }
        .br .bnav .links a:hover{ color:var(--ink); }

        /* COVER */
        .br .cover{ position:relative; min-height:82vh; display:grid; place-items:center; text-align:center; padding:90px 34px; overflow:hidden; }
        .br .cover-enso{ width:min(660px,92vw); height:min(660px,92vw); left:50%; top:50%; transform:translate(-50%,-50%); }
        .br .cover-in{ position:relative; z-index:1; max-width:760px; }
        .br .cover h1{ font-family:var(--serif); font-size:64px; line-height:1.04; letter-spacing:-.02em; font-weight:500; margin:0 0 22px; }
        .br .lede{ font-size:17.5px; color:var(--mut); max-width:56ch; margin:0 auto 26px; }
        .br .cover-chips{ display:flex; justify-content:center; gap:12px; font-size:12.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--matcha-d); }
        .br .scroll-hint{ display:inline-block; margin-top:44px; font-size:13.5px; font-weight:700; color:var(--matcha); animation:bob 2.6s ease-in-out infinite; }
        @keyframes bob{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(6px); } }

        /* CHAPTERS */
        .br .chap{ position:relative; max-width:1180px; margin:0 auto; padding:96px 34px; }
        .br .chap-head{ display:flex; gap:26px; align-items:flex-start; margin-bottom:56px; }
        .br .chap-no{ font-family:var(--serif); font-size:88px; line-height:.9; color:var(--clay); opacity:.35; font-weight:500; }
        .br .chap-no.light{ color:var(--mist); opacity:.5; }
        .br .chap-head h2{ font-family:var(--serif); font-size:42px; line-height:1.1; letter-spacing:-.015em; font-weight:500; margin:0; }

        /* guest plates */
        .br .plates{ display:grid; grid-template-columns:1fr 1fr; gap:26px; }
        .br .plate{ margin:0; background:var(--cream); border:1px solid var(--line); border-radius:28px; padding:34px 26px 26px; text-align:center;
          transition:transform .3s, box-shadow .3s; }
        .br .plate:hover{ transform:translateY(-6px); box-shadow:0 30px 64px rgba(36,70,53,.12); }
        .br .plate-stage{ position:relative; display:grid; place-items:center; padding:8px 0 20px; }
        .br .plate-stage::before{ content:""; position:absolute; inset:12% 18%; border-radius:50%;
          background:radial-gradient(circle, rgba(58,107,77,.13), transparent 68%); }
        .br .plate-stage img{ position:relative; width:min(240px,74%); filter:drop-shadow(0 26px 48px rgba(20,30,20,.30)); }
        .br .plate figcaption b{ display:block; font-family:var(--serif); font-size:18px; font-weight:600; margin-bottom:6px; }
        .br .plate figcaption span{ font-size:13.5px; color:var(--mut); max-width:40ch; display:inline-block; }

        /* dark chapter */
        .br .chap.dark{ max-width:none; background:radial-gradient(120% 140% at 80% 0%,var(--matcha) 0%,var(--matcha-d) 48%,var(--matcha-dd) 100%); color:#fff; overflow:hidden; }
        .br .chap.dark > *{ position:relative; z-index:1; max-width:1120px; margin-left:auto; margin-right:auto; }
        .br .chap-enso{ width:560px; height:560px; right:-140px; top:-140px; left:auto; z-index:0; }
        .br .chap-enso path{ stroke:var(--mist); opacity:.16; }
        .br .light-h{ color:#fff; } .br .light-h em{ color:var(--mist); }

        .br .crow{ display:grid; grid-template-columns:.72fr 1.28fr; gap:44px; align-items:center; margin-bottom:64px; }
        .br .crow.rev{ grid-template-columns:1.28fr .72fr; }
        .br .crow.rev .ccopy{ order:2; }
        .br .ccopy b{ display:block; font-family:var(--serif); font-size:21px; font-weight:600; margin-bottom:10px; }
        .br .ccopy p{ font-size:14.5px; color:#cfe0d2; margin:0; max-width:38ch; }

        /* browser-frame mockups */
        .br .win{ background:var(--cream); border-radius:20px; overflow:hidden; box-shadow:0 34px 80px rgba(10,22,15,.4); color:var(--ink); }
        .br .win-bar{ display:flex; align-items:center; gap:7px; padding:11px 16px; background:#efe9dd; border-bottom:1px solid var(--line); }
        .br .win-bar i{ width:10px; height:10px; border-radius:50%; background:#ddd3c2; }
        .br .win-bar i:nth-child(1){ background:#e29a8f; } .br .win-bar i:nth-child(2){ background:#e6c98b; } .br .win-bar i:nth-child(3){ background:#9ec89b; }
        .br .win-bar span{ margin-left:8px; font-size:11.5px; font-weight:600; color:var(--mut); letter-spacing:.02em; }
        .br .win-body{ padding:22px; }

        .br .kpis{ display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:18px; }
        .br .kpi{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px; }
        .br .kpi span{ display:block; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--mut); }
        .br .kpi b{ display:block; font-family:var(--serif); font-size:19px; margin-top:3px; letter-spacing:-.01em; }
        .br .kpi em{ font-style:normal; font-size:10.5px; font-weight:800; color:var(--matcha); }
        .br .chart{ display:flex; align-items:flex-end; gap:7px; height:110px; padding:4px 2px 0; }
        .br .chart i{ flex:1; border-radius:5px 5px 0 0; background:linear-gradient(to top,var(--matcha-d),var(--matcha)); min-height:8px; }
        .br .chart i.fc{ background:repeating-linear-gradient(45deg,var(--clay),var(--clay) 4px,#d98d68 4px,#d98d68 8px); opacity:.9; }
        .br .chart-note{ margin-top:12px; font-size:12.5px; color:var(--mut); }
        .br .chart-note b{ color:var(--clay); }

        .br .ins-tag{ display:inline-block; font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--matcha-d); background:var(--tint); padding:6px 12px; border-radius:999px; margin-bottom:14px; }
        .br .ins{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
        .br .ins li{ display:flex; gap:11px; align-items:flex-start; background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px 14px; font-size:13.5px; }
        .br .ins li span{ color:var(--clay); font-weight:800; flex-shrink:0; }
        .br .ins-foot{ margin-top:14px; font-size:11.5px; color:var(--mut); }

        .br .tbl{ border:1px solid var(--line); border-radius:14px; overflow:hidden; background:#fff; }
        .br .trow{ display:grid; grid-template-columns:1.6fr .8fr .8fr; gap:8px; padding:11px 14px; font-size:13px; border-bottom:1px solid var(--line); align-items:center; }
        .br .trow:last-child{ border-bottom:0; }
        .br .trow.th{ font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:var(--mut); background:var(--cream); }
        .br .trow .dot{ display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:8px; }
        .br .pill{ display:inline-block; font-size:10.5px; font-weight:800; padding:4px 10px; border-radius:999px; width:max-content; }
        .br .pill.ok{ background:#e7f2e7; color:#2c6b3f; } .br .pill.warm{ background:#fbf0dd; color:#a06a1f; }
        .br .pill.tint{ background:var(--tint); color:var(--matcha-d); }
        .br .pill.tint.on{ background:var(--matcha); color:#fff; }
        .br .addp{ margin-top:16px; }
        .br .addp-lab{ display:block; font-size:11px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; color:var(--mut); margin-bottom:8px; }
        .br .addp-row{ display:flex; align-items:center; gap:10px; background:#fff; border:1px dashed var(--matcha); border-radius:14px; padding:12px 14px; font-size:13.5px; flex-wrap:wrap; }
        .br .addp-row > span:nth-child(2){ font-weight:700; }
        .br .addp-btn{ margin-left:auto; background:var(--matcha); color:#fff; font-size:11.5px; font-weight:800; padding:7px 14px; border-radius:999px; }

        .br .seg{ display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px; }
        .br .wa{ display:flex; gap:11px; align-items:flex-start; }
        .br .wa-ic{ display:grid; place-items:center; width:34px; height:34px; border-radius:50%; background:#25a05c; color:#fff; font-size:15px; flex-shrink:0; }
        .br .wa-bub{ background:#e9f9ee; border:1px solid #cdebd8; border-radius:4px 16px 16px 16px; padding:12px 15px; font-size:13.5px; line-height:1.5; max-width:46ch; }
        .br .wa-stats{ display:flex; align-items:center; gap:16px; margin-top:16px; font-size:12.5px; color:var(--mut); flex-wrap:wrap; }
        .br .wa-stats b{ color:var(--ink); }

        /* BACK COVER */
        .br .back{ position:relative; overflow:hidden; text-align:center; color:#fff; padding:120px 34px 70px;
          background:linear-gradient(180deg,rgba(20,38,28,.78),rgba(20,38,28,.94)), url('/img/shoku-cafe-real.webp') center/cover no-repeat; }
        .br .back-enso{ width:420px; height:420px; left:50%; top:44%; transform:translate(-50%,-50%); }
        .br .back-enso path{ stroke:var(--mist); opacity:.2; }
        .br .back-in{ position:relative; z-index:1; }
        .br .back .mk{ font-family:var(--serif); font-size:40px; color:var(--mist); opacity:.75; margin-bottom:14px; }
        .br .back h2{ font-family:var(--serif); font-size:40px; line-height:1.16; font-weight:500; letter-spacing:-.015em; margin:0 0 26px; }
        .br .back-mail{ font-family:var(--serif); font-size:clamp(22px,4vw,36px); font-weight:500; color:#fff; border-bottom:2px solid var(--clay); padding-bottom:4px; transition:color .2s; }
        .br .back-mail:hover{ color:var(--mist); }
        .br .back-tel{ margin-top:22px; font-size:15.5px; color:#cfe0d2; }
        .br .back-tel a{ font-weight:700; color:#fff; border-bottom:1px solid rgba(255,255,255,.4); }
        .br .back-cta{ display:flex; justify-content:center; gap:14px; flex-wrap:wrap; margin-top:36px; }
        .br .back-foot{ margin-top:80px; font-size:12.5px; color:#9db8a4; border-top:1px solid rgba(255,255,255,.14); padding-top:22px; max-width:1040px; margin-left:auto; margin-right:auto; }

        @media(max-width:880px){
          .br .bnav .links{ display:none; }
          .br .bnav .btn.ghost{ display:none; }
          .br .cover h1{ font-size:42px; }
          .br .chap{ padding:64px 20px; }
          .br .chap-head{ flex-direction:column; gap:8px; }
          .br .chap-no{ font-size:58px; }
          .br .chap-head h2{ font-size:30px; }
          .br .plates{ grid-template-columns:1fr; }
          .br .crow, .br .crow.rev{ grid-template-columns:1fr; gap:20px; margin-bottom:52px; }
          .br .crow.rev .ccopy{ order:0; }
          .br .kpis{ grid-template-columns:repeat(2,1fr); }
          .br .back h2{ font-size:29px; }
        }
        @media(prefers-reduced-motion:reduce){
          .br .reveal{ opacity:1; transform:none; transition:none; }
          .br .enso path{ stroke-dashoffset:0 !important; animation:none !important; transition:none !important; }
          .br .scroll-hint{ animation:none; }
        }
      `}</style>
    </div>
  );
}
