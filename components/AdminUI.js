"use client";

import { formatINR } from "@/lib/menu";

export function SectionCard({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-line bg-white ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="text-sm font-bold">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Stat({ label, value, sub, icon }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="mt-2 text-[26px] font-extrabold tracking-tight text-ink">{value}</div>
      {sub && <div className="mt-1 text-[12px] text-muted">{sub}</div>}
    </div>
  );
}

const STATUS_STYLES = {
  preparing: "bg-amber-50 text-amber-700",
  ready: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// Simple responsive SVG bar chart for the 14-day series.
export function BarChart({ data, valueKey = "revenue", money = true }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  const W = 720;
  const H = 200;
  const pad = 24;
  const bw = (W - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 200 }}>
      {data.map((d, i) => {
        const h = (d[valueKey] / max) * (H - pad * 2);
        const x = pad + i * bw;
        const y = H - pad - h;
        return (
          <g key={i}>
            <rect x={x + bw * 0.18} y={y} width={bw * 0.64} height={Math.max(2, h)} rx={4} fill="rgb(var(--brand))" opacity={0.9}>
              <title>{`${d.label}: ${money ? formatINR(d[valueKey]) : d[valueKey]}`}</title>
            </rect>
            {i % 2 === 0 && (
              <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="rgb(var(--muted))">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export { formatINR };
