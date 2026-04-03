import React, { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — only what a utility AMI system actually transmits
// account info · meter reads (daily gallons) · active flags · billing balance
// ─────────────────────────────────────────────────────────────────────────────
const DATA = {
  account: {
    name: "Sarah Mitchell",
    accountId: "WTR-004821",
    address: "1247 Maple Creek Dr",
    meterSerial: "MET-88234",
    serviceClass: "Residential",
  },
  reads: [
    { date: "Mar 1",  gallons: 142 },
    { date: "Mar 5",  gallons: 158 },
    { date: "Mar 10", gallons: 221 },
    { date: "Mar 15", gallons: 145 },
    { date: "Mar 17", gallons: 310 },
    { date: "Mar 20", gallons: 163 },
    { date: "Mar 22", gallons: 148 },
    { date: "Mar 24", gallons: 172 },
    { date: "Mar 26", gallons: 189 },
    { date: "Mar 27", gallons: 160 },
  ],
  history: [
    { month: "Oct '25", gallons: 3940 },
    { month: "Nov '25", gallons: 3760 },
    { month: "Dec '25", gallons: 4010 },
    { month: "Jan '26", gallons: 4420 },
    { month: "Feb '26", gallons: 4580 },
    { month: "Mar '26", gallons: 4820 },
  ],
  hourly: [2,2,2,2,0,0,8,18,22,14,9,6,4,11,18,22,16,8,12,20,14,6,2,0],
  flags: [
    {
      id: 1, severity: "high",
      code: "CONTINUOUS_FLOW",
      title: "Continuous flow detected",
      detail: "Flow of 1.5 GPM sustained for 3 hours (12:00 am – 3:00 am). Detected via consecutive hourly reads with no zero-flow interval. Likely a running toilet or slow leak.",
      timestamp: "Today, 3:14 AM",
    },
    {
      id: 2, severity: "medium",
      code: "PRESSURE_SPIKE",
      title: "Pressure spike recorded",
      detail: "Meter logged 118 PSI. Normal operating range is 60–80 PSI. A pressure reducing valve may be needed.",
      timestamp: "Mar 26, 11:42 PM",
    },
  ],
  leakDetection: {
    status: "active",
    detectedAt: "Today, 12:00 AM",
    resolvedAt: null,
    durationHrs: 3,
    flowRateGpm: 1.5,
    estimatedWasteGal: 270,
    history: [
      { date: "Mar 27", status: "active",   durationHrs: 3,   wasteGal: 270, resolvedAt: null },
      { date: "Mar 14", status: "resolved", durationHrs: 1.8, wasteGal: 13, resolvedAt: "Mar 14, 7:42 AM" },
      { date: "Feb 28", status: "resolved", durationHrs: 2.1, wasteGal: 15, resolvedAt: "Feb 28, 6:18 AM" },
    ],
  },
  billing: {
    balance: 42.18,
    dueDate: "Apr 15, 2026",
    billingPeriod: "March 2026",
    lineItems: [
      { label: "Base service charge",     amount: 8.42 },
      { label: "Water usage — 4,820 gal", amount: 30.03 },
      { label: "Sewer (usage-based)",     amount: 3.73 },
      { label: "Taxes & fees",            amount: 0.00 },
    ],
    history: [
      { month: "Oct '25", amount: 31.20, paid: true },
      { month: "Nov '25", amount: 29.80, paid: true },
      { month: "Dec '25", amount: 32.10, paid: true },
      { month: "Jan '26", amount: 36.40, paid: true },
      { month: "Feb '26", amount: 39.50, paid: true },
      { month: "Mar '26", amount: 42.18, paid: false },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --blue:        #0B7EA3;
    --blue-light:  #E6F5FA;
    --blue-mid:    #A8DCF0;
    --green:       #157A4A;
    --green-light: #E6F4EC;
    --amber:       #92480A;
    --amber-light: #FDF3E7;
    --red:         #B91C1C;
    --red-light:   #FEF2F2;
    --ink:         #0D1B2A;
    --ink-2:       #2E4057;
    --ink-3:       #607188;
    --ink-4:       #9BAFC2;
    --rule:        #E2EBF0;
    --surface:     #FFFFFF;
    --surface-2:   #F4F8FB;
    --surface-3:   #EBF2F7;
    --font:        'DM Sans', sans-serif;
    --mono:        'DM Mono', monospace;
    --radius:      12px;
    --radius-sm:   8px;
  }
  body { font-family: var(--font); background: var(--surface-2); color: var(--ink); }
  input, button, textarea, select { font-family: var(--font); }
  button {
    cursor: pointer;
    border: 1px solid var(--rule);
    background: var(--surface);
    color: var(--ink-2);
    border-radius: var(--radius-sm);
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.15s, border-color 0.15s;
  }
  button:hover { background: var(--surface-3); }
  button.primary { background: var(--blue); color: #fff; border-color: var(--blue); }
  button.primary:hover { background: #0A6A8A; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ripple { 0% { box-shadow: 0 0 0 0 rgba(185,28,28,0.35); } 70% { box-shadow: 0 0 0 9px rgba(185,28,28,0); } 100% { box-shadow: 0 0 0 0 rgba(185,28,28,0); } }
  .fade-up { animation: fadeUp 0.28s ease both; }
  .tab-bar::-webkit-scrollbar { display: none; }
  .tab-bar { scrollbar-width: none; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ label, variant = "blue" }) {
  const map = {
    blue:  { bg: "var(--blue-light)",  color: "var(--blue)",  border: "var(--blue-mid)" },
    green: { bg: "var(--green-light)", color: "var(--green)", border: "#A7D9BC" },
    amber: { bg: "var(--amber-light)", color: "var(--amber)", border: "#F5CFA0" },
    red:   { bg: "var(--red-light)",   color: "var(--red)",   border: "#FCA5A5" },
    gray:  { bg: "var(--surface-3)",   color: "var(--ink-3)", border: "var(--rule)" },
  };
  const s = map[variant] || map.blue;
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 500,
      padding: "2px 9px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{label}</span>
  );
}

function Stat({ label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? accent.bg : "var(--surface)",
      border: `1px solid ${accent ? accent.border : "var(--rule)"}`,
      borderRadius: "var(--radius)", padding: "16px 18px",
    }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: accent ? accent.labelColor : "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1, color: accent ? accent.valueColor : "var(--ink)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: accent ? accent.subColor : "var(--ink-3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "var(--radius)", ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, sub }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--rule)" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ children, coming }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: coming ? "var(--ink-4)" : "var(--ink-3)" }}>
        {children}
      </div>
      {coming && (
        <span style={{ fontSize: 10, fontWeight: 500, color: "var(--ink-4)", background: "var(--surface-3)", border: "1px solid var(--rule)", borderRadius: 99, padding: "1px 8px" }}>
          Coming soon
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
    </div>
  );
}

function ToggleSwitch({ on, onChange, disabled = false }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        width: 38, height: 22, borderRadius: 11,
        background: on && !disabled ? "var(--blue)" : "var(--rule)",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative", flexShrink: 0,
        transition: "background 0.2s",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: on ? 19 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARTS
// ─────────────────────────────────────────────────────────────────────────────
function BarChart({ data, height = 96, flagThreshold = 250 }) {
  const max = Math.max(...data.map(d => d.gallons));
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ position: "relative" }}>
      {hovered !== null && (
        <div style={{
          position: "absolute", top: -36, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "#fff", fontSize: 11, fontWeight: 500,
          padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10,
        }}>
          {data[hovered].date} · {data[hovered].gallons} gal
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height }}>
        {data.map((d, i) => {
          const h = Math.max(4, Math.round((d.gallons / max) * (height - 4)));
          const flagged = d.gallons > flagThreshold;
          return (
            <div key={i} style={{ flex: 1 }}>
              <div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: "100%", height: h,
                  background: flagged ? "#EF4444" : "var(--blue)",
                  borderRadius: "4px 4px 0 0",
                  opacity: hovered === null || hovered === i ? 1 : 0.45,
                  transition: "opacity 0.15s",
                  cursor: "default",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
        {[data[0], data[Math.floor(data.length / 2)], data[data.length - 1]].map((d, i) => (
          <span key={i} style={{ fontSize: 10, color: "var(--ink-4)" }}>{d.date}</span>
        ))}
      </div>
    </div>
  );
}

function MiniBarChart({ data }) {
  const max = Math.max(...data.map(d => d.gallons));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 52 }}>
      {data.map((d, i) => {
        const h = Math.max(3, Math.round((d.gallons / max) * 48));
        const isCurrent = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: "100%", height: h,
              background: isCurrent ? "var(--blue)" : "var(--surface-3)",
              border: isCurrent ? "none" : "1px solid var(--rule)",
              borderRadius: "3px 3px 0 0",
            }} title={`${d.month}: ${d.gallons.toLocaleString()} gal`} />
            <div style={{ fontSize: 9, color: "var(--ink-4)", whiteSpace: "nowrap" }}>{d.month.split(" ")[0]}</div>
          </div>
        );
      })}
    </div>
  );
}

