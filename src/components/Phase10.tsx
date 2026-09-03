import { useMemo, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";
import { GAP_SKILLS, GAP_CAREERS, computeGaps, type GapRow } from "./Phase9";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

const skillLabel = (id: string) => GAP_SKILLS.find((s) => s.id === id)?.label ?? id;

/* ============================================================
   The recommendation engine. Rules are frozen, the catalog is
   honest (free / free-to-audit only, no affiliate anything),
   and every recommendation below is a pure function of the gap
   table from Phase 9 — drag a slider and watch it re-derive.
   ============================================================ */

/* ---------- §54 · The honest catalog ---------- */

export type ResKind = "course" | "interactive" | "book" | "videos" | "practice";

export interface CatalogItem {
  skill: string;
  name: string;
  kind: ResKind;
  hours: number;
  note: string;
}

export const CATALOG: CatalogItem[] = [
  { skill: "python", name: "CS50P — Intro to Programming with Python", kind: "course", hours: 40, note: "Harvard, free. The standard honest starting point; the certificate is optional." },
  { skill: "python", name: "Automate the Boring Stuff with Python", kind: "book", hours: 25, note: "Free online. Best when you want Python doing real tasks within the first week." },
  { skill: "statistics", name: "Khan Academy — Statistics & Probability", kind: "interactive", hours: 30, note: "Free, self-paced. Covers exactly the syllabus the twin's models depend on." },
  { skill: "statistics", name: "Seeing Theory (Brown University)", kind: "interactive", hours: 8, note: "Free visual probability. Intuition first, formulas second." },
  { skill: "math", name: "3Blue1Brown — Essence of Linear Algebra", kind: "videos", hours: 12, note: "Free. The geometric intuition every ML course quietly assumes." },
  { skill: "math", name: "3Blue1Brown — Essence of Calculus", kind: "videos", hours: 10, note: "Free. Same series; the 'why' behind gradient descent." },
  { skill: "sql", name: "SQLZoo", kind: "interactive", hours: 15, note: "Free interactive exercises. The fastest honest route to working SQL." },
  { skill: "sql", name: "Mode — SQL Tutorial", kind: "interactive", hours: 12, note: "Free, analytics-flavored, runs on real datasets." },
  { skill: "ml", name: "Google — Machine Learning Crash Course", kind: "course", hours: 15, note: "Free, short, practical. A sane first ML course with no hand-waving." },
  { skill: "ml", name: "Kaggle Learn — Intro to Machine Learning", kind: "practice", hours: 6, note: "Free micro-course. Learn by submitting, not by watching." },
  { skill: "data_analysis", name: "Kaggle Learn — pandas + Data Visualization", kind: "practice", hours: 10, note: "Free micro-courses on real data; the analyst's daily toolkit." },
  { skill: "data_analysis", name: "Google Data Analytics (audit track)", kind: "course", hours: 60, note: "Free to audit. Long — only worth it if the analyst track is the target." },
  { skill: "deep_learning", name: "3Blue1Brown — Neural Networks series", kind: "videos", hours: 4, note: "Free. Watch this the evening before any DL course." },
  { skill: "deep_learning", name: "fast.ai — Practical Deep Learning for Coders", kind: "course", hours: 60, note: "Free, top-down, code-first. The classic 'build first, theory after' path." },
  { skill: "mlops", name: "Made With ML — MLOps course", kind: "course", hours: 30, note: "Free and production-oriented. The closest thing to a job-shaped course." },
  { skill: "mlops", name: "Google MLOps whitepapers", kind: "book", hours: 6, note: "Free. The vocabulary of the field, straight from practitioners." },
  { skill: "cloud", name: "AWS Cloud Practitioner Essentials", kind: "course", hours: 18, note: "AWS's own free digital training. Vendor-neutral basics, vendor's materials." },
  { skill: "cloud", name: "Google Cloud Skills Boost — intro quests", kind: "interactive", hours: 10, note: "Free hands-on labs; the console stops being scary fast." },
  { skill: "nlp", name: "Hugging Face — NLP Course", kind: "course", hours: 25, note: "Free. The modern transformers workflow, taught by the people who maintain it." },
  { skill: "nlp", name: "spaCy — free interactive course", kind: "interactive", hours: 8, note: "Free. The classical pipeline — still the right tool for most production NLP." },
  { skill: "cv", name: "CS231n — Convolutional Neural Networks (lectures)", kind: "videos", hours: 30, note: "Stanford, free online. The canonical CV course." },
  { skill: "cv", name: "Kaggle — beginner CV competitions", kind: "practice", hours: 20, note: "Free. Portfolio-grade practice: a leaderboard is honest feedback." },
  { skill: "web_dev", name: "MDN — Learn Web Development", kind: "course", hours: 40, note: "Free, maintained by Mozilla. The reference path, no upsell." },
  { skill: "web_dev", name: "freeCodeCamp — Responsive Web Design", kind: "practice", hours: 60, note: "Free and project-based. Ship five small sites before touching a framework." },
];

const KIND_META: Record<ResKind, { label: string; color: string }> = {
  course: { label: "COURSE", color: CYAN },
  interactive: { label: "INTERACTIVE", color: GREEN },
  book: { label: "BOOK / READING", color: AMBER },
  videos: { label: "VIDEO SERIES", color: "#9db8ff" },
  practice: { label: "PRACTICE", color: ROSE },
};

export function CatalogSection() {
  const [kind, setKind] = useState<ResKind | "all">("all");
  const shown = CATALOG.filter((c) => kind === "all" || c.kind === kind);
  const totalHours = shown.reduce((s, c) => s + c.hours, 0);

  return (
    <Section
      id="s54"
      index="54"
      kicker="Phase 10 · The catalog"
      title="A Catalog That Can Look You in the Eye"
      intro="Twenty-four resources across the twelve skills — every one free or free-to-audit, none affiliated, each with a written reason for its seat. The recommender may only draw from this shelf; if a resource isn't here, it can never be recommended, which is exactly the point."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setKind("all")}
          className={`mono-label border px-2.5 py-1 text-[9px] transition-all duration-200 ${
            kind === "all" ? "border-cyan bg-cyan/15 text-cyan" : "border-line text-faint hover:border-cyan/50 hover:text-dim"
          }`}
        >
          ALL · {CATALOG.length}
        </button>
        {(Object.keys(KIND_META) as ResKind[]).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`mono-label border px-2.5 py-1 text-[9px] transition-all duration-200 ${
              kind === k ? "bg-cyan/15 text-cyan" : "text-faint hover:text-dim"
            }`}
            style={{ borderColor: kind === k ? CYAN : undefined }}
          >
            {KIND_META[k].label} · {CATALOG.filter((c) => c.kind === k).length}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-faint">
          shelf total <span className="text-cyan">{totalHours}h</span> · paid items: <span className="text-rose">0</span>
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <div
            key={c.name}
            className="group border border-line/80 bg-base/40 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/50"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="mono-label border px-1.5 py-0.5 text-[7.5px]"
                style={{ color: KIND_META[c.kind].color, borderColor: `${KIND_META[c.kind].color}55` }}
              >
                {KIND_META[c.kind].label}
              </span>
              <span className="mono-label text-[8.5px] text-faint">~{c.hours}h · FREE</span>
            </div>
            <p className="display-head mt-2 text-[14px] leading-snug text-ink">{c.name}</p>
            <p className="mt-0.5 font-mono text-[10px] text-cyan/80">→ {skillLabel(c.skill)}</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-faint">{c.note}</p>
          </div>
        ))}
      </div>

      <Reveal delay={100}>
        <div className="mt-5 border-l-2 border-green/60 pl-3.5">
          <p className="text-[12.5px] leading-relaxed text-faint">
            <span className="mono-label mr-2 text-green">Selection rules</span>
            free or free-to-audit only · no affiliate links, ever · one canonical path per skill plus one
            alternative learning style · every entry states why it earned its seat. The day this shelf
            starts earning commission is the day it stops being advice.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §55 · The live sequence builder ---------- */

