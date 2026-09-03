import { useMemo, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";
const LAV = "#9db8ff";

/* ============================================================
   Real k-means on seeded demo points — computed live in the
   browser. This is a methodology demonstration; the points are
   generated, and the page says so. The elbow and silhouette it
   draws are genuine arithmetic, not decoration.
   ============================================================ */

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260214);
function gauss(cx: number, cy: number, sx: number, sy: number): [number, number] {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  const r = Math.sqrt(-2 * Math.log(u));
  return [cx + r * Math.cos(2 * Math.PI * v) * sx, cy + r * Math.sin(2 * Math.PI * v) * sy];
}

const DEMO_PTS: [number, number][] = [];
for (let i = 0; i < 24; i++) DEMO_PTS.push(gauss(72, 62, 15, 12));
for (let i = 0; i < 22; i++) DEMO_PTS.push(gauss(182, 152, 17, 13));
for (let i = 0; i < 18; i++) DEMO_PTS.push(gauss(258, 68, 13, 15));
for (let i = 0; i < 6; i++) DEMO_PTS.push([24 + rand() * 276, 22 + rand() * 176]);

type Pt = [number, number];

function dist2(a: Pt, b: Pt) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function kmeans(points: Pt[], k: number, seed: number) {
  const r = mulberry32(seed);
  // init: k distinct random points
  const centers: Pt[] = [];
  const idx = new Set<number>();
  while (centers.length < k) {
    const i = Math.floor(r() * points.length);
    if (idx.has(i)) continue;
    idx.add(i);
    centers.push(points[i]);
  }
  const labels = new Array(points.length).fill(0);
  for (let it = 0; it < 40; it++) {
    let changed = false;
    for (let i = 0; i < points.length; i++) {
      let best = 0;
      let bd = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist2(points[i], centers[c]);
        if (d < bd) {
          bd = d;
          best = c;
        }
      }
      if (labels[i] !== best) {
        labels[i] = best;
        changed = true;
      }
    }
    const sums = Array.from({ length: k }, () => [0, 0, 0]);
    for (let i = 0; i < points.length; i++) {
      sums[labels[i]][0] += points[i][0];
      sums[labels[i]][1] += points[i][1];
      sums[labels[i]][2] += 1;
    }
    for (let c = 0; c < k; c++) {
      if (sums[c][2] > 0) {
        centers[c] = [sums[c][0] / sums[c][2], sums[c][1] / sums[c][2]];
      }
    }
    if (!changed) break;
  }
  let inertia = 0;
  for (let i = 0; i < points.length; i++) inertia += dist2(points[i], centers[labels[i]]);
  return { labels, centers, inertia };
}

function silhouette(points: Pt[], labels: number[], k: number) {
  if (k < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const own: number[] = [];
    const others: number[][] = Array.from({ length: k }, () => []);
    for (let j = 0; j < points.length; j++) {
      if (j === i) continue;
      const d = Math.sqrt(dist2(points[i], points[j]));
      if (labels[j] === labels[i]) own.push(d);
      else others[labels[j]].push(d);
    }
    const a = own.length ? own.reduce((s, x) => s + x, 0) / own.length : 0;
    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (others[c].length === 0) continue;
      const m = others[c].reduce((s, x) => s + x, 0) / others[c].length;
      if (m < b) b = m;
    }
    if (!isFinite(b) || Math.max(a, b) === 0) continue;
    total += (b - a) / Math.max(a, b);
  }
  return total / points.length;
}

const CLUSTER_COLORS = [CYAN, AMBER, GREEN, ROSE, LAV, "#d9c7ff"];

/* ---------- §40 · Protocol ---------- */

const CLUSTER_FEATURES = [
  "school", "reason", "traveltime", "studytime", "failures",
  "schoolsup", "famsup", "paid", "activities", "higher",
  "internet", "freetime", "goout", "absences",
];