function HourChart({ data }) {
  const max = Math.max(...data) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 48 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: Math.max(2, Math.round((v / max) * 46)),
          background: v === 0 ? "var(--surface-3)" : i < 4 ? "#EF4444" : "var(--blue)",
          borderRadius: "2px 2px 0 0",
          opacity: 0.85,
        }} title={`${i}:00 — ${v} gal`} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function Overview({ onNav }) {
  const totalMar    = DATA.reads.reduce((s, r) => s + r.gallons, 0);
  const avgDaily    = Math.round(totalMar / DATA.reads.length);
  const todayGal    = DATA.hourly.reduce((s, v) => s + v, 0);
  const curMonth    = DATA.history[DATA.history.length - 1];
  const prevMonth   = DATA.history[DATA.history.length - 2];
  const monthChange = Math.round(((curMonth.gallons - prevMonth.gallons) / prevMonth.gallons) * 100);
  const ld          = DATA.leakDetection;

  return (
    <div className="fade-up">

      {/* ── DROUGHT BANNER ── */}
      <div
        onClick={() => onNav("drought")}
        style={{
          background: DROUGHT.bg, border: `1px solid ${DROUGHT.border}`,
          borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 14,
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>🌵</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DROUGHT.color }}>
            Colorado {DROUGHT.label} ({DROUGHT.level}) — Stage 2 Restrictions Active
          </div>
          <div style={{ fontSize: 11, color: "#92400E", marginTop: 1 }}>
            Outdoor watering restricted. 20% reduction requested. Tap to view details &amp; tips →
          </div>
        </div>
      </div>

      {/* ── USAGE ── */}
      <SectionLabel>Usage</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>

        {/* Today / hourly */}
        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-4)", marginBottom: 8 }}>Today</div>
          <HourChart data={DATA.hourly} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 9, color: "var(--ink-4)" }}>12am</span>
            <span style={{ fontSize: 9, color: "var(--ink-4)" }}>12pm</span>
            <span style={{ fontSize: 9, color: "var(--ink-4)" }}>11pm</span>
          </div>
          <div style={{ marginTop: 8, borderTop: "1px solid var(--rule)", paddingTop: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
              {todayGal} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--ink-3)" }}>gal</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>So far today</div>
          </div>
          {DATA.flags.some(f => f.code === "CONTINUOUS_FLOW") && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#991B1B" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--red)", animation: "ripple 2s infinite", flexShrink: 0 }} />
              Leak flag active
            </div>
          )}
        </Card>

        {/* This month / daily */}
        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-4)", marginBottom: 8 }}>This month</div>
          <BarChart data={DATA.reads} height={60} />
          <div style={{ marginTop: 8, borderTop: "1px solid var(--rule)", paddingTop: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
              {avgDaily} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--ink-3)" }}>gal/day</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>Daily avg · March</div>
          </div>
        </Card>

        {/* 6 months / monthly */}
        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink-4)", marginBottom: 8 }}>6 months</div>
          <MiniBarChart data={DATA.history} />
          <div style={{ marginTop: 8, borderTop: "1px solid var(--rule)", paddingTop: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
              {curMonth.gallons.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--ink-3)" }}>gal</span>
            </div>
            <div style={{ fontSize: 11, color: monthChange > 0 ? "#991B1B" : "var(--green)", marginTop: 2 }}>
              {monthChange > 0 ? "▲" : "▼"} {Math.abs(monthChange)}% vs. last month
            </div>
          </div>
        </Card>
      </div>

      {/* ── LEAK DETECTION ── */}
      <SectionLabel>Leak Detection</SectionLabel>
      <Card style={{ marginBottom: 14, border: ld.status === "active" ? "1px solid #FCA5A5" : "1px solid var(--rule)" }}>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>💧</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Continuous flow monitoring</div>
                <div style={{ fontSize: 12, color: ld.status === "active" ? "var(--red)" : "var(--ink-3)", marginTop: 1 }}>
                  {ld.status === "active" ? `Flag raised · ${ld.detectedAt}` : "No leak detected"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {ld.status === "active" && (
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--red)", animation: "ripple 2s infinite" }} />
              )}
              <Badge label={ld.status === "active" ? "Active" : "Clear"} variant={ld.status === "active" ? "red" : "green"} />
            </div>
          </div>

          {ld.status === "active" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Flow rate",  value: `${ld.flowRateGpm} GPM` },
                { label: "Duration",   value: `${ld.durationHrs} hrs` },
                { label: "Est. waste", value: `${ld.estimatedWasteGal} gal` },
              ].map(k => (
                <div key={k.label} style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#991B1B", marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--red)" }}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-4)", marginBottom: 8 }}>Recent events</div>
          <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--rule)" }}>
            {ld.history.map((h, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
                background: h.status === "active" ? "#FEF2F2" : "var(--surface)",
                borderBottom: i < ld.history.length - 1 ? "1px solid var(--rule)" : "none",
              }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: h.status === "active" ? "var(--red)" : "var(--green)" }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{h.date}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: 8 }}>{h.durationHrs} hrs · ~{h.wasteGal} gal wasted</span>
                </div>
                <Badge label={h.status === "active" ? "Active" : "Resolved"} variant={h.status === "active" ? "red" : "green"} />
              </div>
            ))}
          </div>

          {ld.status === "active" && (
            <button
              onClick={() => onNav("notifications")}
              style={{ marginTop: 12, width: "100%", fontSize: 12, padding: "7px", color: "var(--red)", borderColor: "#FCA5A5", background: "rgba(254,242,242,0.6)" }}
            >
              Manage leak alert notifications →
            </button>
          )}
        </div>
      </Card>

      {/* ── PRESSURE (coming soon) ── */}
      <SectionLabel coming>Pressure Monitoring</SectionLabel>
      <div style={{ position: "relative", marginBottom: 4 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "var(--radius)", background: "rgba(244,248,251,0.7)", zIndex: 2, cursor: "not-allowed" }} />
        <Card style={{ opacity: 0.5, pointerEvents: "none" }}>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>🔧</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Pressure monitoring</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>Live PSI from meter · spike detection</div>
                </div>
              </div>
              <Badge label="— PSI" variant="gray" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {["Current PSI", "24hr high", "Status"].map(k => (
                <div key={k} style={{ background: "var(--surface-2)", border: "1px solid var(--rule)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-4)", marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink-4)" }}>—</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE TAB
// ─────────────────────────────────────────────────────────────────────────────
function Usage() {
  const current     = DATA.history[DATA.history.length - 1];
  const prev        = DATA.history[DATA.history.length - 2];
  const change      = Math.round(((current.gallons - prev.gallons) / prev.gallons) * 100);
  const neighborAvg = 3960;
  const cityAvg     = 4120;
  const maxVal      = Math.max(current.gallons, neighborAvg, cityAvg);

  return (
    <div className="fade-up">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
        <Stat label="Mar total" value={`${current.gallons.toLocaleString()} gal`} sub={`${change > 0 ? "+" : ""}${change}% vs. Feb`} />
        <Stat label="Feb total" value={`${prev.gallons.toLocaleString()} gal`} sub="Previous cycle" />
        <Stat label="Meter interval" value="Hourly" sub="AMI reads" />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="6-month usage history" sub="Monthly totals from meter reads" />
        <div style={{ padding: "16px 20px" }}>
          <MiniBarChart data={DATA.history} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 14 }}>
            {DATA.history.map((h, i) => (
              <div key={i} style={{
                background: i === DATA.history.length - 1 ? "var(--blue-light)" : "var(--surface-2)",
                border: `1px solid ${i === DATA.history.length - 1 ? "var(--blue-mid)" : "var(--rule)"}`,
                borderRadius: 8, padding: "8px 10px",
              }}>
                <div style={{ fontSize: 11, color: i === DATA.history.length - 1 ? "var(--blue)" : "var(--ink-3)", fontWeight: 500 }}>{h.month}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: i === DATA.history.length - 1 ? "var(--blue)" : "var(--ink)", marginTop: 2 }}>
                  {h.gallons.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 400, color: "var(--ink-3)" }}>gal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="Usage comparison" sub="March 2026 · your home vs. area averages" />
        <div style={{ padding: "16px 20px" }}>
          {[
            { label: "Your home",        value: current.gallons, highlight: true },
            { label: "Neighborhood avg", value: neighborAvg },
            { label: "City avg",         value: cityAvg },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span style={{ color: r.highlight ? "var(--ink)" : "var(--ink-3)", fontWeight: r.highlight ? 600 : 400 }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: r.highlight ? "var(--ink)" : "var(--ink-2)" }}>{r.value.toLocaleString()} gal</span>
              </div>
              <div style={{ height: 7, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.round((r.value / maxVal) * 100)}%`, background: r.highlight ? "var(--blue)" : "var(--ink-4)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--rule)", fontSize: 12, color: "var(--ink-3)" }}>
            Your March usage was <strong style={{ color: "var(--ink)" }}>{Math.round(((current.gallons - neighborAvg) / neighborAvg) * 100)}% above</strong> the neighborhood average of {neighborAvg.toLocaleString()} gal.
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Usage breakdown estimate" sub="Where your water goes · March 2026" />
        <div style={{ padding: "16px 20px" }}>
          {[
            { label: "Irrigation / outdoor", pct: 38, color: "#1D9E75" },
            { label: "Toilets",              pct: 24, color: "var(--blue)" },
            { label: "Laundry / appliances", pct: 18, color: "#7F77DD" },
            { label: "Showers / baths",      pct: 14, color: "#EF9F27" },
            { label: "Faucets / other",      pct:  6, color: "var(--ink-4)" },
          ].map((r, i, a) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < a.length - 1 ? 14 : 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 13, color: "var(--ink-2)" }}>{r.label}</div>
              <div style={{ width: 140, height: 7, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden", flexShrink: 0 }}>
                <div style={{ height: "100%", width: `${r.pct * (100 / 38)}%`, maxWidth: "100%", background: r.color, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", minWidth: 32, textAlign: "right" }}>{r.pct}%</div>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--rule)", fontSize: 12, color: "var(--ink-3)" }}>
            Estimates based on household size, fixture inventory, and seasonal patterns. Irrigation is elevated — consistent with the +12% usage increase vs. last month.
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BILLING TAB
// ─────────────────────────────────────────────────────────────────────────────
function Billing() {
  const [payDone, setPayDone] = useState(false);
  const { balance, dueDate, billingPeriod, lineItems, history } = DATA.billing;
  const total = lineItems.reduce((s, l) => s + l.amount, 0);

  return (
    <div className="fade-up">
      <div style={{
        background: "var(--surface)", border: "1px solid var(--rule)",
        borderRadius: "var(--radius)", padding: "20px 22px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 6 }}>Amount due</div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1 }}>${balance.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{billingPeriod} · Due {dueDate}</div>
        </div>
        {payDone ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--green-light)", border: "1px solid #A7D9BC", borderRadius: 10, padding: "10px 16px" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5l3.5 3.5L13 5" stroke="#157A4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>Payment submitted</span>
          </div>
        ) : (
          <button className="primary" style={{ fontSize: 14, padding: "11px 22px" }} onClick={() => setPayDone(true)}>
            Pay ${balance.toFixed(2)}
          </button>
        )}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader title={`Bill breakdown — ${billingPeriod}`} />
        <div style={{ padding: "4px 0" }}>
          {lineItems.map((l, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "11px 20px", fontSize: 13,
              borderBottom: i < lineItems.length - 1 ? "1px solid var(--rule)" : "none",
            }}>
              <span style={{ color: "var(--ink-2)" }}>{l.label}</span>
              <span style={{ fontWeight: 500, fontFamily: "var(--mono)", fontSize: 12 }}>
                {l.amount === 0 ? "—" : `$${l.amount.toFixed(2)}`}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 20px", fontSize: 14, fontWeight: 700, borderTop: "2px solid var(--rule)" }}>
            <span>Total</span>
            <span style={{ fontFamily: "var(--mono)" }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Payment history" sub="Last 6 billing cycles" />
        <div>
          {history.map((h, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 20px",
              borderBottom: i < history.length - 1 ? "1px solid var(--rule)" : "none",
              background: !h.paid ? "#FFFBEB" : "transparent",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{h.month}</div>
              </div>
              <span style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--ink-2)", fontWeight: 500 }}>${h.amount.toFixed(2)}</span>
              <Badge label={h.paid ? "Paid" : "Due"} variant={h.paid ? "green" : "amber"} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERTS TAB
// ─────────────────────────────────────────────────────────────────────────────
const FLAG_META = {
  CONTINUOUS_FLOW: {
    icon: "💧",
    what: "The meter detected water flowing continuously across multiple consecutive hourly reads with no zero-flow interval — typically overnight when no fixtures should be running.",
    likely: ["Running toilet (flapper valve failure)", "Dripping faucet or showerhead", "Slow underground or slab leak"],
    action: "Turn off water to fixtures one at a time and watch your meter. If flow stops, you've found the source. If not, contact a plumber.",
  },
  PRESSURE_SPIKE: {
    icon: "🔧",
    what: "Meter pressure briefly exceeded the normal operating range. Sustained high pressure strains pipes, fixtures, and appliances.",
    likely: ["Failing pressure reducing valve (PRV)", "Supply pressure surge from the main", "Water hammer from rapid valve closure"],
    action: "A licensed plumber can test your PRV and replace it if needed. Normal residential pressure should stay between 60–80 PSI.",
  },
};

function Alerts() {
  const [dismissed, setDismissed] = useState([]);
  const visible = DATA.flags.filter(f => !dismissed.includes(f.id));

  const sevMeta = {
    high:   { label: "High",   variant: "red",   borderColor: "#FCA5A5", bg: "#FEF2F2" },
    medium: { label: "Medium", variant: "amber",  borderColor: "#FCD34D", bg: "#FFFBEB" },
    low:    { label: "Low",    variant: "blue",   borderColor: "var(--blue-mid)", bg: "var(--blue-light)" },
  };

  return (
    <div className="fade-up">
      {visible.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>No active alerts</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Your meter isn't reporting any flags right now.</div>
        </div>
      )}

      {visible.map(flag => {
        const sm   = sevMeta[flag.severity];
        const meta = FLAG_META[flag.code];
        return (
          <div key={flag.id} style={{ background: sm.bg, border: `1px solid ${sm.borderColor}`, borderRadius: "var(--radius)", marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, lineHeight: 1.3 }}>{meta?.icon}</span>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{flag.title}</span>
                    <Badge label={sm.label} variant={sm.variant} />
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{flag.detail}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 5 }}>{flag.timestamp}</div>
                </div>
              </div>
              <button
                onClick={() => setDismissed(d => [...d, flag.id])}
                style={{ fontSize: 11, padding: "4px 10px", background: "transparent", border: "1px solid rgba(0,0,0,0.12)", color: "var(--ink-3)", flexShrink: 0 }}
              >Dismiss</button>
            </div>
            {meta && (
              <div style={{ borderTop: `1px solid ${sm.borderColor}`, padding: "14px 18px 16px", background: "rgba(255,255,255,0.55)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>What this means</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 12 }}>{meta.what}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Likely causes</div>
                <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 12 }}>
                  {meta.likely.map((l, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-2)", marginBottom: 4 }}>
                      <span style={{ color: "var(--ink-4)" }}>·</span>{l}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Recommended action</div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>{meta.action}</div>
              </div>
            )}
          </div>
        );
      })}

      <Card style={{ marginTop: visible.length > 0 ? 8 : 0 }}>
        <CardHeader title="Flag reference" sub="How your meter detects issues" />
        <div>
          {[
            { label: "Continuous flow", desc: "Flow lasting 2+ hourly reads with no break. Suggests a leak or stuck valve." },
            { label: "Pressure spike",  desc: "PSI exceeds 80. Can stress pipes and void appliance warranties." },
            { label: "Empty tube",      desc: "Meter ran dry — possible supply interruption or broken pipe upstream." },
            { label: "Backflow event",  desc: "Reverse flow detected. May indicate a cross-connection risk." },
          ].map((r, i, a) => (
            <div key={r.label} style={{ padding: "12px 20px", borderBottom: i < a.length - 1 ? "1px solid var(--rule)" : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ink-4)", flexShrink: 0, marginTop: 5 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS TAB
// ─────────────────────────────────────────────────────────────────────────────
function Notifications() {
  const [prefs, setPrefs] = useState({
    email: true, sms: false,
    emailAddr: "sarah.mitchell@email.com",
    phone: "(720) 555-0182",
    leakEmail: true, leakSms: false,
    backflowEmail: true, backflowSms: true,
  });
  const [saved, setSaved] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [draftEmail, setDraftEmail] = useState(prefs.emailAddr);
  const [draftPhone, setDraftPhone] = useState(prefs.phone);

  const tog = key => setPrefs(p => ({ ...p, [key]: !p[key] }));

  function save() {
    setPrefs(p => ({ ...p, emailAddr: draftEmail, phone: draftPhone }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function NotifRow({ icon, title, desc, emailKey, smsKey }) {
    return (
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, lineHeight: 1.3, flexShrink: 0 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</div>
          <ToggleSwitch on={prefs[emailKey] && prefs.email} onChange={() => tog(emailKey)} disabled={!prefs.email} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>SMS</div>
          <ToggleSwitch on={prefs[smsKey] && prefs.sms} onChange={() => tog(smsKey)} disabled={!prefs.sms} />
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="Contact channels" sub="Where H2Q sends your alerts" />
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--rule)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: prefs.email ? 10 : 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>✉️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Email</div>
                {!prefs.email && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Off — no email alerts sent</div>}
              </div>
            </div>
            <ToggleSwitch on={prefs.email} onChange={() => tog("email")} />
          </div>
          {prefs.email && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {editingEmail ? (
                <>
                  <input value={draftEmail} onChange={e => setDraftEmail(e.target.value)} style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--blue)" }} />
                  <button style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setEditingEmail(false)}>Done</button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, fontSize: 13, color: "var(--ink-2)", fontFamily: "var(--mono)", background: "var(--surface-2)", border: "1px solid var(--rule)", borderRadius: 6, padding: "6px 10px" }}>{draftEmail}</div>
                  <button style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setEditingEmail(true)}>Edit</button>
                </>
              )}
            </div>
          )}
        </div>
        <div style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: prefs.sms ? 10 : 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>SMS / Text</div>
                {!prefs.sms && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Off — no text alerts sent</div>}
              </div>
            </div>
            <ToggleSwitch on={prefs.sms} onChange={() => tog("sms")} />
          </div>
          {prefs.sms && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {editingPhone ? (
                <>
                  <input value={draftPhone} onChange={e => setDraftPhone(e.target.value)} style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--blue)" }} />
                  <button style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setEditingPhone(false)}>Done</button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, fontSize: 13, color: "var(--ink-2)", fontFamily: "var(--mono)", background: "var(--surface-2)", border: "1px solid var(--rule)", borderRadius: 6, padding: "6px 10px" }}>{draftPhone}</div>
                  <button style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setEditingPhone(true)}>Edit</button>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="Alert rules" sub="Choose which events trigger a notification and how" />
        <NotifRow icon="💧" title="Leak / continuous flow" desc="Sent immediately when the meter detects uninterrupted flow across 2+ consecutive hourly reads." emailKey="leakEmail" smsKey="leakSms" />
        <div style={{ padding: "0 0 0 0" }}>
          <NotifRow icon="🔄" title="Backflow event" desc="Sent immediately when reverse flow is detected at the meter — potential cross-connection risk." emailKey="backflowEmail" smsKey="backflowSms" />
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="What you'll receive" sub="Example alert messages" />
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>📱 SMS example</div>
            <div style={{ background: "var(--surface-3)", border: "1px solid var(--rule)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, fontFamily: "var(--mono)" }}>
              H2Q Alert: Possible leak at 1247 Maple Creek Dr. Continuous flow detected for 2+ hrs. Check for running toilets or open faucets. View: myh2q.com/alerts
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>✉️ Email subject example</div>
            <div style={{ background: "var(--surface-3)", border: "1px solid var(--rule)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, fontFamily: "var(--mono)" }}>
              [H2Q] Leak alert — continuous flow detected at your meter (WTR-004821)
            </div>
          </div>
        </div>
      </Card>

      <button
        className={saved ? "" : "primary"}
        onClick={save}
        style={{
          width: "100%", fontSize: 14, padding: "11px",
          background: saved ? "var(--green-light)" : undefined,
          color: saved ? "var(--green)" : undefined,
          border: saved ? "1px solid #A7D9BC" : undefined,
          borderRadius: "var(--radius-sm)",
        }}
      >
        {saved ? "✓ Preferences saved" : "Save notification preferences"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSERVATION GOALS TAB
// ─────────────────────────────────────────────────────────────────────────────
function Goals() {
  const [goals, setGoals] = useState([
    { id: 1, label: "Monthly usage",   current: 4820, target: 4200, unit: "gal",     icon: "📊" },
    { id: 2, label: "Daily average",   current: 160,  target: 140,  unit: "gal/day", icon: "📅" },
    { id: 3, label: "Leak-free days",  current: 24,   target: 30,   unit: "days",    icon: "💧", higherIsBetter: true },
  ]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(null);

  const tips = [
    { icon: "🚽", title: "Fix running toilets",      detail: "A running toilet wastes up to 200 gal/day — the single biggest household leak.", saving: "~6,000 gal/mo" },
    { icon: "🌿", title: "Water before 8am",          detail: "Watering before sunrise cuts evaporation by up to 30% versus midday irrigation.", saving: "~30% irrigation" },
    { icon: "🚿", title: "Shorten showers by 2 min",  detail: "Each 2-minute reduction saves around 10 gallons per shower.", saving: "~10 gal/shower" },
    { icon: "🔧", title: "Check fixture aerators",    detail: "Clogged aerators force you to run water longer. Clean or replace them annually.", saving: "~5% faucet use" },
  ];

  function saveGoal(id) {
    const val = Number(draft);
    if (!val || val <= 0) return;
    setGoals(gs => gs.map(g => g.id === id ? { ...g, target: val } : g));
    setEditing(null);
    setSaved(id);
    setTimeout(() => setSaved(null), 2000);
  }

  const totalPotentialSavings = Math.max(0, 4820 - 4200);

  return (
    <div className="fade-up">

      {/* Summary banner */}
      <div style={{
        background: "var(--blue-light)", border: "1px solid var(--blue-mid)",
        borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)", marginBottom: 2 }}>Your conservation potential</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Reach your goals and save an estimated <strong style={{ color: "var(--ink)" }}>{totalPotentialSavings.toLocaleString()} gal/mo</strong> — about <strong style={{ color: "var(--ink)" }}>${((totalPotentialSavings * 0.00623)).toFixed(2)}/mo</strong> off your bill.</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Goals on track</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--blue)" }}>
            {goals.filter(g => g.higherIsBetter ? g.current >= g.target : g.current <= g.target).length} / {goals.length}
          </div>
        </div>
      </div>

      {/* Goal cards */}
      {goals.map(g => {
        const met = g.higherIsBetter ? g.current >= g.target : g.current <= g.target;
        const pct = g.higherIsBetter
          ? Math.min(100, Math.round((g.current / g.target) * 100))
          : Math.min(100, Math.round((g.target / g.current) * 100));
        const isEditing = editing === g.id;

        return (
          <Card key={g.id} style={{
            marginBottom: 10,
            border: `1px solid ${met ? "#A7D9BC" : "var(--rule)"}`,
          }}>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                      Current: <strong style={{ color: met ? "var(--green)" : "var(--red)" }}>{g.current.toLocaleString()} {g.unit}</strong>
                      <span style={{ margin: "0 6px", color: "var(--ink-4)" }}>·</span>
                      Target: <strong style={{ color: "var(--ink)" }}>{g.target.toLocaleString()} {g.unit}</strong>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Badge label={met ? "On track" : "Off track"} variant={met ? "green" : "amber"} />
                  {isEditing ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder={String(g.target)}
                        style={{ width: 80, fontSize: 13, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--blue)" }}
                      />
                      <button style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => saveGoal(g.id)}>Save</button>
                      <button style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setEditing(null)}>✕</button>
                    </div>
                  ) : (
                    <button style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => { setEditing(g.id); setDraft(String(g.target)); }}>
                      {saved === g.id ? "✓ Saved" : "Edit"}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: met ? "var(--green)" : pct > 75 ? "var(--blue)" : "#EF9F27",
                  borderRadius: 4, transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-4)" }}>
                <span>{pct}% toward goal</span>
                {!met && (
                  <span style={{ color: "var(--ink-3)" }}>
                    {g.higherIsBetter
                      ? `${(g.target - g.current).toLocaleString()} ${g.unit} to go`
                      : `${(g.current - g.target).toLocaleString()} ${g.unit} above target`}
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {/* Monthly projection */}
      <Card style={{ marginBottom: 16, marginTop: 6 }}>
        <CardHeader title="Monthly projection" sub="At your current daily rate" />
        <div style={{ padding: "16px 20px" }}>
          {(() => {
            const daysInMonth = 31;
            const daysElapsed = 27;
            const daysLeft = daysInMonth - daysElapsed;
            const projected = Math.round((4820 / daysElapsed) * daysInMonth);
            const goalTarget = 4200;
            const overUnder = projected - goalTarget;
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { label: "Projected total",  value: `${projected.toLocaleString()} gal`, color: projected > goalTarget ? "var(--red)" : "var(--green)" },
                  { label: "Days remaining",   value: `${daysLeft} days`, color: "var(--ink)" },
                  { label: "vs. goal",         value: `${overUnder > 0 ? "+" : ""}${overUnder.toLocaleString()} gal`, color: overUnder > 0 ? "var(--red)" : "var(--green)" },
                ].map(k => (
                  <div key={k.label} style={{ background: "var(--surface-2)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--rule)" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-4)", marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: k.color }}>{k.value}</div>
                  </div>
                ))}
              </div>
            );
          })()}
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-3)", padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8, border: "1px solid var(--rule)" }}>
            At your current pace you're projected to use <strong style={{ color: "var(--ink)" }}>620 gal over your goal</strong> this month. Resolving the active leak flag could recover ~23 gal immediately.
          </div>
        </div>
      </Card>

      {/* Conservation tips */}
      <Card>
        <CardHeader title="Conservation tips" sub="Personalized to your usage patterns" />
        <div>
          {tips.map((t, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, padding: "14px 20px",
              borderBottom: i < tips.length - 1 ? "1px solid var(--rule)" : "none",
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 3 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>{t.detail}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-4)", marginBottom: 2 }}>Est. saving</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>{t.saving}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DROUGHT & CONSERVATION TAB
// ─────────────────────────────────────────────────────────────────────────────
function Drought() {
  const currentUsage = DATA.history[DATA.history.length - 1].gallons;
  const prevYearAvg = 4200;
  const reductionPct = Math.round(((prevYearAvg - currentUsage) / prevYearAvg) * 100);
  const vsNeighbor = currentUsage - DROUGHT.neighborAvg;
  const targetReduction = Math.round(currentUsage * DROUGHT.stageTarget);
  const targetUsage = currentUsage - targetReduction;

  return (
    <div className="fade-up">

      {/* Drought status banner */}
      <div style={{
        background: DROUGHT.bg, border: `1px solid ${DROUGHT.border}`,
        borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: 16,
        display: "flex", alignItems: "flex-start", gap: 14,
      }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>🌵</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: DROUGHT.color }}>{DROUGHT.label} — {DROUGHT.level}</div>
            <span style={{ fontSize: 10, fontWeight: 700, background: DROUGHT.color, color: "#fff", padding: "2px 8px", borderRadius: 99, letterSpacing: "0.05em" }}>Stage 2 Restrictions Active</span>
          </div>
          <div style={{ fontSize: 13, color: "#78350F", lineHeight: 1.55 }}>{DROUGHT.description}</div>
        </div>
      </div>

      {/* Drought scale */}
      <Card>
        <CardHeader title="Colorado drought monitor" sub="U.S. Drought Monitor · Updated weekly" />
        <div style={{ padding: "0 20px 16px", display: "flex", gap: 8 }}>
          {DROUGHT.scale.map(s => (
            <div key={s.code} style={{
              flex: 1, borderRadius: 8, padding: "10px 8px", textAlign: "center",
              background: s.active ? DROUGHT.color : "var(--surface-2)",
              border: `1px solid ${s.active ? DROUGHT.color : "var(--rule)"}`,
              transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.active ? "#fff" : "var(--ink-4)", marginBottom: 3 }}>{s.code}</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: s.active ? "rgba(255,255,255,0.85)" : "var(--ink-4)", lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Your usage vs targets */}
      <Card>
        <CardHeader title="Your usage vs. drought targets" sub="Stage 2 requires 20% reduction from prior year" />
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--rule)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Your usage</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{currentUsage.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 3 }}>gal · March 2026</div>
            </div>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--rule)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Stage 2 target</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0F7B52", lineHeight: 1 }}>{targetUsage.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 3 }}>gal · 20% reduction</div>
            </div>
            <div style={{
              background: vsNeighbor > 0 ? "#FEF3C7" : "#ECFDF5",
              border: `1px solid ${vsNeighbor > 0 ? "#FCD34D" : "#6EE7B7"}`,
              borderRadius: 10, padding: "12px 14px",
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>vs. neighbors</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: vsNeighbor > 0 ? "#B45309" : "#0F7B52", lineHeight: 1 }}>
                {vsNeighbor > 0 ? "+" : ""}{vsNeighbor.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 3 }}>gal {vsNeighbor > 0 ? "above" : "below"} avg</div>
            </div>
          </div>

          {/* Progress bar toward target */}
          <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>Progress toward Stage 2 target</span>
            <span style={{ fontSize: 12, color: reductionPct < 0 ? "#B45309" : "#0F7B52", fontWeight: 600 }}>
              {reductionPct < 0 ? `${Math.abs(reductionPct)}% over` : `${reductionPct}% reduced`}
            </span>
          </div>
          <div style={{ height: 10, background: "var(--surface-2)", borderRadius: 5, overflow: "hidden", border: "1px solid var(--rule)" }}>
            <div style={{
              height: "100%", borderRadius: 5,
              width: `${Math.min(100, Math.max(0, (reductionPct / 20) * 100))}%`,
              background: reductionPct >= 20 ? "#0F7B52" : reductionPct > 0 ? "#F59E0B" : "#EF4444",
              transition: "width 0.5s ease",
            }}/>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }}>
            Target: reduce by {targetReduction.toLocaleString()} gal/mo · You need to reach {targetUsage.toLocaleString()} gal or below
          </div>
        </div>
      </Card>

      {/* Current restrictions */}
      <Card>
        <CardHeader title="Active water restrictions" sub="Set by your utility · Stage 2 — Severe Drought" />
        <div>
          {DROUGHT.restrictions.map((r, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "13px 20px", alignItems: "flex-start",
              borderBottom: i < DROUGHT.restrictions.length - 1 ? "1px solid var(--rule)" : "none",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: DROUGHT.color, flexShrink: 0, marginTop: 6 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>{r.rule}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 20px", background: "var(--surface-2)", borderTop: "1px solid var(--rule)", fontSize: 12, color: "var(--ink-4)" }}>
          Violations may result in fines. Contact your utility for questions about current restrictions.
        </div>
      </Card>

      {/* Conservation tips drought-specific */}
      <Card>
        <CardHeader title="Drought conservation tips" sub="Actions that make the biggest difference right now" />
        <div>
          {[
            { icon: "🌿", title: "Cut outdoor watering by 30%", detail: "Outdoor irrigation is the #1 water use in Colorado homes. Small reductions have a big impact during D2 conditions.", saving: "~800 gal/mo" },
            { icon: "🚽", title: "Fix leaks immediately", detail: "During a drought, every drop counts. A running toilet wastes up to 200 gal/day — far more than most conservation efforts save.", saving: "~6,000 gal/mo" },
            { icon: "🌅", title: "Water only in early morning", detail: "Stage 2 requires watering before 8am or after 6pm. Morning watering also reduces evaporation by up to 30%.", saving: "~30% irrigation" },
            { icon: "🪣", title: "Collect and reuse water", detail: "Catch water while waiting for hot water to arrive. Use it to water indoor plants or rinse produce.", saving: "~20 gal/day" },
          ].map((t, i, a) => (
            <div key={i} style={{
              display: "flex", gap: 14, padding: "13px 20px", alignItems: "flex-start",
              borderBottom: i < a.length - 1 ? "1px solid var(--rule)" : "none",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 3 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>{t.detail}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-4)", marginBottom: 2 }}>Est. saving</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0F7B52" }}>{t.saving}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHELL
// ─────────────────────────────────────────────────────────────────────────────
const DROUGHT = {
  level: "D2",
  label: "Severe Drought",
  description: "Colorado is currently experiencing severe drought conditions. Your utility has activated Stage 2 water restrictions.",
  color: "#B45309",
  bg: "#FEF3C7",
  border: "#FCD34D",
  scale: [
    { code: "D0", label: "Abnormally Dry",  active: false },
    { code: "D1", label: "Moderate",        active: false },
    { code: "D2", label: "Severe",          active: true  },
    { code: "D3", label: "Extreme",         active: false },
    { code: "D4", label: "Exceptional",     active: false },
  ],
  restrictions: [
    { rule: "Outdoor watering allowed", detail: "Odd-numbered addresses: Mon, Wed, Sat only · Even-numbered: Tue, Thu, Sun only" },
    { rule: "Watering hours",           detail: "Before 8:00 AM or after 6:00 PM only — no midday irrigation" },
    { rule: "Car washing",              detail: "Only with bucket or shutoff nozzle — running hose prohibited" },
    { rule: "Fountains & decorative",   detail: "All decorative water features must be turned off" },
    { rule: "New landscaping",          detail: "Watering of new sod/seed limited to 3x per week max" },
  ],
  neighborAvg: 3980,
  stageTarget: 0.20,
};

const TABS = [
  { id: "overview",      label: "Overview" },
  { id: "usage",         label: "Usage" },
  { id: "billing",       label: "Billing & Payment" },
  { id: "alerts",        label: `Alerts (${DATA.flags.length})` },
  { id: "notifications", label: "Notifications" },
  { id: "drought",       label: "🌵 Drought & Conservation" },
  { id: "goals",         label: "Conservation Goals" },
];

export default function App() {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight: "100vh", background: "var(--surface-2)" }}>

        {/* Header */}
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--rule)", padding: "0 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 12px" }}>

              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="34" height="22" viewBox="0 0 34 22" fill="none">
                    <text x="0"  y="17" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="17" fill="white">H</text>
                    <text x="12" y="20" fontFamily="DM Sans, sans-serif" fontWeight="600" fontSize="10" fill="#A8DCF0">2</text>
                    <text x="18" y="17" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="17" fill="white">Q</text>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    H<sub style={{ fontSize: 12 }}>2</sub>Q
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3, letterSpacing: "0.04em", textTransform: "uppercase" }}>Your water HQ</div>
                </div>
              </div>

              {/* Account */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{DATA.account.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>{DATA.account.accountId} · {DATA.account.address}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tab-bar" style={{ display: "flex", gap: 2, overflowX: "auto" }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    background: "none", border: "none",
                    borderBottom: tab === t.id ? "2px solid var(--blue)" : "2px solid transparent",
                    borderRadius: 0, padding: "10px 14px", marginBottom: -1,
                    fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                    color: tab === t.id ? "var(--blue)" : "var(--ink-3)",
                    whiteSpace: "nowrap", transition: "color 0.15s",
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 24px 40px" }}>
          {tab === "overview"      && <Overview onNav={setTab} />}
          {tab === "usage"         && <Usage />}
          {tab === "billing"       && <Billing />}
          {tab === "alerts"        && <Alerts />}
          {tab === "notifications" && <Notifications />}
          {tab === "drought"       && <Drought />}
          {tab === "goals"         && <Goals />}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--rule)", padding: "12px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-4)" }}>
            <span>Meter {DATA.account.meterSerial} · AMI hourly reads</span>
            <span>Last read: Mar 27, 2026, 6:00 AM</span>
          </div>
        </div>

      </div>
    </>
  );
}
