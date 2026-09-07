import { PHASES, STAGES, P2_EXIT } from "../data/design";
import { Section, Reveal, Tag, Corners } from "./ui";

const STAGE_COLOR: Record<string, string> = {
  Foundations: "#6be1ff",
  Models: "#ffc266",
  Intelligence: "#7ce7a5",
  Application: "#9db8ff",
  Defense: "#ff8b8b",
};

/* ---------- 14 · Roadmap ---------- */
export function RoadmapSection() {
  return (
    <Section
      id="s14"
      index="14"
      kicker="Deliverable 15"
      title="Implementation Roadmap"
      intro="Eighteen phases across five stages, each with a deliverable and an exit criterion — a phase is done when its exit criterion is true, not when the calendar says so. Gates require approval; that is the point of them."
    >
      {STAGES.map((stage) => {
        const phases = PHASES.filter((p) => p.stage === stage);
        const color = STAGE_COLOR[stage];
        return (
          <div key={stage} className="mb-10 last:mb-0">
            <Reveal>
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block h-2.5 w-2.5 rotate-45" style={{ background: color }} />
                <p className="display-head text-lg text-ink">
                  STAGE — <span style={{ color }}>{stage.toUpperCase()}</span>
                </p>
                <div className="h-px flex-1" style={{ background: `${color}33` }} />
              </div>
            </Reveal>
            <div className="ml-[5px] border-l border-line pl-6 sm:ml-[9px] sm:pl-8">
              {phases.map((p, i) => {
                const done = p.n <= 17;
                const isCurrent = p.n === 18;
                const locked = p.n > 4;
                return (
                  <Reveal key={p.n} delay={i * 60}>
                    <div className="relative mb-3">
                      {/* node */}
                      <span
                        className="absolute -left-[31px] top-4 inline-block h-[11px] w-[11px] rotate-45 border sm:-left-[39px]"
                        style={{
                          borderColor: done ? "#7ce7a5" : isCurrent ? "#ffc266" : color,
                          background: done
                            ? "#7ce7a5"
                            : isCurrent
                            ? "#ffc266"
                            : locked
                            ? "transparent"
                            : `${color}55`,
                        }}
                      />
                      <div
                        className={`panel grid gap-3 p-4 transition-all duration-300 sm:grid-cols-[70px_1.1fr_1fr_0.9fr] sm:gap-4 ${
                          isCurrent ? "border-amber/60 bg-panel2" : done ? "border-green/30" : locked ? "opacity-60" : ""
                        } ${!isCurrent && !locked && !done ? "panel-hover" : ""}`}
                      >
                        <div>
                          <p className="font-mono text-[10px] text-faint">PHASE</p>
                          <p
                            className="display-head text-2xl"
                            style={{ color: done ? "#7ce7a5" : isCurrent ? "#ffc266" : color }}
                          >
                            {String(p.n).padStart(2, "0")}
                          </p>
                        </div>
                        <div>
                          <p className="display-head text-[16px] text-ink">
                            {p.name}
                            {locked && <span className="ml-2 font-mono text-[9px] tracking-widest text-faint">[LOCKED]</span>}
                            {done && <span className="ml-2 font-mono text-[9px] tracking-widest text-green">[APPROVED]</span>}
                            {isCurrent && <span className="ml-2 font-mono text-[9px] tracking-widest text-amber">[THIS REVISION]</span>}
                          </p>
                          <p className="mt-1 text-[13px] leading-relaxed text-dim">{p.deliverable}</p>
                        </div>
                        <div className="sm:border-l sm:border-line/70 sm:pl-4">
                          <p className="mono-label text-[8.5px] text-faint">Exit criterion</p>
                          <p
                            className={`mt-1 text-[12.5px] leading-relaxed ${
                              done ? "text-green" : isCurrent ? "text-amber" : "text-dim"
                            }`}
                          >
                            {p.exit}
                          </p>
                        </div>
                        <div className="flex items-start justify-start sm:justify-end">
                          <Tag tone={done ? "green" : isCurrent ? "amber" : "dim"}>{p.weeks.toUpperCase()}</Tag>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        );
      })}
    </Section>
  );
}

/* ---------- 15 · Gate G-1 record ---------- */
const G1_CHECK = [
  "Final problem statement",
  "Main & specific objectives",
  "Target users",
  "Complete feature list (16 modules, MoSCoW)",
  "ML / DL / NLP components",
  "Dataset requirements & honesty note",
  "System architecture",
  "Database design (14 tables)",
  "Technology stack + non-choices",
  "Difficulty & effort estimate",
  "Risk register with mitigations",
  "Ethical considerations",
  "Differentiation vs typical projects",
  "Phased roadmap with gates",
];

export function GateG1Section() {
  return (
    <Section
      id="s15"
      index="15"
      kicker="Gate G-1 · Record"
      title="Phase 1 Approval — Passed"
      intro="The record of gate G-1. Approval accepted the design — not any future result: every metric, dataset and model claim in later revisions must still earn its place with evidence."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-green">Deliverables verified at G-1</p>
            <ul className="mt-4 space-y-2">
              {G1_CHECK.map((d, i) => (
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
          <div className="panel relative flex h-full flex-col justify-center overflow-hidden border-green/25 p-6 sm:p-8">
            <Corners color="#7ce7a5" />
            <p className="mono-label text-green">Decision record</p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              Phase 1 approved. Phase 2 — Data — unlocked.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              The dataset register, proxy-label policy, schema-matching plan and synthetic cohort
              protocol in §16–18 were issued under REV B and remain binding on every later phase.
            </p>
            <div className="mt-6">
              <div className="stamp inline-block border-[3px] border-green px-6 py-3" style={{ color: "#7ce7a5" }}>
                <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-1 · DT-CIS-SD-001 · REV A</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- 19 · Gate G-2 ---------- */
const G2_CHECK = [
  "Dataset cards for all ten candidates — source, license, records, features, limits, geography",
  "Licenses verified or dataset excluded (document-or-exclude rule)",
  "Proxy-label policy + the model-card sentence drafted",
  "Schema-matching plan S1–S6 with a cross-source validation checklist",
  "Synthetic cohort protocol — generation rules, boundaries, manifest spec",
  "Intake validation spec — completeness asserts, PII scan, checksums",
];

export function GateG2Section({ g2, onApprove }: { g2: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s19"
      index="19"
      kicker="Gate G-2"
      title="Approval Gate — Phase 2"
      intro={P2_EXIT}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 2 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G2_CHECK.map((d, i) => (
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
            <Corners color={g2 ? "#7ce7a5" : "#ffc266"} />
            <p className={`mono-label ${g2 ? "text-green" : "text-amber"}`}>
              {g2 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g2
                ? "Phase 2 approved. Phase 3 — EDA — unlocked."
                : "Approve Phase 2 to unlock Phase 3 — Exploratory Data Analysis."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g2
                ? "Issued under REV B and passed at this gate: ten dataset dossiers with verdicts, the proxy-label policy, the schema-matching plan S1–S6 and the synthetic cohort protocol."
                : "On approval, the next deliverable is the EDA report: statistical summaries, missing-value analysis, class balance and correlation structure for every ADOPT/CONDITIONAL dataset that survives intake."}
            </p>

            {!g2 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 2 — proceed to EDA</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: "#7ce7a5" }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-2 · DT-CIS-SD-001 · REV B</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">Standing rule carried forward</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                No model is trained on a row of data whose license is not on record, and no
                CONDITIONAL dataset survives a failed intake check. The register above is the
                contract; Phase 3 executes it.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- 24 · Gate G-3 ---------- */
const G3_CHECK = [
  "Six EDA work packages — inputs, outputs, acceptance criteria, all runnable from the notebook",
  "Complete 33-attribute ledger with a signed disposition per column (14 KEEP · 16 EXCLUDE · 2 LEAK · 1 TARGET)",
  "Missingness rule — the documented 'clean' claim will be re-verified at load; every gap needs a decision",
  "Leakage case closed in writing — G1/G2 barred from the primary model, reserved for sensitivity analysis",
  "Target frozen: fail := (G3 < 10), per subject file, with a 60/20/20 stratified partition contract",
  "Imbalance response protocol signed before any ratio is measured",
];

export function GateG3Section({ g3, onApprove }: { g3: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s24"
      index="24"
      kicker="Gate G-3"
      title="Approval Gate — Phase 3"
      intro="Phase 3 stops here by design. The EDA contract is complete; the notebook that executes it — and Phase 4, which builds the preprocessing pipelines — begin only when this gate passes."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 3 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G3_CHECK.map((d, i) => (
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
            <Corners color={g3 ? "#7ce7a5" : "#ffc266"} />
            <p className={`mono-label ${g3 ? "text-green" : "text-amber"}`}>
              {g3 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g3
                ? "Phase 3 approved. Phase 4 — Preprocessing — unlocked."
                : "Approve the EDA contract to unlock Phase 4 — Preprocessing."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g3
                ? "Next: reusable pipelines — imputation, scaling, encoding — fitted inside cross-validation only, with the leakage checklist enforced by tests. The notebook first executes the contract approved here."
                : "On approval, Phase 4 builds the reusable preprocessing pipelines: imputation, scaling and encoding fitted strictly inside CV folds — the leakage checklist from §22 becomes an automated test."}
            </p>

            {!g3 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 3 — proceed to preprocessing</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: "#7ce7a5" }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-3 · DT-CIS-SD-001 · REV C</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate does NOT approve</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                It approves the contract — not the measurements. The distributions, ratios and
                coefficients the notebook produces are findings to be reported in Phase 4's review,
                including any that contradict an assumption made here. Surprises are evidence, not
                failures.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
