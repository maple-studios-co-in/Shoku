"use client";

import { useState } from "react";
import Link from "next/link";

export default function GuideView({ userHtml, devHtml }) {
  const [tab, setTab] = useState("user");
  const html = tab === "dev" && devHtml ? devHtml : userHtml;

  return (
    <div className="guide">
      <nav className="gbar">
        <Link href="/" className="brand"><img src="/shoku-mark.svg" alt="" className="dot" /> Shoku</Link>
        <div className="tabs">
          <button className={tab === "user" ? "on" : ""} onClick={() => setTab("user")}>For café owners</button>
          {devHtml && <button className={tab === "dev" ? "on" : ""} onClick={() => setTab("dev")}>For developers</button>}
        </div>
        <div className="spacer" />
        <Link href="/menu" className="back">Back to app →</Link>
      </nav>

      <article className="prose" dangerouslySetInnerHTML={{ __html: html || "<p>Guide is unavailable right now.</p>" }} />

      <footer className="gfoot">Shoku · getshoku.com</footer>

      <style jsx global>{`
        .guide { --green:#3A6B4D; --dark:#15281e; --ink:#1B1813; --muted:#6F6557; --line:#E4DDD0; --tint:#EAF1EA; --canvas:#F6F2EA;
          background:var(--canvas); min-height:100vh; color:var(--ink);
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
        .guide .gbar { position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:16px; flex-wrap:wrap;
          padding:12px 20px; background:rgba(255,255,255,.9); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
        .guide .brand { font-weight:800; font-size:17px; display:flex; align-items:center; gap:8px; color:var(--ink); text-decoration:none; }
        .guide .dot { display:grid; place-items:center; width:28px; height:28px; border-radius:8px; background:var(--green); color:#fff; font-weight:800; font-size:14px; }
        .guide .tabs { display:flex; gap:6px; background:var(--tint); padding:4px; border-radius:11px; }
        .guide .tabs button { border:0; cursor:pointer; background:transparent; font-size:13px; font-weight:700; color:var(--muted); padding:7px 13px; border-radius:8px; }
        .guide .tabs button.on { background:#fff; color:var(--ink); box-shadow:0 1px 4px rgba(0,0,0,.06); }
        .guide .spacer { flex:1; }
        .guide .back { font-size:13px; font-weight:700; color:var(--green); text-decoration:none; }
        .guide .prose { max-width:860px; margin:0 auto; padding:36px 22px 80px; line-height:1.65; font-size:15.5px; }
        .guide .prose h1 { font-family:var(--font-serif,Georgia,serif); font-size:38px; line-height:1.15; margin:8px 0 18px; letter-spacing:-.01em; }
        .guide .prose h2 { font-family:var(--font-serif,Georgia,serif); font-size:26px; margin:42px 0 14px; padding-top:14px; border-top:1px solid var(--line); }
        .guide .prose h3 { font-size:18px; margin:26px 0 10px; }
        .guide .prose h4 { font-size:15.5px; margin:20px 0 8px; }
        .guide .prose p { margin:0 0 14px; }
        .guide .prose ul, .guide .prose ol { margin:0 0 16px; padding-left:22px; }
        .guide .prose li { margin:6px 0; }
        .guide .prose a { color:var(--green); font-weight:600; text-decoration:none; }
        .guide .prose a:hover { text-decoration:underline; }
        .guide .prose strong { font-weight:700; }
        .guide .prose code { background:#eef2ea; padding:2px 6px; border-radius:6px; font-size:13.5px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
        .guide .prose pre { background:var(--dark); color:#e8f2dd; padding:16px 18px; border-radius:12px; overflow:auto; margin:0 0 18px; }
        .guide .prose pre code { background:transparent; padding:0; color:inherit; font-size:13px; }
        .guide .prose table { width:100%; border-collapse:collapse; margin:0 0 20px; font-size:14px; display:block; overflow-x:auto; }
        .guide .prose th, .guide .prose td { border:1px solid var(--line); padding:9px 12px; text-align:left; vertical-align:top; }
        .guide .prose th { background:var(--tint); font-weight:700; }
        .guide .prose blockquote { margin:0 0 16px; padding:10px 16px; border-left:3px solid var(--green); background:#fff; color:var(--muted); border-radius:0 10px 10px 0; }
        .guide .prose hr { border:0; border-top:1px solid var(--line); margin:30px 0; }
        .guide .prose img { max-width:100%; border-radius:10px; }
        .guide .gfoot { text-align:center; color:var(--muted); font-size:12.5px; padding:24px; border-top:1px solid var(--line); }
        @media (max-width:640px){ .guide .prose h1 { font-size:30px; } .guide .prose h2 { font-size:22px; } }
      `}</style>
    </div>
  );
}
