import { useMemo, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";
const LAV = "#9db8ff";

/* ============================================================
   §66 · The explanation matrix. Every output the system will
   ever publish gets exactly one explanation method — chosen
   here, before any model exists, so no score can ship silent.
   ============================================================ */

interface MatrixRow {
  output: string;
  ref: string;
  method: string;
  why: string;
  status: "SHIPPED" | "AWAITING RUN 002" | "CONDITIONAL" | "FAKERY REFUSED";
  tone: "green" | "amber" | "cyan" | "rose";
}

const MATRIX: MatrixRow[] = [
  {
    output: "Compatibility score — rule terms",
    ref: "§45 · REV H",
    method: "Structural additive decomposition",
    why: "The terms are a weighted sum by construction. The math IS the explanation — SHAP would only re-derive it slower.",
    status: "SHIPPED",
    tone: "green",
  },
  {
    output: "Gap ranking + learning roadmap",
    ref: "§51/§55 · REV I–J",
    method: "Rule trace (shortfall, rank, unlocks)",
    why: "Deterministic ordering rules. Every step cites the exact shortfall points and the doors it opens.",
    status: "SHIPPED",
    tone: "green",
  },
  {
    output: "Resume extractor + JD matcher scores",
    ref: "§59/§63 · REV K–L",
    method: "Contribution listing with evidence counts",
    why: "Linear weighted overlap. Each skill's contribution is printed; the unknown is disclosed, not absorbed.",
    status: "SHIPPED",
    tone: "green",
  },
  {
    output: "Early-warning failure model (Run 001/002)",
    ref: "§30/§35",
    method: "Exact additive SHAP (LogReg) · TreeSHAP (RF / GB)",
    why: "Local, faithful attributions computed from the trained artifact. Global view = mean |φ| per feature.",
    status: "AWAITING RUN 002",
    tone: "amber",
  },
  {
    output: "MLP candidate — only if trees plateau",
    ref: "§35 · REV F",
    method: "Gradient SHAP — labeled approximate",
    why: "No exact method exists for the network. The approximation is printed on every explanation it produces.",
    status: "CONDITIONAL",
    tone: "cyan",
  },
  {
    output: "Cluster membership",
    ref: "§40–§43 · REV G",
    method: "Centroid profile + distance report",
    why: "Shapley values on k-means are theater — the naming protocol already says what a cluster may claim.",
    status: "FAKERY REFUSED",
    tone: "rose",
  },
  {
    output: "What-If simulator deltas",
    ref: "Phase 15 (contracted)",
    method: "Exact term-level diffs of the REV-H engine",
    why: "Same rule engine, two profiles. The delta decomposes term by term — no approximation needed or allowed.",
    status: "SHIPPED",
    tone: "green",
  },
];

export function ExplanationMatrixSection() {
  return (
    <Section
      id="s66"
      index="66"
      kicker="Phase 13 · Who explains what"
      title="One Explanation Method Per Output — Chosen in Advance"
      intro="Explainability is not a layer you bolt on; it is a column in the spec. Seven output types, seven verdicts — most need no SHAP at all because their math is already transparent, one family genuinely needs it, and one is refused the fake version outright."
    >
      <div className="space-y-2.5">
        {MATRIX.map((m, i) => (
          <Reveal key={m.output} delay={Math.min(i * 50, 250)}>
            <div className="group grid gap-3 border border-line/80 bg-base/40 p-4 transition-all duration-200 hover:border-cyan/40 sm:grid-cols-[1.15fr_1fr_0.85fr] sm:p-5">
              <div>
                <p className="display-head text-[15px] text-ink">{m.output}</p>
                <p className="mt-0.5 font-mono text-[10px] text-faint">{m.ref}</p>
              </div>
              <div>
                <p className="mono-label text-[8.5px] text-cyan">METHOD</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-dim">{m.method}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="w-fit"><Tag tone={m.tone}>{m.status}</Tag></span>
                <p className="text-[11.5px] leading-relaxed text-faint">{m.why}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={140}>
        <div className="mt-5 border-l-2 border-cyan/60 pl-3.5">
          <p className="text-[12.5px] leading-relaxed text-faint">
            <span className="mono-label mr-2 text-cyan">Reading the table</span>
            SHAP is reserved for the one place a learned function actually hides its reasoning — the
            supervised models of Run 001/002. Everywhere the math is a transparent sum, the sum is
            printed. Reaching for SHAP where addition would do is decoration, not explanation.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ============================================================
   §67 · Exact Shapley, live. An additive logistic exhibit on
   five REV-D KEEP features. For additive models the Shapley
   values are EXACT: φᵢ = wᵢ(xᵢ − E[xᵢ]) — no sampling, no
   approximation. The waterfall below is real arithmetic.
   ============================================================ */

const EX_W: { id: string; label: string; w: number; kind: "num" | "bin"; min: number; max: number }[] = [
  { id: "absences", label: "Absences", w: 0.09, kind: "num", min: 0, max: 40 },
  { id: "studytime", label: "Study time", w: -0.55, kind: "num", min: 1, max: 4 },
  { id: "failures", label: "Past failures", w: 0.85, kind: "num", min: 0, max: 3 },
  { id: "higher", label: "Wants higher ed", w: -1.15, kind: "bin", min: 0, max: 1 },
  { id: "famsup", label: "Family support", w: -0.35, kind: "bin", min: 0, max: 1 },
];
const EX_B = -2.3;

// Background: enumerate the training-cohort grid → E[x] per feature
const BG_GRID = { absences: [4, 12, 24], studytime: [1, 2, 3, 4], failures: [0, 1, 2], higher: [0, 1], famsup: [0, 1] };
const E_X: Record<string, number> = {};
{
  const sums: Record<string, number> = { absences: 0, studytime: 0, failures: 0, higher: 0, famsup: 0 };
  let n = 0;
  for (const a of BG_GRID.absences) for (const s of BG_GRID.studytime) for (const f of BG_GRID.failures)
    for (const h of BG_GRID.higher) for (const m of BG_GRID.famsup) {
      sums.absences += a; sums.studytime += s; sums.failures += f; sums.higher += h; sums.famsup += m; n++;
    }
  for (const k of Object.keys(sums)) E_X[k] = sums[k] / n; // 144 profiles
}

const gOf = (x: Record<string, number>) =>
  EX_B + EX_W.reduce((s, f) => s + f.w * x[f.id], 0);
const BASELINE = gOf(E_X);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PRESETS: { name: string; x: Record<string, number> }[] = [
  { name: "typical cohort profile", x: { absences: 10, studytime: 2, failures: 1, higher: 1, famsup: 0 } },
  { name: "engaged student", x: { absences: 2, studytime: 4, failures: 0, higher: 1, famsup: 1 } },
  { name: "at-risk profile", x: { absences: 28, studytime: 1, failures: 2, higher: 0, famsup: 0 } },
];

export function ShapleyLabSection() {
  const [x, setX] = useState<Record<string, number>>({ ...PRESETS[0].x });

  const phi = useMemo(
    () => EX_W.map((f) => ({ ...f, phi: f.w * (x[f.id] - E_X[f.id]) })),
    [x]
  );
  const gX = BASELINE + phi.reduce((s, p) => s + p.phi, 0);
  const prob = sigmoid(gX);

  // sorted contributions for the waterfall (largest |φ| first, after base)
  const ordered = [...phi].sort((a, b) => Math.abs(b.phi) - Math.abs(a.phi));

  // global importance: mean |φ| over 80 seeded random profiles
  const importance = useMemo(() => {
    const r = mulberry32(8811);
    const acc: Record<string, number> = {};
    EX_W.forEach((f) => (acc[f.id] = 0));
    for (let i = 0; i < 80; i++) {
      const xi: Record<string, number> = {
        absences: Math.round(r() * 40),
        studytime: 1 + Math.floor(r() * 4),
        failures: Math.floor(r() * 4),
        higher: r() > 0.5 ? 1 : 0,
        famsup: r() > 0.5 ? 1 : 0,
      };
      EX_W.forEach((f) => (acc[f.id] += Math.abs(f.w * (xi[f.id] - E_X[f.id]))));
    }
    EX_W.forEach((f) => (acc[f.id] /= 80));
    return acc;
  }, []);
  const maxImp = Math.max(...Object.values(importance));

  // waterfall geometry (horizontal, classic SHAP layout)
  const W = 640;
  const rowH = 54;
  const padL = 190;
  const padR = 70;
  const rows = ordered.length + 2; // base + features + output
  const H = rows * rowH + 34;
  const cum: number[] = [BASELINE];
  ordered.forEach((p) => cum.push(cum[cum.length - 1] + p.phi));
  const vmin = Math.min(0, ...cum) - 0.4;
  const vmax = Math.max(0, ...cum) + 0.4;
  const sx = (v: number) => padL + ((v - vmin) / (vmax - vmin)) * (W - padL - padR);

  return (
    <Section
      id="s67"
      index="67"
      kicker="Phase 13 · Exact arithmetic, live"
      title="A Shapley Waterfall You Can Check by Hand"
      intro="For additive models the Shapley values are exact — φᵢ = wᵢ(xᵢ − E[xᵢ]), no sampling, no approximation. This exhibit (five REV-D KEEP features, illustrative coefficients, a 144-profile background) runs that arithmetic in your browser. This is what Run 002's explanations will look like — computed, not narrated."
    >
      <div className="panel relative overflow-hidden p-5 sm:p-7">
        <Corners color={CYAN} />
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="mono-label border border-rose/60 px-2.5 py-1 text-[9px] text-rose">
            EXHIBIT MODEL · ILLUSTRATIVE COEFFICIENTS, NOT FITTED ON UCI
          </span>
          <span className="mono-label text-faint">background: 144 enumerated cohort profiles</span>
        </div>

        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.35fr]">
          {/* controls + readouts */}
          <div className="space-y-4">
            <div>
              <p className="mono-label text-[8.5px] text-faint">Profile — move the case</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setX({ ...p.x })}
                    className="mono-label border border-line px-2.5 py-1 text-[8.5px] text-dim transition-all duration-200 hover:border-cyan/60 hover:text-cyan active:translate-y-[1px]"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 border-t border-line pt-4">
              {EX_W.map((f) => (
                <div key={f.id}>
                  <div className="flex items-baseline justify-between">
                    <span className="mono-label text-[9px] text-dim">{f.label}</span>
                    <span className="font-mono text-[12px] text-cyan">
                      {f.kind === "bin" ? (x[f.id] ? "yes" : "no") : x[f.id]}
                      <span className="ml-2 text-[9px] text-faint">w = {f.w > 0 ? "+" : ""}{f.w}</span>
                    </span>
                  </div>
                  {f.kind === "num" ? (
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      value={x[f.id]}
                      onChange={(e) => setX((p) => ({ ...p, [f.id]: Number(e.target.value) }))}
                      className="twin-range mt-1 h-1 w-full cursor-ew-resize"
                      aria-label={f.label}
                    />
                  ) : (
                    <button
                      onClick={() => setX((p) => ({ ...p, [f.id]: p[f.id] ? 0 : 1 }))}
                      className="mt-1 flex h-5 w-11 items-center border border-line px-[3px] transition-colors duration-200 hover:border-cyan/60"
                      aria-label={`toggle ${f.label}`}
                    >
                      <span
                        className="h-3.5 w-3.5 transition-all duration-200"
                        style={{
                          transform: x[f.id] ? "translateX(22px)" : "translateX(0)",
                          background: x[f.id] ? CYAN : "#2a3d5c",
                          boxShadow: x[f.id] ? `0 0 10px ${CYAN}66` : "none",
                        }}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-line pt-4">
              <div className="border border-line/80 bg-base/50 p-3">
                <p className="mono-label text-[8px] text-faint">g(x) · log-odds</p>
                <p className="mt-1 font-mono text-[20px] text-ink">{gX.toFixed(2)}</p>
              </div>
              <div className="border border-line/80 bg-base/50 p-3">
                <p className="mono-label text-[8px] text-faint">flag probability</p>
                <p className={`mt-1 font-mono text-[20px] ${prob > 0.5 ? "text-rose" : prob > 0.15 ? "text-amber" : "text-green"}`}>
                  {(prob * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="border-l-2 border-amber/60 pl-3 text-[11.5px] leading-relaxed text-faint">
              Decomposition is exact in <span className="text-ink">log-odds space</span> (the additive
              part of the model). Probability is shown for readability; the bars add up to g(x), not
              to the probability — an honesty the pretty version usually hides.
            </p>
          </div>

          {/* waterfall + importance */}
          <div className="space-y-5">
            <div className="border border-line/70 bg-base/60 p-3.5">
              <p className="mono-label mb-1 text-[8.5px] text-faint">SHAP waterfall — exact φ per feature</p>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Shapley waterfall">
                {[...Array(9)].map((_, i) => {
                  const v = vmin + ((vmax - vmin) * i) / 8;
                  return (
                    <g key={i}>
                      <line x1={sx(v)} y1={26} x2={sx(v)} y2={H - 16} stroke="#1c2c44" strokeWidth="0.6" />
                      <text x={sx(v)} y={H - 4} textAnchor="middle" className="fill-[#8fa3c4] font-mono" fontSize="8.5">
                        {v.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
                <line x1={sx(0)} y1={26} x2={sx(0)} y2={H - 16} stroke="#43597e" strokeWidth="1" strokeDasharray="3 3" />

                {/* base row */}
                <g>
                  <text x={padL - 10} y={rowH * 0 + 34} textAnchor="end" className="fill-[#aebddb] font-mono" fontSize="10.5">
                    E[g(x)] baseline
                  </text>
                  <rect
                    x={Math.min(sx(0), sx(BASELINE))}
                    y={22}
                    width={Math.abs(sx(BASELINE) - sx(0))}
                    height={20}
                    fill="#2a3d5c"
                    className="wf-bar"
                  />
                  <text x={sx(BASELINE) + 6} y={36} className="fill-[#aebddb] font-mono" fontSize="10">
                    {BASELINE.toFixed(2)}
                  </text>
                </g>

                {ordered.map((p, i) => {
                  const y0 = 22 + rowH * (i + 1);
                  const a = cum[i];
                  const b = cum[i + 1];
                  const col = p.phi >= 0 ? CYAN : ROSE;
                  return (
                    <g key={p.id}>
                      <line x1={sx(b)} y1={y0 - rowH + 42} x2={sx(b)} y2={y0} stroke="#33486b" strokeWidth="0.8" strokeDasharray="2 3" />
                      <text x={padL - 10} y={y0 + 15} textAnchor="end" className="fill-[#aebddb] font-mono" fontSize="10.5">
                        {p.label} = {p.kind === "bin" ? (x[p.id] ? "yes" : "no") : x[p.id]}
                      </text>
                      <rect
                        x={Math.min(sx(a), sx(b))}
                        y={y0}
                        width={Math.max(1.5, Math.abs(sx(b) - sx(a)))}
                        height={20}
                        fill={col}
                        opacity="0.85"
                        className="wf-bar"
                      />
                      <text
                        x={p.phi >= 0 ? sx(b) + 6 : sx(b) - 6}
                        y={y0 + 14}
                        textAnchor={p.phi >= 0 ? "start" : "end"}
                        className="font-mono"
                        fontSize="10"
                        fill={col}
                      >
                        {p.phi >= 0 ? "+" : ""}{p.phi.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* output row */}
                <g>
                  <text x={padL - 10} y={22 + rowH * (ordered.length + 1) + 15} textAnchor="end" className="fill-[#f4f7ff] font-mono" fontSize="11" fontWeight="700">
                    g(x)
                  </text>
                  <rect
                    x={Math.min(sx(0), sx(gX))}
                    y={22 + rowH * (ordered.length + 1)}
                    width={Math.abs(sx(gX) - sx(0))}
                    height={20}
                    fill={AMBER}
                    className="wf-bar"
                  />
                  <text x={sx(gX) + 6} y={22 + rowH * (ordered.length + 1) + 14} className="fill-[#ffc266] font-mono" fontSize="10.5" fontWeight="700">
                    {gX.toFixed(2)}
                  </text>
                </g>
              </svg>
            </div>

            <div className="border border-line/70 bg-base/60 p-3.5">
              <p className="mono-label mb-2 text-[8.5px] text-faint">
                Global importance — mean |φ| over 80 seeded profiles (the other SHAP view)
              </p>
              <div className="space-y-1.5">
                {[...EX_W].sort((a, b) => importance[b.id] - importance[a.id]).map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <span className="mono-label w-28 shrink-0 text-[8.5px] text-dim">{f.label}</span>
                    <div className="h-2.5 flex-1 bg-line/30">
                      <div
                        className="h-full bg-gradient-to-r from-lav/70 to-lav transition-all duration-500"
                        style={{ width: `${(importance[f.id] / maxImp) * 100}%`, boxShadow: `0 0 8px ${LAV}44` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-[10px] text-dim">{importance[f.id].toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* exactness ladder */}
        <div className="mt-6 grid gap-3 border-t border-line pt-5 md:grid-cols-4">
          {[
            { m: "Logistic regression", s: "Exact additive SHAP — this same arithmetic", c: GREEN },
            { m: "Random forest / GB", s: "TreeSHAP — exact for trees, polynomial time", c: CYAN },
            { m: "MLP (if it enters)", s: "Gradient SHAP — approximate, labeled as such", c: AMBER },
            { m: "k-means clusters", s: "Refused — centroid + distance, no Shapley theater", c: ROSE },
          ].map((e) => (
            <div key={e.m} className="border-l-2 pl-3 transition-transform duration-200 hover:translate-x-0.5" style={{ borderColor: e.c }}>
              <p className="display-head text-[13px] text-ink">{e.m}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-faint">{e.s}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
   §68 · The limits, named. XAI answers HOW the model decided —
   never WHY reality behaves. These four limits print wherever
   explanations render.
   ============================================================ */

const LIMITS = [
  {
    id: "X-1",
    title: "Correlated features split the credit",
    body: "Absences and past failures move together in real cohorts. Shapley divides contribution between them rather than assigning independent causal blame — a φ is 'contribution to this model', never 'independent effect in the world'.",
  },
  {
    id: "X-2",
    title: "The background dataset is a choice",
    body: "Every φ is measured against E[x] of a chosen cohort. A different background shifts the baseline and every bar. Ours is versioned and logged as an artifact (background_v{n}.json), so explanations are reproducible — and auditable.",
  },
  {
    id: "X-3",
    title: "It explains the model, not the world",
    body: "'The model flagged this student because absences contribute +1.2' is complete. Any sentence that continues '…and therefore the student will fail' has left the mathematics and entered fortune-telling.",
  },
  {
    id: "X-4",
    title: "Explanations can be gamed",
    body: "A dishonest model can be paired with friendly-looking explanations. Ours are recomputed from the deployed artifact and its logged background in CI (test T-8) — an explanation that cannot be regenerated from the real model is not shown.",
  },
];

const COST_TABLE = [
  { method: "Exact enumeration", cost: "O(2ⁿ) coalitions", exact: "exact", note: "infeasible past ~15 features" },
  { method: "Additive / linear SHAP", cost: "O(n)", exact: "exact", note: "this lab; Run 001 LogReg" },
  { method: "TreeSHAP", cost: "O(T·L·D²)", exact: "exact for trees", note: "Run 002 forest / boosting" },
  { method: "KernelSHAP", cost: "O(samples)", exact: "approximate", note: "fallback for exotic models" },
  { method: "GradientSHAP", cost: "O(backward passes)", exact: "approximate", note: "MLP candidate only, labeled" },
];

export function XaiLimitsSection() {
  return (
    <Section
      id="s68"
      index="68"
      kicker="Phase 13 · The limits, named"
      title="What XAI Can and Cannot Buy You"
      intro="Explanations are sold as a cure-all; they are actually a receipt. Four limits are contractual here — each prints wherever an explanation renders — and the cost table fixes which algorithm pays for which guarantee."
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {LIMITS.map((l, i) => (
            <Reveal key={l.id} delay={i * 70}>
              <div className="panel h-full border-rose/25 p-4 transition-colors duration-200 hover:border-rose/50">
                <p className="mono-label text-rose">{l.id}</p>
                <p className="display-head mt-1.5 text-[14.5px] leading-snug text-ink">{l.title}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-faint">{l.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <div className="panel h-full p-5">
            <p className="mono-label text-cyan">Method cost table</p>
            <table className="mt-3 w-full text-left">
              <thead>
                <tr className="border-b border-line">
                  {["Method", "Cost", "Guarantee"].map((h) => (
                    <th key={h} className="mono-label pb-2 pr-2 text-[8px] text-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COST_TABLE.map((r) => (
                  <tr key={r.method} className="border-b border-line/50 transition-colors duration-150 hover:bg-cyan/[0.04]">
                    <td className="py-2 pr-2 text-[12px] text-dim">{r.method}</td>
                    <td className="py-2 pr-2 font-mono text-[10.5px] text-faint">{r.cost}</td>
                    <td className="py-2">
                      <span className={`font-mono text-[10px] ${r.exact.startsWith("exact") ? "text-green" : "text-amber"}`}>{r.exact}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">{COST_TABLE.map((r) => r.note).filter((_, i) => i === 0).join("")}</p>
            <div className="mt-4 border-l-2 border-green/60 pl-3">
              <p className="mono-label text-[8.5px] text-green">The no-explain-no-publish rule</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-faint">
                The application's <span className="font-mono text-[11px] text-dim">ScoreCard</span> component
                requires an explanation payload. Missing payload → the card renders{" "}
                <span className="text-rose">EXPLANATION REFUSED</span> instead of a number. Test T-8 asserts
                it. A silent score is a defect, not a feature.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §69 · Gate G-13 ---------- */

const G13_CHECK = [
  "Explanation matrix signed: seven output types, one method each — SHAP reserved for learned functions only",
  "Method-by-family ladder frozen: exact additive (LogReg) → TreeSHAP (trees) → labeled-approximate (MLP) → refused (k-means)",
  "Exact-Shapley lab on record (§67): φ verifiable by hand, on five real REV-D KEEP features, 144-profile background",
  "Four XAI limits contractual (X-1…X-4), printed wherever explanations render",
  "No-explain-no-publish enforced: ScoreCard contract + test T-8; background dataset versioned as an artifact",
  "Run 002 deliverables extend to include shap_values.json + background_v1.json, checksummed like every artifact",
];

export function GateG13Section({ g13, onApprove }: { g13: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s69"
      index="69"
      kicker="Gate G-13"
      title="Approval Gate — Phase 13"
      intro="Phase 13 stops here by design. The explanation architecture is complete; the SHAP artifacts themselves arrive with Run 002, computed from the real model — never before."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 13 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G13_CHECK.map((d, i) => (
                <li key={d} className="flex items-start gap-2.5 text-[13.5px] text-dim">
                  <svg viewBox="0 0 16 16" className="mt-[3px] h-3.5 w-3.5 shrink-0 text-green" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.5 8.5 L6.5 12.5 L13.5 4" />
                  </svg>
                  <span>
                    <span className="mr-2 font-mono text-[10px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel relative overflow-hidden border-amber/40 p-6 sm:p-8">
            <Corners color={g13 ? GREEN : AMBER} />
            <p className={`mono-label ${g13 ? "text-green" : "text-amber"}`}>
              {g13 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g13
                ? "Phase 13 approved. Phase 14 — the Digital Twin itself — unlocked."
                : "Approve the explanation architecture to unlock Phase 14 — the Digital Twin."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g13
                ? "Next: the twin at last — its schema, its write path (validated per §28), its versioned timeline, and the contract that every stored value traces to a source the student can correct."
                : "On approval, Phase 14 specifies the Digital Twin: normalized storage of every profile dimension, REV-D-validated writes, append-only history, and the student's right to correct any field."}
            </p>

            {!g13 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 13 — proceed to the Digital Twin</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-13 · DT-CIS-SD-001 · REV M</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any explanation invented for the model, any SHAP plot computed on a different
                artifact than the one deployed, and any cluster 'explanation' that the naming
                protocol would forbid. The receipt must match the transaction.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
