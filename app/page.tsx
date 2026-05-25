"use client";

import { SEASONS, PLAYOFF_2026, ECF_STATS, ERA_COLORS, ERAS, ANOMALIES } from "@/lib/data";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell, ComposedChart, ReferenceLine, ScatterChart, Scatter, ZAxis,
  Line,
} from "recharts";
import { useState, useEffect } from "react";

function abbr(s: string) { return `'${s.split("-")[0].slice(2)}`; }

interface TipEntry { name?: string; value?: number | string; color?: string; }
const Tip = ({ active, payload, label }: { active?: boolean; payload?: TipEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-[#333] rounded p-2 text-xs text-[#e0e0e0]">
      <div className="font-bold mb-1" style={{ color: "#F58426" }}>{label}</div>
      {payload.map((p: TipEntry, i: number) => (
        <div key={i} style={{ color: p.color || "#ccc" }}>
          {p.name}: {typeof p.value === "number" ? (p.value % 1 !== 0 ? p.value.toFixed(1) : p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

function Ball({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill="#F58426" />
      <circle cx="50" cy="50" r="48" fill="none" stroke="#c0560c" strokeWidth="2" />
      <path d="M 50 2 Q 20 30 20 50 Q 20 70 50 98" stroke="#7a2c00" strokeWidth="2.5" fill="none" />
      <path d="M 50 2 Q 80 30 80 50 Q 80 70 50 98" stroke="#7a2c00" strokeWidth="2.5" fill="none" />
      <path d="M 2 50 Q 26 28 50 28 Q 74 28 98 50" stroke="#7a2c00" strokeWidth="2.5" fill="none" />
      <path d="M 2 50 Q 26 72 50 72 Q 74 72 98 50" stroke="#7a2c00" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export default function Home() {
  const [selectedIdx, setSelectedIdx] = useState(SEASONS.length - 1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sel = SEASONS[selectedIdx];

  const totalW = SEASONS.reduce((a, s) => a + s.wins, 0);
  const totalL = SEASONS.reduce((a, s) => a + s.losses, 0);
  const playoffSeasons = SEASONS.filter(s => s.playoffs !== "Missed");
  const missedCount = SEASONS.filter(s => s.playoffs === "Missed").length;
  const bestSeason = SEASONS.reduce((a, s) => s.pct > a.pct ? s : a);
  const worstSeason = SEASONS.reduce((a, s) => s.pct < a.pct ? s : a);

  const winData = SEASONS.map(s => ({
    abbr: abbr(s.season),
    wins: s.wins, losses: s.losses,
    pct: +(s.pct * 100).toFixed(1),
    nRtg: +(s.offRtg - s.defRtg).toFixed(1),
    fill: ERA_COLORS[s.era] || "#888",
  }));

  const netRtgData = SEASONS.map(s => ({
    abbr: abbr(s.season),
    nRtg: +(s.offRtg - s.defRtg).toFixed(1),
    offRtg: s.offRtg, defRtg: s.defRtg,
  }));

  const deltaData = SEASONS.slice(1).map((s, i) => {
    const delta = s.wins - SEASONS[i].wins;
    return { abbr: abbr(s.season), delta, fill: delta >= 0 ? "#22c55e" : "#ef4444" };
  });

  const brunsonEra = SEASONS.slice(-5).map(s => ({
    season: s.season.slice(2),
    wins: s.wins,
    nRtg: +(s.offRtg - s.defRtg).toFixed(1),
  }));

  const coachMap: Record<string, { w: number; l: number; apps: number }> = {};
  SEASONS.forEach(s => {
    const c = s.coach.split(" / ")[0];
    if (!coachMap[c]) coachMap[c] = { w: 0, l: 0, apps: 0 };
    coachMap[c].w += s.wins; coachMap[c].l += s.losses;
    if (s.playoffs !== "Missed") coachMap[c].apps++;
  });
  const coaches = Object.entries(coachMap)
    .map(([name, d]) => ({ name, ...d, pct: +(d.w / (d.w + d.l) * 100).toFixed(1) }))
    .sort((a, b) => b.w - a.w);

  const scorerMap: Record<string, { seasons: number; ppg: number[] }> = {};
  SEASONS.forEach(s => {
    if (!scorerMap[s.leadScorer]) scorerMap[s.leadScorer] = { seasons: 0, ppg: [] };
    scorerMap[s.leadScorer].seasons++;
    scorerMap[s.leadScorer].ppg.push(s.leadPPG);
  });
  const topScorers = Object.entries(scorerMap)
    .map(([name, d]) => ({ name, seasons: d.seasons, avgPPG: +(d.ppg.reduce((a, v) => a + v, 0) / d.ppg.length).toFixed(1), maxPPG: Math.max(...d.ppg) }))
    .sort((a, b) => b.seasons - a.seasons).slice(0, 8);

  const allGames = PLAYOFF_2026.flatMap(r => r.games.map(g => ({
    label: `${r.round.split(" ")[0]} G${g.game}`,
    brunson: g.brunsonPts, kat: g.katPts, bridges: g.bridgesPts,
    win: g.result === "W",
  })));

  const coachNotes: Record<string, string> = {
    "Jeff Van Gundy": "8-seed Finals run, 2 ECFs. Massively overperformed roster.",
    "Tom Thibodeau": "4 straight winning seasons. First sustained success in 27 years.",
    "Mike Woodson": "54-win season with Melo. Best record since 1997.",
    "Isiah Thomas": "GM + Coach simultaneously. Historically disastrous dual role.",
    "Larry Brown": "$124M payroll, 23 wins, fired after 1 season.",
    "Mike D'Antoni": "Run-and-gun, no defense. Bridge era between disasters.",
  };

  if (!mounted) return null;

  const S = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ fontSize: 11, letterSpacing: 4, color: "#F58426", marginBottom: 4, ...style }}>{children}</div>
  );
  const Sub = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 14, letterSpacing: 1 }}>{children}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", fontFamily: "'Courier New', monospace" }}>

      {/* ── STICKY NAV ─────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "#060a12", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", overflowX: "auto", padding: "0 4px" }}>
          {["Overview","Brunson Effect","Season Lens","Coaching","2026 Run","Anomalies"].map((label, i) => (
            <a key={i} href={`#sec-${i}`} style={{ padding: "10px 12px", fontSize: 9, letterSpacing: 1.5, color: "#6b7280", textDecoration: "none", whiteSpace: "nowrap" }}>
              {label.toUpperCase()}
            </a>
          ))}
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <header style={{ background: "linear-gradient(135deg, #00264d 0%, #003d7a 35%, #006BB6 65%, #0085d1 80%, #F58426 100%)", padding: "40px 20px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)" }} />
        <div style={{ position: "absolute", top: 20, right: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div className="ball-bounce"><Ball size={72} /></div>
          <div className="ball-shadow" style={{ width: 40, height: 8, borderRadius: "50%", background: "rgba(0,0,0,0.4)" }} />
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#ffffff99", marginBottom: 6 }}>NEW YORK</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 0.9, letterSpacing: -2, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>KNICKS</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#ffffff80", marginTop: 8 }}>FRANCHISE DASHBOARD · 1999 FINALS → 2026 ECF</div>
          <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
            {[
              { label: "ECF LEAD", val: "3-0", sub: "vs Cleveland", gold: true },
              { label: "THIS SEASON", val: "53-29", sub: ".646 win%" },
              { label: "PLAYOFF RECORD", val: "11-2", sub: "2026 run" },
              { label: "NBA CUP", val: "★ CHAMPS", sub: "2025-26" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 8, letterSpacing: 2, color: "#ffffff80" }}>{s.label}</div>
                <div style={{ fontSize: s.gold ? 28 : 22, fontWeight: 900, color: s.gold ? "#ffd700" : "#fff", textShadow: s.gold ? "0 0 20px rgba(255,215,0,0.5)" : "none" }}>{s.val}</div>
                <div style={{ fontSize: 8, color: "#ffffff60" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── SECTION 0: OVERVIEW ────────────────────────────────────── */}
      <section id="sec-0" style={{ padding: "24px 16px" }}>
        <S>27 SEASONS AT A GLANCE</S>
        <Sub>Complete franchise history — wins, losses, and the eras that defined them</Sub>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
          {[
            { label: "ALL-TIME W-L", val: `${totalW}-${totalL}`, sub: `${(totalW/(totalW+totalL)*100).toFixed(0)}%` },
            { label: "PLAYOFF APPS", val: String(playoffSeasons.length), sub: `${missedCount} missed` },
            { label: "BEST SEASON", val: `${(bestSeason.pct*100).toFixed(0)}%`, sub: bestSeason.season },
            { label: "WORST SEASON", val: `${(worstSeason.pct*100).toFixed(0)}%`, sub: worstSeason.season },
          ].map((s, i) => (
            <div key={i} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 6, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "#6b7280", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#F58426" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#9ca3af" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>WINS BY SEASON — ERA COLORED</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={winData} barGap={1} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="abbr" tick={{ fontSize: 7, fill: "#555" }} interval={2} />
              <YAxis tick={{ fontSize: 8, fill: "#555" }} domain={[0, 82]} />
              <Tooltip content={<Tip />} />
              <ReferenceLine y={41} stroke="#ffffff15" strokeDasharray="4 4" />
              <Bar dataKey="wins" name="Wins" radius={[2,2,0,0]}>
                {winData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            {ERAS.map(e => (
              <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: e.color }} />
                <span style={{ fontSize: 8, color: "#6b7280" }}>{e.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>WIN % TREND</div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={winData} margin={{ left: -28, right: 4 }}>
                <defs><linearGradient id="pG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F58426" stopOpacity={0.4}/><stop offset="100%" stopColor="#F58426" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="abbr" tick={{ fontSize: 6, fill: "#555" }} interval={4} />
                <YAxis tick={{ fontSize: 7, fill: "#555" }} domain={[15, 70]} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={50} stroke="#ffffff25" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="pct" name="Win %" stroke="#F58426" fill="url(#pG)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#006BB6", marginBottom: 8 }}>NET RATING</div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={netRtgData} margin={{ left: -28, right: 4 }}>
                <defs><linearGradient id="nG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#006BB6" stopOpacity={0.4}/><stop offset="100%" stopColor="#006BB6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="abbr" tick={{ fontSize: 6, fill: "#555" }} interval={4} />
                <YAxis tick={{ fontSize: 7, fill: "#555" }} />
                <Tooltip content={<Tip />} />
                <ReferenceLine y={0} stroke="#ffffff25" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="nRtg" name="Net Rtg" stroke="#006BB6" fill="url(#nG)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>PLAYOFF DEPTH BY SEASON</div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={SEASONS.map(s => ({
              abbr: abbr(s.season),
              depth: s.playoffs === "NBA Finals" ? 4 : s.playoffs.includes("ECF") ? 3 : s.playoffs.includes("Semis") ? 2 : s.playoffs === "Missed" ? 0 : 1,
            }))} margin={{ left: -20, right: 4 }}>
              <XAxis dataKey="abbr" tick={{ fontSize: 7, fill: "#555" }} interval={2} />
              <YAxis tick={{ fontSize: 8, fill: "#555" }} ticks={[0,1,2,3,4]} tickFormatter={v => (["","R1","R2","ECF","Fin"] as string[])[v] ?? ""} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="depth" name="Round" radius={[2,2,0,0]}>
                {SEASONS.map((s, i) => {
                  const fill = s.playoffs === "NBA Finals" ? "#ffd700" : s.playoffs.includes("ECF") ? "#F58426" : s.playoffs.includes("Semis") ? "#22c55e" : s.playoffs === "Missed" ? "#1e293b" : "#6b7280";
                  return <Cell key={i} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 4 }}>YEAR-OVER-YEAR WIN SWINGS</div>
          <div style={{ fontSize: 8, color: "#6b7280", marginBottom: 8 }}>Biggest collapses and turnarounds in franchise history</div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={deltaData} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="abbr" tick={{ fontSize: 7, fill: "#555" }} interval={2} />
              <YAxis tick={{ fontSize: 8, fill: "#555" }} />
              <Tooltip content={<Tip />} />
              <ReferenceLine y={0} stroke="#ffffff25" />
              <Bar dataKey="delta" name="Win Δ" radius={[2,2,0,0]}>
                {deltaData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── SECTION 1: BRUNSON EFFECT ──────────────────────────────── */}
      <section id="sec-1" style={{ padding: "24px 16px", borderTop: "1px solid #1e293b" }}>
        <S>THE BRUNSON EFFECT</S>
        <Sub>What actually changed when Jalen Brunson arrived in 2022?</Sub>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { title: "BEFORE BRUNSON", note: "2020-22 avg", color: "#ef4444", items: [["Avg Wins","33"],["Net Rtg","−2.4"],["Playoff Depth","R1 or miss"],["Top Scorer","Randle ~22ppg"],["Offense Rank","~21st"]] },
            { title: "BRUNSON ERA", note: "2023-26 avg", color: "#F58426", items: [["Avg Wins","50.3 ↑53%"],["Net Rtg","+3.7 ↑6.1"],["Playoff Depth","Semis or ECF"],["Top Scorer","Brunson ~26ppg"],["Offense Rank","~5th"]] },
          ].map((col, ci) => (
            <div key={ci} style={{ background: "#0d1623", border: `1px solid ${ci === 0 ? "#1e293b" : "#006BB6"}`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: col.color, marginBottom: 10 }}>{col.title} <span style={{ color: "#6b7280" }}>({col.note})</span></div>
              {col.items.map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11 }}>
                  <span style={{ color: "#6b7280" }}>{k}</span>
                  <span style={{ color: ci === 1 ? "#22c55e" : "#e8e0d4", fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>BRUNSON-ERA WINS + NET RATING</div>
          <ResponsiveContainer width="100%" height={150}>
            <ComposedChart data={brunsonEra} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="season" tick={{ fontSize: 9, fill: "#6b7280" }} />
              <YAxis yAxisId="l" tick={{ fontSize: 8, fill: "#6b7280" }} domain={[35, 60]} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 8, fill: "#6b7280" }} domain={[-1, 7]} />
              <Tooltip content={<Tip />} />
              <Bar yAxisId="l" dataKey="wins" name="Wins" fill="#006BB640" radius={[2,2,0,0]} />
              <Line yAxisId="l" type="monotone" dataKey="wins" name="Wins" stroke="#006BB6" strokeWidth={2.5} dot={{ fill: "#006BB6", r: 4 }} />
              <Line yAxisId="r" type="monotone" dataKey="nRtg" name="Net Rtg" stroke="#F58426" strokeWidth={2} dot={{ fill: "#F58426", r: 3 }} strokeDasharray="5 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Research answers */}
        <div style={{ display: "grid", gap: 12 }}>

          {/* False hope */}
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 4 }}>THE FALSE HOPE MACHINE</div>
            <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 10, lineHeight: 1.6 }}>Did Knicks fans endure the longest false hope cycle in sports? The data says: probably yes. Three separate &ldquo;it&apos;s finally happening&rdquo; moments derailed within a year each time — until 2023.</div>
            {[
              { year: "1999", event: "NBA FINALS", type: "hope", note: "8-seed miracle" },
              { year: "2001-09", event: "8 of 9 MISSED PLAYOFFS", type: "despair", note: "Isiah era abyss" },
              { year: "2012-13", event: "54 WINS", type: "hope", note: "Division champs" },
              { year: "2014-20", event: "17-65 TWICE", type: "despair", note: "7 misses in 8 years" },
              { year: "2021", event: "BACK TO PLAYOFFS!", type: "hope", note: "Thibs miracle" },
              { year: "2022", event: "MISSED AGAIN", type: "despair", note: "Sophomore slump" },
              { year: "2023-26", event: "4 CONSECUTIVE DEEP RUNS", type: "sustained", note: "First real era since Ewing" },
            ].map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 4, marginBottom: 4, background: ev.type === "hope" ? "#F5842615" : ev.type === "sustained" ? "#006BB615" : "#ef444415", borderLeft: `3px solid ${ev.type === "hope" ? "#F58426" : ev.type === "sustained" ? "#006BB6" : "#ef4444"}` }}>
                <span style={{ fontSize: 8, color: "#6b7280", width: 44 }}>{ev.year}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: ev.type === "hope" ? "#F58426" : ev.type === "sustained" ? "#006BB6" : "#ef4444", flex: 1 }}>{ev.event}</span>
                <span style={{ fontSize: 8, color: "#6b7280" }}>{ev.note}</span>
              </div>
            ))}
          </div>

          {/* Melo reframed */}
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 4 }}>WAS MELO UNFAIRLY BLAMED?</div>
            <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 10, lineHeight: 1.6 }}>Carmelo led the Knicks in scoring for 7 straight seasons. When given a functional roster (2013) he delivered 54 wins. The collapses were front office decisions, not Melo&apos;s performance.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              {[
                { season: "2012-13", ppg: "28.7", wins: "54W", result: "Semis", ok: true },
                { season: "2013-14", ppg: "27.4", wins: "37W", result: "Missed", ok: false },
                { season: "2014-15", ppg: "24.2", wins: "17W", result: "Missed", ok: false },
              ].map(r => (
                <div key={r.season} style={{ background: "#0d1623", borderRadius: 6, padding: 8 }}>
                  <div style={{ fontSize: 8, color: "#6b7280" }}>{r.season}</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#F58426" }}>{r.ppg}</div>
                  <div style={{ fontSize: 9, color: "#e8e0d4" }}>PPG · {r.wins}</div>
                  <div style={{ fontSize: 8, color: r.ok ? "#22c55e" : "#ef4444", marginTop: 2 }}>{r.result}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: 8, background: "#006BB615", borderRadius: 4, borderLeft: "3px solid #006BB6" }}>
              <div style={{ fontSize: 9, color: "#9ca3af", lineHeight: 1.6 }}><strong style={{ color: "#e8e0d4" }}>Verdict:</strong> When the Knicks gave Melo a real supporting cast, they won 54 games. Phil Jackson&apos;s triangle experiment — not Melo — caused the 17-65 season. The narrative was unfair.</div>
            </div>
          </div>

          {/* Payroll */}
          <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 4 }}>DID HIGH PAYROLL HURT?</div>
            <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 10, lineHeight: 1.6 }}>The Knicks held top-5 NBA payrolls while posting sub-.350 records. Dolan wrote big checks to solve problems that required smart front office work, not money.</div>
            {[
              { s: "05-06", pay: "$124M", w: 23, bad: true },
              { s: "06-07", pay: "$128M", w: 33, bad: true },
              { s: "07-08", pay: "$119M", w: 23, bad: true },
              { s: "12-13", pay: "$97M",  w: 54, bad: false },
              { s: "23-24", pay: "$210M", w: 50, bad: false },
              { s: "25-26", pay: "$235M", w: 53, bad: false },
            ].map(r => (
              <div key={r.s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: "#6b7280", width: 34 }}>{r.s}</span>
                <span style={{ fontSize: 9, color: "#e8e0d4", width: 38 }}>{r.pay}</span>
                <div style={{ flex: 1, height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(r.w/82)*100}%`, background: r.bad ? "#ef4444" : "#22c55e", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: r.bad ? "#ef4444" : "#22c55e", width: 20 }}>{r.w}W</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: SEASON LENS ─────────────────────────────────── */}
      <section id="sec-2" style={{ padding: "24px 16px", borderTop: "1px solid #1e293b" }}>
        <S>SEASON EXPLORER</S>
        <Sub>Select any of the 28 seasons for full breakdown</Sub>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
          {SEASONS.map((s, i) => (
            <button key={i} onClick={() => setSelectedIdx(i)} style={{ padding: "4px 6px", fontSize: 9, background: selectedIdx === i ? "#F58426" : "#1e293b", color: selectedIdx === i ? "#000" : "#9ca3af", border: `1px solid ${selectedIdx === i ? "#F58426" : "#374151"}`, borderRadius: 3, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
              {abbr(s.season).replace("'","")}
            </button>
          ))}
        </div>

        <div style={{ background: "#111827", border: `1px solid ${ERA_COLORS[sel.era] || "#1e293b"}`, borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#F58426" }}>{sel.season}</div>
              <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: 1 }}>{sel.era} · {sel.coach}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: sel.pct >= 0.5 ? "#22c55e" : "#ef4444" }}>{sel.wins}-{sel.losses}</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>{(sel.pct*100).toFixed(1)}%</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
            {[
              { label: "OFF RTG", val: sel.offRtg.toFixed(1), color: "#22c55e" },
              { label: "DEF RTG", val: sel.defRtg.toFixed(1), color: "#ef4444" },
              { label: "NET RTG", val: (sel.offRtg-sel.defRtg).toFixed(1), color: sel.offRtg-sel.defRtg>=0?"#22c55e":"#ef4444" },
            ].map(r => (
              <div key={r.label} style={{ background: "#0d1623", borderRadius: 6, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: 8, letterSpacing: 1, color: "#6b7280" }}>{r.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: r.color }}>{r.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { label: "TOP SCORER",    player: sel.leadScorer,    stat: `${sel.leadPPG} PPG`, color: "#F58426" },
              { label: "TOP REBOUNDER", player: sel.leadRebounder,  stat: `${sel.leadRPG} RPG`, color: "#006BB6" },
              { label: "TOP ASSISTS",   player: sel.leadAssist,    stat: `${sel.leadAPG} APG`, color: "#8B5CF6" },
            ].map(s => (
              <div key={s.label} style={{ background: "#0d1623", borderRadius: 6, padding: 8 }}>
                <div style={{ fontSize: 8, letterSpacing: 1, color: "#6b7280" }}>{s.label}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#e8e0d4", marginTop: 2 }}>{s.player}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.stat}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 8, letterSpacing: 1, color: "#6b7280" }}>PLAYOFFS: </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: sel.playoffs === "Missed" ? "#ef4444" : "#22c55e" }}>{sel.playoffs}</span>
            {sel.playoffs !== "Missed" && <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 8 }}>{sel.playoffResult}</span>}
            {sel.seed && <span style={{ fontSize: 10, color: "#ffd700", marginLeft: 8 }}>#{sel.seed} seed</span>}
          </div>

          {sel.allStars.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 8, letterSpacing: 1, color: "#ffd700", marginBottom: 4 }}>★ ALL-STARS</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {sel.allStars.map(p => <span key={p} style={{ background: "#ffd70020", color: "#ffd700", padding: "2px 8px", borderRadius: 4, fontSize: 10 }}>{p}</span>)}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 8, letterSpacing: 1, color: "#6b7280", marginBottom: 4 }}>KEY PLAYERS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {sel.keyPlayers.map(p => <span key={p} style={{ background: "#1e293b", color: "#9ca3af", padding: "2px 6px", borderRadius: 3, fontSize: 9 }}>{p}</span>)}
            </div>
          </div>

          <div style={{ padding: 10, background: "#0d1623", borderRadius: 6, borderLeft: `3px solid ${ERA_COLORS[sel.era] || "#F58426"}` }}>
            <div style={{ fontSize: 10, color: "#e8e0d4", lineHeight: 1.6 }}>{sel.note}</div>
          </div>
        </div>

        {/* Off vs Def scatter */}
        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginTop: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 4 }}>OFFENSE vs DEFENSE — ALL SEASONS</div>
          <div style={{ fontSize: 8, color: "#6b7280", marginBottom: 8 }}>Upper-left quadrant = elite two-way team</div>
          <ResponsiveContainer width="100%" height={210}>
            <ScatterChart margin={{ left: -10, right: 4, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="offRtg" name="OffRtg" type="number" domain={[95, 122]} tick={{ fontSize: 8, fill: "#555" }} label={{ value: "OffRtg →", position: "insideBottom", offset: -2, fill: "#555", fontSize: 8 }} />
              <YAxis dataKey="defRtg" name="DefRtg" type="number" domain={[93, 116]} reversed tick={{ fontSize: 8, fill: "#555" }} label={{ value: "← DefRtg", angle: -90, position: "insideLeft", fill: "#555", fontSize: 8 }} />
              <ZAxis range={[40, 40]} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as typeof SEASONS[0];
                return (
                  <div style={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 6, padding: "6px 10px", fontSize: 10 }}>
                    <div style={{ color: "#F58426", fontWeight: 700 }}>{d.season}</div>
                    <div>Off: {d.offRtg?.toFixed(1)}</div>
                    <div>Def: {d.defRtg?.toFixed(1)}</div>
                    <div style={{ color: "#22c55e" }}>Net: {((d.offRtg||0)-(d.defRtg||0)).toFixed(1)}</div>
                  </div>
                );
              }} />
              <Scatter data={SEASONS} fill="#F58426">
                {SEASONS.map((s, i) => <Cell key={i} fill={ERA_COLORS[s.era] || "#888"} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── SECTION 3: COACHING ────────────────────────────────────── */}
      <section id="sec-3" style={{ padding: "24px 16px", borderTop: "1px solid #1e293b" }}>
        <S>COACHING RECORDS</S>
        <Sub>Which coaches squeezed the most out of their rosters?</Sub>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 14 }}>
          {coaches.map((c, i) => (
            <div key={c.name} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: i === 0 ? "#F58426" : "#6b7280" }}>#{i+1}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e0d4" }}>{c.name}</div>
                    <div style={{ fontSize: 8, color: "#6b7280" }}>{c.apps} playoff appearance{c.apps !== 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: +c.pct >= 50 ? "#22c55e" : "#ef4444" }}>{c.pct}%</div>
                  <div style={{ fontSize: 8, color: "#6b7280" }}>{c.w}-{c.l}</div>
                </div>
              </div>
              <div style={{ height: 4, background: "#1e293b", borderRadius: 3, overflow: "hidden", marginBottom: 3 }}>
                <div style={{ height: "100%", width: `${(c.w/(c.w+c.l))*100}%`, background: +c.pct >= 50 ? "#22c55e" : "#ef4444", borderRadius: 3 }} />
              </div>
              {coachNotes[c.name] && <div style={{ fontSize: 8, color: "#6b7280", fontStyle: "italic" }}>{coachNotes[c.name]}</div>}
            </div>
          ))}
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>LEADING SCORER BY # SEASONS LED</div>
          {topScorers.map((p, i) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#F58426", width: 16 }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e8e0d4" }}>{p.name}</div>
                <div style={{ fontSize: 8, color: "#6b7280" }}>avg {p.avgPPG} PPG · peak {p.maxPPG}</div>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: p.seasons }).map((_, j) => (
                  <div key={j} style={{ width: 8, height: 20, background: "#F58426", borderRadius: 2, opacity: 0.6 + j * 0.05 }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", width: 16 }}>{p.seasons}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>OVERRATED vs UNDERRATED</div>
          {[
            { name: "Stephon Marbury",    verdict: "overrated",   reason: "Elite stats, 0 playoff wins. Left for China. Culture cancer." },
            { name: "Amar'e Stoudemire",  verdict: "overrated",   reason: "Brilliant debut season, then knees. $100M in hindsight." },
            { name: "Kristaps Porzingis", verdict: "overrated",   reason: "Unicorn ceiling never realized. ACL + front office drama." },
            { name: "David Lee",          verdict: "underrated",  reason: "Two All-Star seasons in NY. Traded just as team was built around him." },
            { name: "Allan Houston",      verdict: "underrated",  reason: "Carried bad Knicks teams for years. The shot vs Miami is Knicks lore." },
            { name: "Josh Hart",          verdict: "underrated",  reason: "The engine behind every Brunson lineup. Hustle plays no one else makes." },
            { name: "Jalen Brunson",      verdict: "elite",       reason: "$27M/yr turning the Knicks into perennial contenders. Best value in NBA?" },
          ].map(p => (
            <div key={p.name} style={{ display: "flex", gap: 8, padding: "6px 8px", borderRadius: 4, marginBottom: 4, background: p.verdict==="overrated"?"#ef444410":p.verdict==="elite"?"#006BB615":"#22c55e10", borderLeft:`3px solid ${p.verdict==="overrated"?"#ef4444":p.verdict==="elite"?"#006BB6":"#22c55e"}` }}>
              <span style={{ fontSize: 8, color: p.verdict==="overrated"?"#ef4444":p.verdict==="elite"?"#006BB6":"#22c55e", width: 60, flexShrink: 0, marginTop: 1, letterSpacing: 0.5 }}>{p.verdict.toUpperCase()}</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e8e0d4" }}>{p.name}</div>
                <div style={{ fontSize: 9, color: "#9ca3af", lineHeight: 1.4 }}>{p.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: 2026 PLAYOFF RUN ────────────────────────────── */}
      <section id="sec-4" style={{ padding: "24px 16px", borderTop: "1px solid #1e293b" }}>
        <S>2025-26 PLAYOFF RUN</S>
        <Sub>11-2 record · 3-0 in ECF · One win from the Finals</Sub>

        {PLAYOFF_2026.map((round, ri) => (
          <div key={ri} style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: ri === 2 ? "#ffd700" : "#F58426", marginBottom: 8 }}>{round.round} — {round.result}</div>
            {round.games.map(g => (
              <div key={g.game} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 4, background: "#0d1623", borderLeft: `3px solid ${g.result==="W"?"#22c55e":"#ef4444"}`, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: g.result==="W"?"#22c55e":"#ef4444", width: 12 }}>{g.result}</span>
                <span style={{ fontSize: 10, color: "#e8e0d4", width: 56 }}>{g.score}</span>
                <span style={{ fontSize: 8, color: "#6b7280", width: 28 }}>{g.loc}</span>
                <div style={{ flex: 1, display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 9, color: "#F58426" }}>JB {g.brunsonPts}</span>
                  <span style={{ fontSize: 9, color: "#006BB6" }}>KAT {g.katPts}</span>
                  <span style={{ fontSize: 9, color: "#22c55e" }}>MB {g.bridgesPts}</span>
                </div>
              </div>
            ))}
          </div>
        ))}

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>BIG 3 SCORING — ALL 13 GAMES</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={allGames} margin={{ left: -20, right: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 7, fill: "#555" }} />
              <YAxis tick={{ fontSize: 8, fill: "#555" }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="brunson" name="Brunson" fill="#F58426" stackId="a" />
              <Bar dataKey="kat" name="KAT" fill="#006BB6" stackId="a" />
              <Bar dataKey="bridges" name="Bridges" fill="#22c55e" stackId="a" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#ffd700", marginBottom: 8 }}>ECF PLAYER STATS vs CLEVELAND</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e293b" }}>
                  {["PLAYER","PTS","REB","AST","FG%","3P%","+/-"].map(h => (
                    <th key={h} style={{ padding: "4px 4px", textAlign: h==="PLAYER"?"left":"right", color: "#6b7280", fontSize: 8, letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ECF_STATS.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #1e293b33" }}>
                    <td style={{ padding: "5px 4px", fontWeight: 700, color: p.role==="Star"?"#F58426":p.role==="Core"?"#9ca3af":"#6b7280" }}>{p.name}</td>
                    <td style={{ padding: "5px 4px", textAlign: "right", color: "#e8e0d4" }}>{p.pts.toFixed(1)}</td>
                    <td style={{ padding: "5px 4px", textAlign: "right", color: "#e8e0d4" }}>{p.reb.toFixed(1)}</td>
                    <td style={{ padding: "5px 4px", textAlign: "right", color: "#e8e0d4" }}>{p.ast.toFixed(1)}</td>
                    <td style={{ padding: "5px 4px", textAlign: "right", color: p.fgPct>=50?"#22c55e":"#e8e0d4" }}>{p.fgPct.toFixed(1)}</td>
                    <td style={{ padding: "5px 4px", textAlign: "right", color: p.threePct>=40?"#22c55e":"#e8e0d4" }}>{p.threePct.toFixed(0)}</td>
                    <td style={{ padding: "5px 4px", textAlign: "right", fontWeight: 700, color: p.pm>0?"#22c55e":p.pm<0?"#ef4444":"#9ca3af" }}>{p.pm>0?"+":""}{p.pm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: ANOMALIES ───────────────────────────────────── */}
      <section id="sec-5" style={{ padding: "24px 16px", borderTop: "1px solid #1e293b" }}>
        <S>OUTLIERS & LEGENDS</S>
        <Sub>The moments that defined 27 years of Knicks fandom</Sub>

        {ANOMALIES.map((a, i) => {
          const c = {
            legendary: { bg: "#ffd70015", border: "#ffd700", badge: "#ffd700", label: "LEGENDARY" },
            historic:  { bg: "#22c55e15", border: "#22c55e", badge: "#22c55e", label: "HISTORIC" },
            catastrophic: { bg: "#ef444415", border: "#ef4444", badge: "#ef4444", label: "CATASTROPHIC" },
          }[a.severity];
          return (
            <div key={i} style={{ background: c.bg, borderRadius: 6, padding: 12, marginBottom: 8, borderLeft: `3px solid ${c.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#e8e0d4", paddingRight: 8 }}>{a.title}</div>
                <span style={{ fontSize: 7, letterSpacing: 1, color: c.badge, background: `${c.badge}20`, padding: "2px 6px", borderRadius: 3, flexShrink: 0 }}>{c.label}</span>
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.6 }}>{a.desc}</div>
            </div>
          );
        })}

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginTop: 8 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>BEST ROSTER CHEMISTRY</div>
          {[
            { name: "2025-26 Brunson Core", players: "Brunson-KAT-Bridges-OG-Hart", why: "Villanova pipeline + complementary trades. First time every role was crystal clear.", score: 95 },
            { name: "1998-99 Finals Run", players: "Sprewell-Houston-Ewing-Johnson-Camby", why: "6th-man mentality top to bottom. Van Gundy unlocked something no one expected.", score: 90 },
            { name: "2012-13 Woodson Squad", players: "Melo-JR-Chandler-Kidd-Felton", why: "Best defensive core + elite scoring. JR Smith 6MOY. 54 wins felt earned.", score: 82 },
          ].map((t, i) => (
            <div key={i} style={{ background: "#0d1623", borderRadius: 6, padding: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e8e0d4" }}>{t.name}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#F58426" }}>{t.score}/100</div>
              </div>
              <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 4 }}>{t.players}</div>
              <div style={{ fontSize: 9, color: "#9ca3af", lineHeight: 1.4, marginBottom: 6 }}>{t.why}</div>
              <div style={{ height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${t.score}%`, background: "#F58426", borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#111827", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginTop: 12 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: "#F58426", marginBottom: 8 }}>HOTTEST AT THE RIGHT TIME</div>
          {[
            { yr: "1999", ctx: "Beat #1 Miami as 8-seed → went all the way to Finals", peak: "Sprewell 22 PPG through Finals run" },
            { yr: "Feb 2012", ctx: "Linsanity — 7-game win streak from complete obscurity", peak: "Lin 22.5 PPG over the stretch" },
            { yr: "2026", ctx: "11-2 in playoffs. Swept Philly. Up 3-0 in ECF", peak: "Brunson 30+ PPG in ECF" },
          ].map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "8px 10px", background: "#0d1623", borderRadius: 4, borderLeft: "3px solid #ffd700", marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#ffd700", width: 48, flexShrink: 0 }}>{h.yr}</div>
              <div>
                <div style={{ fontSize: 10, color: "#e8e0d4", marginBottom: 2 }}>{h.ctx}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>{h.peak}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ padding: "20px 16px", borderTop: "1px solid #1e293b", textAlign: "center", background: "#060a12" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 10 }}>
          <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#F58426", textDecoration: "none", letterSpacing: 1 }}>↗ TWITTER</a>
          <a href="mailto:t@nyvp.com" style={{ fontSize: 10, color: "#F58426", textDecoration: "none", letterSpacing: 1 }}>↗ EMAIL</a>
        </div>
        <div style={{ fontSize: 8, letterSpacing: 2, color: "#374151" }}>VALUEADD VC × KNICKS ANALYTICS · DATA THROUGH MAY 24, 2026</div>
        <div style={{ fontSize: 7, letterSpacing: 1, color: "#1e293b", marginTop: 4 }}>Source: Basketball Reference · knicks-franchise-dashboard.jsx</div>
      </footer>
    </div>
  );
}
