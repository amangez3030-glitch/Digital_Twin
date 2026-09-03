import { useState } from "react";
import {
  P4_INTRO,
  P4_TRANSFORMER_CODE,
  P4_GROUPS,
  P4_TARGET_CODE,
  P4_FIT,
  P4_TESTS,
  P4_VALIDATOR_RULES,
  P4_VALIDATOR_NOTE,
  P4_ARTIFACTS,
  P4_EXIT,
} from "../data/design";
import { Section, Reveal, Tag, Corners } from "./ui";

/* ---------- code block ---------- */
function Code({ code, accent = "#6be1ff" }: { code: string; accent?: string }) {
  return (
    <pre
      className="overflow-x-auto border border-line bg-deep/90 p-4 font-mono text-[11.5px] leading-relaxed text-dim"
      style={{ borderLeft: `2px solid ${accent}` }}
    >
      <code>{code}</code>
    </pre>
  );
}

/* ---------- §25 · Pipeline composition ---------- */
export function PipelineSection() {
  const [group, setGroup] = useState(P4_GROUPS[0].id);
  const [col, setCol] = useState<string | null>(null);

  const g = P4_GROUPS.find((x) => x.id === group)!;
  const activeCol = g.columns.find((c) => c.name === col) ?? g.columns[0];

  return (
    <Section
      id="s25"
      index="25"
      kicker="Phase 4 · Preprocessing"
      title="The ColumnTransformer — Final Code"
      intro={P4_INTRO}
    >
      {/* group selector */}
      <Reveal>
        <div className="mb-4 flex flex-wrap gap-2">
          {P4_GROUPS.map((gr) => (
            <button
              key={gr.id}
              onClick={() => {
                setGroup(gr.id);
                setCol(null);
              }}
              className={`mono-label border px-3 py-1.5 text-[9.5px] transition-all duration-200 ${
                group === gr.id ? "bg-panel2" : "text-faint hover:text-dim"
              }`}
              style={{
                borderColor: group === gr.id ? gr.accent : "rgba(255,255,255,0.08)",
                color: group === gr.id ? gr.accent : undefined,
              }}
            >
              {gr.name.toUpperCase()} · {gr.columns.length}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* left: columns + transformer */}
        <Reveal>
          <div className="panel flex h-full flex-col p-5">
            <p className="mono-label" style={{ color: g.accent }}>
              {g.transformer}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {g.columns.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCol(c.name)}
                  className={`border px-3 py-2 font-mono text-[12px] transition-all duration-200 ${
                    activeCol.name === c.name ? "bg-panel2 text-ink" : "text-dim hover:text-ink"
                  }`}
                  style={{
                    borderColor: activeCol.name === c.name ? g.accent : "rgba(255,255,255,0.08)",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* transform chain */}
            <div className="mt-5 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">Transform chain</p>
              <div className="mt-3 space-y-2.5">
                {g.chain.map((s, i) => (
                  <div key={s.code + i} className="flex items-start gap-3">
                    <span className="mono-label mt-[2px] shrink-0 text-faint">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-mono text-[12.5px]" style={{ color: g.accent }}>
                        {s.code}
                      </p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-faint">{s.why}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-l-2 pl-3 text-[12px] leading-relaxed text-dim" style={{ borderColor: g.accent }}>
                {g.note}
              </p>
            </div>
          </div>
        </Reveal>

        {/* right: why this column */}
        <Reveal delay={120}>
          <div className="panel relative flex h-full flex-col p-5">
            <Corners color={g.accent} />
            <p className="mono-label text-faint">Why this column is here</p>
            <p className="display-head mt-3 text-2xl text-ink">{activeCol.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Tag tone="cyan">{activeCol.type}</Tag>
              <Tag tone="dim">{activeCol.range}</Tag>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-dim">{activeCol.why}</p>
            <div className="mt-auto border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">Ledger reference</p>
              <p className="mt-1.5 font-mono text-[11px] text-faint">
                Disposition signed in §21 · KEEP — verified against the 33-attribute ledger, not re-decided here.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* full code */}
      <Reveal delay={160}>
        <div className="mt-5">
          <p className="mono-label mb-3 text-cyan">src/preprocessing/pipeline.py — the composition</p>
          <Code code={P4_TRANSFORMER_CODE} />
        </div>
      </Reveal>
      <Reveal delay={200}>
        <div className="mt-5">
          <p className="mono-label mb-3 text-rose">Target engineering — the §22 leakage log enforced</p>
          <Code code={P4_TARGET_CODE} accent="#ff8b8b" />
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §26 · fit discipline ---------- */
export function FitSection() {
  return (
    <Section
      id="s26"
      index="26"
      kicker="Phase 4 · Discipline"
      title="Fit Discipline — Where Statistics Come From"
      intro={P4_FIT.rule}
    >
      {/* CV flow strip */}
      <Reveal>
        <div className="panel mb-6 p-5">
          <p className="mono-label text-[8.5px] text-faint">Inside each of the 5 stratified CV folds</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {P4_FIT.cvFlow.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span
                  className={`border px-3 py-2 font-mono text-[11.5px] ${
                    i === 0 ? "border-cyan/50 text-cyan" : i === 3 || i === 4 ? "border-amber/50 text-amber" : "border-line2 text-dim"
                  }`}
                >
                  {s}
                </span>
                {i < P4_FIT.cvFlow.length - 1 && (
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-faint" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 8 H13 M9.5 4.5 L13 8 L9.5 11.5" />
                  </svg>
                )}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-faint">
            The preprocessor and the model are fit together on the fold's training rows; the validation rows are only ever{" "}
            <span className="text-amber">transformed</span>, never fit on. Repeated 5× — so every statistic the model uses is
            fold-local.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {P4_FIT.points.map((p, i) => (
          <Reveal key={p.title} delay={i * 80}>
            <div className="panel panel-hover h-full border-l-2 border-cyan/60 p-5">
              <p className="display-head text-[15px] text-ink">{p.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-dim">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- §27 · leakage tests ---------- */
export function TestsSection() {
  const [open, setOpen] = useState<string | null>(P4_TESTS[0].id);

  return (
    <Section
      id="s27"
      index="27"
      kicker="Phase 4 · Enforcement"
      title="The Leakage Checklist — Now Executable"
      intro="The §22 leakage log was prose. This is the same seven commitments as pytest tests that run on every commit. A preprocessing decision that leaks will fail the build, not slip through review."
    >
      <div className="space-y-3">
        {P4_TESTS.map((t, i) => {
          const isOpen = open === t.id;
          return (
            <Reveal key={t.id} delay={i * 50}>
              <div className={`panel overflow-hidden transition-all duration-300 ${isOpen ? "border-cyan/50" : ""}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : t.id)}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <span className="mono-label shrink-0 border border-cyan/40 px-2 py-[3px] text-[9px] text-cyan">{t.id}</span>
                  <span className="flex-1 font-mono text-[13px] text-ink">{t.name}</span>
                  <span className="hidden flex-1 text-[12px] text-faint sm:block">{t.asserts}</span>
                  <svg
                    viewBox="0 0 16 16"
                    className={`h-4 w-4 shrink-0 text-faint transition-transform duration-300 ${isOpen ? "rotate-180 text-cyan" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M4 6 L8 10 L12 6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="border-t border-line/70 p-4">
                    <p className="mb-3 text-[12.5px] leading-relaxed text-dim sm:hidden">{t.asserts}</p>
                    <Code code={t.code} />
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------- §28 · input validator ---------- */
export function ValidatorSection() {
  return (
    <Section
      id="s28"
      index="28"
      kicker="Phase 4 · Boundary"
      title="The Twin Input Validator"
      intro={P4_VALIDATOR_NOTE}
    >
      <Reveal>
        <div className="panel overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-panel2/60">
                <th className="mono-label px-4 py-3 text-[9px] text-faint">FIELD</th>
                <th className="mono-label px-4 py-3 text-[9px] text-faint">RULE</th>
                <th className="mono-label hidden px-4 py-3 text-[9px] text-faint sm:table-cell">KIND</th>
              </tr>
            </thead>
            <tbody>
              {P4_VALIDATOR_RULES.map((r, i) => (
                <tr key={r.field} className={`border-b border-line/50 transition-colors hover:bg-panel2/40 ${i % 2 ? "bg-deep/30" : ""}`}>
                  <td className="px-4 py-3 font-mono text-[12px] text-cyan">{r.field}</td>
                  <td className="px-4 py-3 text-[12.5px] text-dim">{r.rule}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Tag tone="dim">{r.type.toUpperCase()}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-5">
          <p className="mono-label mb-3 text-green">Artifacts pinned at the end of Phase 4</p>
          <div className="grid gap-3 md:grid-cols-2">
            {P4_ARTIFACTS.map((a) => (
              <div key={a.f} className="panel panel-hover flex items-start gap-3 p-4">
                <svg viewBox="0 0 16 16" className="mt-[2px] h-4 w-4 shrink-0 text-green" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M8 1.5 L13.5 4.5 V11.5 L8 14.5 L2.5 11.5 V4.5 Z" />
                  <path d="M8 7.5 V14.5 M8 7.5 L13.5 4.5 M8 7.5 L2.5 4.5" />
                </svg>
                <div>
                  <p className="font-mono text-[12.5px] text-ink">{a.f}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-faint">{a.what}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §29 · gate G-4 ---------- */
const G4_CHECK = [
  "ColumnTransformer composition for all 14 KEEP columns — final code, remainder='drop'",
  "Target engineered from G3 alone; G1/G2/G3 excluded from features per §22",
  "Fit discipline: imputer & scaler inside the pipeline, refit per CV fold, test touched once",
  "Seven leakage commitments converted to executable pytest tests",
  "Twin input validator — one rule set guarding both training intake and twin writes",
  "Artifact manifest spec: data hash, CV metrics, timestamp, version",
];

export function GateG4Section({ g4, onApprove }: { g4: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s29"
      index="29"
      kicker="Gate G-4"
      title="Approval Gate — Phase 4"
      intro={P4_EXIT}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 4 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G4_CHECK.map((d, i) => (
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
            <Corners color={g4 ? "#7ce7a5" : "#ffc266"} />
            <p className={`mono-label ${g4 ? "text-green" : "text-amber"}`}>{g4 ? "Decision recorded" : "Decision required"}</p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g4 ? "Phase 4 approved. Phase 5 — Baseline Models — unlocked." : "Approve Phase 4 to unlock Phase 5 — Baseline Models."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g4
                ? "Next: Logistic Regression and Random Forest reference bars, trained through the pipeline approved here, with full metrics and fold variance reported. The preprocessing module is wired in unchanged."
                : "On approval, Phase 5 trains the two reference models — Logistic Regression and Random Forest — through this exact pipeline, reporting macro-F1, ROC-AUC and fold variance. They set the bar every later model must beat."}
            </p>

            {!g4 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 4 — proceed to baseline models</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: "#7ce7a5" }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-4 · DT-CIS-SD-001 · REV D</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate does NOT approve</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                It approves the preprocessing contract — not any model result. The baseline metrics Phase 5 produces are
                findings to be reported, including modest ones. A reference bar that is honest is worth more than a tuned
                number that is not.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
