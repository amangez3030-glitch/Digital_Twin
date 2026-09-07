import { useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";
import { useCountUp, useReveal } from "../hooks";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

/* ============================================================
   Finalization. Everything the defense needs, gathered in one
   place — the vault, a demo you can rehearse click-by-click,
   the questions you will be asked, and the seal that closes
   the document.
   ============================================================ */

/* ---------- §86 · The deliverables vault ---------- */

const TREE = `AI-Digital-Twin/
├─ data/            raw · processed · external
├─ notebooks/       01_EDA · 02_baselines · 03_clustering
├─ src/
│  ├─ data/         loaders + intake validators
│  ├─ features/     the REV-D ColumnTransformer
│  ├─ models/       harness, candidates, model cards
│  ├─ recommendation/  gap + roadmap engines
│  ├─ nlp/          resume + JD extractors
│  ├─ explainability/  SHAP bridge (Run 002+)
│  ├─ simulation/   what-if engine
│  └─ utils/        audit log, versioning
├─ models/          artifacts + checksums
├─ database/        schema.sql + migrations
├─ app/             Streamlit pages (12)
├─ tests/           the 28-test suite
├─ configs/         frozen weights + vocabularies
├─ requirements.txt
├─ README.md
└─ main.py`;

const README_SECTIONS = [
  "What it is — and, in one paragraph, what it refuses to be",
  "Quickstart: three commands to a running app",
  "The honesty contract (E-1…E-8), verbatim",
  "Architecture: one diagram, four layers",
  "Dataset provenance: every source, license and limit",
  "How each score is computed — links to the §refs",
  "Model cards: one per candidate, metrics or 'pending Run 002'",
  "Limitations — the section a grader reads first",
];

const REPORT_TOC = [
  ["1", "Problem, objectives, and the decision-support framing"],
  ["2", "Related work — and why most of it overclaims"],
  ["3", "Data: provenance, the proxy-label problem, schema merge"],
  ["4", "Method: preprocessing, baselines, clustering, the engines"],
  ["5", "Results — Run 001, Run 002, null results included"],
  ["6", "Explainability: what is explained, and what is refused"],
  ["7", "Ethics & limitations: E-1…E-8 enforced, not appended"],
  ["8", "Future work: the honest short list"],
];

export function VaultSection() {
  return (
    <Section
      id="s86"
      index="86"
      kicker="Phase 18 · The vault"
      title="Everything the Defense Needs, In One Place"
      intro="The final revision gathers what ships: a repository a stranger could run, a README that leads with what the system refuses to do, and a technical report whose table of contents puts limitations before conclusions."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <div className="panel h-full overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-line bg-base/60 px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-rose/70" />
              <span className="h-2 w-2 rounded-full bg-amber/70" />
              <span className="h-2 w-2 rounded-full bg-green/70" />
              <span className="mono-label ml-2 text-[9px] text-faint">repo — AI-Digital-Twin/</span>
              <span className="ml-auto font-mono text-[10px] text-green">main · clean</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-[1.7] text-dim">
              {TREE}
            </pre>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal delay={100}>
            <div className="panel p-5">
              <p className="mono-label text-cyan">README.md — section order is a stance</p>
              <ul className="mt-3 space-y-1.5">
                {README_SECTIONS.map((s, i) => (
                  <li key={s} className="flex gap-2.5 text-[12.5px] leading-snug text-dim">
                    <span className="font-mono text-[10px] text-cyan">{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="panel p-5">
              <p className="mono-label text-amber">Technical report — contents</p>
              <ul className="mt-3 space-y-1.5">
                {REPORT_TOC.map(([n, s]) => (
                  <li key={n} className="flex gap-2.5 border-b border-line/40 pb-1.5 text-[12.5px] leading-snug text-dim last:border-0">
                    <span className="font-mono text-[10px] text-amber">§{n}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §87 · The demo script ---------- */

const DEMO_STEPS = [
  { page: "terminal", engine: "—", say: "streamlit run app/Main.py", note: "Cold start. If Run 002 artifacts are present and checksummed, the model loads; otherwise the app says so and runs on the rule engines alone." },
  { page: "🏠 Dashboard", engine: "§45 · §71", say: "Five readiness indicators, each with its formula one hover away.", note: "The opening move: show that no number on screen is unexplained." },
  { page: "👤 Digital Twin", engine: "§72 · §71", say: "Raise SQL 40 → 80. Commit snapshot v2.", note: "The write corridor validates the field; the audit trail logs it; the timeline grows a point." },
  { page: "🎯 Career Intelligence", engine: "§45", say: "ML Engineer: 78.4% — decomposed into four named terms.", note: "Click the score. It argues for itself: coverage up, model term renormalized and absent." },
  { page: "🧠 Skill Intelligence", engine: "§50", say: "SQL is now LEARN NEXT, payoff 0.42/h.", note: "The gap table re-derived from the snapshot you just committed — same profile, live." },
  { page: "📚 Learning Roadmap", engine: "§55", say: "Six moves, each citing the shortfall it closes.", note: "Point at one 'WHY' line. This is the sentence a salesperson could never produce." },
  { page: "📄 Resume Analyzer", engine: "§59", say: "Paste the sample CV. Six skills, four with confidence, two flagged 'inferred'.", note: "The extractor transcribes claims and refuses to guess — the miss-list renders either way." },
  { page: "💼 Job Matcher", engine: "§62", say: "Paste the FinBank JD. Match 62%, three gaps, one disclaimer.", note: "The disclaimer is part of the result, not a footnote. Say it out loud." },
  { page: "🔮 Future Simulator", engine: "§75", say: "Scenario: SQL→80, DL→70. ML Engineer +16.5, attributed exactly.", note: "The bars sum to the delta with no residual. This is the feature nobody else's project has." },
  { page: "⚙️ Model Performance", engine: "Run 002", say: "Evidence JSON, model card, and the test suite — 21 green, 7 pending.", note: "Close on the honest number: what is proven, and what is still owed." },
];

export function DemoSection() {
  const [step, setStep] = useState(0);
  const s = DEMO_STEPS[step];
  const pct = ((step + 1) / DEMO_STEPS.length) * 100;

  return (
    <Section
      id="s87"
      index="87"
      kicker="Phase 18 · The demo"
      title="A Demo You Can Rehearse Click-by-Click"
      intro="Ten moves, each landing on a real page and a real engine. Walk it before the defense so the story is muscle memory — and so you know, move by move, which honesty clause each one demonstrates."
    >
      <div className="panel relative overflow-hidden p-5 sm:p-7">
        <Corners color={CYAN} />
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="mono-label text-[9px] text-faint">DEMO SCRIPT · 10 MOVES</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setStep((p) => Math.max(0, p - 1))} disabled={step === 0}
              className="mono-label border border-line px-2.5 py-1 text-[9px] text-dim transition-colors hover:border-cyan hover:text-cyan disabled:opacity-30">← PREV</button>
            <button onClick={() => setStep((p) => Math.min(DEMO_STEPS.length - 1, p + 1))} disabled={step === DEMO_STEPS.length - 1}
              className="mono-label border border-cyan bg-cyan/10 px-2.5 py-1 text-[9px] text-cyan transition-all hover:bg-cyan/20 hover:shadow-[0_0_16px_rgba(107,225,255,0.15)] disabled:opacity-30">NEXT →</button>
          </div>
        </div>

        {/* progress */}
        <div className="mb-5 flex gap-1">
          {DEMO_STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} aria-label={`go to step ${i + 1}`}
              className="group h-1.5 flex-1" >
              <span className={`block h-full transition-all duration-300 ${i <= step ? "bg-cyan" : "bg-line/50 group-hover:bg-line"}`} />
            </button>
          ))}
        </div>

        <div key={step} className="fadeup grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="mono-label text-[9px] text-faint">MOVE {String(step + 1).padStart(2, "0")} / {DEMO_STEPS.length}</p>
            <p className="display-head mt-2 text-2xl leading-tight text-ink sm:text-3xl">{s.page}</p>
            <div className="mt-3 flex items-center gap-2">
              <Tag tone="cyan">{s.engine}</Tag>
            </div>
            <div className="mt-5 border border-line/80 bg-base/70 p-4">
              <p className="mono-label mb-1.5 text-[8.5px] text-faint">you say / do</p>
              <p className="font-mono text-[12.5px] leading-relaxed text-cyan">“{s.say}”</p>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex-1 border border-amber/40 bg-amber/5 p-5">
              <p className="mono-label mb-2 text-[9px] text-amber">why this move lands</p>
              <p className="text-[15px] leading-relaxed text-dim">{s.note}</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <p className="font-mono text-[10.5px] text-faint">{Math.round(pct)}% through the demo</p>
              <p className="mono-label text-[8.5px] text-faint">
                {step === DEMO_STEPS.length - 1 ? "— hold the pause here; invite questions" : "keep the pace brisk; honesty needs no wind-up"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §88 · Viva defense ---------- */

const VIVA_QA = [
  { cat: "DATA", q: "Why did you exclude G1 and G2 from the model?", a: "They are earlier recordings of the target itself — using them is leakage, the model would be grading the exam with the exam in its pocket. They survive only in a documented sensitivity analysis (§22)." },
  { cat: "DATA", q: "Your labels are proxy labels. Isn't that a problem?", a: "Yes, and it's named, not hidden. The supervised model predicts a coarse occupation family from real labeled data; it cannot and does not predict your future. The model card says so in one sentence (§17)." },
  { cat: "MODEL", q: "Why K-Means and not something fancier?", a: "DBSCAN and hierarchical were evaluated and rejected with reasons — the data has neither noise structure nor a need for a dendrogram. K-Means is standard, fast, and its k is earned by elbow + silhouette + stability, not chosen to look good (§40)." },
  { cat: "MODEL", q: "What does a 91% compatibility actually mean?", a: "It is a weighted sum of four named terms — skill coverage, model evidence, academic alignment, interest fit. It is an argument, not a probability of employment, and it decomposes on demand (§45, §48)." },
  { cat: "DESIGN", q: "Why Streamlit and not FastAPI + a React front end?", a: "Scope honesty. FastAPI was deferred as a documented non-choice; a solo final-year project defends better with one coherent, testable surface than two half-finished ones (§10)." },
  { cat: "DESIGN", q: "How do you handle a resume the extractor can't parse?", a: "Gracefully and loudly. Low-confidence extractions are flagged, the miss-list always renders, and the system refuses to guess silently. Imperfect extraction is expected; pretending otherwise is not (§59)." },
  { cat: "ETHICS", q: "Can your system guarantee someone a job?", a: "No, and it is built so it cannot say so. The match gauge is keyword overlap, the simulator is labeled 'not a prediction', and E-2 forbids employment guarantees. The disclaimer is asserted by a test, not just written (§64)." },
  { cat: "ETHICS", q: "What was the hardest trade-off?", a: "Reporting an honest, lower baseline instead of inflating it with G1/G2. The tempting number was bigger; the defensible one was smaller. This project chose the one it can stand behind in this room." },
];

const CAT_COLOR: Record<string, string> = { DATA: CYAN, MODEL: AMBER, DESIGN: GREEN, ETHICS: ROSE };

export function VivaSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section
      id="s88"
      index="88"
      kicker="Phase 18 · The defense"
      title="The Questions You Will Be Asked"
      intro="Eight questions across data, model, design and ethics — the ones a grader reaches for first. Each answer is already in this document; the defense is just pointing at the right §ref."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {VIVA_QA.map((item, i) => {
          const isOpen = open === i;
          const c = CAT_COLOR[item.cat];
          return (
            <Reveal key={item.q} delay={(i % 2) * 70}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className={`block w-full border p-4 text-left transition-all duration-200 ${
                  isOpen ? "border-cyan/60 bg-base/60" : "border-line/80 bg-base/30 hover:border-cyan/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="mono-label border px-1.5 py-0.5 text-[8px]" style={{ color: c, borderColor: `${c}55` }}>
                    {item.cat}
                  </span>
                  <span className={`font-mono text-[11px] text-faint transition-transform duration-200 ${isOpen ? "rotate-45 text-cyan" : ""}`}>+</span>
                </div>
                <p className="display-head mt-2.5 text-[15px] leading-snug text-ink">{item.q}</p>
                <div className={`grid transition-all duration-300 ${isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="border-l-2 pl-3 text-[13px] leading-relaxed text-dim" style={{ borderColor: `${c}88` }}>
                      {item.a}
                    </p>
                  </div>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------- §89 · The final seal ---------- */

const LEDGER = [
  { label: "phases", value: 18, suffix: "" },
  { label: "gates passed", value: 17, suffix: "" },
  { label: "revisions", value: 18, suffix: "" },
  { label: "sections", value: 89, suffix: "" },
  { label: "careers", value: 12, suffix: "" },
  { label: "tests written", value: 28, suffix: "" },
];

function LedgerCell({ label, value, suffix, go }: { label: string; value: number; suffix: string; go: boolean }) {
  const v = useCountUp(value, go, 900);
  return (
    <div className="border border-line/70 bg-base/50 p-3 text-center">
      <p className="display-head text-2xl text-cyan">
        {v}
        {suffix}
      </p>
      <p className="mono-label mt-1 text-[8px] text-faint">{label}</p>
    </div>
  );
}

export function SealSection({ sealed, onSeal }: { sealed: boolean; onSeal: () => void }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <Section
      id="s89"
      index="89"
      kicker="Phase 18 · The last gate"
      title="Seal It, or Send It Back"
      intro="This is the only decision left. Sealing archives the document at REV R, marks all eighteen phases complete, and hands the project to the defense. Sending it back is always allowed — that is what revisions are for."
    >
      <div ref={ref} className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Project ledger — the final tally</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {LEDGER.map((l) => (
                <LedgerCell key={l.label} label={l.label} value={l.value} suffix={l.suffix} go={visible} />
              ))}
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What sealing confirms</p>
              <ul className="mt-2.5 space-y-1.5 text-[12.5px] leading-relaxed text-dim">
                {[
                  "Every score the system can produce is explained, and the ones it can't are refused.",
                  "No data was fabricated, no metric invented, no error hidden — across 18 revisions.",
                  "The 7 PENDING tests are an honest debt to Run 002, documented and scheduled.",
                  "The project is a decision-support system, and it says so on every page that matters.",
                ].map((t, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-[3px] font-mono text-[10px] text-green">▸</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="panel relative flex h-full flex-col items-center justify-center overflow-hidden border-amber/40 p-6 text-center sm:p-10">
            <Corners color={sealed ? GREEN : AMBER} />
            {!sealed ? (
              <>
                <p className="mono-label text-amber">The final decision</p>
                <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
                  Approve &amp; archive<br />DT-CIS · REV R
                </p>
                <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-dim">
                  Eighteen phases. Seventeen gates already passed. One seal left — and it is yours to press.
                </p>
                <button
                  onClick={onSeal}
                  className="group mt-7 inline-flex items-center gap-3 border border-amber bg-amber/10 px-8 py-4 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_36px_rgba(255,194,102,0.22)] active:translate-y-[1px]"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 10.5 L8 15.5 L17 4.5" />
                  </svg>
                  <span className="mono-label text-[11px] text-amber">SEAL &amp; ARCHIVE THE PROJECT</span>
                </button>
              </>
            ) : (
              <>
                <div className="seal-in border-[4px] border-green px-10 py-6" style={{ color: GREEN }}>
                  <p className="mono-label text-[14px] tracking-[0.35em]">APPROVED</p>
                  <p className="mt-1.5 font-mono text-[10px] text-green/70">DT-CIS-SD-001 · REV R · FINAL</p>
                  <p className="mt-2 mono-label text-[8.5px] tracking-[0.2em] text-green/60">READY FOR DEFENSE</p>
                </div>
                <p className="mt-6 max-w-sm text-[13.5px] leading-relaxed text-dim">
                  Archived. All eighteen phases complete, all gates passed. The document is now a record —
                  and the project is yours to defend.
                </p>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
