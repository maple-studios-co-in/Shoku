"use client";

import Link from "next/link";

export default function LandingPage() {
  function handleDemo(e) {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    if (input) input.value = "";
    alert("Thanks! We'll be in touch shortly to schedule your Pista demo.");
  }

  return (
    <div className="landing">
      {/* NAV */}
      <nav>
        <div className="wrap nav-in">
          <a className="logo" href="#top"><span className="mark">P</span> Pista</a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#customers">Customers</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-cta">
            <Link href="/menu" className="btn btn-ghost">View live demo</Link>
            <a href="#demo" className="btn btn-primary">Book a demo</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero" id="top">
        <div className="wrap hero-grid">
          <div>
            <span className="pill">✨ AI-powered · white-label ordering</span>
            <h1>Your café&apos;s own <span className="hl">ordering app</span> — powered by AI.</h1>
            <p className="sub">Pista gives restaurant chains, cafés and coffee shops a beautiful branded ordering app in days — with an AI assistant, food intelligence and smart upsells built in. Your brand, your menu, your customers.</p>
            <div className="hero-cta">
              <a href="#demo" className="btn btn-primary">Book a demo →</a>
              <Link href="/menu" className="btn btn-ghost">View live demo →</Link>
            </div>
            <div className="hero-trust">
              <span className="stars">★★★★★</span>
              <span>Trusted by cafés &amp; chains across India</span>
            </div>
          </div>

          <div className="phone-stage">
            <div className="glow" />
            <div className="ftag t1"><span className="ic">✨</span> &quot;Cold &amp; low caffeine?&quot; → 3 picks</div>
            <div className="ftag t2"><span className="ic">🎨</span> Live in your brand colours</div>

            <div className="phone">
              <div className="ph-status"><span>9:41</span><span>● ● ● ＝</span></div>
              <div className="ph-head">
                <div className="ph-badge">P</div>
                <div><div className="l">Pickup from</div><div className="v">Your Café · Indiranagar ▾</div></div>
              </div>
              <div className="ph-ai">
                <div className="sp">✨</div>
                <div className="k">✨ PISTA AI</div>
                <h4>Not sure what to order?</h4>
                <p>Tell me your mood — I&apos;ll build your perfect cup.</p>
                <span className="go">Ask Pista AI →</span>
              </div>
              <div className="ph-chips"><span className="ph-chip on">All</span><span className="ph-chip">Ice Blended</span><span className="ph-chip">Hot Coffee</span><span className="ph-chip">Tea</span></div>
              <div className="ph-item">
                <img src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200" alt="" />
                <div><div className="nm">Original Ice Blended</div><div className="ds">★ 4.8 · Signature</div></div>
                <div className="pr">₹385</div>
              </div>
              <div className="ph-item">
                <img src="https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200" alt="" />
                <div><div className="nm">Café Latte</div><div className="ds">9g protein · 190 kcal</div></div>
                <div className="pr">₹295</div>
              </div>
              <div className="ph-nav">
                <div className="on"><span className="ic">🏠</span>Menu</div>
                <div><span className="ic">✨</span>Pista AI</div>
                <div><span className="ic">🛍️</span>Bag</div>
                <div><span className="ic">👤</span>Account</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* LOGO STRIP */}
      <div className="logos">
        <div className="wrap">
          <div className="lab">Powering ordering for forward-thinking cafés &amp; chains</div>
          <div className="logo-row">
            <div className="brandname"><img src="https://assets.fudr.in/brand/cbtl/CBTL%20Logo.png" alt="CBTL" style={{ height: 26, width: 26, borderRadius: 6, objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; }} /> The Coffee Bean &amp; Tea Leaf</div>
            <div className="brandname"><span className="b">🫖</span> Chai &amp; Co.</div>
            <div className="brandname"><span className="b">🥐</span> Maple Bakehouse</div>
            <div className="brandname"><span className="b">🍵</span> Leaf &amp; Bean</div>
          </div>
        </div>
      </div>

      {/* VALUE CARDS */}
      <section>
        <div className="wrap">
          <div className="center-head">
            <span className="eyebrow">Why Pista</span>
            <h2>Everything you need to sell direct — minus the dev team.</h2>
            <p>Most cafés lose 20–30% to third-party delivery apps and never see their own customer data. Pista puts you back in control with a branded app that&apos;s smarter than the marketplaces.</p>
          </div>
          <div className="cards">
            <div className="card"><div className="ic">🎨</div><h3>100% your brand</h3><p>Your logo, colours, fonts and menu on your own subdomain. No &quot;Pista&quot; in sight — it&apos;s your app.</p></div>
            <div className="card"><div className="ic">✨</div><h3>Built-in AI ordering</h3><p>A chat assistant that recommends the right item by mood, diet, time of day and caffeine.</p></div>
            <div className="card"><div className="ic">🧾</div><h3>Food intelligence</h3><p>Auto-generated origin, ingredients, allergens and nutrition for every item builds trust and sales.</p></div>
            <div className="card"><div className="ic">📊</div><h3>You own the data</h3><p>Every order, customer and insight is yours — power loyalty, repeat visits and smarter menus.</p></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ paddingTop: 20 }}>
        <div className="wrap">

          <div className="feat">
            <div className="ftext">
              <div className="eyebrow">Pista AI Assistant</div>
              <h2>An AI barista that knows your whole menu.</h2>
              <p>Customers tap &quot;cold &amp; refreshing&quot; or type &quot;something light, low caffeine&quot; — and Pista AI ranks your menu instantly, explaining <em>why</em> each pick fits. It&apos;s like having your best barista on every screen.</p>
              <ul>
                <li><span className="ck">✓</span> Recommends by mood, diet, calories &amp; caffeine</li>
                <li><span className="ck">✓</span> Drives bigger baskets with smart upsells &amp; pairings</li>
                <li><span className="ck">✓</span> Works out of the box — no AI setup needed</li>
              </ul>
            </div>
            <div className="fvisual">
              <div className="chatmock">
                <div className="cm-q">Something cold, not too sweet, low caffeine 🙂</div>
                <div className="cm-a">Perfect — here are 3 great matches:</div>
                <div className="cm-rec"><img src="https://images.unsplash.com/photo-1568649929103-28ffbefaca1e?w=200" alt="" /><div><div className="n">Matcha Ice Blended</div><div className="w">↳ Cold, gently sweet, low caffeine</div></div><div className="p">₹410</div></div>
                <div className="cm-rec"><img src="https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=200" alt="" /><div><div className="n">Iced Black Tea, no sugar</div><div className="w">↳ The lightest, most refreshing pick</div></div><div className="p">₹220</div></div>
              </div>
            </div>
          </div>

          <div className="feat rev">
            <div className="ftext">
              <div className="eyebrow">Food intelligence</div>
              <h2>Every item, fully explained.</h2>
              <p>Pista enriches your menu with a &quot;Know your cup&quot; card — bean origin, ingredients, allergens and nutrition — generated automatically. Customers order with confidence, and you cut down on questions at the counter.</p>
              <ul>
                <li><span className="ck">✓</span> Origin &amp; sourcing story for every item</li>
                <li><span className="ck">✓</span> Allergens &amp; nutrition shown clearly</li>
                <li><span className="ck">✓</span> Auto-generated — just upload your menu</li>
              </ul>
            </div>
            <div className="fvisual">
              <div className="cupmock">
                <div className="cupcard">
                  <div className="h">✨ Know your cup <span className="ai">PISTA AI</span></div>
                  <div className="cuprow"><span className="ic">🌍</span><div><b>Bean origin</b>100% Arabica from Coorg, Karnataka &amp; Costa Rica. Medium roast — cocoa &amp; toasted nut.</div></div>
                  <div className="cuprow"><span className="ic">🧾</span><div><b>Ingredients</b><div className="cuppills"><span>Espresso</span><span>Whole milk</span><span>Cane sugar</span><span>Ice</span></div></div></div>
                  <div className="cuprow"><span className="ic">🥗</span><div><b>Nutrition</b><div className="cuppills"><span>320 kcal</span><span>Protein 6g</span><span>Caffeine 95mg</span></div></div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="feat">
            <div className="ftext">
              <div className="eyebrow">White-label engine</div>
              <h2>Launch in your brand — in minutes.</h2>
              <p>Set your name, colours, font and menu in one console and the entire app re-themes instantly. Ship a polished, on-brand ordering experience without writing a single line of code.</p>
              <ul>
                <li><span className="ck">✓</span> Live colour, logo &amp; font controls</li>
                <li><span className="ck">✓</span> Your own subdomain (e.g. order.yourcafe.com)</li>
                <li><span className="ck">✓</span> Menu management with one click to go live</li>
              </ul>
            </div>
            <div className="fvisual">
              <div className="thememock">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="swatch" style={{ background: "#7AB04A" }} />
                  <div className="swatch" style={{ background: "#0a2540" }} />
                  <div className="swatch" style={{ background: "#d4202c" }} />
                  <div className="swatch" style={{ background: "#e8a33d" }} />
                </div>
                <div className="miniapp">
                  <div className="top"><div className="b" style={{ background: "#7AB04A" }}>Y</div><div className="nm">Your Café</div></div>
                  <div className="hero2" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300')" }} />
                  <div className="cta2" style={{ background: "#7AB04A" }}>Order now</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how">
        <div className="wrap">
          <div className="center-head">
            <span className="eyebrow" style={{ color: "#bfe09a" }}>How it works</span>
            <h2>From menu to live app in three steps.</h2>
            <p>No engineering, no months of build time. Most cafés go live within a week.</p>
          </div>
          <div className="steps">
            <div className="step"><div className="num">1</div><h3>Send us your menu</h3><p>Share a link or a list. We import your items, photos and prices — and Pista AI enriches them with origin, ingredients and nutrition.</p></div>
            <div className="step"><div className="num">2</div><h3>Brand it your way</h3><p>Drop in your logo and colours in the white-label console. Preview the full app live and tweak until it&apos;s perfectly you.</p></div>
            <div className="step"><div className="num">3</div><h3>Go live &amp; sell</h3><p>Publish to your own subdomain and share the link. Take orders, keep 100% of the relationship and own all your data.</p></div>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section id="customers" className="show">
        <div className="wrap">
          <div className="center-head">
            <span className="eyebrow">Customer story</span>
            <h2>How a coffee chain went direct with Pista.</h2>
          </div>
          <div className="showcard">
            <div className="show-l">
              <div className="brandname"><img src="https://assets.fudr.in/brand/cbtl/CBTL%20Logo.png" alt="CBTL" style={{ height: 26, width: 26, borderRadius: 6, objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; }} /> The Coffee Bean &amp; Tea Leaf</div>
              <p className="quote">&quot;We launched our own AI-powered ordering app in under two weeks. Our customers love the recommendations — and we finally own our data instead of renting it from delivery apps.&quot;</p>
              <div className="who">
                <div className="av">👩</div>
                <div><b>Head of Digital</b><span>Coffee chain · 40+ outlets</span></div>
              </div>
              <div className="stats">
                <div className="s"><b>+24%</b><br /><span>average order value</span></div>
                <div className="s"><b>2 wks</b><br /><span>to launch</span></div>
                <div className="s"><b>100%</b><br /><span>customer data owned</span></div>
              </div>
            </div>
            <div className="show-r" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800')" }} />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="wrap">
          <div className="center-head">
            <span className="eyebrow">Pricing</span>
            <h2>Simple plans that grow with you.</h2>
            <p>No commission on orders — ever. Pick a plan, keep your margins.</p>
          </div>
          <div className="pricing-grid">
            <div className="price">
              <h3>Starter</h3>
              <div className="amt">₹4,999<small>/mo</small></div>
              <p className="desc">For a single café or coffee shop getting started online.</p>
              <ul>
                <li><span className="ck">✓</span> Branded ordering app</li>
                <li><span className="ck">✓</span> Up to 50 menu items</li>
                <li><span className="ck">✓</span> AI food intelligence cards</li>
                <li><span className="ck">✓</span> Pickup &amp; dine-in orders</li>
              </ul>
              <a href="#demo" className="btn btn-ghost">Start free trial</a>
            </div>
            <div className="price pop">
              <span className="badge">MOST POPULAR</span>
              <h3>Growth</h3>
              <div className="amt">₹12,999<small>/mo</small></div>
              <p className="desc">For growing cafés &amp; small chains that want the full AI suite.</p>
              <ul>
                <li><span className="ck">✓</span> Everything in Starter</li>
                <li><span className="ck">✓</span> Pista AI ordering assistant</li>
                <li><span className="ck">✓</span> Smart upsells &amp; loyalty rewards</li>
                <li><span className="ck">✓</span> Delivery &amp; payments integration</li>
                <li><span className="ck">✓</span> Analytics dashboard</li>
              </ul>
              <a href="#demo" className="btn btn-primary">Book a demo</a>
            </div>
            <div className="price">
              <h3>Enterprise</h3>
              <div className="amt">Custom</div>
              <p className="desc">For multi-outlet chains needing scale, control &amp; support.</p>
              <ul>
                <li><span className="ck">✓</span> Everything in Growth</li>
                <li><span className="ck">✓</span> Unlimited outlets &amp; items</li>
                <li><span className="ck">✓</span> Custom AI &amp; integrations</li>
                <li><span className="ck">✓</span> Dedicated success manager</li>
              </ul>
              <a href="#demo" className="btn btn-ghost">Contact sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="demo" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta-band">
            <div className="sp">✨</div>
            <h2>Ready to launch your own ordering app?</h2>
            <p>Book a 20-minute demo and we&apos;ll spin up a branded preview of your café&apos;s app — AI and all — before you decide.</p>
            <form className="cta-form" onSubmit={handleDemo}>
              <input type="email" placeholder="you@yourcafe.com" required />
              <button className="btn btn-white" type="submit">Book a demo →</button>
            </form>
            <div className="cta-note">No commitment · branded preview included · go live in ~1 week</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <a className="logo" href="#top"><span className="mark">P</span> Pista</a>
              <p>The AI-powered white-label ordering platform for cafés, coffee shops and restaurant chains.</p>
            </div>
            <div className="fcol"><h4>Product</h4><a href="#features">Features</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="/docs/index.html">Docs</a><a href="#demo">Book a demo</a></div>
            <div className="fcol"><h4>Company</h4><a href="#top">About</a><a href="#customers">Customers</a><a href="#top">Careers</a><a href="#top">Blog</a></div>
            <div className="fcol"><h4>Contact</h4><a href="mailto:hello@pista.app">hello@pista.app</a><a href="#top">Support</a><a href="#top">Privacy</a><a href="#top">Terms</a></div>
          </div>
          <div className="foot-bot">
            <span>© 2026 Pista. All rights reserved.</span>
            <span>Made for cafés that want to own their customers.</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .landing { --pista:#7AB04A; --pista-d:#36511f; --pista-dd:#2b4a1c; --tint:#E9F2DE; --tint2:#f4f8ee; --ink:#1b2417; --muted:#5d6b50; --line:#e4ead9; --cream:#f7faf2; --white:#fff; --radius:20px; --shadow:0 1px 2px rgba(20,40,10,.04), 0 14px 40px rgba(20,40,10,.08); --lfont:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; font-family:var(--lfont); color:var(--ink); background:var(--white); line-height:1.6; -webkit-font-smoothing:antialiased; }
        html { scroll-behavior:smooth; }
        .landing * { box-sizing:border-box; }
        .landing img { display:block; max-width:100%; }
        .landing a { color:inherit; text-decoration:none; }
        .landing .wrap { max-width:1140px; margin:0 auto; padding:0 24px; }
        .landing .btn { display:inline-flex; align-items:center; gap:8px; font-weight:700; font-size:15px; padding:13px 22px; border-radius:12px; border:none; cursor:pointer; transition:.15s; font-family:inherit; }
        .landing .btn-primary { background:var(--pista); color:#fff; box-shadow:0 6px 18px rgba(122,176,74,.35); }
        .landing .btn-primary:hover { background:var(--pista-d); transform:translateY(-1px); }
        .landing .btn-ghost { background:#fff; color:var(--ink); border:1.5px solid var(--line); }
        .landing .btn-ghost:hover { border-color:var(--pista); color:var(--pista-d); }
        .landing .eyebrow { font-size:13px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:var(--pista-d); }
        .landing h1, .landing h2, .landing h3 { letter-spacing:-.02em; line-height:1.12; }
        .landing section { padding:96px 0; }

        .landing nav { position:sticky; top:0; z-index:50; background:rgba(255,255,255,.85); backdrop-filter:blur(12px); border-bottom:1px solid var(--line); }
        .landing .nav-in { display:flex; align-items:center; gap:14px; height:68px; }
        .landing .logo { display:flex; align-items:center; gap:10px; font-weight:800; font-size:20px; letter-spacing:-.02em; }
        .landing .logo .mark { width:32px; height:32px; border-radius:9px; background:var(--pista); color:#fff; display:grid; place-items:center; font-size:18px; font-weight:900; }
        .landing .nav-links { display:flex; gap:30px; margin-left:30px; }
        .landing .nav-links a { font-size:14.5px; font-weight:600; color:var(--muted); }
        .landing .nav-links a:hover { color:var(--ink); }
        .landing .nav-cta { margin-left:auto; display:flex; gap:10px; align-items:center; }
        @media(max-width:860px){ .landing .nav-links{display:none} .landing .nav-cta .btn-ghost{display:none} }

        .landing .hero { background:radial-gradient(1100px 520px at 70% -10%, var(--tint) 0%, transparent 60%), var(--white); padding:74px 0 60px; overflow:hidden; }
        .landing .hero-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:48px; align-items:center; }
        @media(max-width:900px){ .landing .hero-grid{grid-template-columns:1fr;gap:40px} }
        .landing .pill { display:inline-flex; align-items:center; gap:8px; background:var(--tint); color:var(--pista-d); font-size:13px; font-weight:700; padding:7px 14px; border-radius:999px; margin-bottom:22px; }
        .landing .hero h1 { font-size:54px; font-weight:800; }
        .landing .hero h1 .hl { color:var(--pista); }
        @media(max-width:900px){ .landing .hero h1{font-size:40px} }
        .landing .hero p.sub { font-size:18px; color:var(--muted); margin-top:20px; max-width:520px; }
        .landing .hero-cta { display:flex; gap:12px; margin-top:30px; flex-wrap:wrap; }
        .landing .hero-trust { display:flex; align-items:center; gap:18px; margin-top:30px; font-size:13.5px; color:var(--muted); }
        .landing .stars { color:#e8a33d; letter-spacing:2px; }

        .landing .phone-stage { position:relative; display:flex; justify-content:center; }
        .landing .glow { position:absolute; inset:-10% 5%; background:radial-gradient(closest-side, rgba(122,176,74,.28), transparent); filter:blur(10px); }
        .landing .phone { position:relative; width:300px; background:#fff; border-radius:38px; box-shadow:0 0 0 10px #1d2a14, 0 40px 80px rgba(20,40,10,.28); overflow:hidden; }
        .landing .ph-status { display:flex; justify-content:space-between; font-size:11px; font-weight:600; padding:12px 22px 6px; }
        .landing .ph-head { display:flex; align-items:center; gap:9px; padding:4px 16px 12px; }
        .landing .ph-badge { width:34px; height:34px; border-radius:10px; background:var(--pista-d); color:#fff; display:grid; place-items:center; font-weight:800; font-size:13px; }
        .landing .ph-head .l { font-size:10px; color:var(--muted); }
        .landing .ph-head .v { font-size:13px; font-weight:700; }
        .landing .ph-ai { margin:0 16px; background:linear-gradient(120deg,var(--pista),var(--pista-d)); color:#fff; border-radius:16px; padding:14px; position:relative; overflow:hidden; }
        .landing .ph-ai .sp { position:absolute; right:-8px; top:-8px; font-size:54px; opacity:.16; }
        .landing .ph-ai .k { font-size:9px; font-weight:800; letter-spacing:.06em; opacity:.85; }
        .landing .ph-ai h4 { font-size:14px; margin:3px 0 2px; }
        .landing .ph-ai p { font-size:11px; opacity:.9; }
        .landing .ph-ai .go { display:inline-block; margin-top:9px; background:#fff; color:var(--pista-d); font-size:10.5px; font-weight:800; padding:6px 11px; border-radius:999px; }
        .landing .ph-chips { display:flex; gap:6px; padding:13px 16px 6px; overflow:hidden; }
        .landing .ph-chip { font-size:11px; font-weight:700; padding:6px 11px; border-radius:999px; background:#f1f4ec; color:var(--muted); white-space:nowrap; }
        .landing .ph-chip.on { background:var(--tint); color:var(--pista-d); }
        .landing .ph-item { display:flex; gap:11px; padding:11px 16px; align-items:center; }
        .landing .ph-item img { width:54px; height:54px; border-radius:12px; object-fit:cover; }
        .landing .ph-item .nm { font-size:12.5px; font-weight:700; }
        .landing .ph-item .ds { font-size:10.5px; color:var(--muted); }
        .landing .ph-item .pr { margin-left:auto; font-size:12.5px; font-weight:800; }
        .landing .ph-nav { display:flex; border-top:1px solid var(--line); margin-top:6px; }
        .landing .ph-nav div { flex:1; text-align:center; font-size:9px; font-weight:700; color:var(--muted); padding:9px 0; }
        .landing .ph-nav div.on { color:var(--pista-d); }
        .landing .ph-nav .ic { font-size:15px; display:block; }

        .landing .ftag { position:absolute; background:#fff; border:1px solid var(--line); box-shadow:var(--shadow); border-radius:14px; padding:11px 14px; font-size:12.5px; font-weight:700; display:flex; align-items:center; gap:9px; z-index:2; }
        .landing .ftag .ic { width:30px; height:30px; border-radius:9px; background:var(--tint); color:var(--pista-d); display:grid; place-items:center; font-size:15px; }
        .landing .ftag.t1 { top:18%; left:-6%; }
        .landing .ftag.t2 { bottom:16%; right:-8%; }
        @media(max-width:560px){ .landing .ftag{display:none} }

        .landing .logos { padding:42px 0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); background:var(--cream); }
        .landing .logos .lab { text-align:center; font-size:13px; font-weight:700; color:var(--muted); margin-bottom:22px; }
        .landing .logo-row { display:flex; flex-wrap:wrap; justify-content:center; gap:40px; align-items:center; opacity:.8; }
        .landing .brandname { font-size:20px; font-weight:800; color:var(--pista-dd); letter-spacing:-.02em; display:flex; align-items:center; gap:7px; }
        .landing .brandname .b { font-size:22px; }

        .landing .center-head { text-align:center; max-width:680px; margin:0 auto 56px; }
        .landing .center-head h2 { font-size:38px; font-weight:800; }
        .landing .center-head p { font-size:17px; color:var(--muted); margin-top:14px; }
        @media(max-width:900px){ .landing .center-head h2{font-size:30px} }
        .landing .cards { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        @media(max-width:900px){ .landing .cards{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:520px){ .landing .cards{grid-template-columns:1fr} }
        .landing .card { background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:26px 22px; transition:.15s; }
        .landing .card:hover { border-color:var(--pista); box-shadow:var(--shadow); transform:translateY(-3px); }
        .landing .card .ic { width:48px; height:48px; border-radius:13px; background:var(--tint); color:var(--pista-d); display:grid; place-items:center; font-size:23px; margin-bottom:16px; }
        .landing .card h3 { font-size:18px; font-weight:700; }
        .landing .card p { font-size:14px; color:var(--muted); margin-top:8px; }

        .landing .feat { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; margin-bottom:90px; }
        .landing .feat:last-child { margin-bottom:0; }
        .landing .feat.rev .ftext { order:2; }
        @media(max-width:880px){ .landing .feat{grid-template-columns:1fr;gap:30px} .landing .feat.rev .ftext{order:0} }
        .landing .ftext .eyebrow { margin-bottom:12px; }
        .landing .ftext h2 { font-size:32px; font-weight:800; }
        @media(max-width:880px){ .landing .ftext h2{font-size:26px} }
        .landing .ftext p { font-size:16px; color:var(--muted); margin-top:14px; }
        .landing .ftext ul { list-style:none; margin-top:20px; display:flex; flex-direction:column; gap:12px; padding:0; }
        .landing .ftext li { display:flex; gap:11px; font-size:14.5px; font-weight:600; }
        .landing .ftext li .ck { width:22px; height:22px; border-radius:7px; background:var(--tint); color:var(--pista-d); display:grid; place-items:center; font-size:12px; font-weight:900; flex:none; }
        .landing .fvisual { border-radius:var(--radius); overflow:hidden; border:1px solid var(--line); box-shadow:var(--shadow); background:var(--cream); }

        .landing .chatmock { padding:24px; display:flex; flex-direction:column; gap:12px; background:linear-gradient(160deg,var(--tint2),#fff); }
        .landing .cm-q { align-self:flex-end; background:var(--pista); color:#fff; font-size:13.5px; font-weight:600; padding:11px 15px; border-radius:16px 16px 5px 16px; max-width:80%; }
        .landing .cm-a { align-self:flex-start; background:#fff; border:1px solid var(--line); font-size:13.5px; padding:11px 15px; border-radius:16px 16px 16px 5px; max-width:88%; }
        .landing .cm-rec { display:flex; align-items:center; gap:11px; background:#fff; border:1px solid var(--line); border-radius:13px; padding:9px; box-shadow:var(--shadow); }
        .landing .cm-rec img { width:46px; height:46px; border-radius:10px; object-fit:cover; }
        .landing .cm-rec .n { font-size:12.5px; font-weight:700; }
        .landing .cm-rec .w { font-size:11px; color:var(--pista-d); font-weight:700; }
        .landing .cm-rec .p { margin-left:auto; font-size:13px; font-weight:800; }

        .landing .cupmock { padding:24px; background:linear-gradient(160deg,var(--tint2),#fff); }
        .landing .cupcard { background:#fff; border:1px solid var(--line); border-radius:16px; overflow:hidden; }
        .landing .cupcard .h { display:flex; align-items:center; gap:8px; background:var(--tint); color:var(--pista-d); font-size:13px; font-weight:800; padding:12px 14px; }
        .landing .cupcard .h .ai { margin-left:auto; background:var(--pista-d); color:#fff; font-size:9px; font-weight:800; padding:3px 7px; border-radius:6px; }
        .landing .cuprow { display:flex; gap:10px; padding:12px 14px; border-top:1px solid var(--line); font-size:12.5px; }
        .landing .cuprow .ic { font-size:15px; }
        .landing .cuprow b { display:block; font-size:11px; color:var(--muted); }
        .landing .cuppills { display:flex; flex-wrap:wrap; gap:5px; margin-top:5px; }
        .landing .cuppills span { font-size:10.5px; background:var(--cream); border-radius:999px; padding:3px 9px; font-weight:700; }

        .landing .thememock { padding:28px 24px; background:linear-gradient(160deg,var(--tint2),#fff); display:flex; gap:18px; align-items:center; justify-content:center; flex-wrap:wrap; }
        .landing .swatch { width:54px; height:54px; border-radius:14px; box-shadow:var(--shadow); border:2px solid #fff; cursor:pointer; }
        .landing .miniapp { width:150px; border-radius:20px; overflow:hidden; border:1px solid var(--line); box-shadow:var(--shadow); background:#fff; }
        .landing .miniapp .top { display:flex; align-items:center; gap:7px; padding:10px; }
        .landing .miniapp .b { width:24px; height:24px; border-radius:7px; display:grid; place-items:center; color:#fff; font-weight:800; font-size:11px; }
        .landing .miniapp .nm { font-size:11px; font-weight:800; }
        .landing .miniapp .hero2 { height:60px; margin:0 10px; border-radius:10px; background-size:cover; background-position:center; }
        .landing .miniapp .cta2 { margin:10px; padding:8px; border-radius:9px; text-align:center; color:#fff; font-size:10px; font-weight:800; }

        .landing .how { background:var(--pista-dd); color:#fff; }
        .landing .how .center-head h2 { color:#fff; }
        .landing .how .center-head p { color:#c7d8b6; }
        .landing .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        @media(max-width:820px){ .landing .steps{grid-template-columns:1fr} }
        .landing .step { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:var(--radius); padding:28px 24px; position:relative; }
        .landing .step .num { width:40px; height:40px; border-radius:11px; background:var(--pista); color:#fff; display:grid; place-items:center; font-weight:900; font-size:18px; margin-bottom:16px; }
        .landing .step h3 { font-size:19px; }
        .landing .step p { font-size:14.5px; color:#c7d8b6; margin-top:8px; }

        .landing .show { background:var(--cream); }
        .landing .showcard { background:#fff; border:1px solid var(--line); border-radius:28px; overflow:hidden; display:grid; grid-template-columns:1fr 1fr; box-shadow:var(--shadow); }
        @media(max-width:880px){ .landing .showcard{grid-template-columns:1fr} }
        .landing .show-l { padding:48px; }
        .landing .show-l .quote { font-size:23px; font-weight:700; letter-spacing:-.01em; line-height:1.35; margin:18px 0 22px; }
        .landing .show-l .who { display:flex; align-items:center; gap:12px; }
        .landing .show-l .who .av { width:46px; height:46px; border-radius:50%; background:var(--tint); display:grid; place-items:center; font-size:20px; }
        .landing .show-l .who b { font-size:14px; }
        .landing .show-l .who span { font-size:12.5px; color:var(--muted); }
        .landing .stats { display:flex; gap:30px; margin-top:30px; flex-wrap:wrap; }
        .landing .stats .s b { font-size:30px; font-weight:800; color:var(--pista-d); }
        .landing .stats .s span { font-size:12.5px; color:var(--muted); }
        .landing .show-r { background-size:cover; background-position:center; min-height:280px; }

        .landing .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; align-items:stretch; }
        @media(max-width:880px){ .landing .pricing-grid{grid-template-columns:1fr} }
        .landing .price { background:#fff; border:1px solid var(--line); border-radius:var(--radius); padding:30px 26px; display:flex; flex-direction:column; }
        .landing .price.pop { border:2px solid var(--pista); box-shadow:var(--shadow); position:relative; }
        .landing .price.pop .badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--pista); color:#fff; font-size:11px; font-weight:800; padding:5px 13px; border-radius:999px; }
        .landing .price h3 { font-size:19px; }
        .landing .price .amt { font-size:40px; font-weight:800; margin:10px 0 2px; }
        .landing .price .amt small { font-size:15px; font-weight:600; color:var(--muted); }
        .landing .price .desc { font-size:13.5px; color:var(--muted); min-height:42px; }
        .landing .price ul { list-style:none; margin:20px 0 24px; display:flex; flex-direction:column; gap:11px; padding:0; }
        .landing .price li { display:flex; gap:10px; font-size:14px; }
        .landing .price li .ck { color:var(--pista-d); font-weight:900; }
        .landing .price .btn { width:100%; justify-content:center; margin-top:auto; }

        .landing .cta-band { background:linear-gradient(135deg,var(--pista),var(--pista-d)); color:#fff; border-radius:28px; padding:60px 48px; text-align:center; position:relative; overflow:hidden; }
        .landing .cta-band .sp { position:absolute; font-size:200px; opacity:.08; right:-20px; top:-50px; }
        .landing .cta-band h2 { font-size:38px; font-weight:800; }
        @media(max-width:700px){ .landing .cta-band h2{font-size:28px} .landing .cta-band{padding:44px 24px} }
        .landing .cta-band p { font-size:17px; opacity:.92; margin-top:14px; max-width:560px; margin-left:auto; margin-right:auto; }
        .landing .cta-form { display:flex; gap:10px; justify-content:center; margin-top:28px; flex-wrap:wrap; }
        .landing .cta-form input { border:none; border-radius:12px; padding:14px 18px; font-size:15px; font-family:inherit; width:300px; max-width:80vw; }
        .landing .cta-band .btn-white { background:#fff; color:var(--pista-d); }
        .landing .cta-band .btn-white:hover { background:#eef6e3; }
        .landing .cta-note { font-size:13px; opacity:.85; margin-top:14px; }

        .landing footer { padding:60px 0 36px; border-top:1px solid var(--line); }
        .landing .foot-grid { display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:30px; margin-bottom:40px; }
        @media(max-width:760px){ .landing .foot-grid{grid-template-columns:1fr 1fr} }
        .landing .foot-grid p { font-size:14px; color:var(--muted); margin-top:14px; max-width:280px; }
        .landing .fcol h4 { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--ink); margin-bottom:14px; }
        .landing .fcol a { display:block; font-size:14px; color:var(--muted); margin-bottom:10px; }
        .landing .fcol a:hover { color:var(--pista-d); }
        .landing .foot-bot { display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--line); padding-top:24px; font-size:13px; color:var(--muted); flex-wrap:wrap; gap:10px; }
      `}</style>
    </div>
  );
}
