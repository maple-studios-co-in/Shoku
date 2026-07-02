import fs from "fs";
import path from "path";
import { marked } from "marked";
import { safeMarkdownHtml } from "@/lib/sanitize";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ResearchView from "./ResearchView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shoku — Research Hub" };

const DIR = path.join(process.cwd(), "content", "research");

const TITLES = {
  "pos-deep-dive": "POS deep-dive: Rista, Petpooja & the wedge",
  "unit-economics": "Unit economics & pricing model",
  "market-trends-2026": "Market trends & reports",
  "competitor-analysis-2026": "Competitor analysis",
  "competitor-intel": "Competitor intel (scraped)",
  "petpooja-comparison-and-pivot": "Petpooja: compare & pivot",
  "foodtech-landscape-and-gaps": "Food-tech landscape & gaps",
  "community-sentiment": "Community & Reddit sentiment",
  "rebranding-and-genz-strategy": "Rebrand & Gen-Z strategy",
};
const ORDER = [
  "pos-deep-dive",
  "unit-economics",
  "market-trends-2026",
  "competitor-analysis-2026",
  "competitor-intel",
  "petpooja-comparison-and-pivot",
  "foodtech-landscape-and-gaps",
  "community-sentiment",
  "rebranding-and-genz-strategy",
];

function titleFor(slug) {
  return TITLES[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadDocs() {
  let files = [];
  try {
    files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const docs = files.map((f) => {
    const slug = f.replace(/\.md$/, "");
    const md = fs.readFileSync(path.join(DIR, f), "utf8");
    return { slug, title: titleFor(slug), html: safeMarkdownHtml(marked.parse(md, { gfm: true })) };
  });
  docs.sort((a, b) => {
    const ia = ORDER.indexOf(a.slug);
    const ib = ORDER.indexOf(b.slug);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return docs;
}

const INSIGHTS = {
  kpis: [
    { v: "₹5.7L → 7.8L Cr", l: "India food-services market, FY24→FY28 (NRAI IFSR)" },
    { v: "5,339 → 10k+", l: "India branded coffee outlets, 2025→2030 (World Coffee Portal)" },
    { v: "100k+ · ₹137 Cr", l: "Petpooja outlets / Series C — the incumbent to ride" },
    { v: "850M+ · 98%", l: "WhatsApp India users · message open rate" },
  ],
  takeRate: [
    { k: "Zomato", v: 30 },
    { k: "Swiggy", v: 28 },
    { k: "ONDC", v: 6 },
    { k: "Shoku (us)", v: 0 },
  ],
  outlets: [
    { k: "2025", v: 5339 },
    { k: "2026", v: 6110 },
    { k: "2030 (f)", v: 10000 },
  ],
  pains: [
    { k: "Aggregator commissions", v: 100 },
    { k: "Customer-data masking", v: 82 },
    { k: "Discount / ad pressure", v: 70 },
    { k: "POS cost & complexity", v: 58 },
    { k: "Payment delays", v: 45 },
  ],
  gaps: [
    "Café-native ordering & POS",
    "AI diner assistant (conversational order)",
    "Diner-facing food intelligence",
    "F&B-native AI WhatsApp marketing",
  ],
  funding: "$237M",
  // POS pivot + unit economics (see pos-deep-dive.md / unit-economics.md)
  posPricing: [
    { k: "Budget apps", v: 4500 },
    { k: "Petpooja (real)", v: 22500 },
    { k: "Rista / DotPe", v: 40000 },
    { k: "Posist yr-1", v: 55000 },
  ],
  unitEcon: [
    { k: "Starter GP/mo", v: 4049 },
    { k: "Growth GP/mo", v: 10134 },
    { k: "POS add-on GP/mo", v: 1400 },
  ],
  posKpis: [
    { v: "$13.4B · 8.3%", l: "Global restaurant-POS market 2026 · CAGR (R&M)" },
    { v: "65%+", l: "SMB restaurants preferring cloud POS" },
    { v: "78–81%", l: "Shoku gross margin per café (modelled)" },
    { v: "≤0.8 mo", l: "CAC payback, inbound Growth café" },
  ],
};

function Gate() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F6F2EA", fontFamily: "-apple-system,Segoe UI,Roboto,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 40 }}>🔬</div>
        <h1 style={{ fontFamily: "var(--font-serif,Georgia,serif)", margin: "10px 0 6px" }}>Research Hub</h1>
        <p style={{ color: "#6F6557", margin: "0 0 18px" }}>This internal strategy hub is for Shoku staff only.</p>
        <Link href="/login?next=/research" style={{ background: "#3A6B4D", color: "#fff", fontWeight: 700, padding: "10px 18px", borderRadius: 12, textDecoration: "none" }}>Sign in</Link>
      </div>
    </div>
  );
}

export default async function ResearchPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "superadmin") return <Gate />;
  const docs = loadDocs();
  return <ResearchView docs={docs} insights={INSIGHTS} />;
}
