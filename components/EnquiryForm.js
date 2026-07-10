"use client";

import { useState } from "react";

// Live demo & sales enquiry form — self-contained styling so it sits equally
// well on the cream landing page and inside dark bands.
export default function EnquiryForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", cafe: "", message: "" });
  const [state, setState] = useState("idle"); // idle | busy | done
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setState("busy");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(d.error || "Something went wrong — please try again.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setErr("Couldn't reach the server — please try again.");
      setState("idle");
    }
  }

  return (
    <div className="eq">
      {state === "done" ? (
        <div className="eq-done">
          <span className="eq-tick">✓</span>
          <h3>Thank you, {form.name.split(" ")[0]}.</h3>
          <p>Your enquiry is with us — we&rsquo;ll reach out within 24 hours to set up your live demo and branded preview.</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="eq-head">
            <h3>Get a live demo</h3>
            <p>Tell us about your café — we&rsquo;ll spin up a branded preview and walk you through it in 20 minutes.</p>
          </div>
          <div className="eq-grid">
            <label>Your name *<input required value={form.name} onChange={set("name")} placeholder="Priya Nair" /></label>
            <label>Email *<input required type="email" value={form.email} onChange={set("email")} placeholder="priya@brewandbloom.in" /></label>
            <label>Phone<input value={form.phone} onChange={set("phone")} placeholder="+91 …" /></label>
            <label>Café / brand<input value={form.cafe} onChange={set("cafe")} placeholder="Brew & Bloom, Bengaluru" /></label>
          </div>
          <label className="eq-full">Anything we should know?
            <textarea rows={3} value={form.message} onChange={set("message")} placeholder="2 outlets, currently on aggregators, interested in the AI ordering + WhatsApp marketing…" />
          </label>
          {err && <div className="eq-err">{err}</div>}
          <button type="submit" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Request a live demo →"}</button>
          <div className="eq-note">We reply within 24 hours. No spam, ever.</div>
        </form>
      )}

      <style jsx>{`
        .eq{ background:#fbf7ef; border:1px solid #e4ddd0; border-radius:26px; padding:34px 32px; text-align:left; color:#1b1813;
          box-shadow:0 30px 70px rgba(15,28,20,.22); }
        .eq-head h3, .eq-done h3{ font-family:var(--font-serif,Georgia,serif); font-size:26px; font-weight:500; letter-spacing:-.01em; margin:0 0 6px; }
        .eq-head p{ font-size:14px; color:#6f6557; margin:0 0 22px; max-width:52ch; }
        .eq-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        label{ display:flex; flex-direction:column; gap:6px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#6f6557; }
        .eq-full{ margin-top:14px; }
        input, textarea{ font:inherit; font-size:14.5px; font-weight:400; letter-spacing:0; text-transform:none; color:#1b1813;
          background:#fff; border:1px solid #e4ddd0; border-radius:13px; padding:12px 14px; outline:none; transition:border-color .2s, box-shadow .2s; }
        input:focus, textarea:focus{ border-color:#3a6b4d; box-shadow:0 0 0 3px rgba(58,107,77,.12); }
        textarea{ resize:vertical; }
        button{ margin-top:18px; width:100%; border:0; cursor:pointer; background:#3a6b4d; color:#fff; font-weight:700; font-size:15px;
          padding:15px 24px; border-radius:999px; transition:background .2s, transform .15s; box-shadow:0 12px 28px rgba(36,70,53,.28); }
        button:hover{ background:#244635; transform:translateY(-1px); }
        button:disabled{ opacity:.6; cursor:default; transform:none; }
        .eq-err{ margin-top:14px; background:#fdecec; color:#b3413b; border-radius:12px; padding:10px 14px; font-size:13.5px; }
        .eq-note{ margin-top:12px; text-align:center; font-size:12px; color:#6f6557; }
        .eq-done{ text-align:center; padding:26px 10px; }
        .eq-tick{ display:grid; place-items:center; width:58px; height:58px; margin:0 auto 16px; border-radius:50%;
          background:#eaf1ea; color:#244635; font-size:26px; font-weight:800; }
        .eq-done p{ font-size:14.5px; color:#6f6557; max-width:46ch; margin:0 auto; }
        @media(max-width:640px){ .eq{ padding:26px 20px; } .eq-grid{ grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
