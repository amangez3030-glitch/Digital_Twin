import { useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";

/* ============================================================
   PHASE 6 · Advanced ML — selection machinery, decided before
   any run. Candidates, nested CV, the evidence rule, model card.
   ============================================================ */

type CandStatus = "ACTIVE" | "CONDITIONAL";
interface Candidate {
  id: string;
  name: string;
  family: string;
  status: CandStatus;
  gate?: string;
  space: string[];
  why: string;
  xai: string;
}

const CANDIDATES: Candidate[] = [
  {
    id: "C-1",
    name: "GradientBoostingClassifier",
    family: "Ensemble · boosting",
    status: "ACTIVE",
    space: [
      "n_estimators {200, 400}",
      "learning_rate {0.05, 0.1}",
      "max_depth {3, 5}",
      "subsample {0.8, 1.0}",
    ],
    why: "The question this phase exists to answer: does boosting beat the bagging reference bar on this small tabular data? 32 configurations, nested CV.",
    xai: "TreeExplainer-compatible — if it wins, SHAP is free.",
  },
  {
    id: "C-2",
    name: "XGBClassifier",
    family: "Ensemble · boosting",
    status: "CONDITIONAL",
    gate: "Unlocked only if C-1 beats Random Forest on outer CV. Otherwise it stays a line in the report — scope control, not a snub.",
    space: [
      "n_estimators {300}",
      "learning_rate {0.05, 0.1}",
      "max_depth {4, 6}",
      "reg_lambda {1, 3}",
    ],
    why: "Regularized boosting. Included because Phase 1 promised the comparison — gated so the surface stays honest.",
    xai: "TreeExplainer-compatible.",
  },
  {
    id: "C-3",
    name: "LinearSVC",
    family: "Margin classifier",
    status: "ACTIVE",
    space: ["C {0.1, 1, 10}", "class_weight {None, balanced}"],
    why: "A second linear reference: if the problem is nearly linear, the simplest model should say so loudly. Calibration (Platt) added if the hybrid scorer needs probabilities.",
    xai: "Coefficients = global explanation.",
  },
  {
    id: "C-4",
    name: "MLPClassifier",
    family: "Deep learning",
    status: "CONDITIONAL",
    gate: "Unlocked only if trees plateau — no candidate beats RF by the margin. Small-n tabular data rarely justifies DL; this candidate exists so that claim is tested, not assumed.",
    space: [
      "hidden {64, 128} × {1, 2} layers",
      "dropout {0, 0.3}",
      "early stopping on inner CV",
    ],
    why: "The DL representative. If it underperforms, that is a result worth reporting — rule 2: never hide a failed model.",
    xai: "Permutation-importance surrogate (documented in §05).",
  },
];

export function CandidatesSection() {
  return (
    <Section
      id="s35"
      index="35"
      kicker="Phase 6 · Candidates"
      title="Four Candidates Enter the Ring"
      intro="Phase 1 promised a comparison chosen by evidence, not by complexity. Here are the entrants — two active, two gated. The gates are the honesty: XGBoost and the MLP must earn their way in, and a model that never enters still appears in the report as a documented decision."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {CANDIDATES.map((c, i) => (
          <Reveal key={c.id} delay={i * 80}>
            <div
              className={`panel group relative h-full overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] ${
                c.status === "CONDITIONAL" ? "border-amber/30" : "border-cyan/25"
              }`}
            >
              <span
                className={`stamp pointer-events-none absolute -right-4 top-5 rotate-[8deg] border-2 px-2.5 py-1 opacity-60 transition-opacity duration-300 group-hover:opacity-100 ${
                  c.status === "CONDITIONAL" ? "border-amber/70 text-amber" : "border-cyan/70 text-cyan"
                }`}
              >
                <span className="mono-label text-[9px]">{c.status}</span>
              </span>

              <p className="mono-label text-faint">
                {c.id} · {c.family.toUpperCase()}
              </p>
              <p className="mt-1.5 font-mono text-[15px] font-semibold text-ink">{c.name}</p>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {c.space.map((s) => (
                  <span
                    key={s}
                    className="mono-label border border-line bg-panel2 px-2 py-1 text-[9px] text-dim transition-colors duration-200 group-hover:border-line2"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <p className="mt-3.5 text-[13px] leading-relaxed text-dim">{c.why}</p>

              <div className="mt-3 flex items-center gap-2 border-t border-line/70 pt-3">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="5.5" />
                  <path d="M8 5 v3 l2.2 1.6" />
                </svg>
                <p className="font-mono text-[10.5px] text-faint">{c.xai}</p>
              </div>

              {c.gate && (
                <div className="mt-3 border border-dashed border-amber/40 bg-amber/5 p-3">
                  <p className="mono-label text-[8.5px] text-amber">INCLUSION GATE</p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-amber/90">{c.gate}</p>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- nested CV schematic ---------- */
const ROW_Y0 = 46;
const ROW_H = 48;
const ROW_STEP = 56;
const X0 = 64;
const SEG_W = 116;

export function NestedCVSection() {
  return (
    <Section
      id="s36"
      index="36"
      kicker="Phase 6 · Protocol"
      title="Nested CV — Tuning Without Telling"
      intro="Hyperparameter tuning is a decision, and decisions leak. Nested cross-validation keeps the estimate honest: tuning happens only inside each outer training block, so the reported number is what genuinely unseen data can expect — not what the tuning process already saw."
    >
      <Reveal>
        <div className="panel p-4 sm:p-6">
          <svg viewBox="0 0 660 330" className="w-full" role="img" aria-label="Nested cross-validation: five outer folds, each with three inner tuning folds inside its training block">
            {/* outer frame */}
            <rect x="56" y="34" width="598" height="272" fill="none" stroke="#1d2c4c" strokeWidth="1" />

            {Array.from({ length: 5 }).map((_, k) => {
              const y = ROW_Y0 + k * ROW_STEP;
              return (
                <g key={k}>
                  <text x="4" y={y + ROW_H / 2 + 3} fontSize="9" fill="#5a6b8c" fontFamily="ui-monospace, monospace">
                    O{k + 1}/5
                  </text>
                  {Array.from({ length: 5 }).map((_, j) => {
                    const x = X0 + j * SEG_W;
                    const isTest = j === k;
                    return (
                      <g key={j}>
                        <rect
                          x={x + 1.5}
                          y={y}
                          width={SEG_W - 3}
                          height={ROW_H}
                          fill={isTest ? "rgba(255,194,102,0.13)" : "rgba(107,225,255,0.06)"}
                          stroke={isTest ? "rgba(255,194,102,0.75)" : "rgba(107,225,255,0.32)"}
                          strokeWidth="1"
                        />
                        {isTest ? (
                          <text x={x + SEG_W / 2} y={y + ROW_H / 2 + 3} fontSize="9.5" fill="#ffc266" textAnchor="middle" letterSpacing="3" fontFamily="ui-monospace, monospace">
                            TEST
                          </text>
                        ) : (
                          <>
                            <line x1={x + SEG_W / 3} y1={y + 7} x2={x + SEG_W / 3} y2={y + ROW_H - 7} stroke="#2c3e66" strokeWidth="1" strokeDasharray="3 4" />
                            <line x1={x + (2 * SEG_W) / 3} y1={y + 7} x2={x + (2 * SEG_W) / 3} y2={y + ROW_H - 7} stroke="#2c3e66" strokeWidth="1" strokeDasharray="3 4" />
                          </>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* travelling scan = one outer iteration at a time */}
            <g className="nest-scan">
              <rect x="58" y={ROW_Y0 - 5} width="594" height={ROW_H + 10} fill="rgba(107,225,255,0.05)" stroke="rgba(107,225,255,0.5)" strokeWidth="1" strokeDasharray="7 6" />
            </g>

            <text x="660" y="324" fontSize="9" fill="#5a6b8c" textAnchor="end" fontFamily="ui-monospace, monospace">
              inner 3-fold CV tunes on TRAIN only · outer fold TESTs the tuned model
            </text>
          </svg>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/70 pt-4">
            <span className="flex items-center gap-2 font-mono text-[10.5px] text-dim">
              <span className="inline-block h-2.5 w-2.5 border border-cyan/60 bg-cyan/10" /> TRAIN — tuned inside
            </span>
            <span className="flex items-center gap-2 font-mono text-[10.5px] text-dim">
              <span className="inline-block h-2.5 w-2.5 border border-amber/70 bg-amber/15" /> TEST — never tuned on
            </span>
            <span className="flex items-center gap-2 font-mono text-[10.5px] text-dim">
              <span className="inline-block h-2.5 w-4 border border-dashed border-cyan/60" /> scan = one outer iteration
            </span>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "OUTER LOOP", v: "5 stratified folds — each held out once as an unbiased estimate of generalization." },
          { k: "INNER LOOP", v: "3 stratified folds inside each outer TRAIN block — the only place hyperparameters are chosen." },
          { k: "WHY NESTED", v: "Tuning on the outer fold leaks the selection decision into the estimate. Nesting keeps the number honest." },
          { k: "COST", v: "≤ 4 candidates × 32 combos × 5 outer × 3 inner ≈ 2,000 fits — minutes on a laptop. Cheap enough to do it right." },
        ].map((b, i) => (
          <Reveal key={b.k} delay={i * 70}>
            <div className="panel panel-hover h-full p-4">
              <p className="mono-label text-cyan">{b.k}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-dim">{b.v}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- the evidence rule ---------- */
const RULES = [
  { n: "R-1", rule: "Primary metric is outer-CV macro-F1, reported as mean ± sd across the five folds. Never a single split.", why: "Small data flatters single splits; the interval is the finding." },
  { n: "R-2", rule: "Simplicity ladder: a candidate wins only if it beats the current champion by more than the margin. Random Forest is the starting champion.", why: "Complexity must purchase measured accuracy — not the other way around." },
  { n: "R-3", rule: "If no candidate clears the margin, the Random Forest baseline wins and the null result is reported in full.", why: "A baseline that could not be beaten is a strong, honest result." },
  { n: "R-4", rule: "Training time and fold variance enter the card. A half-point bought with 40× runtime is a finding, not a win.", why: "The twin must stay demo-able on a laptop." },
  { n: "R-5", rule: "The TEST split stays untouched until winner and hyperparameters are frozen — then exactly one evaluation.", why: "The §22 contract, extended to model selection." },
];

/* Hypothetical rows — invented to demonstrate R-2, never measurements */
const HYPO = [
  { rung: 1, name: "Logistic Regression", f1: 0.782, sd: 0.031 },
  { rung: 2, name: "Linear SVC", f1: 0.812, sd: 0.028 },
  { rung: 3, name: "Random Forest (baseline)", f1: 0.831, sd: 0.022 },
  { rung: 4, name: "Gradient Boosting", f1: 0.842, sd: 0.041 },
];

export function EvidenceSection() {
  const [margin, setMargin] = useState(1);
  const m = margin / 100;

  let champ = HYPO[0];
  const marks = HYPO.map((r, i) => {
    if (i === 0) return { r, beat: true, first: true, needs: 0, champName: champ.name };
    const champBefore = champ;
    const beat = r.f1 > champBefore.f1 + m;
    if (beat) champ = r;
    return { r, beat, first: false, needs: champBefore.f1 + m, champName: champ.name };
  });
  const winner = champ.name;

  return (
    <Section
      id="s37"
      index="37"
      kicker="Phase 6 · Selection"
      title="The Evidence Rule — Decided Before Any Run"
      intro="Five rules decide the winner, and they are written down now, while nobody knows the numbers. That is the point: a selection rule drafted after seeing results is a rationalization."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* rules */}
        <div className="space-y-3">
          {RULES.map((r, i) => (
            <Reveal key={r.n} delay={i * 60}>
              <div className="panel panel-hover flex gap-4 p-4">
                <p className="display-head shrink-0 text-xl text-amber">{r.n}</p>
                <div>
                  <p className="text-[13.5px] leading-relaxed text-ink">{r.rule}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-faint">{r.why}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* interactive walkthrough */}
        <Reveal delay={120}>
          <div className="panel relative h-full overflow-hidden p-5 sm:p-6">
            <Corners color="#ff8b8b" />
            <span className="stamp pointer-events-none absolute -right-3 top-6 rotate-[10deg] border-2 border-rose/70 px-3 py-1 text-rose">
              <span className="mono-label text-[9px]">HYPOTHETICAL VALUES</span>
            </span>

            <p className="mono-label text-cyan">Reading the ladder — a worked example</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
              Drag the margin and watch rule R-2 pick the winner. These four numbers are invented
              to demonstrate the rule — Run 002 replaces every one of them with a measurement.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <span className="mono-label text-[9px] text-faint">MARGIN</span>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.25}
                value={margin}
                onChange={(e) => setMargin(parseFloat(e.target.value))}
                className="h-1 flex-1 cursor-pointer appearance-none bg-line accent-cyan"
                aria-label="Simplicity margin in percentage points"
              />
              <span className="mono-label w-12 text-right text-[11px] text-cyan">{margin.toFixed(2)}%</span>
            </div>

            <ul className="mt-5 space-y-2">
              {marks.map(({ r, beat, first, needs }) => {
                const isChamp = r.name === winner;
                return (
                  <li
                    key={r.name}
                    className={`flex items-center gap-3 border p-3 transition-all duration-300 ${
                      isChamp ? "border-cyan/60 bg-cyan/5 shadow-[0_0_20px_rgba(107,225,255,0.08)]" : "border-line/70"
                    }`}
                  >
                    <span className="mono-label w-12 shrink-0 text-[9px] text-faint">RUNG {r.rung}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[13px] ${isChamp ? "text-cyan" : "text-ink"}`}>{r.name}</p>
                      <p className="font-mono text-[10.5px] text-faint">
                        {r.f1.toFixed(3)} ± {r.sd.toFixed(3)}
                        {!first && (
                          <span className="ml-2">
                            needed &gt; {needs.toFixed(3)}
                          </span>
                        )}
                      </p>
                    </div>
                    {first ? (
                      <Tag tone="dim">SEED</Tag>
                    ) : beat ? (
                      <Tag tone="green">CLIMBS</Tag>
                    ) : (
                      <Tag tone="rose">SHORT</Tag>
                    )}
                    {isChamp && <Tag tone="cyan">CHAMPION</Tag>}
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">WINNER AT MARGIN {margin.toFixed(2)}%</p>
              <p className="display-head mt-1 text-xl text-cyan">{winner}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
                {winner === "Gradient Boosting"
                  ? "At this margin the boost barely clears the bar — note how its wide ± sd makes the climb fragile."
                  : "At this margin, the simpler model holds the ladder. Complexity did not pay for itself."}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- model card anatomy ---------- */
const CARD_FIELDS = [
  { k: "Model & version", v: "— filled by Run 002", awaiting: true },
  { k: "Training data", v: "— row count + sha256, filled by Run 002", awaiting: true },
  { k: "Features (14)", v: "school, reason, traveltime, studytime, failures, schoolsup, famsup, paid, activities, higher, internet, freetime, goout, absences", awaiting: false },
  { k: "Target", v: "fail := (G3 < 10) — frozen at REV C, §23", awaiting: false },
  { k: "Protocol", v: "Nested CV · 5 outer × 3 inner, stratified · TEST once — frozen at REV E", awaiting: false },
  { k: "Metrics", v: "— macro-F1 mean±sd, ROC-AUC, confusion matrix, calibration", awaiting: true },
  { k: "Intended use", v: "Early-warning signal for the twin's academic dimension — decision support only", awaiting: false },
  { k: "Out of scope", v: "Employment prediction, grading, any decision about a person without a human in the loop", awaiting: false },
  { k: "Limitations", v: "Secondary-school population (UCI); proxy features only; no claim about any individual's future", awaiting: false },
  { k: "Lineage", v: "— commit hash + artifact checksums, filled by Run 002", awaiting: true },
];

export function ModelCardSection() {
  return (
    <Section
      id="s38"
      index="38"
      kicker="Phase 6 · Documentation"
      title="The Model Card — Written Before the Model"
      intro="Ethics item E-8 is enforced operationally: the card's protocol fields are filled now, from approved revisions, and only measurement fields may be completed by the run. A card written after the demo is marketing; this one is a contract."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.25fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Run 002 — one command</p>
            <div className="mt-3 border border-line bg-deep p-3">
              <p className="font-mono text-[11.5px] leading-relaxed text-green">
                <span className="text-faint">$</span> python -m src.models.run_advanced \<br />
                <span className="pl-4">--run 002 --emit-card</span>
              </p>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-dim">
              The command emits three pinned artifacts, each checksummed into the evidence chain:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                ["models/winner.joblib", "the selected pipeline, frozen"],
                ["model_card.md", "this card, measurement fields completed"],
                ["evidence/run_002.json", "outer-CV metrics per candidate + timing"],
              ].map(([f, d]) => (
                <li key={f} className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[11px] text-cyan">{f}</span>
                  <span className="text-[11.5px] text-faint">— {d}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">Why the card first</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Intended use, limitations and out-of-scope statements are commitments about the
                system — they do not depend on which model wins. Filling them now proves they are
                not being reverse-engineered from the results.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel relative overflow-hidden p-5 sm:p-6">
            <Corners color="#6be1ff" />
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <p className="display-head text-lg text-ink">MODEL CARD — SPECIMEN</p>
              <Tag tone="amber">4 FIELDS AWAIT RUN 002</Tag>
            </div>
            <dl className="mt-4 divide-y divide-line/70">
              {CARD_FIELDS.map((f) => (
                <div key={f.k} className="grid gap-1 py-2.5 sm:grid-cols-[130px_1fr] sm:gap-4">
                  <dt className="mono-label pt-[2px] text-[8.5px] text-faint">{f.k.toUpperCase()}</dt>
                  <dd className={`font-mono text-[11.5px] leading-relaxed ${f.awaiting ? "text-amber/80" : "text-dim"}`}>
                    {f.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- gate G-6 ---------- */
const G6_CHECK = [
  "Candidate grid C-1..C-4 with search spaces — two active, two with written inclusion gates",
  "Nested-CV protocol: 5 outer × 3 inner, tuning confined to inner folds",
  "Evidence rules R-1..R-5, including the simplicity ladder and the margin",
  "Null-result clause — the baseline can win, and that gets reported in full",
  "Model-card anatomy with protocol fields pre-filled from approved revisions",
  "Run 002 runbook — one command, three checksummed artifacts",
];

export function GateG6Section({ g6, onApprove }: { g6: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s39"
      index="39"
      kicker="Gate G-6"
      title="Approval Gate — Phase 6"
      intro="Phase 6 stops here by design. The selection machinery is on record; Run 002 — and Phase 7, which clusters student personas — begin only when this gate passes."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 6 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G6_CHECK.map((d, i) => (
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
            <Corners color={g6 ? "#7ce7a5" : "#ffc266"} />
            <p className={`mono-label ${g6 ? "text-green" : "text-amber"}`}>
              {g6 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g6
                ? "Phase 6 approved. Phase 7 — Student Clustering — unlocked."
                : "Approve Phase 6 to unlock Phase 7 — Student Clustering."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g6
                ? "Next: K-Means over standardized skill and behavior features, with k justified by elbow and silhouette, PCA for the 2-D map — and labels that stay descriptive, never psychological."
                : "On approval, Phase 7 derives data-driven student profiles: K-Means with a statistically justified k, a PCA projection for inspection, and an honesty clause — clusters describe the data, not the person."}
            </p>

            {!g6 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 6 — proceed to clustering</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: "#7ce7a5" }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-6 · DT-CIS-SD-001 · REV F</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate does NOT decide</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                It does not pick the winner — Run 002 does, under rules R-1..R-5. If the winner
                turns out to be the Random Forest baseline, that is a legitimate, reportable
                outcome of this phase, not a failure of it.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