const ALGO_VERDICTS = [
  {
    name: "K-Means",
    verdict: "PRIMARY",
    tone: "green" as const,
    reason: "Standard, fast, centroid-interpretable. The baseline every other method must justify itself against.",
  },
  {
    name: "Gaussian Mixture",
    verdict: "CONDITIONAL",
    tone: "amber" as const,
    reason: "Considered only if silhouette rejects K-Means and soft membership adds a defensible story.",
  },
  {
    name: "DBSCAN",
    verdict: "REJECT",
    tone: "rose" as const,
    reason: "Designed for noise and arbitrary shapes. Student behavioral data has neither — it would invent a noise class.",
  },
  {
    name: "Hierarchical",
    verdict: "REJECT",
    tone: "rose" as const,
    reason: "O(n²) for a dendrogram nobody asked for; the same question is answered by the elbow at a fraction of the cost.",
  },
];

export function ClusterProtocolSection() {
  return (
    <Section
      id="s40"
      index="40"
      kicker="Phase 7 · Protocol"
      title="Clustering Students — Without Inventing Personalities"
      intro="Clustering is the phase most tempted by pseudo-science: the urge to declare four 'student personalities' from 649 rows. This revision pre-commits the antidote — a protocol where k must be earned by evidence, stability is measured, and the output is a description of the data, never a diagnosis of a person."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">CL-1 · What gets clustered</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-dim">
              The <span className="text-ink">14 REV-D KEEP columns</span>, z-scored, on the full
              dataset — clustering has no train/test split, so its honesty rests on{" "}
              <span className="text-ink">stability, not withheld data</span>. Sensitive attributes
              stay excluded: E-3 holds across every task, not just supervision.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {CLUSTER_FEATURES.map((f) => (
                <span
                  key={f}
                  className="mono-label border border-line/80 px-2 py-1 text-[8.5px] text-dim transition-colors duration-200 hover:border-cyan/60 hover:text-cyan"
                >
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">CL-2 · k-selection, in order</p>
              <ol className="mt-3 space-y-2">
                {[
                  ["Elbow", "inertia for k = 2..8, seeded Lloyd runs, diminishing-returns read"],
                  ["Silhouette", "mean per-point score for the same range; below 0.20 everywhere is a finding"],
                  ["Stability", "10 seeds per k; agreement across seeds reported — a cluster that appears and vanishes is noise"],
                  ["Interpretability", "tie-breaker only, and it must be written down before the centroids are inspected"],
                ].map(([k, v], i) => (
                  <li key={k} className="flex gap-3 text-[12.5px] leading-relaxed text-dim">
                    <span className="font-mono text-[11px] text-cyan">{i + 1}.</span>
                    <span>
                      <span className="text-ink">{k}</span> — {v}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-amber">Algorithm verdicts — before any run</p>
            <ul className="mt-4 space-y-3">
              {ALGO_VERDICTS.map((a) => (
                <li key={a.name} className="border border-line/80 bg-base/40 p-3.5 transition-colors duration-200 hover:border-amber/40">
                  <div className="flex items-center justify-between gap-3">
                    <p className="display-head text-[15px] text-ink">{a.name}</p>
                    <Tag tone={a.tone}>{a.verdict}</Tag>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-faint">{a.reason}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-l-2 border-rose/60 pl-3">
              <p className="text-[12px] leading-relaxed text-faint">
                <span className="mono-label text-rose">Honesty clause</span> — the PCA map that
                accompanies the clusters is for <em>inspection</em>. K-Means runs in 14 dimensions;
                a 2-D picture cannot show those distances, and its explained variance will be
                reported so nobody mistakes the map for the territory.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §41 · Live k-means lab ---------- */

export function ElbowLabSection() {
  const [k, setK] = useState(3);

  const runs = useMemo(() => {
    const out: { k: number; labels: number[]; centers: Pt[]; inertia: number; sil: number }[] = [];
    for (let kk = 1; kk <= 6; kk++) {
      const km = kmeans(DEMO_PTS, kk, 42 + kk);
      out.push({ k: kk, ...km, sil: kk === 1 ? 0 : silhouette(DEMO_PTS, km.labels, kk) });
    }
    return out;
  }, []);

  const run = runs[k - 1];
  const maxI = runs[0].inertia;
  const elbowPts = runs
    .map((r, i) => `${20 + i * 36},${110 - (r.inertia / maxI) * 92}`)
    .join(" ");

  return (
    <Section
      id="s41"
      index="41"
      kicker="Phase 7 · Methodology, computed live"
      title="The Elbow & the Silhouette — Doing the Arithmetic"
      intro="This panel runs real Lloyd's k-means in your browser on 70 seeded demo points — generated data, clearly labeled, never confused with the UCI cohort. What it draws is genuine arithmetic: the inertia elbow and mean silhouette your notebook will compute on real features. Drag k and watch the method work."
    >
      <div className="panel relative overflow-hidden p-5 sm:p-7">
        <Corners color={CYAN} />
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="mono-label border border-rose/60 px-2.5 py-1 text-[9px] text-rose">
            DEMO POINTS · METHODOLOGY, NOT UCI DATA
          </span>
          <span className="mono-label text-faint">seed 20260214 · 70 pts · Lloyd, 40 iters max</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          {/* scatter */}
          <div>
            <svg viewBox="0 0 320 220" className="w-full border border-line/70 bg-base/60" role="img" aria-label="k-means scatter demo">
              {/* grid */}
              {[44, 88, 132, 176].map((y) => (
                <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#1c2c44" strokeWidth="0.6" />
              ))}
              {[64, 128, 192, 256].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#1c2c44" strokeWidth="0.6" />
              ))}
              {DEMO_PTS.map((p, i) => (
                <circle
                  key={i}
                  cx={p[0]}
                  cy={p[1]}
                  r="3.4"
                  fill={CLUSTER_COLORS[run.labels[i]]}
                  opacity="0.85"
                  className="transition-all duration-500"
                />
              ))}
              {run.centers.map((c, i) => (
                <g key={i} className="transition-all duration-500" style={{ transform: `translate(${c[0]}px, ${c[1]}px)` }}>
                  <circle r="8" fill="none" stroke="#f4f7ff" strokeWidth="1.2" opacity="0.9" />
                  <line x1="-5" x2="5" y1="0" y2="0" stroke="#f4f7ff" strokeWidth="1.2" />
                  <line x1="0" x2="0" y1="-5" y2="5" stroke="#f4f7ff" strokeWidth="1.2" />
                </g>
              ))}
            </svg>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mono-label text-[8.5px] text-faint">k =</span>
              {[1, 2, 3, 4, 5, 6].map((kk) => (
                <button
                  key={kk}
                  onClick={() => setK(kk)}
                  className={`mono-label border px-2.5 py-1 text-[9.5px] transition-all duration-200 ${
                    k === kk
                      ? "border-cyan bg-cyan/15 text-cyan"
                      : "border-line text-faint hover:border-cyan/50 hover:text-dim"
                  }`}
                >
                  {kk}
                </button>
              ))}
              <span className="ml-auto font-mono text-[11px] text-dim">
                inertia <span className="text-cyan">{Math.round(run.inertia).toLocaleString()}</span>
                <span className="mx-2 text-faint">·</span>
                silhouette <span className="text-amber">{run.sil.toFixed(3)}</span>
              </span>
            </div>
          </div>

          {/* charts */}
          <div className="flex flex-col gap-4">
            <div className="border border-line/70 bg-base/60 p-3.5">
              <p className="mono-label mb-2 text-[8.5px] text-faint">Inertia — the elbow</p>
              <svg viewBox="0 0 220 120" className="w-full">
                {[30, 60, 90].map((y) => (
                  <line key={y} x1="16" y1={y} x2="208" y2={y} stroke="#1c2c44" strokeWidth="0.7" />
                ))}
                <polyline points={elbowPts} fill="none" stroke={CYAN} strokeWidth="1.8" />
                {runs.map((r, i) => {
                  const x = 20 + i * 36;
                  const y = 110 - (r.inertia / maxI) * 92;
                  const active = r.k === k;
                  return (
                    <g key={r.k}>
                      <circle cx={x} cy={y} r={active ? 5 : 3} fill={active ? CYAN : "#0f1c31"} stroke={CYAN} strokeWidth="1.4" className="transition-all duration-300" />
                      <text x={x} y={y - 9} textAnchor="middle" className="fill-[#8fa3c4] font-mono" fontSize="7.5">
                        k={r.k}
                      </text>
                    </g>
                  );
                })}
                <line x1="16" y1="110" x2="208" y2="110" stroke="#2a3d5c" strokeWidth="1" />
              </svg>
            </div>
            <div className="border border-line/70 bg-base/60 p-3.5">
              <p className="mono-label mb-2 text-[8.5px] text-faint">Mean silhouette — the quality check</p>
              <div className="flex h-[72px] items-end gap-2">
                {runs.slice(1).map((r) => {
                  const active = r.k === k;
                  const h = Math.max(4, r.sil * 95);
                  return (
                    <div key={r.k} className="flex flex-1 flex-col items-center gap-1">
                      <span className="font-mono text-[8.5px] text-dim">{r.sil.toFixed(2)}</span>
                      <div
                        className="w-full transition-all duration-500"
                        style={{
                          height: `${h}px`,
                          background: active ? AMBER : "rgba(255,194,102,0.25)",
                          boxShadow: active ? "0 0 14px rgba(255,194,102,0.35)" : "none",
                        }}
                      />
                      <span className="font-mono text-[8px] text-faint">k{r.k}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="border-l-2 border-amber/60 pl-3 text-[12px] leading-relaxed text-faint">
              Reading both together is the protocol: the elbow says where returns flatten, the
              silhouette says whether the partition is even coherent, and ten seeded runs say
              whether it survives luck. A pretty map is worth none of those.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §42 · Naming protocol, practiced ---------- */

interface NameOption { label: string; ok: boolean; rule: string; why: string }
interface ClusterCase { id: string; profile: [string, string][]; options: NameOption[] }

const NAMING_RULES = [
  { id: "R-1", rule: "Describe behavior, not worth", detail: "'High-attendance group', never 'good students'." },
  { id: "R-2", rule: "No ranking words", detail: "No best / worst / top / bottom. Clusters are regions, not a ladder." },
  { id: "R-3", rule: "No destiny words", detail: "No 'future dropouts', no 'bound for'. A centroid is not a fortune." },
  { id: "R-4", rule: "Cohort-level only", detail: "Names describe the group's center — they are never applied to an individual student." },
];

const NAMING_CASES: ClusterCase[] = [
  {
    id: "C1",
    profile: [
      ["studytime", "3.8"], ["absences", "4"], ["goout", "1.9"], ["failures", "1.7"],
    ],
    options: [
      { label: "High-effort, low-attendance group", ok: true, rule: "R-1 ✓", why: "Names the measured behavior at the centroid — nothing more, nothing predicted." },
      { label: "Problem students", ok: false, rule: "R-1 ✗", why: "A judgment, not a description. The same centroid described without the verdict." },
      { label: "Future dropouts", ok: false, rule: "R-3 ✗", why: "A destiny. Centroids do not know futures, and this system refuses to pretend they do." },
    ],
  },
  {
    id: "C2",
    profile: [
      ["studytime", "2.1"], ["absences", "11"], ["goout", "3.4"], ["freetime", "3.6"],
    ],
    options: [
      { label: "The struggling cluster", ok: false, rule: "R-2 ✗", why: "'Struggling' ranks the group against others. Describe what is measured instead." },
      { label: "Socially-active, high-absence group", ok: true, rule: "R-1 ✓", why: "Both centroid readings, named plainly. An advisor can act on this; a label cannot hurt with it." },
      { label: "Students headed for failure", ok: false, rule: "R-3 ✗", why: "Prophecy dressed as a cluster name. The failure model is supervised — clustering must not smuggle it back in." },
    ],
  },
  {
    id: "C3",
    profile: [
      ["studytime", "2.0"], ["absences", "14"], ["higher", "0.42"], ["failures", "0.6"],
    ],
    options: [
      { label: "Low-engagement, uncertain-aspiration group", ok: true, rule: "R-1 ✓", why: "Descriptive and cautious — 'uncertain' flags a reading, not a sentence." },
      { label: "Aimless students", ok: false, rule: "R-1 ✗", why: "A character verdict. The data shows attendance and answers to one survey question — that is all." },
      { label: "Bottom tier", ok: false, rule: "R-2 ✗", why: "A rung on a ladder nobody built. There is no tier, only a region of the feature space." },
    ],
  },
];

export function NamingSection() {
  const [choices, setChoices] = useState<Record<string, number>>({});

  return (
    <Section
      id="s42"
      index="42"
      kicker="Phase 7 · The naming protocol"
      title="Naming Clusters Without Hurting Anyone"
      intro="A cluster name is a small piece of power: it travels into reports, advisor meetings, and a student's head. Four rules govern it, and the worksheet below practices them on example centroid profiles before the real centroids exist."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-green">The four naming rules</p>
            <ul className="mt-4 space-y-3">
              {NAMING_RULES.map((r) => (
                <li key={r.id} className="border-l-2 border-green/50 pl-3.5">
                  <p className="display-head text-[14px] text-ink">
                    <span className="mr-2 font-mono text-[10px] text-green">{r.id}</span>
                    {r.rule}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-faint">{r.detail}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[12px] leading-relaxed text-faint">
                The rule that binds them: <span className="text-ink">the name must survive being read
                aloud to the student it describes.</span> If it would not, it is not a name — it is a
                verdict, and verdicts have no place in a decision-support system.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="space-y-4">
          {NAMING_CASES.map((c, ci) => {
            const chosen = choices[c.id];
            const opt = chosen !== undefined ? c.options[chosen] : undefined;
            return (
              <Reveal key={c.id} delay={ci * 90}>
                <div className="panel p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono-label border border-line px-2 py-1 text-[9px] text-cyan">{c.id}</span>
                    <span className="mono-label text-[8.5px] text-faint">example centroid profile</span>
                    <div className="ml-auto flex flex-wrap gap-1.5">
                      {c.profile.map(([f, v]) => (
                        <span key={f} className="mono-label border border-line/70 px-1.5 py-0.5 text-[8px] text-faint">
                          {f} <span className="text-dim">{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mono-label mt-3 text-[8.5px] text-faint">Choose the defensible name:</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {c.options.map((o, oi) => {
                      const isChosen = chosen === oi;
                      return (
                        <button
                          key={o.label}
                          onClick={() => setChoices((p) => ({ ...p, [c.id]: oi }))}
                          className={`border px-3 py-2.5 text-left text-[12px] leading-snug transition-all duration-200 ${
                            isChosen
                              ? o.ok
                                ? "border-green/70 bg-green/10 text-ink"
                                : "border-rose/70 bg-rose/10 text-ink"
                              : "border-line text-dim hover:border-cyan/50 hover:text-ink"
                          }`}
                        >
                          “{o.label}”
                        </button>
                      );
                    })}
                  </div>
                  {opt && (
                    <p
                      className={`mt-3 border-l-2 pl-3 text-[12.5px] leading-relaxed ${
                        opt.ok ? "border-green/60 text-dim" : "border-rose/60 text-dim"
                      }`}
                    >
                      <span className={`mono-label mr-2 text-[9px] ${opt.ok ? "text-green" : "text-rose"}`}>
                        {opt.rule}
                      </span>
                      {opt.why}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ---------- §43 · Guardrails & artifacts ---------- */

export function GuardrailsSection() {
  return (
    <Section
      id="s43"
      index="43"
      kicker="Phase 7 · Guardrails"
      title="What Personas Are — and Are Never For"
      intro="Data-derived profiles earn their keep by staying in their lane. These guardrails are contractual: they bind the clustering report, the dashboard copy, and anything a future page of the application might want to say about a cluster."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-green">Personas may…</p>
            <ul className="mt-4 space-y-2.5">
              {[
                "Summarize cohort-level patterns — 'this region of students studies more and misses less'.",
                "Help an advisor notice a group whose profile resembles one that benefited from support.",
                "Feed the learning recommender as a coarse prior — one input among many, never the verdict.",
                "Be redrawn, renamed, or discarded when new data shifts the centroids. They are provisional by design.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-dim">
                  <span className="mt-[3px] font-mono text-[10px] text-green">▸</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-rose">…and are never…</p>
            <ul className="mt-4 space-y-2.5">
              {[
                "A psychological type. No MBTI, no temperament, no 'kind of person' — the features cannot support it.",
                "An individual score. A student near a centroid is not 'a member of a personality'.",
                "A feature for the supervised models. Feeding cluster IDs back into the failure model is circularity wearing a costume.",
                "A destiny. Membership is a description of recorded behavior at one point in time.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-dim">
                  <span className="mt-[3px] font-mono text-[10px] text-rose">✕</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">Phase 7 artifacts</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["cluster_report.json", "silhouette_table.csv", "pca_map.png", "seed_stability.json"].map((a) => (
                  <span key={a} className="mono-label border border-line px-2 py-1 text-[8.5px] text-dim">{a}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §44 · Gate G-7 ---------- */

const G7_CHECK = [
  "Feature set frozen: the 14 REV-D KEEP columns, z-scored, sensitive attributes excluded across tasks",
  "k-selection protocol signed: elbow + silhouette over k = 2..8, 10-seed stability, interpretability as logged tie-breaker",
  "Algorithm verdicts recorded — K-Means primary, GMM conditional, DBSCAN and hierarchical rejected with reasons",
  "Naming protocol signed: descriptive, non-ranking, non-destiny, cohort-level — practiced on example centroids",
  "Null-result clause: if silhouette < 0.20 for all k, report 'no defensible structure' and drop personas — optional, never forced",
  "Guardrails contractual: no types, no individual scores, no circular features, no destiny",
];

export function GateG7Section({ g7, onApprove }: { g7: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s44"
      index="44"
      kicker="Gate G-7"
      title="Approval Gate — Phase 7"
      intro="Phase 7 stops here by design. The clustering protocol, naming rules and guardrails are complete; the notebook that runs them on the real cohort begins only when this gate passes."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 7 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G7_CHECK.map((d, i) => (
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
            <Corners color={g7 ? GREEN : AMBER} />
            <p className={`mono-label ${g7 ? "text-green" : "text-amber"}`}>
              {g7 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g7
                ? "Phase 7 approved. Phase 8 — Career Recommendation — unlocked."
                : "Approve the clustering protocol to unlock Phase 8 — Career Recommendation."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g7
                ? "Next: the hybrid compatibility engine — rule-based skill coverage plus model evidence, weighted and explained feature by feature, so a 91% is something you can argue with."
                : "On approval, Phase 8 specifies the career-intelligence engine: how rule-based skill coverage and model outputs combine into an explainable compatibility score — no black-box percentages."}
            </p>

            {!g7 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 7 — proceed to career intelligence</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-7 · DT-CIS-SD-001 · REV G</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any deliverable that calls a cluster a personality, ranks students by membership, or
                feeds cluster IDs back into the supervised models. Those are not scope cuts — they
                are the difference between a tool and a label.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