const R10_PROFILE: Record<string, number> = {
  python: 70, statistics: 45, math: 55, sql: 40, web_dev: 60,
  ml: 55, data_analysis: 50, cloud: 30, deep_learning: 25, mlops: 20, nlp: 15, cv: 15,
};

interface Step extends GapRow { order: number; unlocks: string[] }

function buildSequence(rows: GapRow[], cap: number): { seq: Step[]; later: GapRow[] } {
  const active = rows.filter((r) => r.gap > 0);
  const placed = new Set<string>();
  const seq: Step[] = [];
  const pool = [...active];
  while (pool.length > 0 && seq.length < cap) {
    const ready = pool.filter((r) =>
      r.skill.prereq.every((p) => placed.has(p) || (R10_PROFILE[p] ?? 0) >= 60)
    );
    if (ready.length === 0) break;
    ready.sort((a, b) => b.payoff - a.payoff);
    const next = ready[0];
    pool.splice(pool.indexOf(next), 1);
    placed.add(next.skill.id);
    const unlocks = active
      .filter((r) => r !== next && r.skill.prereq.includes(next.skill.id))
      .map((r) => r.skill.label);
    seq.push({ ...next, order: seq.length + 1, unlocks });
  }
  return { seq, later: pool.sort((a, b) => b.payoff - a.payoff) };
}

