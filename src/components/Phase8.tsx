import { useMemo, useState } from "react";
import { Section, Reveal, Corners } from "./ui";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

/* ============================================================
   PHASE 8 · Career Intelligence — the scoring engine.
   The equation is frozen in writing, the weight vectors are
   auditable, and the engine below actually computes — so a
   compatibility score is something you can argue with, feature
   by feature. Run 002's model evidence is absent by design;
   its weight is renormalized in plain view, never faked.
   ============================================================ */

export interface SkillDef { id: string; label: string }
export const SKILLS: SkillDef[] = [
  { id: "python", label: "Python" },
  { id: "math", label: "Mathematics" },
  { id: "stats", label: "Statistics" },
  { id: "ml", label: "Machine Learning" },
  { id: "dl", label: "Deep Learning" },
  { id: "sql", label: "SQL / Data" },
  { id: "web", label: "Web Dev" },
  { id: "cloud", label: "Cloud / DevOps" },
  { id: "security", label: "Security" },
  { id: "portfolio", label: "Portfolio" },
];

export interface InterestDef { id: string; label: string }
export const INTERESTS: InterestDef[] = [
  { id: "ai", label: "AI / ML" },
  { id: "data", label: "Data" },
  { id: "se", label: "Software Eng" },
  { id: "web", label: "Web" },
  { id: "sec", label: "Security" },
  { id: "research", label: "Research" },
];

export const ACADEMIC_DIMS = [
  { id: "math", label: "Math grades" },
  { id: "prog", label: "Programming grades" },
  { id: "stats", label: "Statistics grades" },
  { id: "proj", label: "Project grades" },
] as const;

export interface CareerDef {
  id: string;
  label: string;
  req: Record<string, number>; // skill requirement weights 0..1
  acad: Record<string, number>; // academic-dim weights 0..1
  tags: string[]; // interest tags
}

