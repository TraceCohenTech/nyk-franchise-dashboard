"use client";
import { useState, useEffect, useRef } from "react";
import { SEASONS, PLAYOFF_2026, ECF_STATS, ERA_COLORS, ERAS, ANOMALIES } from "@/lib/data";
import {
  BarChart, Bar, AreaChart, Area, Line, ComposedChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell, ReferenceLine, ScatterChart, Scatter, ZAxis,
} from "recharts";

/* ── utils ─────────────────────────────────────────────── */
const yr = (s: string) => `'${s.split("-")[0].slice(2)}`;
const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

/* ── Basketball SVG ────────────────────────────────────── */
function Ball({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="#F58426" />
      <circle cx="50" cy="50" r="48" fill="none" stroke="#c0560c" strokeWidth="1.5" />
      <path d="M50 2 Q20 30 20 50 Q20 70 50 98" stroke="#7a2c00" strokeWidth="2.5" fill="none" />
      <path d="M50 2 Q80 30 80 50 Q80 70 50 98" stroke="#7a2c00" strokeWidth="2.5" fill="none" />
      <path d="M2 50 Q26 28 50 28 Q74 28 98 50" stroke="#7a2c00" strokeWidth="2.5" fill="none" />
      <path d="M2 50 Q26 72 50 72 Q74 72 98 50" stroke="#7a2c00" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

/* ── Custom tooltip ────────────────────────────────────── */
interface TipEntry { name?: string; value?: number | string; color?: string; }
const Tip = ({ active, payload, label }: { active?: boolean; payload?: TipEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#f1f5f9", boxShadow: "0 4px 12px rgba(0,0,0,.2)" }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#F58426" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#94a3b8" }}>
          {p.name}: {typeof p.value === "number" ? (p.value % 1 !== 0 ? p.value.toFixed(1) : p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

/* ── Animated counter ──────────────────────────────────── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = end / 40;
      const t = setInterval(() => {
        start += step;
        if (start >= end) { setVal(end); clearInterval(t); }
        else setVal(Math.round(start));
      }, 30);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Section wrapper ───────────────────────────────────── */
const Sec = ({ id, children, cls = "" }: { id?: string; children: React.ReactNode; cls?: string }) => (
  <section id={id} className={`px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-5xl mx-auto ${cls}`}>{children}</section>
);

/* ── Section header ────────────────────────────────────── */
const Head = ({ label, title, sub }: { label: string; title: string; sub?: string }) => (
  <div className="mb-8">
    <div className="section-label">{label}</div>
    <h2 className="section-title">{title}</h2>
    {sub && <p className="section-sub">{sub}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
export default function Home() {
  const [selIdx, setSelIdx] = useState(SEASONS.length - 1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sel = SEASONS[selIdx];

  /* derived */
  const totalW = SEASONS.reduce((a, s) => a + s.wins, 0);
  const playoffSeasons = SEASONS.filter(s => s.playoffs !== "Missed");
  const missedCount = SEASONS.filter(s => s.playoffs === "Missed").length;
  const bestSeason = SEASONS.reduce((a, s) => s.pct > a.pct ? s : a);

  /* chart data */
  const winData = SEASONS.map(s => ({
    y: yr(s.season), wins: s.wins, losses: 82 - s.wins,
    nRtg: +(s.offRtg - s.defRtg).toFixed(1),
    pct: +(s.pct * 100).toFixed(1),
    fill: ERA_COLORS[s.era] || "#888",
  }));

  const netRtg = SEASONS.map(s => ({
    y: yr(s.season),
    nRtg: +(s.offRtg - s.defRtg).toFixed(1),
    off: s.offRtg, def: s.defRtg,
  }));

  const delta = SEASONS.slice(1).map((s, i) => {
    const d = s.wins - SEASONS[i].wins;
    return { y: yr(s.season), d, fill: d >= 0 ? "#16a34a" : "#dc2626" };
  });

  const brunsonArc = SEASONS.slice(-5).map(s => ({
    s: s.season.slice(2), wins: s.wins,
    nRtg: +(s.offRtg - s.defRtg).toFixed(1),
    ppg: s.leadPPG,
  }));

  const coachMap: Record<string, { w: number; l: number; apps: number }> = {};
  SEASONS.forEach(s => {
    const c = s.coach.split(" / ")[0];
    if (!coachMap[c]) coachMap[c] = { w: 0, l: 0, apps: 0 };
    coachMap[c].w += s.wins; coachMap[c].l += s.losses;
    if (s.playoffs !== "Missed") coachMap[c].apps++;
  });
  const coaches = Object.entries(coachMap)
    .map(([name, d]) => ({ name, ...d, wpct: +(d.w / (d.w + d.l) * 100).toFixed(0) }))
    .sort((a, b) => b.w - a.w);

  const scorerMap: Record<string, { n: number; ppg: number[] }> = {};
  SEASONS.forEach(s => {
    if (!scorerMap[s.leadScorer]) scorerMap[s.leadScorer] = { n: 0, ppg: [] };
    scorerMap[s.leadScorer].n++;
    scorerMap[s.leadScorer].ppg.push(s.leadPPG);
  });
  const topScorers = Object.entries(scorerMap)
    .map(([name, d]) => ({ name, n: d.n, avg: +(d.ppg.reduce((a,v)=>a+v,0)/d.ppg.length).toFixed(1), peak: Math.max(...d.ppg) }))
    .sort((a, b) => b.n - a.n).slice(0, 8);

  const allGames = PLAYOFF_2026.flatMap(r => r.games.map(g => ({
    l: `${r.round.split(" ")[0][0]}${r.round.split(" ")[0].length > 1 ? r.round.split(" ")[0].slice(1, 2) : ""} G${g.game}`,
    jb: g.brunsonPts, kat: g.katPts, mb: g.bridgesPts, w: g.result === "W",
  })));

  const coachNote: Record<string, string> = {
    "Jeff Van Gundy": "8-seed Finals run + 2 ECFs. Massively overperformed roster every year.",
    "Tom Thibodeau": "4 straight winning seasons — first sustained success in 27 years.",
    "Mike Woodson": "54-win season with Melo. Best record since 1996-97.",
    "Isiah Thomas": "GM + Coach simultaneously. Historically disastrous dual-role experiment.",
    "Larry Brown": "$124M payroll, 23 wins, fired after one season.",
    "Mike D'Antoni": "Run-and-gun bridge era. Great offense, no defense.",
  };

  if (!mounted) return null;

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>

      {/* ══ STICKY NAV ════════════════════════════════════════════ */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,250,252,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div style={{ width: 28, height: 28 }}><Ball size={28} /></div>
            <span style={{ fontWeight: 800, fontSize: 14, color: "var(--blue)" }}>NYK FRANCHISE</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {[["Overview","#overview"],["Brunson","#brunson"],["Seasons","#seasons"],["2026","#playoffs"],["Coaching","#coaching"],["Legends","#legends"]].map(([l, h]) => (
              <a key={l} href={h} style={{ padding: "4px 10px", fontSize: 12, color: "var(--muted)", textDecoration: "none", borderRadius: 6, fontWeight: 500, transition: "color .15s" }}
                 onMouseEnter={e => (e.currentTarget.style.color = "var(--blue)")}
                 onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <header style={{ background: "linear-gradient(135deg, #002d5c 0%, #004a80 25%, #006BB6 60%, #0085d4 85%, #F58426 100%)", position: "relative", overflow: "hidden", padding: "0 16px" }}>
        {/* court grid overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 56px),repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 56px)" }} />

        <div className="max-w-5xl mx-auto py-12 sm:py-16 lg:py-20 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">

            {/* left: headline */}
            <div className="fade-up">
              <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(255,255,255,0.6)", marginBottom: 8, textTransform: "uppercase" }}>New York</div>
              <h1 style={{ fontSize: "clamp(52px,10vw,88px)", fontWeight: 900, color: "#fff", lineHeight: 0.9, letterSpacing: "-3px", textShadow: "0 4px 24px rgba(0,0,0,.3)" }}>
                KNICKS
              </h1>
              <div style={{ fontSize: "clamp(13px,2vw,16px)", color: "rgba(255,255,255,0.6)", marginTop: 10, letterSpacing: "0.08em" }}>
                Franchise Dashboard · 1999 Finals → 2026 ECF
              </div>

              {/* hero chips */}
              <div className="flex flex-wrap gap-2 mt-6">
                {[
                  { v: "3-0", l: "ECF Lead" },
                  { v: "53-29", l: "This Season" },
                  { v: "11-2", l: "Playoff Record" },
                  { v: "★ Cup", l: "NBA Cup 2026" },
                ].map(c => (
                  <div key={c.l} className="hero-chip">
                    <span className="hero-chip-v">{c.v}</span>
                    <span className="hero-chip-l">{c.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* right: bouncing ball */}
            <div className="flex flex-col items-center gap-2 self-center sm:self-auto">
              <div className="ball-anim"><Ball size={88} /></div>
              <div className="shadow-anim" style={{ width: 50, height: 10, borderRadius: "50%", background: "rgba(0,0,0,0.35)" }} />
            </div>
          </div>
        </div>
      </header>

      {/* ══ BIG 4 STATS ═══════════════════════════════════════════ */}
      <div id="overview" style={{ background: "var(--blue)", color: "#fff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {[
            { n: totalW, label: "Career Wins", suf: "" },
            { n: playoffSeasons.length, label: "Playoff Appearances", suf: "" },
            { n: missedCount, label: "Missed Playoffs", suf: "" },
            { n: +(bestSeason.pct * 100).toFixed(0), label: "Best Win %", suf: "%" },
          ].map(({ n, label, suf }) => (
            <div key={label} className="text-center">
              <div className="stat-num" style={{ color: "#fff", letterSpacing: "-2px" }}>
                <Counter end={n} suffix={suf} />
              </div>
              <div className="stat-label" style={{ color: "rgba(255,255,255,.65)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 27 SEASONS WINS ═══════════════════════════════════════ */}
      <Sec>
        <Head label="27 Seasons of Data" title="Win totals by season, era by era." sub="Every bar colored by the franchise era it represents. White dashed line = .500." />

        <div className="lift p-5 sm:p-6 mb-5">
          <div className="section-label mb-4">Wins per Season — Era Colored</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={winData} margin={{ left: -16, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="y" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 82]} />
              <Tooltip content={<Tip />} />
              <ReferenceLine y={41} stroke="#94a3b8" strokeDasharray="4 4" />
              <Bar dataKey="wins" name="Wins" radius={[3, 3, 0, 0]}>
                {winData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Era legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            {ERAS.map(e => (
              <div key={e.name} className="flex items-center gap-1.5">
                <div style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{e.name} <span style={{ color: "var(--subtle)" }}>({e.range})</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Win % + Net Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div className="lift p-5">
            <div className="section-label mb-3">Win % Trajectory</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={winData} margin={{ left: -24, right: 4 }}>
                <defs>
                  <linearGradient id="wG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#006BB6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#006BB6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="y" tick={{ fontSize: 8, fill: "#94a3b8" }} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} domain={[15, 70]} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="pct" name="Win %" stroke="#006BB6" fill="url(#wG)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="lift p-5">
            <div className="section-label mb-3" style={{ color: "var(--orange)" }}>Net Rating Over Time</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={netRtg} margin={{ left: -24, right: 4 }}>
                <defs>
                  <linearGradient id="nG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F58426" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#F58426" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="y" tick={{ fontSize: 8, fill: "#94a3b8" }} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="nRtg" name="Net Rtg" stroke="#F58426" fill="url(#nG)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Playoff depth + YoY swings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="lift p-5">
            <div className="section-label mb-3">Playoff Depth</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={SEASONS.map(s => ({
                y: yr(s.season),
                d: s.playoffs === "NBA Finals" ? 4 : s.playoffs.includes("ECF") ? 3 : s.playoffs.includes("Semis") ? 2 : s.playoffs === "Missed" ? 0 : 1,
                fill: s.playoffs === "NBA Finals" ? "#d97706" : s.playoffs.includes("ECF") ? "#F58426" : s.playoffs.includes("Semis") ? "#16a34a" : s.playoffs === "Missed" ? "#e2e8f0" : "#94a3b8",
              }))} margin={{ left: -24, right: 4 }}>
                <XAxis dataKey="y" tick={{ fontSize: 8, fill: "#94a3b8" }} interval={3} />
                <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} ticks={[0,1,2,3,4]} tickFormatter={v => (["","R1","R2","ECF","Fin"] as string[])[v] ?? ""} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="d" name="Round" radius={[2,2,0,0]}>
                  {SEASONS.map((s, i) => {
                    const f = s.playoffs === "NBA Finals" ? "#d97706" : s.playoffs.includes("ECF") ? "#F58426" : s.playoffs.includes("Semis") ? "#16a34a" : s.playoffs === "Missed" ? "#e2e8f0" : "#94a3b8";
                    return <Cell key={i} fill={f} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-3">
              {[["#d97706","Finals"],["#F58426","ECF"],["#16a34a","Semis"],["#94a3b8","R1"],["#e2e8f0","Missed"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c, border: "1px solid #e2e8f0", flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lift p-5">
            <div className="section-label mb-1">Year-over-Year Win Swings</div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>How violently the Knicks yo-yoed</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={delta} margin={{ left: -24, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="y" tick={{ fontSize: 8, fill: "#94a3b8" }} interval={3} />
                <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Bar dataKey="d" name="Win Δ" radius={[2,2,0,0]}>
                  {delta.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Sec>

      <div className="ed-divider max-w-5xl mx-auto" />

      {/* ══ BRUNSON EFFECT ════════════════════════════════════════ */}
      <Sec id="brunson">
        <Head label="The Transformation" title="What changed when Brunson arrived." sub="The single most impactful roster decision in 20 years — for $27M/year." />

        {/* before / after big numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "24px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#dc2626", marginBottom: 16 }}>Before Brunson (2020–22 avg)</div>
            <div className="grid grid-cols-2 gap-4">
              {[["33","Avg Wins"],["−2.4","Net Rtg"],["21st","Off. Rank"],["R1/Miss","Playoff Depth"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#dc2626", letterSpacing: "-1px" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "24px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--blue)", marginBottom: 16 }}>Brunson Era (2023–26 avg)</div>
            <div className="grid grid-cols-2 gap-4">
              {[["50.3","Avg Wins ↑53%"],["+3.7","Net Rtg ↑6.1"],["5th","Off. Rank"],["Semis/ECF","Playoff Depth"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--blue)", letterSpacing: "-1px" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brunson arc chart */}
        <div className="lift p-5 mb-8">
          <div className="section-label mb-1">5-Year Ascent</div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Wins (bars) and Net Rating (dashed line) during the Brunson era</p>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={brunsonArc} margin={{ left: -16, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="s" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[35, 60]} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[-1, 7]} />
              <Tooltip content={<Tip />} />
              <Bar yAxisId="l" dataKey="wins" name="Wins" fill="#006BB625" radius={[3,3,0,0]} />
              <Line yAxisId="l" type="monotone" dataKey="wins" name="Wins" stroke="#006BB6" strokeWidth={3} dot={{ fill: "#006BB6", r: 5, strokeWidth: 0 }} />
              <Line yAxisId="r" type="monotone" dataKey="nRtg" name="Net Rtg" stroke="#F58426" strokeWidth={2} dot={{ fill: "#F58426", r: 4, strokeWidth: 0 }} strokeDasharray="6 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Research Q&A editorial cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
          {/* False hope */}
          <div className="lift p-5 sm:col-span-1">
            <div className="section-label">False Hope Machine?</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 8, lineHeight: 1.25 }}>Yes — 3 waves of optimism, each crushed within a year.</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>1999 Finals → 8 dark years. 2013 title contention → 7 misses in 8 seasons. 2021 return → miss again. Until 2023, the Knicks could not sustain momentum.</div>
          </div>
          {/* Melo */}
          <div className="lift p-5 sm:col-span-1">
            <div className="section-label">Was Melo Blamed Unfairly?</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 8, lineHeight: 1.25 }}>Yes. His 2013 team won 54 games. Then Phil broke everything.</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>When Melo had a real roster he delivered. Phil Jackson&apos;s triangle experiment — not Carmelo — caused the 17-65 disaster. The narrative was lazy and unfair.</div>
          </div>
          {/* Payroll */}
          <div className="lift p-5 sm:col-span-1">
            <div className="section-label">Did High Payroll Hurt?</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 8, lineHeight: 1.25 }}>Yes. $124M payroll → 23 wins in 2005-06.</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>Three top-5 NBA payrolls while posting sub-.350 records. Dolan wrote checks to fix problems that required smart roster construction, not money. 2026&apos;s $235M finally pays off.</div>
          </div>
        </div>

        {/* Payroll bar chart */}
        <div className="lift p-5">
          <div className="section-label mb-3">Payroll vs Wins — Selected Seasons</div>
          <div className="flex flex-col gap-3">
            {[
              { s: "2005-06", pay: "$124M", w: 23, cat: "bad" },
              { s: "2007-08", pay: "$119M", w: 23, cat: "bad" },
              { s: "2012-13", pay: "$97M",  w: 54, cat: "good" },
              { s: "2023-24", pay: "$210M", w: 50, cat: "good" },
              { s: "2025-26", pay: "$235M", w: 53, cat: "good" },
            ].map(r => (
              <div key={r.s} className="flex items-center gap-3">
                <span style={{ fontSize: 11, color: "var(--muted)", width: 44, flexShrink: 0 }}>{r.s.slice(2)}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", width: 44, flexShrink: 0 }}>{r.pay}</span>
                <div className="prog-track flex-1">
                  <div className="prog-fill" style={{ width: `${(r.w / 82) * 100}%`, background: r.cat === "bad" ? "#dc2626" : "#16a34a" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: r.cat === "bad" ? "#dc2626" : "#16a34a", width: 28, textAlign: "right" }}>{r.w}W</span>
              </div>
            ))}
          </div>
        </div>
      </Sec>

      <div className="ed-divider max-w-5xl mx-auto" />

      {/* ══ SEASON EXPLORER ═══════════════════════════════════════ */}
      <Sec id="seasons">
        <Head label="Season Explorer" title="Drill into any of the 28 seasons." sub="Click a year for full stats, context, and key players." />

        {/* Year picker */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {SEASONS.map((s, i) => (
            <button key={i} onClick={() => setSelIdx(i)} style={{
              padding: "5px 9px", fontSize: 11, fontWeight: 700,
              background: selIdx === i ? "var(--blue)" : "var(--surface)",
              color: selIdx === i ? "#fff" : "var(--muted)",
              border: `1px solid ${selIdx === i ? "var(--blue)" : "var(--border)"}`,
              borderRadius: 6, cursor: "pointer", transition: "all .12s",
            }}>
              {yr(s.season).replace("'", "")}
            </button>
          ))}
        </div>

        {/* Selected season card */}
        <div className="lift overflow-hidden mb-8">
          {/* header band */}
          <div style={{ background: ERA_COLORS[sel.era] || "var(--blue)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>{sel.season}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{sel.era} · {sel.coach}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>{sel.wins}-{sel.losses}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)" }}>{pct(sel.pct)} win rate</div>
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            {/* ratings */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { l: "OffRtg", v: sel.offRtg.toFixed(1), good: sel.offRtg > 106 },
                { l: "DefRtg", v: sel.defRtg.toFixed(1), good: sel.defRtg < 106 },
                { l: "NetRtg", v: (sel.offRtg - sel.defRtg).toFixed(1), good: sel.offRtg - sel.defRtg > 0 },
              ].map(r => (
                <div key={r.l} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{r.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: r.good ? "var(--green)" : "var(--red)", letterSpacing: "-0.5px" }}>{r.v}</div>
                </div>
              ))}
            </div>

            {/* stat leaders */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { l: "Top Scorer", name: sel.leadScorer, stat: `${sel.leadPPG} PPG`, c: "var(--orange)" },
                { l: "Top Rebounder", name: sel.leadRebounder, stat: `${sel.leadRPG} RPG`, c: "var(--blue)" },
                { l: "Top Assists", name: sel.leadAssist, stat: `${sel.leadAPG} APG`, c: "#7c3aed" },
              ].map(r => (
                <div key={r.l} style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 3 }}>{r.l}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{r.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: r.c, letterSpacing: "-0.5px" }}>{r.stat}</div>
                </div>
              ))}
            </div>

            {/* playoffs */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="badge" style={{ background: sel.playoffs === "Missed" ? "#fee2e2" : "#dcfce7", color: sel.playoffs === "Missed" ? "#dc2626" : "#16a34a" }}>
                {sel.playoffs === "Missed" ? "MISSED PLAYOFFS" : sel.playoffs.toUpperCase()}
              </span>
              {sel.seed && <span className="badge" style={{ background: "#fff4e6", color: "var(--orange)" }}>#{sel.seed} SEED</span>}
              {sel.playoffs !== "Missed" && <span style={{ fontSize: 12, color: "var(--muted)" }}>{sel.playoffResult}</span>}
            </div>

            {/* all-stars */}
            {sel.allStars.length > 0 && (
              <div className="mb-4">
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>★ All-Stars</div>
                <div className="flex flex-wrap gap-2">
                  {sel.allStars.map(p => <span key={p} style={{ background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{p}</span>)}
                </div>
              </div>
            )}

            {/* key players */}
            <div className="mb-5">
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Key Players</div>
              <div className="flex flex-wrap gap-1.5">
                {sel.keyPlayers.map(p => <span key={p} style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "3px 9px", borderRadius: 6, fontSize: 12 }}>{p}</span>)}
              </div>
            </div>

            {/* note */}
            <div style={{ padding: "12px 16px", background: "#eff6ff", borderRadius: 8, borderLeft: `4px solid ${ERA_COLORS[sel.era] || "var(--blue)"}` }}>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{sel.note}</p>
            </div>
          </div>
        </div>

        {/* Offense vs Defense scatter */}
        <div className="lift p-5">
          <div className="section-label mb-1">Offense vs Defense — All 28 Seasons</div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Top-left = elite two-way team. Bottom-right = bad offense AND defense.</p>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ left: -8, right: 8, top: 8, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="offRtg" name="OffRtg" type="number" domain={[95, 122]} tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Offensive Rating →", position: "insideBottom", offset: -8, fill: "#94a3b8", fontSize: 10 }} />
              <YAxis dataKey="defRtg" name="DefRtg" type="number" domain={[93, 116]} reversed tick={{ fontSize: 10, fill: "#94a3b8" }} label={{ value: "Defensive Rating", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10, dx: 10 }} />
              <ZAxis range={[50, 50]} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as typeof SEASONS[0];
                return (
                  <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#f1f5f9" }}>
                    <div style={{ color: "#F58426", fontWeight: 700 }}>{d.season}</div>
                    <div>Off: {d.offRtg?.toFixed(1)} · Def: {d.defRtg?.toFixed(1)}</div>
                    <div style={{ color: "#4ade80" }}>Net: {((d.offRtg||0)-(d.defRtg||0)).toFixed(1)}</div>
                  </div>
                );
              }} />
              <Scatter data={SEASONS} fill="#006BB6">
                {SEASONS.map((s, i) => <Cell key={i} fill={ERA_COLORS[s.era] || "#888"} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Sec>

      <div className="ed-divider max-w-5xl mx-auto" />

      {/* ══ 2026 PLAYOFF RUN ══════════════════════════════════════ */}
      <Sec id="playoffs">
        <Head label="Live 2026 Playoffs" title="11-2 record. One win from the Finals." sub="Game-by-game log for all 13 playoff games. Brunson / KAT / Bridges scoring breakdown." />

        {/* Round cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {PLAYOFF_2026.map((round, ri) => (
            <div key={ri} className="lift overflow-hidden">
              <div style={{ background: ri === 2 ? "#d97706" : ri === 1 ? "var(--green)" : "var(--blue)", padding: "10px 16px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{round.round}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)" }}>{round.result}</div>
              </div>
              <div style={{ padding: "10px 12px" }}>
                {round.games.map(g => (
                  <div key={g.game} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: g.result === "W" ? "var(--green)" : "var(--red)", width: 12 }}>{g.result}</span>
                    <span style={{ fontSize: 11, color: "var(--text)", fontWeight: 600, flex: 1 }}>{g.score}</span>
                    <span style={{ fontSize: 8, color: "var(--muted)", width: 24 }}>{g.loc}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 9, color: "var(--orange)", fontWeight: 700 }}>{g.brunsonPts}</span>
                      <span style={{ fontSize: 9, color: "var(--blue)", fontWeight: 700 }}>{g.katPts}</span>
                      <span style={{ fontSize: 9, color: "var(--green)", fontWeight: 700 }}>{g.bridgesPts}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Stacked scoring chart */}
        <div className="lift p-5 mb-5">
          <div className="section-label mb-1">Big 3 Scoring — All 13 Games</div>
          <div className="flex gap-4 mb-4">
            {[["var(--orange)","Brunson"],["var(--blue)","KAT"],["var(--green)","Bridges"]].map(([c,n]) => (
              <div key={n} className="flex items-center gap-1.5">
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{n}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={allGames} margin={{ left: -16, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="l" tick={{ fontSize: 8, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="jb" name="Brunson" fill="#F58426" stackId="a" />
              <Bar dataKey="kat" name="KAT" fill="#006BB6" stackId="a" />
              <Bar dataKey="mb" name="Bridges" fill="#16a34a" stackId="a" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ECF stats table */}
        <div className="lift overflow-hidden">
          <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
            <div className="section-label" style={{ color: "var(--gold)" }}>ECF Player Stats vs Cleveland</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  {["Player","PTS","REB","AST","FG%","3P%","+/-"].map(h => <th key={h} style={{ textAlign: h === "Player" ? "left" : "right" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {ECF_STATS.map((p, i) => (
                  <tr key={i} className="row-hover">
                    <td style={{ fontWeight: 700, color: p.role === "Star" ? "var(--blue)" : p.role === "Core" ? "var(--text)" : "var(--muted)" }}>{p.name}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{p.pts.toFixed(1)}</td>
                    <td style={{ textAlign: "right" }}>{p.reb.toFixed(1)}</td>
                    <td style={{ textAlign: "right" }}>{p.ast.toFixed(1)}</td>
                    <td style={{ textAlign: "right", color: p.fgPct >= 50 ? "var(--green)" : "var(--text)" }}>{p.fgPct.toFixed(1)}</td>
                    <td style={{ textAlign: "right", color: p.threePct >= 40 ? "var(--green)" : "var(--text)" }}>{p.threePct.toFixed(0)}</td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: p.pm > 0 ? "var(--green)" : p.pm < 0 ? "var(--red)" : "var(--muted)" }}>{p.pm > 0 ? "+" : ""}{p.pm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Sec>

      <div className="ed-divider max-w-5xl mx-auto" />

      {/* ══ COACHING ══════════════════════════════════════════════ */}
      <Sec id="coaching">
        <Head label="Coaching Records" title="Who squeezed the most from the roster?" sub="27 years of head coaches ranked by win percentage and playoff success." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="lift p-5">
            <div className="section-label mb-4">Win % by Coach</div>
            {coaches.map((c) => (
              <div key={c.name} style={{ marginBottom: 14 }}>
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 6 }}>{c.w}-{c.l} · {c.apps} PO</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 900, color: +c.wpct >= 50 ? "var(--green)" : "var(--red)" }}>{c.wpct}%</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${(c.w/(c.w+c.l))*100}%`, background: +c.wpct >= 50 ? "#16a34a" : "#dc2626" }} />
                </div>
                {coachNote[c.name] && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>{coachNote[c.name]}</div>}
              </div>
            ))}
          </div>

          {/* Leading scorers */}
          <div className="lift p-5">
            <div className="section-label mb-4">Leading Scorer Most Seasons</div>
            {topScorers.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 mb-4">
                <div style={{ fontSize: 18, fontWeight: 900, color: i === 0 ? "var(--orange)" : i <= 2 ? "var(--blue)" : "var(--muted)", width: 20, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>avg {p.avg} PPG · peak {p.peak}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: p.n }).map((_, j) => (
                    <div key={j} style={{ width: 7, height: 22, background: "var(--orange)", borderRadius: 2, opacity: 0.5 + j * 0.1 }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", width: 14, textAlign: "right" }}>{p.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overrated vs underrated */}
        <div className="lift p-5">
          <div className="section-label mb-4">Overrated vs Underrated — The Honest List</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Stephon Marbury",    v: "overrated",   r: "Elite stats, 0 playoff wins. Left for China. Made every locker room worse." },
              { name: "Amar'e Stoudemire",  v: "overrated",   r: "MVP-level debut, then knees ended it. $100M in hindsight." },
              { name: "Kristaps Porzingis", v: "overrated",   r: "Unicorn potential never realized. ACL + trade demand + front office chaos." },
              { name: "David Lee",          v: "underrated",  r: "Two All-Star caliber seasons in NY. Traded just as team was building." },
              { name: "Allan Houston",      v: "underrated",  r: "Carried bad teams for years. His 1999 shot vs Miami is immortal." },
              { name: "Josh Hart",          v: "underrated",  r: "The invisible engine of every Brunson lineup. Hustle plays nobody else makes." },
              { name: "Jalen Brunson",      v: "elite",       r: "$27M/yr → perennial contender. Best value contract in modern NBA?" },
              { name: "Julius Randle",      v: "complicated", r: "One brilliant year (2021 MIP), then inconsistency. Still meaningful contributor." },
            ].map(p => {
              const colors: Record<string,{bg:string;text:string;badge:string}> = {
                overrated: { bg: "#fee2e2", text: "#dc2626", badge: "#dc2626" },
                underrated: { bg: "#dcfce7", text: "#16a34a", badge: "#16a34a" },
                elite:      { bg: "#eff6ff", text: "#006BB6", badge: "#006BB6" },
                complicated:{ bg: "#fef3c7", text: "#d97706", badge: "#d97706" },
              };
              const c = colors[p.v];
              return (
                <div key={p.name} style={{ background: c.bg, borderRadius: 8, padding: "10px 14px", borderLeft: `3px solid ${c.badge}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{p.name}</span>
                    <span className="badge" style={{ background: c.badge, color: "#fff" }}>{p.v}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{p.r}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Sec>

      <div className="ed-divider max-w-5xl mx-auto" />

      {/* ══ LEGENDS & ANOMALIES ═══════════════════════════════════ */}
      <Sec id="legends">
        <Head label="Outliers & Legends" title="The moments that defined 27 years." sub="Catastrophic disasters, historic upsets, legendary runs — ranked by impact." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {ANOMALIES.map((a, i) => {
            const c = {
              legendary:    { bg: "#fef3c7", border: "#d97706", badge: "#d97706", label: "LEGENDARY" },
              historic:     { bg: "#dcfce7", border: "#16a34a", badge: "#16a34a", label: "HISTORIC" },
              catastrophic: { bg: "#fee2e2", border: "#dc2626", badge: "#dc2626", label: "CATASTROPHIC" },
            }[a.severity];
            return (
              <div key={i} style={{ background: c.bg, borderRadius: 10, padding: "16px 18px", borderLeft: `4px solid ${c.border}` }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", lineHeight: 1.25 }}>{a.title}</div>
                  <span className="badge" style={{ background: c.badge, color: "#fff", flexShrink: 0 }}>{c.label}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Best chemistry */}
        <div className="lift p-5 mb-5">
          <div className="section-label mb-4">Best Roster Chemistry</div>
          <div className="flex flex-col gap-4">
            {[
              { name: "2025-26 Core", score: 95, players: "Brunson · KAT · Bridges · OG · Hart", why: "Villanova pipeline + perfectly complementary trades. Every role crystal clear. First time in 27 years everyone knew their job." },
              { name: "1998-99 Finals Run", score: 90, players: "Sprewell · Houston · Ewing · Johnson · Camby", why: "6th-man mentality from every starter. Van Gundy built a brotherhood. No one expected the Finals. That was the point." },
              { name: "2012-13 Melo Squad", score: 82, players: "Anthony · JR Smith · Chandler · Kidd · Felton", why: "Best defensive core in the Melo era. JR won 6th Man of the Year. 54 wins felt earned, not lucky." },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ textAlign: "center", minWidth: 52 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: i === 0 ? "var(--orange)" : "var(--blue)", letterSpacing: "-1px" }}>{t.score}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 600 }}>/ 100</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 500, marginBottom: 4 }}>{t.players}</div>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{t.why}</p>
                  <div className="prog-track mt-3" style={{ maxWidth: 200 }}>
                    <div className="prog-fill" style={{ width: `${t.score}%`, background: i === 0 ? "var(--orange)" : "var(--blue)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hottest at the right time */}
        <div className="lift p-5">
          <div className="section-label mb-4">Hottest at the Right Time</div>
          <div className="flex flex-col gap-4">
            {[
              { yr: "1999", ctx: "8-seed all the way to the Finals — beat the #1, #4, and #2 seeds along the way.", peak: "Sprewell averaged 22 PPG through the Finals run" },
              { yr: "Feb 2012", ctx: "Linsanity — 7-game win streak from sleeping on teammates' couches to the back page of the Post.", peak: "Jeremy Lin: 22.5 PPG over the stretch, 38 vs Lakers" },
              { yr: "2026", ctx: "11-2 in playoffs. Gentleman's sweep of Philly. Up 3-0 on Cleveland in the ECF.", peak: "Brunson averaging 30 PPG in the ECF. Bridges at 69.6% FG." },
            ].map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 14px", background: "#fef3c7", borderRadius: 8, borderLeft: "4px solid var(--gold)" }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: "var(--gold)", minWidth: 56, paddingTop: 1 }}>{h.yr}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{h.ctx}</p>
                  <p style={{ fontSize: 11, color: "var(--muted)" }}>{h.peak}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Sec>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "24px 16px", marginTop: 24 }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Ball size={22} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }}>NYK Franchise Dashboard</span>
          </div>
          <div className="flex gap-6">
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>Twitter / X</a>
            <a href="mailto:t@nyvp.com" style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>t@nyvp.com</a>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>Data through May 24, 2026 · ValueAdd VC</div>
        </div>
      </footer>
    </div>
  );
}
