import { PHASES, STAGES } from "../data/design";
import { Section, Reveal, Tag, Corners } from "./ui";

const STAGE_COLOR: Record<string, string> = {
  Foundations: "#6be1ff",
  Models: "#ffc266",
  Intelligence: "#7ce7a5",
  Application: "#9db8ff",
  Defense: "#ff8b8b",
};

/* ---------- 14 · Roadmap ---------- */
export function RoadmapSection({ approved }: { approved: boolean }) {
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
                const isCurrent = p.n === 1;
                const locked = p.n > 1 && !approved;
                return (
                  <Reveal key={p.n} delay={i * 60}>
                    <div className="relative mb-3">
                      {/* node */}
                      <span
                        className="absolute -left-[31px] top-4 inline-block h-[11px] w-[11px] rotate-45 border sm:-left-[39px]"
                        style={{
                          borderColor: isCurrent ? "#ffc266" : color,
                          background: isCurrent ? "#ffc266" : locked ? "transparent" : `${color}55`,
                        }}
                      />
                      <div
                        className={`panel grid gap-3 p-4 transition-all duration-300 sm:grid-cols-[70px_1.1fr_1fr_0.9fr] sm:gap-4 ${
                          isCurrent ? "border-amber/60 bg-panel2" : locked ? "opacity-60" : ""
                        } ${!isCurrent && !locked ? "panel-hover" : ""}`}
                      >
                        <div>
                          <p className="font-mono text-[10px] text-faint">PHASE</p>
                          <p className="display-head text-2xl" style={{ color: isCurrent ? "#ffc266" : color }}>
                            {String(p.n).padStart(2, "0")}
                          </p>
                        </div>
                        <div>
                          <p className="display-head text-[16px] text-ink">
                            {p.name}
                            {locked && <span className="ml-2 font-mono text-[9px] tracking-widest text-faint">[LOCKED]</span>}
                            {isCurrent && <span className="ml-2 font-mono text-[9px] tracking-widest text-amber">[THIS DOCUMENT]</span>}
                          </p>
                          <p className="mt-1 text-[13px] leading-relaxed text-dim">{p.deliverable}</p>
                        </div>
                        <div className="sm:border-l sm:border-line/70 sm:pl-4">
                          <p className="mono-label text-[8.5px] text-faint">Exit criterion</p>
                          <p className={`mt-1 text-[12.5px] leading-relaxed ${isCurrent ? "text-amber" : "text-dim"}`}>{p.exit}</p>
                        </div>
                        <div className="flex items-start justify-start sm:justify-end">
                          <Tag tone={isCurrent ? "amber" : "dim"}>{p.weeks.toUpperCase()}</Tag>
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

/* ---------- 15 · Approval gate ---------- */
const DELIVERABLE_CHECK = [
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

export function ApprovalSection({
  approved,
  onApprove,
}: {
  approved: boolean;
  onApprove: () => void;
}) {
  return (
    <Section
      id="s15"
      index="15"
      kicker="Gate G-1"
      title="Approval Gate"
      intro="Phase 1 stops here by design. The fourteen deliverables above are complete; Phase 2 (Data) begins only when this gate is passed."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* checklist */}
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 1 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {DELIVERABLE_CHECK.map((d, i) => (
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

        {/* gate card */}
        <Reveal delay={120}>
          <div className="panel relative overflow-hidden border-amber/40 p-6 sm:p-8">
            <Corners color="#ffc266" />
            <p className="mono-label text-amber">Decision required</p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {approved ? "Phase 1 approved. Phase 2 unlocked." : "Approve Phase 1 to unlock Phase 2 — Data."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {approved
                ? "Next: dataset cards for every candidate source — license verified, limits documented, fallbacks declared. No data will be loaded before its license is on record."
                : "On approval, the next deliverable is dataset cards: source, license, record counts, features, targets, missingness, limits and geographic relevance for every candidate — before any data is loaded."}
            </p>

            {!approved ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 1 — proceed to data</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: "#7ce7a5" }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-1 · DT-CIS-SD-001 · REV A</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What the gate does NOT mean</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Approval accepts the design — not any future result. Every metric, dataset and model
                claim produced in later phases must still earn its place with evidence, and any
                deliverable that cannot be done honestly will be reported as a limitation, per rule 13.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
