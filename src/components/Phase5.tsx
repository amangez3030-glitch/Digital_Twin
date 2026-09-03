import { useMemo, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";
import { useReveal } from "../hooks";

/* ============================================================
   PHASE 5 · Baseline Models — REV E
   The harness is code, so it ships. The results are not yet
   measured, so the table ships empty — by design. The metric
   machinery ships interactive, on an explicit worked example.
   ============================================================ */

function Code({ lines, title }: { lines: string[]; title: string }) {
  return (
    <div className="overflow-hidden border border-line bg-deep/80">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <p className="mono-label text-[8.5px] text-faint">{title}</p>
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-green/60" />
        </div>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[11px] leading-[1.75]">
        {lines.map((l, i) => (
          <div key={i} className={l.trim().startsWith("#") || l.trim().startsWith('"""') ? "text-faint" : l.trim().startsWith('"') && l.includes(":") ? "text-cyan/80" : "text-dim"}>
            {l || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}

const HARNESS = [
  '"""baselines/run_baselines.py — Run 001 harness.',
  "Trains LogReg + Random Forest through the REV D pipeline.",
  "CV inside TRAIN · TEST touched exactly once · evidence to disk.\"\"\"",
  "import json, time",
  "import numpy as np",
  "from sklearn.linear_model import LogisticRegression",
  "from sklearn.ensemble import RandomForestClassifier",
  "from sklearn.model_selection import StratifiedKFold, cross_validate",
  "from sklearn.metrics import (accuracy_score, precision_score,",
  "    recall_score, f1_score, roc_auc_score, confusion_matrix)",
  "from src.preprocess.pipeline import build_pipeline, prepare_xy",
  "",
  "SEED = 42",
  "MODELS = {",
  '    "logreg": LogisticRegression(max_iter=2000, random_state=SEED),',
  '    "rf": RandomForestClassifier(n_estimators=300, random_state=SEED),',
  "}",
  "",
  "def main():",
  "    X_train, y_train, X_test, y_test = prepare_xy()  # 60/20/20, stratified",
  "    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)",
  "    report = {}",
  "    for name, model in MODELS.items():",
  "        pipe = build_pipeline(model)               # REV D ColumnTransformer",
  '        cvr = cross_validate(pipe, X_train, y_train, cv=cv,',
  '            scoring=["accuracy", "precision", "recall", "f1", "roc_auc"])',
  "        t0 = time.time()",
  "        pipe.fit(X_train, y_train)                 # fit on TRAIN only",
  "        prob = pipe.predict_proba(X_test)[:, 1]    # TEST touched once",
  "        yhat = prob > 0.5",
  '        report[name] = {',
  '            "cv_f1_mean": float(np.mean(cvr["test_f1"])),',
  '            "cv_f1_std":  float(np.std(cvr["test_f1"])),',
  '            "test": {',
  '                "accuracy":  accuracy_score(y_test, yhat),',
  '                "precision": precision_score(y_test, yhat, zero_division=0),',
  '                "recall":    recall_score(y_test, yhat, zero_division=0),',
  '                "f1":        f1_score(y_test, yhat, zero_division=0),',
  '                "roc_auc":   roc_auc_score(y_test, prob),',
  '                "confusion": confusion_matrix(y_test, yhat).tolist(),',
  "            },",
  '            "fit_seconds": round(time.time() - t0, 3),',
  "        }",
  '    with open("reports/run_001_baselines.json", "w") as f:',
  "        json.dump(report, f, indent=2)",
  '    # ^ evidence file. The document reads it — never writes it.',
  "",
  'if __name__ == "__main__":',
  "    main()",
];

const RESULT_COLS = ["MODEL", "ACC", "PREC", "REC", "F1", "ROC-AUC", "FOLD σ", "FIT s"];
const RESULT_ROWS = ["Logistic Regression", "Random Forest"];

const CARD_STUB: [string, string][] = [
  ["Model family", "(filled by Run 001)"],
  ["Dataset", "UCI Student Performance @ intake checksum — REV B register"],
  ["Features", "14 KEEP columns via REV D ColumnTransformer"],
  ["Target", "fail := (G3 < 10), per subject file"],
  ["Split", "60/20/20 stratified · 5-fold CV inside TRAIN"],
  ["Seed", "42 — pinned in code, not in prose"],
  ["Commit hash", "(pinned at run time)"],
  ["Known limits", "binary fail-detection task; the occupation model arrives in Phase 6 with proxy labels and the model-card sentence"],
];

/* ---------- §30 · Baseline harness + frozen-empty results ---------- */
export function HarnessSection() {
  return (
    <Section
      id="s30"
      index="30"
      kicker="Phase 5 · Deliverable"
      title="Two Models, One Harness, Zero Results"
      intro="The harness below is final code — everything it produces is evidence this document reads, never writes. The results table on the right is deliberately empty: Run 001 has not been executed, and filling these cells early would be exactly the fabrication this project is built to prevent."
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <Code lines={HARNESS} title="baselines/run_baselines.py · 46 lines · reviewed at G-4 discipline" />
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal delay={100}>
            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <p className="mono-label text-cyan">Run 001 — results table</p>
                <Tag tone="amber">NOT YET EXECUTED</Tag>
              </div>
              <div className="overflow-x-auto px-4 py-3">
                <table className="w-full min-w-[430px] border-collapse font-mono text-[11px]">
                  <thead>
                    <tr>
                      {RESULT_COLS.map((c) => (
                        <th key={c} className="mono-label border-b border-line px-2 py-2 text-left text-[8px] text-faint">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RESULT_ROWS.map((r) => (
                      <tr key={r} className="group">
                        <td className="border-b border-line/60 px-2 py-2.5 font-sans text-[12px] text-dim">{r}</td>
                        {Array.from({ length: 7 }).map((_, i) => (
                          <td key={i} className="border-b border-line/60 px-2 py-2.5 text-center text-faint transition-colors group-hover:text-line2">—</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-line bg-panel2/60 px-4 py-2.5 font-mono text-[10px] leading-relaxed text-faint">
                These cells are contractual blanks. Any number appearing here before{" "}
                <span className="text-cyan">python -m baselines.run_baselines</span> has executed is a defect, not a draft.
              </p>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="panel p-4">
              <p className="mono-label text-faint">Model card — stub, completed at run time</p>
              <dl className="mt-3 space-y-1.5">
                {CARD_STUB.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-3 border-b border-line/50 pb-1.5 text-[11.5px]">
                    <dt className="mono-label pt-[2px] text-[8px] text-faint">{k}</dt>
                    <dd className={`font-mono ${v.startsWith("(") ? "text-faint" : "text-dim"}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal delay={140}>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            { t: "LogReg is the reference bar", b: "Every Phase 6 candidate must beat its CV macro-F1 by a meaningful margin — or it does not ship. Complexity that buys nothing is reported as a negative result, not hidden." },
            { t: "RF is the strong simple default", b: "SHAP-compatible and likely the eventual winner. If Phase 6 confirms that, it is a legitimate outcome — evidence over ambition — and the model card will say so plainly." },
            { t: "Every mean ships with its fold σ", b: "On ~650 rows, single-number metrics flatter. The standard deviation across the five folds is part of the result, and calibration is checked because these probabilities will feed the hybrid compatibility score." },
            { t: "One command, one evidence file", b: "run_baselines.py writes reports/run_001_baselines.json — checksummed and committed. The notebook, the report and the defense all read the same artifact." },
          ].map((x) => (
            <div key={x.t} className="panel panel-hover border-l-2 border-l-cyan/50 p-4">
              <p className="display-head text-[14px] text-ink">{x.t}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{x.b}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §31 · Confusion matrix lab ---------- */
function MetricBar({ label, value, color, note }: { label: string; value: number; color: string; note: string }) {
  const pct = Math.round(value * 1000) / 10;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="mono-label text-[9px] text-faint">{label}</p>
        <p className="display-head text-lg" style={{ color }}>{Number.isFinite(value) ? pct.toFixed(1) + "%" : "—"}</p>
      </div>
      <div className="mt-1 h-[5px] w-full bg-panel2">
        <div className="h-full transition-all duration-300" style={{ width: `${Number.isFinite(value) ? Math.min(100, pct) : 0}%`, background: color }} />
      </div>
      <p className="mt-1 font-mono text-[9.5px] text-faint">{note}</p>
    </div>
  );
}

export function ConfusionLabSection() {
  const [tp, setTp] = useState(9);
  const [fp, setFp] = useState(4);
  const [fn, setFn] = useState(3);
  const [tn, setTn] = useState(24);

  const acc = (tp + tn) / Math.max(1, tp + fp + fn + tn);
  const prec = tp / Math.max(0.0001, tp + fp);
  const rec = tp / Math.max(0.0001, tp + fn);
  const f1 = (2 * prec * rec) / Math.max(0.0001, prec + rec);
  const total = tp + fp + fn + tn;

  const cells = [
    { k: "TP", v: tp, set: setTp, label: "True Positive", color: "#7ce7a5", meaning: "correctly warned — flagged, and did fail" },
    { k: "FP", v: fp, set: setFp, label: "False Positive", color: "#ffc266", meaning: "false alarm — flagged, would have passed" },
    { k: "FN", v: fn, set: setFn, label: "False Negative", color: "#ff8b8b", meaning: "missed warning — passed the screen, then failed" },
    { k: "TN", v: tn, set: setTn, label: "True Negative", color: "#8fa7c9", meaning: "correctly cleared — no flag, did pass" },
  ];

  return (
    <Section
      id="s31"
      index="31"
      kicker="Phase 5 · Metric machinery"
      title="The Confusion Matrix, Understood Before It Is Measured"
      intro="Before the notebook produces a confusion matrix, the decision it encodes has to be understood. Drag the four counts — the arithmetic below is live, and so is the asymmetry: for a fail-warning system a false negative is a student who fails unseen; a false positive is one unnecessary conversation."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* the matrix */}
        <Reveal>
          <div className="panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="mono-label text-cyan">Interactive matrix · n = {total} students</p>
              <Tag tone="dim">LIVE ARITHMETIC</Tag>
            </div>
            {/* column headers */}
            <div className="mb-1 grid grid-cols-[70px_1fr_1fr] gap-1.5">
              <div />
              <p className="mono-label text-center text-[8px] text-faint">ACTUAL: FAIL</p>
              <p className="mono-label text-center text-[8px] text-faint">ACTUAL: PASS</p>
            </div>
            {[0, 1].map((row) => (
              <div key={row} className="mb-1.5 grid grid-cols-[70px_1fr_1fr] items-stretch gap-1.5">
                <p className="mono-label flex items-center justify-center border border-line/50 bg-panel2/50 text-center text-[7.5px] leading-tight text-faint">
                  {row === 0 ? "PREDICTED: FAIL" : "PREDICTED: PASS"}
                </p>
                {[0, 1].map((col) => {
                  const c = cells[row * 2 + col];
                  return (
                    <div key={c.k} className="panel p-3 transition-colors" style={{ borderColor: `${c.color}55` }}>
                      <div className="flex items-center justify-between">
                        <p className="mono-label text-[8px]" style={{ color: c.color }}>{c.k}</p>
                        <p className="display-head text-xl" style={{ color: c.color }}>{c.v}</p>
                      </div>
                      <p className="mono-label mt-0.5 text-[7.5px] text-faint">{c.label}</p>
                      <p className="mt-1.5 text-[10.5px] leading-snug text-faint">{c.meaning}</p>
                      <input
                        type="range" min={0} max={50} value={c.v}
                        onChange={(e) => c.set(Number(e.target.value))}
                        className="mt-2 w-full" aria-label={`${c.label} count`}
                        style={{ accentColor: c.color }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
            <p className="mt-3 border-t border-line pt-3 font-mono text-[10px] leading-relaxed text-faint">
              For this task the errors are not symmetric: <span className="text-rose">FN = a missed warning</span> costs a
              student the year; <span className="text-amber">FP = a false alarm</span> costs an advisor twenty minutes.
              That asymmetry is why recall is reported prominently — and why the operating threshold may move in Phase 6.
            </p>
          </div>
        </Reveal>

        {/* live metrics */}
        <Reveal delay={120}>
          <div className="panel h-full p-5">
            <p className="mono-label text-cyan">Derived metrics — recomputed on every drag</p>
            <div className="mt-5 space-y-5">
              <MetricBar label="ACCURACY — (TP+TN)/n" value={acc} color="#6be1ff" note="Dominant when classes balance; misleading when they don't" />
              <MetricBar label="PRECISION — TP/(TP+FP)" value={prec} color="#ffc266" note="Of those flagged, the share that truly failed" />
              <MetricBar label="RECALL — TP/(TP+FN)" value={rec} color="#ff8b8b" note="Of true failures, the share the system caught" />
              <MetricBar label="F1 — harmonic mean of P & R" value={f1} color="#7ce7a5" note="The single compromise number; never the whole story" />
            </div>
            <div className="mt-6 border border-line/70 bg-panel2/50 p-3.5">
              <p className="mono-label text-[8.5px] text-faint">Why both models report all four</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-dim">
                A tuned Random Forest can trade recall for precision invisibly; Logistic Regression
                cannot hide its trade-off at all. Reporting the full matrix for both — plus ROC-AUC,
                which is threshold-free — is how Phase 6 will compare them without flattering either.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §32 · ROC / AUC worked example ---------- */
const EXAMPLE = [
  { id: 1, y: 1, p: 0.92 },
  { id: 2, y: 1, p: 0.85 },
  { id: 3, y: 0, p: 0.78 },
  { id: 4, y: 1, p: 0.61 },
  { id: 5, y: 0, p: 0.55 },
  { id: 6, y: 0, p: 0.38 },
  { id: 7, y: 1, p: 0.22 },
  { id: 8, y: 0, p: 0.1 },
];

// ROC points (FPR, TPR) after ranking by p descending — hand-checkable.
const ROC_PTS: [number, number][] = [
  [0, 0], [0, 0.25], [0, 0.5], [0.25, 0.5], [0.25, 0.75],
  [0.5, 0.75], [0.75, 0.75], [0.75, 1], [1, 1],
];
const AUC = 0.75; // trapezoid sum of the polygon above — verifiable on paper

function RocPlot({ k }: { k: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const X = (fpr: number) => 34 + fpr * 196;
  const Y = (tpr: number) => 226 - tpr * 196;
  const line = ROC_PTS.map(([f, t]) => `${X(f)},${Y(t)}`).join(" ");
  const area = `${ROC_PTS.map(([f, t]) => `${X(f)},${Y(t)}`).join(" ")} ${X(1)},${Y(0)} ${X(0)},${Y(0)}`;
  const [cf, ct] = ROC_PTS[k];

  return (
    <div ref={ref} className={`reveal ${visible ? "in" : ""}`}>
      <svg viewBox="0 0 260 260" className="w-full" role="img" aria-label="ROC curve constructed from the eight-row worked example">
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={X(g)} y1={Y(0)} x2={X(g)} y2={Y(1)} stroke="#1c2b45" strokeWidth="1" />
            <line x1={X(0)} y1={Y(g)} x2={X(1)} y2={Y(g)} stroke="#1c2b45" strokeWidth="1" />
            <text x={X(g)} y={244} textAnchor="middle" fontSize="8" fill="#5b7396" fontFamily="monospace">{g}</text>
            <text x={26} y={Y(g) + 3} textAnchor="end" fontSize="8" fill="#5b7396" fontFamily="monospace">{g}</text>
          </g>
        ))}
        {/* chance diagonal */}
        <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke="#33445f" strokeDasharray="4 4" strokeWidth="1" />
        {/* AUC area — sweeps in on reveal */}
        <polygon points={area} fill="#6be1ff" opacity="0.13" className="roc-area" />
        {/* curve */}
        <polyline points={line} fill="none" stroke="#6be1ff" strokeWidth="2" />
        {/* operating point at threshold k */}
        <circle cx={X(cf)} cy={Y(ct)} r="6" fill="#081120" stroke="#ffc266" strokeWidth="2" className="transition-all duration-300" />
        <circle cx={X(cf)} cy={Y(ct)} r="2" fill="#ffc266" className="transition-all duration-300" />
        <text x={140} y={24} fontSize="10" fill="#8fa7c9" fontFamily="monospace">
          AUC = {AUC.toFixed(2)} · shaded area, trapezoid-summed
        </text>
        <text x={230} y={130} fontSize="8" fill="#5b7396" fontFamily="monospace" textAnchor="end">FPR →</text>
        <text x={40} y={34} fontSize="8" fill="#5b7396" fontFamily="monospace">↑ TPR</text>
      </svg>
    </div>
  );
}

export function RocSection() {
  const [k, setK] = useState(4);
  const flagged = EXAMPLE.slice(0, k);
  const tp = flagged.filter((r) => r.y === 1).length;
  const fp = flagged.filter((r) => r.y === 0).length;

  const table = useMemo(
    () =>
      EXAMPLE.map((r, i) => ({
        ...r,
        rank: i + 1,
        flagged: i < k,
      })),
    [k]
  );

  return (
    <Section
      id="s32"
      index="32"
      kicker="Phase 5 · Metric machinery"
      title="ROC-AUC, Constructed by Hand"
      intro="ROC-AUC is cited constantly and understood rarely. Here it is in full, on eight hand-written records — every curve point checkable on paper, the area sumable with a pencil. The real number will come from ~650 rows in Run 001; this example exists so that number will mean something when it arrives."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <div className="panel h-full p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="mono-label text-cyan">Worked example · 8 records · 4 failures</p>
              <Tag tone="dim">HAND-CHECKABLE</Tag>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[340px] border-collapse font-mono text-[11.5px]">
                <thead>
                  <tr>
                    {["RANK", "STUDENT", "y (failed)", "p̂ (fail)", "FLAGGED"].map((h) => (
                      <th key={h} className="mono-label border-b border-line px-2 py-2 text-left text-[8px] text-faint">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.map((r) => (
                    <tr key={r.id} className={`transition-colors duration-200 ${r.flagged ? "bg-amber/5" : ""}`}>
                      <td className="border-b border-line/50 px-2 py-2 text-faint">{r.rank}</td>
                      <td className="border-b border-line/50 px-2 py-2 text-dim">S{String(r.id).padStart(2, "0")}</td>
                      <td className={`border-b border-line/50 px-2 py-2 ${r.y === 1 ? "text-rose" : "text-faint"}`}>{r.y}</td>
                      <td className="border-b border-line/50 px-2 py-2 text-cyan">{r.p.toFixed(2)}</td>
                      <td className="border-b border-line/50 px-2 py-2">
                        {r.flagged ? <span className="text-amber">⚑ yes</span> : <span className="text-faint">no</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="mono-label text-[9px] text-faint">THRESHOLD — flag the top-k scored students</p>
                <p className="display-head text-lg text-amber">k = {k}</p>
              </div>
              <input
                type="range" min={0} max={8} value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="mt-2 w-full" style={{ accentColor: "#ffc266" }}
                aria-label="Threshold: number of top-scored students flagged"
              />
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="border border-line/60 bg-panel2/50 px-3 py-2">
                  <span className="text-faint">TP = </span><span className="text-green">{tp}</span>
                  <span className="ml-3 text-faint">FP = </span><span className="text-amber">{fp}</span>
                </div>
                <div className="border border-line/60 bg-panel2/50 px-3 py-2">
                  <span className="text-faint">TPR = </span><span className="text-cyan">{(tp / 4).toFixed(2)}</span>
                  <span className="ml-3 text-faint">FPR = </span><span className="text-cyan">{(fp / 4).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel relative h-full overflow-hidden p-5">
            <Corners color="#6be1ff" />
            <div className="flex items-center justify-between">
              <p className="mono-label text-cyan">ROC curve — every point = one threshold</p>
              <Tag tone="cyan">AUC 0.75</Tag>
            </div>
            <div className="mx-auto mt-3 max-w-[420px]">
              <RocPlot k={k} />
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-dim">
              Slide k and watch the amber operating point walk the curve: each position is a
              different (FPR, TPR) trade-off, and AUC is simply the shaded area — here{" "}
              <span className="font-mono text-cyan">0.125 + 0.1875 + 0.1875 + 0.25 = 0.75</span>, computed
              from these eight rows alone. A perfect model hugs the top-left corner (AUC 1.0); a coin
              flip rides the diagonal (AUC 0.5).
            </p>
            <p className="mt-3 border-t border-line pt-3 font-mono text-[10px] leading-relaxed text-faint">
              Honest scope: this AUC belongs to the toy table, not to the system. Run 001's AUC on the
              real split will be reported with its confidence interval — and if it lands near 0.5, that
              is a finding, not a failure to hide.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §33 · Runbook & evidence chain ---------- */
const RUNBOOK = [
  { step: "01", cmd: "python -m baselines.run_baselines", out: "reports/run_001_baselines.json", who: "the run itself — writes evidence, prints nothing ornamental" },
  { step: "02", cmd: "pytest tests/test_leakage.py -q", out: "7 green tests (REV D checklist)", who: "continuous proof the pipeline still honors §22" },
  { step: "03", cmd: "sha256sum reports/run_001_baselines.json", out: "checksum recorded in the model card", who: "pins the artifact the report will cite" },
  { step: "04", cmd: "git commit — data version + seed + hash in message", out: "reproducible history", who: "the defense trail: anyone can re-run Run 001 and diff it" },
  { step: "05", cmd: "review meeting", out: "supervisor reads run_001 before G-5 is stamped", who: "no gate passes on the builder's word alone" },
];

export function RunbookSection() {
  return (
    <Section
      id="s33"
      index="33"
      kicker="Phase 5 · Reproducibility"
      title="The Evidence Chain"
      intro="Reproducibility is not a slogan — it is a command list. The runbook below fixes who produces Run 001, what artifact it leaves behind, and who signs off on it. 'Baselines reproducible from one command' is the exit criterion; these five steps are what it means operationally."
    >
      <Reveal>
        <div className="panel overflow-hidden">
          {RUNBOOK.map((r, i) => (
            <div
              key={r.step}
              className={`group grid gap-2 px-5 py-4 transition-colors duration-200 hover:bg-panel2/70 sm:grid-cols-[50px_1.1fr_1fr_1fr] sm:gap-4 ${
                i > 0 ? "border-t border-line/70" : ""
              }`}
            >
              <p className="display-head text-xl text-cyan/70 transition-colors group-hover:text-cyan">{r.step}</p>
              <div>
                <p className="mono-label text-[8px] text-faint">COMMAND / ACTION</p>
                <p className="mt-1 font-mono text-[11.5px] text-cyan">{r.cmd}</p>
              </div>
              <div>
                <p className="mono-label text-[8px] text-faint">ARTIFACT</p>
                <p className="mt-1 text-[12.5px] text-dim">{r.out}</p>
              </div>
              <div>
                <p className="mono-label text-[8px] text-faint">WHY IT EXISTS</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-faint">{r.who}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { t: "The reference bar is a promise", b: "Phase 6 candidates that fail to beat LogReg's CV macro-F1 meaningfully are reported as negative results in the final document — visible, numbered, and explained." },
            { t: "Negative results are evidence", b: "If the MLP underperforms the Random Forest, that is written down with its fold variance. The defense values an honest table over a flattering one." },
            { t: "The twin inherits the discipline", b: "When the Digital Twin scores a student in Phase 8, it calls this same pipeline artifact — pinned, versioned, checksummed. No second implementation, no drift." },
          ].map((x) => (
            <div key={x.t} className="panel panel-hover border-l-2 border-l-amber/50 p-4">
              <p className="display-head text-[14px] text-ink">{x.t}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{x.b}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §34 · Gate G-5 ---------- */
const G5_CHECK = [
  "Harness code reviewed — trains through the REV D pipeline, CV inside TRAIN, TEST touched exactly once",
  "Results table frozen empty — filled only by Run 001's evidence file, never by hand",
  "Metric machinery demonstrated — confusion lab arithmetic + hand-checkable ROC/AUC on the worked example",
  "Model card stub prepared — data version, seed, split, known limits; commit hash pinned at run time",
  "Runbook fixed — one command produces the evidence JSON; checksum and commit complete the trail",
  "Exit criterion accepted: baselines reproducible from one command, reviewed with the supervisor",
];

export function GateG5Section({ g5, onApprove }: { g5: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s34"
      index="34"
      kicker="Gate G-5"
      title="Approval Gate — Phase 5"
      intro="Phase 5 stops here by design. The harness, the blank results contract, the metric machinery and the runbook are complete. Run 001 itself executes when this gate passes — and its numbers belong to the notebook, not to this revision."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 5 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G5_CHECK.map((d, i) => (
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
            <Corners color={g5 ? "#7ce7a5" : "#ffc266"} />
            <p className={`mono-label ${g5 ? "text-green" : "text-amber"}`}>
              {g5 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g5
                ? "Phase 5 approved. Phase 6 — Advanced ML — unlocked."
                : "Approve Phase 5 to unlock Phase 6 — Advanced ML."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g5
                ? "Next: Gradient Boosting, XGBoost (conditional on evidence), Linear SVM and the MLP candidate — all on the identical CV splits, all judged against the Run 001 reference bar. The winner is chosen by an evidence table, never by complexity."
                : "On approval, Phase 6 trains the advanced candidates — GB, conditional XGBoost, SVM, MLP — on the identical splits and judges each against the baseline reference bar. Run 001 executes first; its table is filled by the evidence file."}
            </p>

            {!g5 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 5 — execute Run 001, then Phase 6</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: "#7ce7a5" }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-5 · DT-CIS-SD-001 · REV E</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate does NOT approve</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                It approves the harness and the methodology — not the results, which do not exist
                yet. If Run 001's numbers are disappointing, they are reported as measured; the
                reference bar exists precisely so that disappointment becomes information.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