const HEAVY_THRESHOLD = 35; // hours — two heavy blocks in a row earn a build checkpoint

export function RoadmapBuilderSection() {
  const [careerId, setCareerId] = useState("mle");
  const [profile, setProfile] = useState({ ...R10_PROFILE });
  const [weekly, setWeekly] = useState(8);

  const career = GAP_CAREERS.find((c) => c.id === careerId)!;
  const rows = useMemo(() => computeGaps(career, profile), [career, profile]);
  const { seq, later } = useMemo(() => buildSequence(rows, 6), [rows]);

  // interleave practice checkpoints after every two consecutive heavy blocks
  const timeline: ({ type: "block"; step: Step } | { type: "checkpoint"; after: number })[] = [];
  let heavyRun = 0;
  seq.forEach((step) => {
    timeline.push({ type: "block", step });
    heavyRun = step.effortHours > HEAVY_THRESHOLD ? heavyRun + 1 : 0;
    if (heavyRun >= 2) {
      timeline.push({ type: "checkpoint", after: step.order });
      heavyRun = 0;
    }
  });

  let cumulative = 0;
  const cumAt: Record<number, number> = {};
  seq.forEach((s) => {
    cumulative += s.effortHours;
    cumAt[s.order] = cumulative;
  });
  const totalWeeks = Math.max(1, Math.ceil(cumulative / weekly));
  const topPayoff = seq.length ? Math.max(...seq.map((s) => s.payoff)) : 0;

  return (
    <Section
      id="s55"
      index="55"
      kicker="Phase 10 · The engine, running"
      title="Your Next Six Moves — Derived, Not Decreed"
      intro="The same gap math from §51, now answering 'what do I actually do'. Order is prerequisite-respecting and payoff-ranked; every card cites the shortfall, the ranking and the doors it opens. Drag any slider — the sequence re-derives on the spot."
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.3fr]">
        {/* controls */}
        <div className="space-y-4">
          <Reveal>
            <div className="panel p-4 sm:p-5">
              <p className="mono-label text-[8.5px] text-faint">Target career</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {GAP_CAREERS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCareerId(c.id)}
                    className={`mono-label border px-2 py-1.5 text-left text-[8.5px] transition-all duration-200 ${
                      careerId === c.id
                        ? "border-cyan bg-cyan/15 text-cyan"
                        : "border-line text-faint hover:border-cyan/40 hover:text-dim"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel p-4 sm:p-5">
              <p className="mono-label text-[8.5px] text-faint">Current profile · drag to change</p>
              <div className="mt-3 space-y-2">
                {Object.keys(R10_PROFILE).map((sid) => (
                  <div key={sid} className="flex items-center gap-2">
                    <span className="mono-label w-24 shrink-0 text-[8px] text-dim">{skillLabel(sid)}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={profile[sid]}
                      onChange={(e) => setProfile((p) => ({ ...p, [sid]: Number(e.target.value) }))}
                      className="twin-range h-1 flex-1 cursor-ew-resize"
                      aria-label={`${skillLabel(sid)} level`}
                    />
                    <span className="w-8 text-right font-mono text-[11px] text-cyan">{profile[sid]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-line pt-3">
                <div className="flex items-center gap-2">
                  <span className="mono-label w-24 shrink-0 text-[8px] text-dim">Hours / week</span>
                  <input
                    type="range"
                    min={4}
                    max={20}
                    value={weekly}
                    onChange={(e) => setWeekly(Number(e.target.value))}
                    className="twin-range h-1 flex-1 cursor-ew-resize"
                    aria-label="study hours per week"
                  />
                  <span className="w-8 text-right font-mono text-[11px] text-amber">{weekly}</span>
                </div>
                <p className="mt-2 font-mono text-[10.5px] text-faint">
                  {cumulative}h planned → <span className="text-amber">≈ {totalWeeks} weeks</span> at {weekly}h/wk
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* sequence */}
        <div>
          {seq.length === 0 ? (
            <div className="panel flex h-full items-center justify-center p-8">
              <p className="text-center text-[13px] text-faint">
                No gaps above zero for this profile and target —{" "}
                <span className="text-green">the engine recommends nothing, which is itself a recommendation.</span>
              </p>
            </div>
          ) : (
            <div className="relative pl-5">
              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line" aria-hidden="true" />
              <div className="space-y-3">
                {timeline.map((t, i) =>
                  t.type === "checkpoint" ? (
                    <Reveal key={`cp-${t.after}`} delay={i * 60}>
                      <div className="relative flex items-center gap-3 border border-dashed border-green/50 bg-green/5 px-4 py-2.5">
                        <span className="absolute -left-5 h-[9px] w-[9px] rounded-full border-2 border-green bg-base" />
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-green" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M2.5 8.5 L6.5 12.5 L13.5 4" />
                        </svg>
                        <p className="text-[12px] text-dim">
                          <span className="mono-label mr-2 text-[8.5px] text-green">CHECKPOINT</span>
                          Two heavy blocks done — build one small thing with what you just learned before
                          continuing. Evidence beats momentum.
                        </p>
                      </div>
                    </Reveal>
                  ) : (
                    <Reveal key={t.step.skill.id} delay={i * 60}>
                      <div className="group relative border border-line/80 bg-base/50 p-3.5 transition-all duration-200 hover:border-cyan/50 hover:shadow-[0_0_24px_rgba(107,225,255,0.07)] sm:p-4">
                        <span className="absolute -left-5 top-4 h-[9px] w-[9px] rounded-full border-2 border-cyan bg-base transition-colors duration-200 group-hover:bg-cyan" />
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="display-head text-[15px] text-cyan">{String(t.step.order).padStart(2, "0")}</span>
                          <p className="display-head text-[16px] text-ink">{t.step.skill.label}</p>
                          <span className="font-mono text-[10.5px] text-faint">
                            {t.step.current} → <span className="text-cyan">{t.step.target}</span>
                          </span>
                          {t.step.payoff === topPayoff && <Tag tone="green">#1 payoff</Tag>}
                          <span className="ml-auto font-mono text-[11px] text-amber">~{t.step.effortHours}h</span>
                        </div>
                        {/* effort bar */}
                        <div className="mt-2.5 h-1.5 w-full bg-line/40">
                          <div
                            className="h-full bg-gradient-to-r from-cyan/70 to-cyan transition-all duration-500"
                            style={{ width: `${Math.min(100, (t.step.effortHours / 120) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-2.5 text-[12.5px] leading-relaxed text-dim">
                          <span className="text-green">WHY:</span> closing this removes a{" "}
                          <span className="text-ink">{t.step.shortfall.toFixed(0)}-pt weighted shortfall</span>{" "}
                          (gap {t.step.gap} × career weight {t.step.weight.toFixed(2)}) — ranked #
                          {seq.filter((s) => s.payoff >= t.step.payoff).length} of {seq.length} by
                          payoff-per-effort
                          {t.step.unlocks.length > 0 && (
                            <>
                              {" "}· unlocks <span className="text-cyan">{t.step.unlocks.join(", ")}</span>
                            </>
                          )}
                          .
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-faint">
                          week {Math.ceil((cumAt[t.step.order] - t.step.effortHours) / weekly) + 1}–
                          {Math.ceil(cumAt[t.step.order] / weekly)} · running total {cumAt[t.step.order]}h
                        </p>
                      </div>
                    </Reveal>
                  )
                )}
                {later.length > 0 && (
                  <Reveal delay={(timeline.length + 1) * 60}>
                    <div className="relative border border-line/60 bg-base/30 px-4 py-3">
                      <span className="absolute -left-5 top-4 h-[9px] w-[9px] rounded-full border-2 border-line bg-base" />
                      <p className="mono-label text-[8.5px] text-faint">
                        Then, in payoff order — {later.map((r) => r.skill.label).join(" · ")}
                      </p>
                      <p className="mt-1 text-[11.5px] text-faint">
                        Sequenced after the first six; the engine re-ranks them as your profile changes.
                      </p>
                    </div>
                  </Reveal>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ---------- §56 · Why not ---------- */

const WHY_NOT = [
  {
    rejected: "A paid Python bootcamp (~$5,000)",
    reason: "The free paths above (CS50P + Automate the Boring Stuff) cover the same ground. Money changes the incentive structure of advice, so the catalog has none of it.",
    rule: "Selection rule — free only",
  },
  {
    rejected: "A cloud certification, right now",
    reason: "Your profile shows Cloud at 30 with a 15-h gap to floor. Certificates certify skill you already have; they do not create it. Build the skill first — the cert can wait for Phase 15 scenarios.",
    rule: "Rule R-2 — fill gaps before collecting paper",
  },
  {
    rejected: "An advanced transformers course",
    reason: "Blocked by the prerequisite DAG: Deep Learning sits below the 60-pt floor. Recommending it now would set you up to drown — the engine refuses.",
    rule: "Rule R-1 — prerequisites gate the order",
  },
  {
    rejected: "A competitive-programming track",
    reason: "Not connected to any shortfall on the selected target. Interesting, adjacent, and wrong for this goal — the catalog has better uses for those hours.",
    rule: "Every item must trace to a shortfall",
  },
];

export function WhyNotSection() {
  return (
    <Section
      id="s56"
      index="56"
      kicker="Phase 10 · Transparency"
      title="The Why-Not Panel"
      intro="A recommender you cannot interrogate is a salesperson. For every plan the engine produces, the application must also render the plausible things it declined — and the rule each one fell to."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {WHY_NOT.map((w, i) => (
          <Reveal key={w.rejected} delay={i * 80}>
            <div className="panel h-full p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mono-label mt-0.5 border border-rose/50 px-2 py-1 text-[8.5px] text-rose">DECLINED</span>
                <div>
                  <p className="display-head text-[15px] text-ink">{w.rejected}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{w.reason}</p>
                  <p className="mt-2 font-mono text-[10px] text-rose/80">↳ {w.rule}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <p className="mt-5 border-l-2 border-amber/60 pl-3.5 text-[12.5px] leading-relaxed text-faint">
          <span className="mono-label mr-2 text-amber">Design obligation</span>
          the shipped application renders this panel beneath every learning plan, populated from the
          same rule trace — not hand-written copy. If the rules cannot explain a refusal, the refusal
          is not allowed.
        </p>
      </Reveal>
    </Section>
  );
}

/* ---------- §57 · Gate G-10 ---------- */

const G10_CHECK = [
  "Catalog frozen at 24 items: free / free-to-audit only, zero affiliate ties, a written selection reason per seat",
  "Recommender is a pure function of (gap table, prerequisite DAG, catalog) — deterministic, unit-testable, replayable",
  "Sequence rules signed: prerequisite gating (R-1), gap-before-certificate (R-2), payoff ordering (R-3), two-heavy-blocks-then-build rhythm",
  "Every recommendation carries a citable why: shortfall points, rank by payoff-per-effort, doors unlocked",
  "Why-not panel is a rendering obligation, populated from the rule trace — refusals must be explainable or withdrawn",
  "The What-If simulator (Phase 15) is contracted to reuse this exact engine — one source of truth for 'what should I do'",
];

export function GateG10Section({ g10, onApprove }: { g10: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s57"
      index="57"
      kicker="Gate G-10"
      title="Approval Gate — Phase 10"
      intro="Phase 10 stops here by design. The recommender's rules, catalog and transparency obligations are complete; the Intelligence stage is one engine away from closing."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 10 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G10_CHECK.map((d, i) => (
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
            <Corners color={g10 ? GREEN : AMBER} />
            <p className={`mono-label ${g10 ? "text-green" : "text-amber"}`}>
              {g10 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g10
                ? "Phase 10 approved. Phase 11 — NLP Resume Intelligence — unlocked."
                : "Approve the recommendation engine to unlock Phase 11 — NLP Resume Analysis."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g10
                ? "Next: the extraction pipeline that turns a pasted CV into normalized skills and experience — with confidence scores, graceful failure, and a hard rule against silent guessing."
                : "On approval, Phase 11 specifies the resume pipeline: entity extraction, skill normalization against the §47 vocabulary, confidence-tagged gaps — and what the system says when it isn't sure."}
            </p>

            {!g10 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 10 — proceed to resume intelligence</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-10 · DT-CIS-SD-001 · REV J</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any recommended resource that costs money, earns commission, or cannot trace itself to
                a measured shortfall. Advice with an invoice attached is not advice — it is a
                transaction wearing advice's clothes.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
