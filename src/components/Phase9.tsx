import { useMemo, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

/* ============================================================
   The skill-gap engine, executable. Gap math is frozen here and
   runs live below. "Learn next" is DERIVED — weighted shortfall,
   prerequisite gating, payoff-per-effort — never asserted.
   ============================================================ */

export interface GapSkill {
  id: string;
  label: string;
  prereq: string[];
  effortPer10: number; // honest planning constant: hours per +10 pts
  x: number; // graph layout
  y: number;
}

export const GAP_SKILLS: GapSkill[] = [
  { id: "python", label: "Python", prereq: [], effortPer10: 20, x: 80, y: 45 },
  { id: "statistics", label: "Statistics", prereq: [], effortPer10: 30, x: 80, y: 125 },
  { id: "math", label: "Mathematics", prereq: [], effortPer10: 35, x: 80, y: 205 },
  { id: "sql", label: "SQL", prereq: [], effortPer10: 15, x: 80, y: 285 },
  { id: "web_dev", label: "Web Dev", prereq: [], effortPer10: 25, x: 205, y: 285 },
  { id: "ml", label: "Machine Learning", prereq: ["python", "statistics"], effortPer10: 40, x: 300, y: 85 },
  { id: "data_analysis", label: "Data Analysis", prereq: ["python", "statistics", "sql"], effortPer10: 30, x: 300, y: 205 },
  { id: "cloud", label: "Cloud", prereq: ["python"], effortPer10: 35, x: 300, y: 285 },
  { id: "deep_learning", label: "Deep Learning", prereq: ["ml", "math"], effortPer10: 60, x: 480, y: 85 },
  { id: "mlops", label: "MLOps", prereq: ["python", "ml"], effortPer10: 45, x: 480, y: 205 },
  { id: "nlp", label: "NLP", prereq: ["deep_learning"], effortPer10: 50, x: 645, y: 45 },
  { id: "cv", label: "Computer Vision", prereq: ["deep_learning"], effortPer10: 50, x: 645, y: 125 },
];

export interface GapCareer { id: string; name: string; req: Record<string, number> }

export const GAP_CAREERS: GapCareer[] = [
  { id: "mle", name: "ML Engineer", req: { python: 1, statistics: 0.7, math: 0.8, ml: 1, deep_learning: 0.7, sql: 0.5, data_analysis: 0.6, mlops: 0.7, cloud: 0.4 } },
  { id: "aie", name: "AI Engineer", req: { python: 1, math: 0.8, ml: 0.9, deep_learning: 0.9, nlp: 0.5, cv: 0.5, mlops: 0.5, cloud: 0.4 } },
  { id: "ds", name: "Data Scientist", req: { python: 0.9, statistics: 1, math: 0.8, ml: 0.9, sql: 0.8, data_analysis: 0.9, deep_learning: 0.4 } },
  { id: "da", name: "Data Analyst", req: { sql: 1, statistics: 0.9, data_analysis: 1, python: 0.6 } },
  { id: "swe", name: "Software Engineer", req: { python: 0.8, web_dev: 0.7, sql: 0.6, cloud: 0.5, data_analysis: 0.3 } },
  { id: "be", name: "Backend Developer", req: { python: 0.9, sql: 0.9, web_dev: 0.6, cloud: 0.6 } },
  { id: "fe", name: "Frontend Developer", req: { web_dev: 1, python: 0.3 } },
  { id: "sec", name: "Cybersecurity Analyst", req: { python: 0.6, sql: 0.5, cloud: 0.6, web_dev: 0.4 } },
  { id: "ce", name: "Cloud Engineer", req: { cloud: 1, python: 0.7, mlops: 0.6, sql: 0.4 } },
  { id: "rs", name: "Research Scientist", req: { math: 1, statistics: 0.9, ml: 0.8, deep_learning: 0.8, python: 0.7, nlp: 0.4, cv: 0.4 } },
  { id: "cve", name: "CV Engineer", req: { python: 0.9, math: 0.8, ml: 0.8, deep_learning: 0.9, cv: 1 } },
  { id: "nlpe", name: "NLP Engineer", req: { python: 0.9, ml: 0.8, deep_learning: 0.9, nlp: 1, statistics: 0.5 } },
];

const PREREQ_FLOOR = 60; // a prerequisite counts as satisfied at >= 60

const DEFAULT_PROFILE: Record<string, number> = {
  python: 70, statistics: 45, math: 55, sql: 40, web_dev: 60,
  ml: 55, data_analysis: 50, cloud: 30, deep_learning: 25, mlops: 20, nlp: 15, cv: 15,
};

export function targetFor(w: number): number {
  if (w >= 0.8) return 90;
  if (w >= 0.5) return 75;
  if (w > 0) return 60;
  return 0;
}

export interface GapRow {
  skill: GapSkill;
  weight: number;
  current: number;
  target: number;
  gap: number;
  shortfall: number; // gap * weight
  effortHours: number;
  payoff: number; // shortfall per hour
  prereqsMet: boolean;
  missingPrereq: string[];
}

export function computeGaps(career: GapCareer, profile: Record<string, number>): GapRow[] {
  const rows: GapRow[] = [];
  for (const [sid, w] of Object.entries(career.req)) {
    if (w <= 0) continue;
    const skill = GAP_SKILLS.find((s) => s.id === sid)!;
    const target = targetFor(w);
    const current = profile[sid] ?? 0;
    const gap = Math.max(0, target - current);
    const effortHours = Math.max(1, Math.round((gap / 10) * skill.effortPer10));
    const missing = skill.prereq.filter((p) => (profile[p] ?? 0) < PREREQ_FLOOR);
    rows.push({
      skill, weight: w, current, target, gap,
      shortfall: gap * w,
      effortHours: gap === 0 ? 0 : effortHours,
      payoff: gap === 0 ? 0 : (gap * w) / effortHours,
      prereqsMet: missing.length === 0,
      missingPrereq: missing,
    });
  }
  return rows;
}

const skillLabel = (id: string) => GAP_SKILLS.find((s) => s.id === id)?.label ?? id;

/* ---------- §50 · The formulation ---------- */

export function FormulationSection() {
  const cards = [
    {
      id: "G-1", title: "Weighted shortfall", color: CYAN,
      formula: "shortfall(s) = max(0, target(s) − current(s)) · w(s)",
      body: "A missing skill only matters in proportion to how much the career needs it. SQL missing for a Data Analyst hurts far more than for a CV Engineer — the weight carries that.",
    },
    {
      id: "G-2", title: "Honest effort", color: GREEN,
      formula: "effort(s) = ⌈gap(s) / 10⌉ · hours_per_10(s)",
      body: "Each skill carries a planning constant — calibrated hours per +10 points from the learning-resource corpus. It is a planning number, never a promise: people learn at different speeds.",
    },
    {
      id: "G-3", title: "Payoff-per-effort", color: AMBER,
      formula: "payoff(s) = shortfall(s) / effort(s)",
      body: "The ranking key. 'Learn next' is the actionable skill with the highest shortfall returned per hour of effort — gated behind its prerequisites. Derived, not asserted.",
    },
  ];
  return (
    <Section
      id="s50"
      index="50"
      kicker="Phase 9 · The formulation"
      title="From a Requirement Vector to a Learning Target"
      intro="Phase 8 said where you fit; Phase 9 says what is missing and what to do about it — in that order. The gap math is frozen in three definitions, and every recommendation below is a consequence of them, not an opinion."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 100}>
            <div className="panel h-full border-t-2 p-5" style={{ borderTopColor: c.color }}>
              <p className="mono-label" style={{ color: c.color }}>{c.id}</p>
              <p className="display-head mt-2 text-lg text-ink">{c.title}</p>
              <p className="mt-3 border border-line/70 bg-base/60 px-3 py-2 font-mono text-[11px] leading-relaxed text-dim">
                {c.formula}
              </p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-faint">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={200}>
        <div className="mt-5 border-l-2 border-amber/60 pl-4">
          <p className="text-[13px] leading-relaxed text-faint">
            <span className="mono-label mr-2 text-amber">Ordering rule</span>
            A skill is <span className="text-ink">actionable</span> only when all its prerequisites sit at
            ≥ {PREREQ_FLOOR}. Otherwise it is <span className="text-ink">blocked</span>, and the engine names
            exactly which foundation to build first. This is a dependency graph, not a syllabus someone
            remembered — it cannot be argued away, only satisfied.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §51 · Live gap engine ---------- */

export function GapEngineSection() {
  const [profile, setProfile] = useState<Record<string, number>>(DEFAULT_PROFILE);
  const [careerId, setCareerId] = useState("mle");

  const career = GAP_CAREERS.find((c) => c.id === careerId)!;
  const rows = useMemo(() => computeGaps(career, profile), [career, profile]);

  const actionable = rows
    .filter((r) => r.prereqsMet && r.gap > 0)
    .sort((a, b) => b.payoff - a.payoff);
  const blocked = rows.filter((r) => r.gap > 0 && !r.prereqsMet);
  const done = rows.filter((r) => r.gap === 0);
  const learnNext = actionable[0];
  const totalShortfall = rows.reduce((s, r) => s + r.shortfall, 0);
  const totalEffort = actionable.reduce((s, r) => s + r.effortHours, 0);

  const setSkill = (id: string, v: number) => setProfile((p) => ({ ...p, [id]: v }));

  return (
    <Section
      id="s51"
      index="51"
      kicker="Phase 9 · The engine, running"
      title="Live Gap Engine"
      intro="The frozen math executing on a live profile. Pick a career, drag the skill sliders, and watch the gap table re-derive its ordering — including the one skill the engine says to learn next, and the ones it refuses to let you touch yet."
    >
      <div className="panel relative overflow-hidden p-5 sm:p-7">
        <Corners color={CYAN} />

        {/* career picker */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mono-label text-[8.5px] text-faint">TARGET CAREER →</span>
          {GAP_CAREERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCareerId(c.id)}
              className={`mono-label border px-2.5 py-1.5 text-[9px] transition-all duration-200 ${
                c.id === careerId
                  ? "border-cyan bg-cyan/15 text-cyan"
                  : "border-line text-faint hover:border-cyan/50 hover:text-dim"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid gap-7 lg:grid-cols-[1fr_1.15fr]">
          {/* sliders */}
          <div>
            <p className="mono-label mb-3 text-[8.5px] text-faint">TWIN SKILL PROFILE — drag to edit</p>
            <div className="space-y-2.5">
              {GAP_SKILLS.map((s) => {
                const required = career.req[s.id];
                return (
                  <div key={s.id} className={`flex items-center gap-3 ${required ? "" : "opacity-40"}`}>
                    <span className="w-[104px] shrink-0 truncate text-[12px] text-dim">{s.label}</span>
                    <input
                      type="range" min={0} max={100} value={profile[s.id]}
                      onChange={(e) => setSkill(s.id, Number(e.target.value))}
                      className="twin-range h-1 flex-1 cursor-ew-resize"
                      aria-label={`${s.label} level`}
                    />
                    <span className="w-8 shrink-0 text-right font-mono text-[11.5px] text-cyan">{profile[s.id]}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-faint">
              Dimmed skills are not in <span className="text-dim">{career.name}</span>'s requirement
              vector — the engine ignores them for this target.
            </p>
          </div>

          {/* gap table + verdict */}
          <div>
            <p className="mono-label mb-3 text-[8.5px] text-faint">DERIVED GAP TABLE — {career.name}</p>
            <div className="space-y-1.5">
              {[...rows].sort((a, b) => b.shortfall - a.shortfall).map((r) => {
                const isNext = learnNext?.skill.id === r.skill.id;
                return (
                  <div
                    key={r.skill.id}
                    className={`border px-3 py-2 transition-all duration-300 ${
                      isNext ? "border-amber/70 bg-amber/10" : "border-line/70 bg-base/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-[110px] shrink-0 truncate text-[12px] text-ink">{r.skill.label}</span>
                      <span className="mono-label text-[8px] text-faint">w {r.weight.toFixed(1)}</span>
                      <span className="ml-auto font-mono text-[10.5px] text-faint">
                        {r.current} → <span className="text-dim">{r.target}</span>
                      </span>
                      {r.gap > 0 ? (
                        <span className="font-mono text-[10.5px] text-rose">−{r.gap}</span>
                      ) : (
                        <span className="font-mono text-[10.5px] text-green">✓</span>
                      )}
                    </div>
                    {/* current vs target bar */}
                    <div className="relative mt-1.5 h-2 w-full bg-[#0b1626]">
                      <div
                        className="absolute inset-y-0 left-0 bg-cyan/70 transition-all duration-500"
                        style={{ width: `${r.current}%` }}
                      />
                      <div
                        className="absolute inset-y-0 w-[2px] bg-amber"
                        style={{ left: `${r.target}%` }}
                        title={`target ${r.target}`}
                      />
                      {r.gap > 0 && (
                        <div
                          className="absolute inset-y-0 bg-rose/40 transition-all duration-500"
                          style={{ left: `${r.current}%`, width: `${r.gap}%` }}
                        />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[9.5px] text-faint">
                      <span>shortfall <span className="text-dim">{r.shortfall.toFixed(0)}</span></span>
                      {r.gap > 0 && <span>· ~{r.effortHours}h</span>}
                      {r.gap > 0 && <span>· payoff <span className="text-amber">{r.payoff.toFixed(2)}</span></span>}
                      {!r.prereqsMet && r.gap > 0 && (
                        <span className="text-rose">· blocked: needs {r.missingPrereq.map(skillLabel).join(", ")}</span>
                      )}
                      {isNext && <span className="text-amber">· LEARN NEXT</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* verdict */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="border border-line/70 bg-base/50 p-3">
                <p className="mono-label text-[8px] text-faint">TOTAL SHORTFALL</p>
                <p className="mt-1 font-mono text-xl text-rose">{totalShortfall.toFixed(0)}</p>
              </div>
              <div className="border border-line/70 bg-base/50 p-3">
                <p className="mono-label text-[8px] text-faint">ACTIONABLE EFFORT</p>
                <p className="mt-1 font-mono text-xl text-cyan">~{totalEffort}h</p>
              </div>
              <div className="border border-line/70 bg-base/50 p-3">
                <p className="mono-label text-[8px] text-faint">SATISFIED / BLOCKED</p>
                <p className="mt-1 font-mono text-xl">
                  <span className="text-green">{done.length}</span>
                  <span className="mx-1 text-faint">/</span>
                  <span className="text-rose">{blocked.length}</span>
                </p>
              </div>
            </div>

            {learnNext ? (
              <p className="mt-4 border-l-2 border-amber pl-3 text-[13px] leading-relaxed text-dim">
                <span className="mono-label mr-2 text-amber">LEARN NEXT →</span>
                <span className="text-ink">{learnNext.skill.label}</span>: highest payoff-per-effort among
                actionable skills (≈{learnNext.effortHours}h closes a {learnNext.gap}-point gap worth{" "}
                {learnNext.shortfall.toFixed(0)} weighted shortfall for {career.name}).
              </p>
            ) : (
              <p className="mt-4 border-l-2 border-green pl-3 text-[13px] leading-relaxed text-dim">
                <span className="mono-label mr-2 text-green">NO GAPS →</span>
                Every required skill for {career.name} is at or above target on this profile.
              </p>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §52 · Prerequisite graph ---------- */

export function PrereqGraphSection() {
  const [careerId, setCareerId] = useState("mle");
  const career = GAP_CAREERS.find((c) => c.id === careerId)!;
  const required = new Set(Object.keys(career.req));

  const edges: { from: GapSkill; to: GapSkill }[] = [];
  for (const s of GAP_SKILLS) {
    for (const p of s.prereq) {
      edges.push({ from: GAP_SKILLS.find((x) => x.id === p)!, to: s });
    }
  }

  return (
    <Section
      id="s52"
      index="52"
      kicker="Phase 9 · The dependency graph"
      title="Why the Order Is Not Negotiable"
      intro="Skills are not a flat list — they are a graph. Deep Learning sits on ML and Mathematics; NLP sits on Deep Learning. The engine walks this graph, so it will never recommend NLP to someone whose Deep Learning is 15, no matter how tempting the payoff looks."
    >
      <div className="panel p-5 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mono-label text-[8.5px] text-faint">HIGHLIGHT REQUIREMENTS OF →</span>
          {GAP_CAREERS.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => setCareerId(c.id)}
              className={`mono-label border px-2.5 py-1.5 text-[9px] transition-all duration-200 ${
                c.id === careerId ? "border-cyan bg-cyan/15 text-cyan" : "border-line text-faint hover:border-cyan/50 hover:text-dim"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <svg viewBox="0 0 720 330" className="w-full border border-line/70 bg-base/60" role="img" aria-label="Skill prerequisite graph">
          {edges.map((e, i) => {
            const active = required.has(e.to.id) || required.has(e.from.id);
            return (
              <line
                key={i}
                x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
                stroke={active ? CYAN : "#1c2c44"}
                strokeWidth={active ? 1.6 : 1}
                opacity={active ? 0.75 : 0.5}
                className="transition-all duration-500"
              />
            );
          })}
          {GAP_SKILLS.map((s) => {
            const isReq = required.has(s.id);
            return (
              <g key={s.id} className="transition-all duration-500">
                <circle
                  cx={s.x} cy={s.y} r="7"
                  fill={isReq ? CYAN : "#0f1c31"}
                  stroke={isReq ? CYAN : "#2a3d5c"}
                  strokeWidth="1.5"
                  opacity={isReq ? 1 : 0.8}
                />
                <text
                  x={s.x} y={s.y + 22} textAnchor="middle"
                  className="font-mono transition-all duration-500"
                  fontSize="10.5"
                  fill={isReq ? "#d7e6ff" : "#8fa3c4"}
                >
                  {s.label}
                </text>
                {s.prereq.length > 0 && (
                  <text x={s.x} y={s.y - 14} textAnchor="middle" className="font-mono" fontSize="7.5" fill="#5b708f">
                    needs {s.prereq.map((p) => skillLabel(p).split(" ")[0]).join(" · ")}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <p className="flex items-center gap-2 font-mono text-[10.5px] text-faint">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan" /> required by {career.name}
          </p>
          <p className="flex items-center gap-2 font-mono text-[10.5px] text-faint">
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#2a3d5c] bg-[#0f1c31]" /> not required (ignored)
          </p>
          <p className="flex items-center gap-2 font-mono text-[10.5px] text-faint">
            <span className="inline-block h-[2px] w-6 bg-cyan/70" /> prerequisite edge
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §53 · Gate G-9 ---------- */

const G9_CHECK = [
  "Gap math frozen: weighted shortfall, honest effort constants, payoff-per-effort — all three defined before any profile is scored",
  "Prerequisite DAG specified: 12 skills, edges from the Digital Twin's technical taxonomy, floor of 60 to satisfy a prerequisite",
  "'Learn next' is derived — highest actionable payoff-per-effort — and blocked skills name their exact missing foundation",
  "Live engine demonstrated on seeded profiles; the ordering it produces is reproducible from the frozen formulas",
  "Honesty: effort hours are planning constants from the learning-resource corpus, labeled as such — never a promise of speed",
  "The engine ranks skills to learn, never students. A gap is an address to work on, not a verdict",
];

export function GateG9Section({ g9, onApprove }: { g9: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s53"
      index="53"
      kicker="Gate G-9"
      title="Approval Gate — Phase 9"
      intro="Phase 9 stops here by design. The gap engine is specified and running; wiring it to the real Digital Twin and the learning recommender begins only when this gate passes."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 9 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G9_CHECK.map((d, i) => (
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
            <Corners color={g9 ? GREEN : AMBER} />
            <p className={`mono-label ${g9 ? "text-green" : "text-amber"}`}>
              {g9 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g9
                ? "Phase 9 approved. Phase 10 — Recommendation Engine — unlocked."
                : "Approve the gap engine to unlock Phase 10 — Recommendation Engine."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g9
                ? "Next: the learning recommender turns each ranked gap into skills, courses, projects and a sequence — every suggestion traceable to the shortfall that caused it."
                : "On approval, Phase 10 builds the recommender that converts each ranked gap into concrete learning actions — with a reason attached to every recommendation."}
            </p>

            {!g9 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 9 — proceed to the recommender</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-9 · DT-CIS-SD-001 · REV I</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any 'learn next' that is asserted rather than derived, any effort figure presented as a
                guarantee, and any ordering that ignores prerequisites. The engine's value is that its
                advice can be traced back to a formula — the moment it cannot, it is just an opinion.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
