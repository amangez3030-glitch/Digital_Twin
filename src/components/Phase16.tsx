import { useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

/* ============================================================
   The Streamlit Application. No Streamlit runs here — but the
   blueprint is a living wireframe: every page is clickable and
   renders the exact engines it composes and the session state
   it touches, rehearsed from the approvals in this document.
   ============================================================ */

interface PageBinding {
  id: string;
  label: string;
  icon: string;
  blurb: string;
  engines: { ref: string; name: string }[];
  state: string[];
  heavy?: boolean;
}

const PAGES: PageBinding[] = [
  {
    id: "dashboard", label: "🏠 Dashboard", icon: "🏠",
    blurb: "The student at a glance — readiness, top careers, and the twin's pulse.",
    engines: [
      { ref: "§45", name: "Readiness equations" },
      { ref: "§71", name: "Twin console (read-only view)" },
      { ref: "§47", name: "Career weight matrix" },
    ],
    state: ["twin.profile", "derived.readiness"],
  },
  {
    id: "twin", label: "👤 Digital Twin", icon: "👤",
    blurb: "The full profile — edit, commit snapshots, amend, and audit.",
    engines: [
      { ref: "§70", name: "Twin constitution" },
      { ref: "§71", name: "Twin console" },
      { ref: "§72", name: "Write corridor" },
    ],
    state: ["twin.profile", "twin.snapshots", "twin.audit"],
    heavy: true,
  },
  {
    id: "career", label: "🎯 Career Intelligence", icon: "🎯",
    blurb: "Twelve careers ranked by the frozen four-term score.",
    engines: [
      { ref: "§45", name: "Scoring equation" },
      { ref: "§46", name: "Compatibility lab" },
      { ref: "§47", name: "Weight vectors" },
    ],
    state: ["derived.coverage", "derived.scores"],
  },
  {
    id: "skill", label: "🧠 Skill Intelligence", icon: "🧠",
    blurb: "Strengths, gaps and the prerequisite DAG for the target.",
    engines: [
      { ref: "§50", name: "Gap formulation" },
      { ref: "§51", name: "Gap engine" },
      { ref: "§52", name: "Dependency graph" },
    ],
    state: ["derived.gaps", "twin.target_career"],
  },
  {
    id: "roadmap", label: "📚 Learning Roadmap", icon: "📚",
    blurb: "The prerequisite-ordered, payoff-ranked plan with its why-nots.",
    engines: [
      { ref: "§54", name: "Honest catalog" },
      { ref: "§55", name: "Sequence builder" },
      { ref: "§56", name: "Why-not panel" },
    ],
    state: ["derived.sequence", "session.weekly_hours"],
    heavy: true,
  },
  {
    id: "projects", label: "🚀 Project Recommendations", icon: "🚀",
    blurb: "Portfolio-building projects matched to level and target.",
    engines: [
      { ref: "§51", name: "Gap engine (drivers)" },
      { ref: "§15", name: "Project catalog & difficulty" },
    ],
    state: ["derived.gaps", "twin.portfolio"],
  },
  {
    id: "resume", label: "📄 Resume Analyzer", icon: "📄",
    blurb: "Deterministic extraction from a pasted CV, twin-diffed.",
    engines: [
      { ref: "§58", name: "Extraction pipeline" },
      { ref: "§59", name: "Live extractor" },
      { ref: "§60", name: "Normalization" },
    ],
    state: ["session.resume_text", "derived.extraction"],
    heavy: true,
  },
  {
    id: "job", label: "💼 Job Matcher", icon: "💼",
    blurb: "Paste a posting — get a fit gauge, never a hiring verdict.",
    engines: [
      { ref: "§62", name: "Matcher math" },
      { ref: "§63", name: "Live matcher" },
      { ref: "§64", name: "Match ≠ hiring" },
    ],
    state: ["session.jd_text", "derived.match"],
  },
  {
    id: "sim", label: "🔮 Future Simulator", icon: "🔮",
    blurb: "What-if skill scenarios with exact attribution. Read-only.",
    engines: [
      { ref: "§74", name: "Sim contract" },
      { ref: "§75", name: "What-if lab" },
      { ref: "§76", name: "The clause" },
    ],
    state: ["session.scenario", "derived.attribution"],
  },
  {
    id: "xai", label: "💡 Explainable AI", icon: "💡",
    blurb: "Every score decomposed; SHAP waits for Run 002 by contract.",
    engines: [
      { ref: "§66", name: "Explanation matrix" },
      { ref: "§67", name: "Shapley lab" },
      { ref: "§68", name: "XAI limits" },
    ],
    state: ["derived.shapley", "model.run_id"],
  },
  {
    id: "progress", label: "📈 Progress", icon: "📈",
    blurb: "The twin's growth timeline across committed snapshots.",
    engines: [
      { ref: "§71", name: "Growth timeline" },
      { ref: "§72", name: "Amend-never-erase" },
    ],
    state: ["twin.snapshots"],
  },
  {
    id: "model", label: "⚙️ Model Performance", icon: "⚙️",
    blurb: "Run evidence, leakage tests and the model card — honest numbers only.",
    engines: [
      { ref: "§30-33", name: "Baseline harness & metrics" },
      { ref: "§35-38", name: "Candidates & evidence rules" },
    ],
    state: ["model.run_id", "model.metrics"],
    heavy: true,
  },
];

/* ---------- §78 · The page map ---------- */

export function PageMapSection() {
  return (
    <Section
      id="s78"
      index="78"
      kicker="Phase 16 · The page map"
      title="Twelve Pages, Each Bound to an Approved Engine"
      intro="The application is a composition, not a rewrite. Every page below cites the engines it assembles — there is no page that computes something this document hasn't already approved, and no engine that fails to find a home."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 70}>
            <div className="group flex h-full flex-col border border-line/80 bg-base/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/50 hover:shadow-[0_0_24px_rgba(107,225,255,0.06)]">
              <div className="flex items-center justify-between">
                <p className="display-head text-[15px] text-ink">{p.label}</p>
                {p.heavy && <Tag tone="amber">HEAVY</Tag>}
              </div>
              <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-faint">{p.blurb}</p>
              <div className="mt-3 space-y-1 border-t border-line/60 pt-2.5">
                {p.engines.map((e) => (
                  <div key={e.ref} className="flex items-baseline gap-2">
                    <span className="font-mono text-[9.5px] text-cyan">{e.ref}</span>
                    <span className="text-[11px] text-dim">{e.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <p className="mt-5 border-l-2 border-cyan/60 pl-3.5 text-[12.5px] leading-relaxed text-faint">
          <span className="mono-label mr-2 text-cyan">Composition rule</span>
          pages import engines; engines never import pages. The moment a page needs logic that isn't
          an approved engine, that logic goes back through a gate — the UI is a lens, not a brain.
        </p>
      </Reveal>
    </Section>
  );
}

/* ---------- §79 · The living app-shell wireframe ---------- */

export function AppShellSection() {
  const [active, setActive] = useState("dashboard");
  const page = PAGES.find((p) => p.id === active)!;

  return (
    <Section
      id="s79"
      index="79"
      kicker="Phase 16 · The wireframe, alive"
      title="Rehearse the App Before It Exists"
      intro="This is the Streamlit shell as it will stand — sidebar, page chrome and all. Click through the twelve pages: each renders the engines it composes and the session keys it touches, so the build phase is assembly, not discovery."
    >
      <div className="panel relative overflow-hidden p-0">
        <Corners color={CYAN} />

        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-base/80 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green/70" />
          <span className="mono-label ml-3 flex-1 border border-line/60 bg-base px-3 py-1 text-[9px] text-faint">
            http://localhost:8501 · streamlit run app/Home.py
          </span>
          <span className="mono-label hidden border border-amber/50 px-2 py-1 text-[8.5px] text-amber sm:block">
            BLUEPRINT — NOT RUNNING STREAMLIT
          </span>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* sidebar */}
          <div className="shrink-0 border-b border-line bg-base/70 md:w-56 md:border-b-0 md:border-r">
            <div className="border-b border-line/60 px-4 py-3.5">
              <p className="display-head text-[15px] text-ink">DT-CIS</p>
              <p className="mono-label mt-0.5 text-[8px] text-faint">Digital Twin &amp; Career Intelligence</p>
            </div>
            <nav className="flex gap-0.5 overflow-x-auto p-2 md:flex-col">
              {PAGES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActive(p.id)}
                  className={`mono-label shrink-0 border px-3 py-2 text-left text-[9px] transition-all duration-200 md:border-0 ${
                    active === p.id
                      ? "border-l-2 border-cyan bg-cyan/10 text-cyan md:border-l-2"
                      : "text-faint hover:bg-line/20 hover:text-dim md:border-l-2 md:border-l-transparent"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </nav>
          </div>

          {/* main area */}
          <div className="flex-1 bg-base/40 p-5">
            <div key={page.id} className="animate-[fadeup_0.35s_ease-out]">
              <div className="flex items-baseline justify-between border-b border-line pb-3">
                <p className="display-head text-xl text-ink">{page.label.replace(/^[^\s]+\s/, "")}</p>
                <span className="mono-label text-[8.5px] text-faint">
                  {page.engines.length} engine{page.engines.length > 1 ? "s" : ""} · {page.state.length} state key{page.state.length > 1 ? "s" : ""}
                </span>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-dim">{page.blurb}</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="border border-line/70 bg-base/60 p-3.5">
                  <p className="mono-label mb-2 text-[8.5px] text-cyan">Composes</p>
                  <div className="space-y-1.5">
                    {page.engines.map((e) => (
                      <div key={e.ref} className="flex items-center justify-between border border-line/50 px-2.5 py-1.5 transition-colors hover:border-cyan/40">
                        <span className="text-[11.5px] text-dim">{e.name}</span>
                        <span className="font-mono text-[9.5px] text-cyan">{e.ref}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-line/70 bg-base/60 p-3.5">
                  <p className="mono-label mb-2 text-[8.5px] text-amber">Touches session state</p>
                  <div className="flex flex-wrap gap-1.5">
                    {page.state.map((s) => {
                      const kind = s.startsWith("twin.") ? "STORED" : s.startsWith("derived.") ? "DERIVED" : s.startsWith("model.") ? "MODEL" : "SESSION";
                      const color = kind === "STORED" ? GREEN : kind === "DERIVED" ? CYAN : kind === "MODEL" ? ROSE : AMBER;
                      return (
                        <span key={s} className="mono-label border px-2 py-1 text-[8.5px]" style={{ borderColor: `${color}55`, color }}>
                          {s} <span className="opacity-60">· {kind}</span>
                        </span>
                      );
                    })}
                  </div>
                  <p className="mt-3 border-t border-line/60 pt-2 text-[11px] leading-relaxed text-faint">
                    {page.heavy
                      ? "Marked HEAVY: wrap its engine calls in @st.cache_data so re-runs don't recompute."
                      : "Light page: derived state recomputes cheaply on each interaction."}
                  </p>
                </div>
              </div>

              {/* ethics footer */}
              <div className="mt-5 border border-dashed border-rose/40 bg-rose/5 px-3.5 py-2.5">
                <p className="mono-label text-[8.5px] text-rose">Ethics footer — rendered on this and every page</p>
                <p className="mt-1 text-[11px] leading-relaxed text-faint">
                  DT-CIS is a decision-support system. Scores are explainable gauges over self-reported data —
                  not predictions of your future, your grades, or an employer's choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §80 · State & caching contract ---------- */

export function StateCacheSection() {
  const layers = [
    {
      name: "STORED", color: GREEN,
      what: "twin.profile · twin.snapshots · twin.audit",
      rule: "Lives only in the SQLite twin store, written through the §72 corridor. Session state holds a reference, never a copy that can drift.",
    },
    {
      name: "SESSION", color: AMBER,
      what: "resume_text · jd_text · scenario · weekly_hours",
      rule: "Ephemeral inputs in st.session_state. Cleared on restart by design — nothing transient is allowed to masquerade as the twin.",
    },
    {
      name: "DERIVED", color: CYAN,
      what: "readiness · coverage · gaps · scores · match · attribution",
      rule: "Never stored. Recomputed from STORED + SESSION at read time, memoized with @st.cache_data keyed on the inputs' hash. Derivation is the anti-staleness guarantee from §72.",
    },
    {
      name: "MODEL", color: ROSE,
      what: "run_id · metrics · model artifact",
      rule: "Loaded once with @st.cache_resource from a checksummed artifact (§33). If the checksum fails, the page shows 'no model on record' — it never fakes one.",
    },
  ];

  return (
    <Section
      id="s80"
      index="80"
      kicker="Phase 16 · State & caching"
      title="Four Kinds of State, Four Rules"
      intro="Most Streamlit apps rot from the inside because everything lives in one bag. This one keeps four kinds of state apart — and the wireframe above tags every key by kind, so a reviewer can see at a glance where each value lives and why."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {layers.map((l, i) => (
          <Reveal key={l.name} delay={i * 80}>
            <div className="panel h-full p-5">
              <div className="flex items-center justify-between">
                <p className="display-head text-[16px]" style={{ color: l.color }}>{l.name}</p>
                <span className="mono-label border px-2 py-0.5 text-[8px]" style={{ borderColor: `${l.color}55`, color: l.color }}>
                  {l.name === "STORED" ? "SQLite" : l.name === "SESSION" ? "st.session_state" : l.name === "MODEL" ? "@st.cache_resource" : "@st.cache_data"}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10.5px] text-dim">{l.what}</p>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-faint">{l.rule}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={140}>
        <p className="mt-5 border-l-2 border-green/60 pl-3.5 text-[12.5px] leading-relaxed text-faint">
          <span className="mono-label mr-2 text-green">The one invariant</span>
          a number shown on any page is either STORED (and audited) or DERIVED (and re-proven on render).
          There is no third place for a score to live — which is how the app keeps the twin's honesty
          all the way to the pixel.
        </p>
      </Reveal>
    </Section>
  );
}

/* ---------- §81 · Gate G-16 ---------- */

const G16_CHECK = [
  "Twelve-page map complete — every page cites the approved engines it composes; no page carries un-approved logic",
  "Composition rule signed: pages import engines, engines never import pages; the UI is a lens, not a brain",
  "Living wireframe rehearses every page with its engine bindings and state keys before a line of Streamlit is written",
  "State contract frozen: STORED / SESSION / DERIVED / MODEL kept apart, each with its own rule and cache strategy",
  "Ethics footer renders on every page, in the app's own voice, asserted by a UI test",
  "The model page shows 'no model on record' until Run 001/002 checksums land — it never invents metrics",
];

export function GateG16Section({ g16, onApprove }: { g16: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s81"
      index="81"
      kicker="Gate G-16"
      title="Approval Gate — Phase 16"
      intro="Phase 16 stops here by design. The application's blueprint, wireframe and state contract are complete; only testing and finalization remain."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 16 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G16_CHECK.map((d, i) => (
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
            <Corners color={g16 ? GREEN : AMBER} />
            <p className={`mono-label ${g16 ? "text-green" : "text-amber"}`}>
              {g16 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g16
                ? "Phase 16 approved. Phase 17 — Testing — unlocked."
                : "Approve the application blueprint to unlock Phase 17 — Testing."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g16
                ? "Next: the test suite — data validation, leakage re-proofs, UI assertions, and a security pass on the resume/JD inputs — each tied to a failure mode this document already named."
                : "On approval, Phase 17 specifies the testing strategy: what each of the seven leakage tests guards, how the UI is asserted, and how upload inputs are treated as hostile by default."}
            </p>

            {!g16 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 16 — proceed to testing</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-16 · DT-CIS-SD-001 · REV P</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any page that computes outside an approved engine, any state that blurs the four kinds,
                and any view that shows a score without its decomposition. The app inherits the
                document's honesty — or it doesn't ship.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