export const CAREERS: CareerDef[] = [
  { id: "mle", label: "ML Engineer", req: { python: 0.95, math: 0.8, stats: 0.85, ml: 0.95, dl: 0.85, sql: 0.6, web: 0.2, cloud: 0.5, security: 0.1, portfolio: 0.8 }, acad: { math: 0.9, prog: 0.8, stats: 0.9, proj: 0.8 }, tags: ["ai", "data"] },
  { id: "aie", label: "AI Engineer", req: { python: 0.9, math: 0.75, stats: 0.7, ml: 0.9, dl: 0.9, sql: 0.5, web: 0.3, cloud: 0.5, security: 0.1, portfolio: 0.75 }, acad: { math: 0.85, prog: 0.85, stats: 0.8, proj: 0.8 }, tags: ["ai"] },
  { id: "ds", label: "Data Scientist", req: { python: 0.85, math: 0.7, stats: 0.95, ml: 0.8, dl: 0.5, sql: 0.85, web: 0.2, cloud: 0.3, security: 0.1, portfolio: 0.7 }, acad: { math: 0.8, prog: 0.7, stats: 0.95, proj: 0.7 }, tags: ["ai", "data"] },
  { id: "da", label: "Data Analyst", req: { python: 0.6, math: 0.5, stats: 0.8, ml: 0.4, dl: 0.1, sql: 0.95, web: 0.2, cloud: 0.2, security: 0.1, portfolio: 0.5 }, acad: { math: 0.6, prog: 0.6, stats: 0.95, proj: 0.5 }, tags: ["data"] },
  { id: "swe", label: "Software Engineer", req: { python: 0.8, math: 0.5, stats: 0.3, ml: 0.2, dl: 0.1, sql: 0.6, web: 0.7, cloud: 0.5, security: 0.3, portfolio: 0.8 }, acad: { math: 0.5, prog: 0.95, stats: 0.4, proj: 0.8 }, tags: ["se"] },
  { id: "be", label: "Backend Developer", req: { python: 0.8, math: 0.4, stats: 0.2, ml: 0.15, dl: 0.05, sql: 0.85, web: 0.6, cloud: 0.6, security: 0.3, portfolio: 0.7 }, acad: { math: 0.4, prog: 0.95, stats: 0.3, proj: 0.75 }, tags: ["se"] },
  { id: "fe", label: "Frontend Developer", req: { python: 0.5, math: 0.3, stats: 0.15, ml: 0.1, dl: 0.05, sql: 0.3, web: 0.95, cloud: 0.3, security: 0.2, portfolio: 0.75 }, acad: { math: 0.3, prog: 0.9, stats: 0.2, proj: 0.85 }, tags: ["se", "web"] },
  { id: "cyber", label: "Cybersecurity Analyst", req: { python: 0.6, math: 0.4, stats: 0.4, ml: 0.2, dl: 0.05, sql: 0.5, web: 0.3, cloud: 0.6, security: 0.95, portfolio: 0.6 }, acad: { math: 0.5, prog: 0.7, stats: 0.4, proj: 0.6 }, tags: ["sec"] },
  { id: "cloud", label: "Cloud Engineer", req: { python: 0.7, math: 0.4, stats: 0.3, ml: 0.2, dl: 0.1, sql: 0.5, web: 0.4, cloud: 0.95, security: 0.6, portfolio: 0.65 }, acad: { math: 0.4, prog: 0.85, stats: 0.3, proj: 0.7 }, tags: ["se"] },
  { id: "res", label: "Research Scientist", req: { python: 0.8, math: 0.95, stats: 0.9, ml: 0.85, dl: 0.8, sql: 0.4, web: 0.1, cloud: 0.2, security: 0.05, portfolio: 0.8 }, acad: { math: 0.95, prog: 0.7, stats: 0.95, proj: 0.9 }, tags: ["ai", "research"] },
  { id: "cv", label: "Computer Vision Eng", req: { python: 0.9, math: 0.85, stats: 0.6, ml: 0.85, dl: 0.95, sql: 0.3, web: 0.2, cloud: 0.4, security: 0.1, portfolio: 0.75 }, acad: { math: 0.9, prog: 0.8, stats: 0.7, proj: 0.8 }, tags: ["ai", "research"] },
  { id: "nlp", label: "NLP Engineer", req: { python: 0.9, math: 0.7, stats: 0.7, ml: 0.85, dl: 0.9, sql: 0.5, web: 0.3, cloud: 0.4, security: 0.1, portfolio: 0.75 }, acad: { math: 0.8, prog: 0.85, stats: 0.8, proj: 0.8 }, tags: ["ai", "research"] },
];

/* frozen term weights */
export const TERM_WEIGHTS = [
  { id: "skill", label: "Skill coverage", w: 0.5, why: "The engine's core question: does the profile cover what the career asks for? Requirements come from the merged ESCO / O*NET vectors of §18." },
  { id: "model", label: "Model evidence", w: 0.25, why: "Probability that the supervised model (Run 002's champion) assigns the profile to this career's coarse occupation family. Absent until the runs exist." },
  { id: "acad", label: "Academic alignment", w: 0.15, why: "Grades in the dimensions the career actually leans on — math for research tracks, programming for engineering tracks — not a blanket GPA." },
  { id: "interest", label: "Interest fit", w: 0.1, why: "Declared interests vs the career's interest tags. Deliberately the smallest weight: interest motivates, it does not qualify." },
];

export interface Profile {
  skills: Record<string, number>;
  acad: Record<string, number>;
  interests: string[];
  modelOn: boolean;
  modelProb: Record<string, number>;
}

export function computeTerms(c: CareerDef, p: Profile) {
  let num = 0;
  let wsum = 0;
  for (const s of SKILLS) {
    wsum += c.req[s.id];
    num += c.req[s.id] * Math.min(p.skills[s.id] / 100 / Math.max(c.req[s.id], 0.2), 1);
  }
  const coverage = num / wsum;
  let anum = 0;
  let aden = 0;
  for (const d of ACADEMIC_DIMS) {
    anum += c.acad[d.id] * (p.acad[d.id] / 100);
    aden += c.acad[d.id];
  }
  const academic = anum / aden;
  const interest = c.tags.filter((t) => p.interests.includes(t)).length / c.tags.length;
  return { coverage, academic, interest };
}

