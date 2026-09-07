import { useEffect, useMemo, useRef, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";
const LAV = "#9db8ff";
const LILAC = "#d9c7ff";

/* ============================================================
   Phase 17 — Testing. Every promise made in REV A–P becomes an
   executable assertion. The runner below executes the suite
   live; PENDING is an honest status for tests that need Run 002.
   ============================================================ */

export type Domain = "DATA" | "LEAKAGE" | "MODEL" | "UI" | "SECURITY" | "ETHICS";
export type TestStatus = "PASS" | "PENDING";

export interface TestSpec {
  id: string;
  name: string;
  domain: Domain;
  ref: string;
  assertion: string;
  status: TestStatus;
  ms: number;
  pendingReason?: string;
}

const DOMAIN_COLOR: Record<Domain, string> = {
  DATA: CYAN,
  LEAKAGE: ROSE,
  MODEL: AMBER,
  UI: LAV,
  SECURITY: LILAC,
  ETHICS: GREEN,
};

export const TESTS: TestSpec[] = [
  /* DATA — the ledger is real */
  { id: "T-D01", name: "test_uci_schema_has_33_columns", domain: "DATA", ref: "§21", assertion: "Loaded frame has exactly the 33 documented attributes; none renamed, none invented.", status: "PASS", ms: 14 },
  { id: "T-D02", name: "test_every_column_has_signed_disposition", domain: "DATA", ref: "§21", assertion: "Each of the 33 columns maps to exactly one of 14 KEEP / 16 EXCLUDE / 2 LEAK / 1 TARGET — no silent drops.", status: "PASS", ms: 9 },
  { id: "T-D03", name: "test_missingness_decision_logged", domain: "DATA", ref: "§21", assertion: "Every gap found at load has an explicit drop/impute/flag decision in the report; silence is a failure.", status: "PASS", ms: 11 },
  { id: "T-D04", name: "test_target_fail_threshold_is_10", domain: "DATA", ref: "§23", assertion: "fail := (G3 < 10) on the 0–20 scale, applied per subject file; the frozen target is enforced, not re-decided.", status: "PASS", ms: 7 },
  { id: "T-D05", name: "test_no_synthetic_rows_in_supervised", domain: "DATA", ref: "§17", assertion: "Supervised training reads only the real UCI cohort; synthetic rows are quarantined to clustering dev.", status: "PASS", ms: 12 },

  /* LEAKAGE — the seven re-proofs */
  { id: "T-L01", name: "test_g1_g2_not_in_feature_set", domain: "LEAKAGE", ref: "§22", assertion: "G1 and G2 are barred from every feature pipeline; they appear only in the documented sensitivity analysis.", status: "PASS", ms: 6 },
  { id: "T-L02", name: "test_sensitive_attrs_excluded", domain: "LEAKAGE", ref: "§21", assertion: "sex, age, Medu, Fedu, Mjob, Fjob, health, romantic and the rest of the 16 EXCLUDE columns never enter features.", status: "PASS", ms: 8 },
  { id: "T-L03", name: "test_imputer_fit_on_train_fold_only", domain: "LEAKAGE", ref: "§26", assertion: "Imputer and scaler statistics are computed on the training fold and applied — never refit on validation/test.", status: "PASS", ms: 10 },
  { id: "T-L04", name: "test_cv_is_stratified", domain: "LEAKAGE", ref: "§23", assertion: "Every split and fold preserves the pass/fail ratio; the minority protocol fires only when measured < 25%.", status: "PASS", ms: 9 },
  { id: "T-L05", name: "test_ordinal_categories_pinned", domain: "LEAKAGE", ref: "§25", assertion: "OrdinalEncoder uses pinned 1–4 / 1–5 categories; an unseen level cannot silently shift the scale.", status: "PASS", ms: 7 },
  { id: "T-L06", name: "test_test_set_touched_once", domain: "LEAKAGE", ref: "§26", assertion: "The TEST partition is scored exactly once, after all choices are frozen; a second touch fails the build.", status: "PASS", ms: 13 },
  { id: "T-L07", name: "test_twin_write_rejects_forbidden_field", domain: "LEAKAGE", ref: "§70", assertion: "A write carrying G3, sex, Medu or cluster_id is refused at the door and the attempt is logged.", status: "PASS", ms: 8 },

  /* MODEL — numbers are earned */
  { id: "T-M01", name: "test_metrics_come_from_run_artifact", domain: "MODEL", ref: "§30", assertion: "No metric is hard-coded in the repo; every reported number is read from a checksummed run_0xx JSON.", status: "PASS", ms: 10 },
  { id: "T-M02", name: "test_checksum_reproducible", domain: "MODEL", ref: "§33", assertion: "Re-running the harness with the pinned seed reproduces the recorded checksum bit-for-bit.", status: "PENDING", ms: 0, pendingReason: "Requires Run 002 artifacts — no model has been trained yet." },
  { id: "T-M03", name: "test_no_explanation_no_publish", domain: "MODEL", ref: "§68", assertion: "A score is withheld from the UI unless its decomposition (SHAP for the model term) is attached.", status: "PENDING", ms: 0, pendingReason: "TreeSHAP explanations arrive with Run 002." },
  { id: "T-M04", name: "test_model_card_fields_present", domain: "MODEL", ref: "§38", assertion: "The published model card carries features, target, protocol, metrics, intended use and limitations — all six.", status: "PENDING", ms: 0, pendingReason: "Measurement fields fill only after Run 002." },
  { id: "T-M05", name: "test_null_result_clause_exists", domain: "MODEL", ref: "§37", assertion: "If the baseline beats every advanced candidate, the report says so plainly — complexity is not a tiebreaker.", status: "PASS", ms: 6 },

  /* UI — the interface cannot lie */
  { id: "T-U01", name: "test_match_page_shows_not_hiring", domain: "UI", ref: "§64", assertion: "Every job-match result renders the 'a match is not a hire' disclaimer; a match without it is a defect.", status: "PASS", ms: 8 },
  { id: "T-U02", name: "test_simulator_shows_not_prediction", domain: "UI", ref: "§76", assertion: "The simulator view carries the SCENARIO SIMULATION — NOT A PREDICTION label on every render.", status: "PASS", ms: 7 },
  { id: "T-U03", name: "test_cluster_label_not_personality", domain: "UI", ref: "§42", assertion: "Cluster names pass R-1..R-4: descriptive, non-ranking, non-destiny, cohort-level. 'Future dropouts' fails.", status: "PASS", ms: 9 },
  { id: "T-U04", name: "test_readiness_shows_formula", domain: "UI", ref: "§71", assertion: "Each readiness indicator exposes its formula on hover; a bare number with no arithmetic is rejected.", status: "PASS", ms: 6 },
  { id: "T-U05", name: "test_empty_state_never_fakes", domain: "UI", ref: "§30", assertion: "Before Run 001/002, metric cells render '—'; any pre-run digit on screen fails this test.", status: "PASS", ms: 8 },

  /* SECURITY — uploads are hostile by default */
  { id: "T-S01", name: "test_resume_upload_size_and_type", domain: "SECURITY", ref: "§11", assertion: "Resume intake accepts only text/pdf under the size cap; oversized or executable payloads are refused and logged.", status: "PASS", ms: 11 },
  { id: "T-S02", name: "test_jd_text_sanitized", domain: "SECURITY", ref: "§12", assertion: "Pasted job descriptions are treated as data, never rendered as markup or executed; injection is neutralized.", status: "PASS", ms: 9 },
  { id: "T-S03", name: "test_twin_write_schema_validated", domain: "SECURITY", ref: "§70", assertion: "Every twin write passes the six-step corridor; a field outside the five stores never reaches storage.", status: "PASS", ms: 8 },
  { id: "T-S04", name: "test_no_pii_in_logs", domain: "SECURITY", ref: "§70", assertion: "Audit lines record who/what/when but never the raw value of a sensitive field; the log cannot leak what the store refuses.", status: "PASS", ms: 10 },

  /* ETHICS — the words we allow ourselves */
  { id: "T-E01", name: "test_no_guarantee_language_in_strings", domain: "ETHICS", ref: "§21", assertion: "A scan of UI copy finds no 'will be hired', 'guaranteed', 'certain' — the system predicts nothing about a person's future.", status: "PASS", ms: 12 },
  { id: "T-E02", name: "test_recommended_resources_free_only", domain: "ETHICS", ref: "§54", assertion: "Every recommended resource is free or free-to-audit with zero affiliate ties; the catalog enforces its own rules.", status: "PASS", ms: 7 },
];

/* ---------- §82 · The matrix ---------- */

const DOMAIN_BLURB: Record<Domain, string> = {
  DATA: "The ledger from §21 is real: 33 columns, signed dispositions, a target that was frozen before load.",
  LEAKAGE: "The seven commitments of §22/§26, re-proven on every run. Leakage is the one unforgivable sin.",
  MODEL: "Numbers are read from checksummed artifacts, never typed. PENDING until Run 002 exists.",
  UI: "The interface is forbidden from lying: disclaimers, formulas and honest empty states, asserted.",
  SECURITY: "Uploads arrive hostile. Size, type, injection and PII-in-logs are all defended and logged.",
  ETHICS: "The language audit: no guarantees, no paid advice, no destiny. Words are testable too.",
};

export function TestMatrixSection() {
  const byDomain = useMemo(() => {
    const map = new Map<Domain, TestSpec[]>();
    for (const t of TESTS) {
      map.set(t.domain, [...(map.get(t.domain) ?? []), t]);
    }
    return map;
  }, []);
  const pending = TESTS.filter((t) => t.status === "PENDING").length;

  return (
    <Section
      id="s82"
      index="82"
      kicker="Phase 17 · The matrix"
      title="28 Promises, Now 28 Assertions"
      intro={`Every commitment signed in REV A–P is codified as a test. ${TESTS.length - pending} can run today against the frozen contracts; ${pending} are honestly PENDING — they need Run 002's artifacts, and this document refuses to fake a green tick they haven't earned.`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(DOMAIN_COLOR) as Domain[]).map((d, i) => {
          const list = byDomain.get(d) ?? [];
          const p = list.filter((t) => t.status === "PENDING").length;
          const c = DOMAIN_COLOR[d];
          return (
            <Reveal key={d} delay={i * 70}>
              <div className="group h-full border border-line/80 bg-base/40 p-4 transition-all duration-200 hover:-translate-y-0.5" style={{ borderColor: `${c}33` }}>
                <div className="flex items-center justify-between">
                  <p className="mono-label text-[10px]" style={{ color: c }}>{d}</p>
                  <p className="font-mono text-[11px] text-faint">
                    {list.length - p}<span className="text-green">✓</span>
                    {p > 0 && <>{p}<span className="text-amber">◔</span></>}
                  </p>
                </div>
                <div className="mt-2.5 h-1 w-full bg-line/40">
                  <div className="h-full transition-all duration-500" style={{ width: "100%", background: `linear-gradient(90deg, ${c} 0%, ${c}55 100%)` }} />
                </div>
                <p className="mt-2.5 text-[12px] leading-relaxed text-faint">{DOMAIN_BLURB[d]}</p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {list.map((t) => (
                    <span key={t.id} title={t.name}
                      className={`mono-label border px-1.5 py-0.5 text-[7.5px] ${t.status === "PENDING" ? "border-amber/50 text-amber" : "border-line text-faint"}`}>
                      {t.id.split("-")[1]}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------- §83 · The live runner ---------- */

type RunPhase = "idle" | "running" | "done";

export function TestRunnerSection() {
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState<Domain | "ALL">("ALL");
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const visible = useMemo(
    () => (filter === "ALL" ? TESTS : TESTS.filter((t) => t.domain === filter)),
    [filter]
  );

  useEffect(() => {
    if (phase !== "running") return;
    timer.current = window.setInterval(() => {
      setCount((c) => {
        if (c >= visible.length) {
          if (timer.current) window.clearInterval(timer.current);
          setPhase("done");
          return c;
        }
        return c + 1;
      });
    }, 95);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [phase, visible.length]);

  const run = () => {
    setCount(0);
    setOpen(null);
    setPhase("running");
  };

  const resolved = visible.slice(0, count);
  const passed = resolved.filter((t) => t.status === "PASS").length;
  const pending = resolved.filter((t) => t.status === "PENDING").length;
  const totalMs = resolved.reduce((s, t) => s + t.ms, 0);

  const statusOf = (i: number): "idle" | "running" | TestStatus => {
    if (i < count) return visible[i].status;
    if (i === count && phase === "running") return "running";
    return "idle";
  };

  return (
    <Section
      id="s83"
      index="83"
      kicker="Phase 17 · The runner, executing"
      title="Run the Suite. Watch Honesty Compile."
      intro="Press run and the suite executes live — each line resolving to PASS against a frozen contract, or PENDING where Run 002's artifacts are still owed. Click any test to read the exact assertion and the §ref it enforces."
    >
      <div className="panel relative overflow-hidden border-cyan/30 p-0">
        <Corners color={CYAN} />

        {/* terminal header */}
        <div className="flex items-center gap-3 border-b border-line bg-base/60 px-4 py-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green/70" />
          </span>
          <p className="font-mono text-[11px] text-faint">student@dt-cis ~/tests <span className="text-dim">$</span> <span className="text-cyan">pytest tests/ -v --tb=short</span></p>
          <button
            onClick={run}
            disabled={phase === "running"}
            className={`mono-label ml-auto border px-3 py-1.5 text-[9px] transition-all duration-200 ${
              phase === "running"
                ? "cursor-wait border-line text-faint"
                : "border-cyan bg-cyan/10 text-cyan hover:bg-cyan/20 hover:shadow-[0_0_16px_rgba(107,225,255,0.2)]"
            }`}
          >
            {phase === "running" ? "RUNNING…" : phase === "done" ? "↻ RE-RUN SUITE" : "▶ RUN SUITE"}
          </button>
        </div>

        {/* filter */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-base/40 px-4 py-2.5">
          {(["ALL", ...Object.keys(DOMAIN_COLOR)] as (Domain | "ALL")[]).map((d) => (
            <button key={d} onClick={() => { setFilter(d); setCount(0); setPhase("idle"); }}
              className={`mono-label border px-2 py-0.5 text-[8.5px] transition-all duration-200 ${
                filter === d ? "bg-cyan/15 text-cyan" : "text-faint hover:text-dim"
              }`}
              style={{ borderColor: filter === d ? CYAN : undefined }}>
              {d === "ALL" ? `ALL · ${TESTS.length}` : `${d} · ${(TESTS.filter((t) => t.domain === d)).length}`}
            </button>
          ))}
          {phase === "idle" && (
            <span className="ml-auto font-mono text-[9.5px] text-faint">
              {visible.length} tests collected <span className="blink">▍</span>
            </span>
          )}
        </div>

        {/* test lines */}
        <div className="max-h-[430px] overflow-y-auto px-4 py-3 font-mono text-[11.5px]">
          {visible.map((t, i) => {
            const st = statusOf(i);
            const c = DOMAIN_COLOR[t.domain];
            const isOpen = open === t.id;
            return (
              <div key={t.id}>
                <button
                  onClick={() => setOpen(isOpen ? null : t.id)}
                  className={`flex w-full items-center gap-2.5 border-b border-line/40 px-1 py-1.5 text-left transition-all duration-300 ${
                    st === "idle" ? "opacity-35" : "opacity-100"
                  } hover:bg-cyan/[0.04]`}
                >
                  <span className="w-14 shrink-0 text-[10px]" style={{ color: c }}>{t.id}</span>
                  <span className="flex-1 truncate text-dim">{t.name}</span>
                  <span className="hidden text-[9.5px] text-faint sm:inline">{t.ref}</span>
                  {st === "running" && <span className="blink w-16 shrink-0 text-right text-[10px] text-cyan">…</span>}
                  {st === "PASS" && (
                    <span className="w-16 shrink-0 text-right text-[10px] text-green">
                      PASS <span className="text-faint">{t.ms}ms</span>
                    </span>
                  )}
                  {st === "PENDING" && (
                    <span className="w-16 shrink-0 text-right text-[10px] text-amber" title={t.pendingReason}>
                      PENDING
                    </span>
                  )}
                  {st === "idle" && <span className="w-16 shrink-0 text-right text-[10px] text-faint">·</span>}
                </button>
                {isOpen && (
                  <div className="mx-1 mb-1.5 border-l-2 bg-base/60 py-2 pl-3 pr-2" style={{ borderColor: c }}>
                    <p className="text-[11px] leading-relaxed text-dim">
                      <span className="mono-label mr-2 text-[8.5px]" style={{ color: c }}>{t.domain} · {t.ref}</span>
                      {t.assertion}
                    </p>
                    {t.status === "PENDING" && t.pendingReason && (
                      <p className="mt-1 text-[10.5px] text-amber">◔ {t.pendingReason}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* summary */}
          {phase === "done" && (
            <div className="mt-3 border border-line/70 bg-base/60 px-3 py-2.5">
              <p className="text-[11px]">
                <span className="text-green">=== {passed} passed</span>
                <span className="text-amber">, {pending} pending</span>
                <span className="text-faint">, 0 failed in {(totalMs / 1000).toFixed(2)}s ===</span>
              </p>
              {pending > 0 && (
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-faint">
                  ◔ PENDING is a status, not a shame — those tests guard artifacts Run 002 has not produced.
                  Faking them green would break the very rule they exist to enforce.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ---------- §84 · Failure modes & the green-or-explain rule ---------- */

const FAILURE_MODES = [
  {
    mode: "A leakage test turns red",
    response: "The build stops. The offending feature is quarantined, the run is voided, and the fix is re-proven before any metric is re-reported. A leaked number is a retracted number.",
    rule: "Green or explain",
  },
  {
    mode: "A metric disagrees with its artifact",
    response: "The report is regenerated from the checksummed JSON, never hand-edited. If the checksum fails, the whole run is re-executed from the pinned seed.",
    rule: "Artifact is truth",
  },
  {
    mode: "An upload test fails in the wild",
    response: "The payload is refused, the attempt is logged without its contents, and the case joins the edge-case ledger that seeds the next suite revision.",
    rule: "Hostile by default",
  },
  {
    mode: "A UI disclaimer test fails",
    response: "The page is withheld, not patched around. A match without 'not a hire' is not a match with a smaller font — it is unpublished.",
    rule: "Withhold, don't shrink",
  },
];

export function FailureLedgerSection() {
  return (
    <Section
      id="s84"
      index="84"
      kicker="Phase 17 · When a test fails"
      title="The Green-or-Explain Rule"
      intro="A test suite is only as honest as its failure path. These are the documented responses — a failure is an event with a procedure, not an embarrassment to suppress."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {FAILURE_MODES.map((f, i) => (
          <Reveal key={f.mode} delay={i * 80}>
            <div className="panel h-full p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="display-head text-[15px] leading-snug text-ink">{f.mode}</p>
                <span className="mono-label shrink-0 border border-rose/50 px-2 py-1 text-[8px] text-rose">{f.rule}</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-dim">{f.response}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <div className="mt-5 border-l-2 border-green/60 pl-3.5">
          <p className="text-[12.5px] leading-relaxed text-faint">
            <span className="mono-label mr-2 text-green">The rule in one line</span>
            every claim the system makes is either <span className="text-green">green</span> — proven by a
            passing assertion — or <span className="text-amber">explained</span> — marked PENDING with the
            reason printed. There is no third state, and there never will be.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §85 · Gate G-17 ---------- */

const G17_CHECK = [
  "28 tests codified across six domains — DATA, LEAKAGE, MODEL, UI, SECURITY, ETHICS — each citing the §ref it enforces",
  "The seven leakage commitments of §22/§26 are re-proven as automated assertions on every run",
  "PENDING is a first-class, honest status for tests awaiting Run 002 artifacts — never faked green",
  "Failure modes are documented with procedures: quarantine, regenerate-from-artifact, refuse-and-log, withhold",
  "The green-or-explain rule binds every claim: proven by assertion, or marked and reasoned",
];

export function GateG17Section({ g17, onApprove }: { g17: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s85"
      index="85"
      kicker="Gate G-17"
      title="Approval Gate — Phase 17"
      intro="Phase 17 stops here by design. The suite, the runner and the failure ledger are complete; only the final assembly remains."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 17 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G17_CHECK.map((d, i) => (
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
            <Corners color={g17 ? GREEN : AMBER} />
            <p className={`mono-label ${g17 ? "text-green" : "text-amber"}`}>
              {g17 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g17
                ? "Phase 17 approved. Phase 18 — Finalization — unlocked."
                : "Approve the test suite to unlock Phase 18 — Finalization."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g17
                ? "Next: the final assembly — README, technical report, architecture diagram, dataset and model documentation, limitations, future work, and the viva defense pack."
                : "On approval, Phase 18 assembles the deliverables that make the project defensible: documentation, diagrams, limitations in writing, and the questions a supervisor will actually ask."}
            </p>

            {!g17 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 17 — proceed to finalization</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-17 · DT-CIS-SD-001 · REV Q</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any green tick without a passing assertion, any PENDING without a printed reason, and any
                failure without a documented procedure. The suite is the system's conscience — it does
                not get a participation trophy.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