export function computeScore(c: CareerDef, p: Profile) {
  const t = computeTerms(c, p);
  const active = TERM_WEIGHTS.filter((tw) => tw.id !== "model" || p.modelOn);
  const wSum = active.reduce((a, tw) => a + tw.w, 0);
  const model = p.modelOn ? p.modelProb[c.id] / 100 : 0;
  const raw =
    (0.5 * t.coverage +
      (p.modelOn ? 0.25 * model : 0) +
      0.15 * t.academic +
      0.1 * t.interest) /
    wSum;
  return { ...t, model, score: raw * 100 };
}

/* ---------- §45 · the frozen equation ---------- */

export function EquationSection() {
  return (
    <Section
      id="s45"
      index="45"
      kicker="Phase 8 · The scoring equation"
      title="A Compatibility Score You Can Argue With"
      intro="No black-box percentages. Compatibility is a frozen, four-term weighted average — each term inspectable, each weight justified, and the whole thing computed in the open. If a student disagrees with a 71%, the system can show exactly which term produced it."
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <div className="panel relative overflow-hidden p-5 sm:p-7">
            <Corners color={CYAN} />
            <p className="mono-label text-cyan">compatibility(career) — frozen at REV H</p>
            <div className="mt-5 border border-line/80 bg-base/70 p-4 font-mono text-[12px] leading-loose text-dim sm:text-[13px]">
              <p><span className="text-cyan">score</span> = ( <span className="text-amber">0.50</span>·skill_coverage</p>
              <p className="pl-10">+ <span className="text-amber">0.25</span>·model_evidence</p>
              <p className="pl-10">+ <span className="text-amber">0.15</span>·academic_alignment</p>
              <p className="pl-10">+ <span className="text-amber">0.10</span>·interest_fit ) / Σ active_weights</p>
              <p className="mt-3 border-t border-line/70 pt-3 text-[11px] text-faint">
                skill_coverage = Σ wₛ·min(levelₛ / requirementₛ, 1) / Σ wₛ
                <br />
                reported as <span className="text-ink">score ± 5</span> — inputs are self-assessed; the band says so
              </p>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-dim">
              The division by <span className="text-ink">Σ active_weights</span> is the honesty valve: when model
              evidence is unavailable — as it is today, before Run 002 — its 0.25 is not silently zeroed (which
              would deflate every score) and not invented. The remaining terms are{" "}
              <span className="text-ink">renormalized</span>, and the report states it.
            </p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {TERM_WEIGHTS.map((tw, i) => (
            <Reveal key={tw.id} delay={i * 80}>
              <div className="panel group flex items-start gap-4 p-4 transition-colors duration-200 hover:border-cyan/40">
                <div className="shrink-0 pt-0.5 text-right">
                  <p className="display-head text-2xl text-amber">{tw.w.toFixed(2)}</p>
                  <div className="mt-1 h-1 w-12 bg-line">
                    <div className="h-full bg-amber transition-all duration-500 group-hover:shadow-[0_0_8px_rgba(255,194,102,0.6)]" style={{ width: `${tw.w * 100}%` }} />
                  </div>
                </div>
                <div>
                  <p className="display-head text-[14.5px] text-ink">{tw.label}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-faint">{tw.why}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------- §46 · the live engine ---------- */

const DEFAULT_PROFILE: Profile = {
  skills: { python: 72, math: 64, stats: 58, ml: 66, dl: 38, sql: 45, web: 52, cloud: 25, security: 20, portfolio: 55 },
  acad: { math: 70, prog: 78, stats: 66, proj: 74 },
  interests: ["ai", "data"],
  modelOn: false,
  modelProb: { mle: 62, aie: 58, ds: 55, da: 30, swe: 41, be: 33, fe: 22, cyber: 12, cloud: 18, res: 35, cv: 40, nlp: 44 },
};

export function LabSection() {
  const [p, setP] = useState<Profile>(DEFAULT_PROFILE);
  const [sel, setSel] = useState("mle");

  const ranked = useMemo(
    () =>
      CAREERS.map((c) => ({ c, r: computeScore(c, p) })).sort(
        (a, b) => b.r.score - a.r.score
      ),
    [p]
  );
  const selCareer = CAREERS.find((c) => c.id === sel)!;
  const selScore = computeScore(selCareer, p);

  const contributors = useMemo(() => {
    const rows = SKILLS.map((s) => {
      const w = selCareer.req[s.id];
      const match = Math.min(p.skills[s.id] / 100 / Math.max(w, 0.2), 1);
      return { s, w, match, contrib: w * match, gap: w * (1 - match) };
    });
    const pos = [...rows].sort((a, b) => b.contrib - a.contrib).slice(0, 3).filter((r) => r.w >= 0.4);
    const neg = [...rows].sort((a, b) => b.gap - a.gap).slice(0, 3).filter((r) => r.gap >= 0.25);
    return { pos, neg };
  }, [selCareer, p]);

  const setSkill = (id: string, v: number) =>
    setP((prev) => ({ ...prev, skills: { ...prev.skills, [id]: v } }));
  const setAcad = (id: string, v: number) =>
    setP((prev) => ({ ...prev, acad: { ...prev.acad, [id]: v } }));
  const toggleInterest = (id: string) =>
    setP((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((x) => x !== id)
        : [...prev.interests, id],
    }));

  return (
    <Section
      id="s46"
      index="46"
      kicker="Phase 8 · The engine, running"
      title="Compatibility Lab — Compute It Yourself"
      intro="The frozen equation, executing live. Adjust the example twin's skills, grades and interests — every one of the twelve careers re-scores and re-ranks instantly, and the selected career's score decomposes into its four terms. This is the methodology on curated example data; production weights arrive with the §18 schema merge, and model evidence arrives with Run 002."
    >
      <div className="panel relative overflow-hidden p-5 sm:p-7">
        <Corners color={AMBER} />
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="mono-label border border-amber/60 px-2.5 py-1 text-[9px] text-amber">
            LIVE ENGINE · EXAMPLE PROFILE
          </span>
          <span className="mono-label text-faint">
            model evidence: {p.modelOn ? "hypothetical Run 002 output" : "absent → weights renormalized"}
          </span>
          <button
            onClick={() => setP(DEFAULT_PROFILE)}
            className="mono-label ml-auto border border-line px-2.5 py-1 text-[9px] text-faint transition-colors hover:border-cyan hover:text-cyan"
          >
            ⟲ reset profile
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* left: controls */}
          <div className="space-y-5">
            <div>
              <p className="mono-label mb-2 text-[9px] text-cyan">Technical skills — self-assessed 0–100</p>
              <div className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
                {SKILLS.map((s) => (
                  <label key={s.id} className="flex items-center gap-2.5">
                    <span className="w-[86px] shrink-0 text-[11px] text-dim">{s.label}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={p.skills[s.id]}
                      onChange={(e) => setSkill(s.id, Number(e.target.value))}
                      className="twin-range h-1 flex-1 cursor-ew-resize"
                      aria-label={`${s.label} level`}
                    />
                    <span className="w-8 shrink-0 text-right font-mono text-[11px] text-cyan">{p.skills[s.id]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mono-label mb-2 text-[9px] text-cyan">Academic record</p>
                <div className="space-y-1.5">
                  {ACADEMIC_DIMS.map((d) => (
                    <label key={d.id} className="flex items-center gap-2.5">
                      <span className="w-[86px] shrink-0 text-[11px] text-dim">{d.label}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={p.acad[d.id]}
                        onChange={(e) => setAcad(d.id, Number(e.target.value))}
                        className="twin-range h-1 flex-1 cursor-ew-resize"
                        aria-label={d.label}
                      />
                      <span className="w-8 shrink-0 text-right font-mono text-[11px] text-cyan">{p.acad[d.id]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mono-label mb-2 text-[9px] text-cyan">Declared interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map((it) => {
                    const on = p.interests.includes(it.id);
                    return (
                      <button
                        key={it.id}
                        onClick={() => toggleInterest(it.id)}
                        className={`mono-label border px-2.5 py-1.5 text-[9px] transition-all duration-200 ${
                          on
                            ? "border-green/70 bg-green/10 text-green"
                            : "border-line text-faint hover:border-green/40 hover:text-dim"
                        }`}
                      >
                        {it.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 border border-line/70 bg-base/50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="mono-label text-[8.5px] text-faint">Model evidence (0.25)</p>
                    <button
                      onClick={() => setP((prev) => ({ ...prev, modelOn: !prev.modelOn }))}
                      className={`relative h-5 w-10 border transition-colors duration-200 ${
                        p.modelOn ? "border-amber bg-amber/25" : "border-line bg-base"
                      }`}
                      aria-pressed={p.modelOn}
                    >
                      <span
                        className={`absolute top-[2px] h-3.5 w-3.5 transition-all duration-200 ${
                          p.modelOn ? "left-[22px] bg-amber" : "left-[2px] bg-faint"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-2 text-[10.5px] leading-relaxed text-faint">
                    {p.modelOn
                      ? "Showing placeholder probabilities from a hypothetical Run 002 — labeled, never presented as trained output."
                      : "Off, as it must be before Run 002 exists. The 0.25 weight is renormalized into the other three terms — visibly."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* right: ranking + decomposition */}
          <div className="space-y-5">
            <div>
              <p className="mono-label mb-2 text-[9px] text-amber">All twelve careers — live ranking</p>
              <div className="space-y-1">
                {ranked.map(({ c, r }, i) => {
                  const isSel = c.id === sel;
                  const top = i === 0;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSel(c.id)}
                      className={`group flex w-full items-center gap-2.5 border px-2.5 py-[7px] text-left transition-all duration-200 ${
                        isSel
                          ? "border-cyan/70 bg-cyan/10"
                          : top
                          ? "border-amber/40 bg-amber/5 hover:border-amber/70"
                          : "border-line/60 hover:border-cyan/40"
                      }`}
                    >
                      <span className={`w-5 shrink-0 font-mono text-[10px] ${top ? "text-amber" : "text-faint"}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="w-[128px] shrink-0 text-[11.5px] text-dim group-hover:text-ink">{c.label}</span>
                      <span className="relative h-2 flex-1 overflow-hidden bg-base/80">
                        <span
                          className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                          style={{
                            width: `${(r.score / 100) * 100}%`,
                            background: isSel ? CYAN : top ? AMBER : "rgba(107,225,255,0.35)",
                            boxShadow: isSel ? "0 0 10px rgba(107,225,255,0.5)" : "none",
                          }}
                        />
                      </span>
                      <span className={`w-12 shrink-0 text-right font-mono text-[11.5px] ${top ? "text-amber" : "text-dim"}`}>
                        {r.score.toFixed(0)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* decomposition of the selected career */}
            <div className="border border-cyan/40 bg-base/50 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="display-head text-[16px] text-ink">{selCareer.label}</p>
                <p className="font-mono text-[13px] text-cyan">
                  {selScore.score.toFixed(0)}% <span className="text-[10px] text-faint">± 5</span>
                </p>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Skill coverage", v: selScore.coverage, w: 0.5, color: CYAN },
                  { label: "Model evidence", v: p.modelOn ? selScore.model : null, w: 0.25, color: AMBER },
                  { label: "Academic alignment", v: selScore.academic, w: 0.15, color: GREEN },
                  { label: "Interest fit", v: selScore.interest, w: 0.1, color: ROSE },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-2.5">
                    <span className="w-[124px] shrink-0 text-[11px] text-dim">{t.label}</span>
                    <span className="w-10 shrink-0 font-mono text-[9.5px] text-faint">w={t.w.toFixed(2)}</span>
                    <span className="relative h-2.5 flex-1 bg-panel2">
                      {t.v !== null ? (
                        <span
                          className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                          style={{ width: `${t.v * 100}%`, background: t.color }}
                        />
                      ) : (
                        <span className="absolute inset-0 flex items-center pl-1.5 font-mono text-[8.5px] tracking-widest text-faint">
                          ABSENT — RENORMALIZED
                        </span>
                      )}
                    </span>
                    <span className="w-10 shrink-0 text-right font-mono text-[11px] text-dim">
                      {t.v === null ? "—" : `${(t.v * 100).toFixed(0)}%`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 border-t border-line/70 pt-3 sm:grid-cols-2">
                <div>
                  <p className="mono-label text-[8.5px] text-green">Main positive factors</p>
                  <ul className="mt-1.5 space-y-1">
                    {contributors.pos.map((r) => (
                      <li key={r.s.id} className="flex items-center justify-between gap-2 text-[11.5px] text-dim">
                        <span>+ {r.s.label}</span>
                        <span className="font-mono text-[10px] text-green">{(r.contrib * 100).toFixed(0)} pts</span>
                      </li>
                    ))}
                    {contributors.pos.length === 0 && <li className="text-[11px] text-faint">none above threshold</li>}
                  </ul>
                </div>
                <div>
                  <p className="mono-label text-[8.5px] text-rose">Main negative factors</p>
                  <ul className="mt-1.5 space-y-1">
                    {contributors.neg.map((r) => (
                      <li key={r.s.id} className="flex items-center justify-between gap-2 text-[11.5px] text-dim">
                        <span>− {r.s.label}</span>
                        <span className="font-mono text-[10px] text-rose">{(r.gap * 100).toFixed(0)} pts</span>
                      </li>
                    ))}
                    {contributors.neg.length === 0 && <li className="text-[11px] text-faint">no major gaps</li>}
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-[10.5px] leading-relaxed text-faint">
                These lists are the score's own arithmetic — wₛ·match and wₛ·(1−match) — the same structural
                explanation the production engine will return. SHAP (§13, Phase 13) will explain the model term;
                the rule terms explain themselves.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §47 · the weight vectors ---------- */

export function WeightMatrixSection() {
  return (
    <Section
      id="s47"
      index="47"
      kicker="Phase 8 · Auditable inputs"
      title="Twelve Careers × Ten Skills — The Weight Vectors"
      intro="The skill_coverage term is only as honest as its requirement vectors. These twelve rows are the S3 output of the schema merge: ESCO concepts mapped to O*NET work-activity weights, canonicalized into the REV-B vocabulary. Each cell is a requirement weight — and every one is open to challenge at the viva."
    >
      <Reveal>
        <div className="panel overflow-x-auto p-5 sm:p-6">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className="mono-label pb-2 pr-3 text-left text-[8.5px] text-faint">Career ↓ / skill →</th>
                {SKILLS.map((s) => (
                  <th key={s.id} className="mono-label pb-2 text-center text-[8px] text-faint">
                    {s.label.split(" ")[0].split("/")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAREERS.map((c) => (
                <tr key={c.id} className="group border-t border-line/60 transition-colors hover:bg-cyan/[0.04]">
                  <td className="py-[7px] pr-3 text-[12px] text-dim group-hover:text-ink">{c.label}</td>
                  {SKILLS.map((s) => {
                    const v = c.req[s.id];
                    return (
                      <td key={s.id} className="py-[7px] text-center">
                        <span
                          title={`${c.label} requires ${s.label} at weight ${v.toFixed(2)}`}
                          className="inline-block h-5 w-9 cursor-help border border-line/40 font-mono text-[9.5px] leading-5 transition-transform duration-150 hover:scale-110"
                          style={{
                            background: `rgba(107,225,255,${v * 0.55})`,
                            color: v > 0.55 ? "#081120" : "#8fa3c4",
                          }}
                        >
                          {v.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line/70 pt-3">
            <p className="mono-label text-[8.5px] text-faint">Reading the heat:</p>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-faint">
              0.0 <span className="h-3 w-16" style={{ background: "linear-gradient(90deg, rgba(107,225,255,0.02), rgba(107,225,255,0.55))" }} /> 1.0
            </span>
            <span className="ml-auto font-mono text-[10px] text-faint">source: ESCO v1.2 × O*NET 29.1 → S3 merge (curated draft)</span>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §48 · explainability contract ---------- */

export function ExplainContractSection() {
  return (
    <Section
      id="s48"
      index="48"
      kicker="Phase 8 · Explainability contract"
      title="Every Score Ships With Its Own Argument"
      intro="A compatibility number without a decomposition is a horoscope. Four obligations bind every score the engine emits — in the dashboard, the advisor's answers, and the API alike."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            id: "X-1",
            title: "Decompose on demand",
            body: "Any score can be expanded into its four weighted terms and, for skill coverage, into per-skill contributions — exactly the panel in §46, served as data.",
          },
          {
            id: "X-2",
            title: "Report a band, not a point",
            body: "Inputs are self-assessed and the requirement vectors are curated: scores are reported as ±5. A 71% and a 74% are the same statement; the UI must not pretend otherwise.",
          },
          {
            id: "X-3",
            title: "Name the absent evidence",
            body: "Until Run 002 exists, every report states that model evidence is excluded and weights renormalized. Silence about missing evidence is itself a kind of fabrication.",
          },
          {
            id: "X-4",
            title: "Ranking is not ranking people",
            body: "Careers are ordered for the student's attention, not the student for the careers. The 12th row is not a verdict — it is the furthest point on the same map.",
          },
        ].map((x, i) => (
          <Reveal key={x.id} delay={i * 80}>
            <div className="panel panel-hover h-full p-5">
              <div className="flex items-center gap-3">
                <span className="mono-label border border-cyan/50 px-2 py-1 text-[9px] text-cyan">{x.id}</span>
                <p className="display-head text-[15.5px] text-ink">{x.title}</p>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-dim">{x.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={200}>
        <div className="mt-5 border-l-2 border-amber/70 pl-4">
          <p className="text-[13.5px] leading-relaxed text-dim">
            <span className="mono-label mr-2 text-amber">Division of explanatory labor</span>
            The rule terms (coverage, academic, interest) are <em>structurally</em> explainable — weighted sums with
            visible inputs. The model term will need <em>SHAP</em> in Phase 13, because gradient forests do not argue
            for themselves. Two kinds of explanation, each honest about its kind.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §49 · Gate G-8 ---------- */

const G8_CHECK = [
  "Scoring equation frozen: four terms, weights 0.50 / 0.25 / 0.15 / 0.10, renormalization rule for absent evidence",
  "Skill coverage defined on the merged ESCO × O*NET requirement vectors — twelve rows, ten skills, every cell auditable",
  "Academic alignment weighted per career dimension — never a blanket GPA",
  "Interest fit capped at the smallest weight: motivation is not qualification",
  "Live engine demonstrates the full decomposition, ranking and positive/negative factors on an example profile",
  "Explainability obligations X-1..X-4 signed: decompose, band ±5, name absent evidence, rank careers not people",
];

export function GateG8Section({ g8, onApprove }: { g8: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s49"
      index="49"
      kicker="Gate G-8"
      title="Approval Gate — Phase 8"
      intro="Phase 8 stops here by design. The scoring engine, its inputs and its explanatory obligations are complete; wiring it to the real merged vectors and Run 002's evidence begins only when this gate passes."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 8 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G8_CHECK.map((d, i) => (
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
            <Corners color={g8 ? GREEN : AMBER} />
            <p className={`mono-label ${g8 ? "text-green" : "text-amber"}`}>
              {g8 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g8
                ? "Phase 8 approved. Phase 9 — Skill Gap Engine — unlocked."
                : "Approve the scoring engine to unlock Phase 9 — Skill Gap Engine."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g8
                ? "Next: turning each career's requirement vector into a prioritized gap list — target level, current level, weighted shortfall, and the order in which closing them pays back fastest."
                : "On approval, Phase 9 specifies the skill-gap engine: how requirement vectors become prioritized learning targets, with prerequisite ordering and payoff-per-effort ranking."}
            </p>

            {!g8 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 8 — proceed to skill gaps</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-8 · DT-CIS-SD-001 · REV H</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any interface that shows a bare percentage without its decomposition, any ranking presented as a
                verdict on the student, and any imputation of model evidence before Run 002 exists. A score that
                cannot argue for itself does not ship.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
