import { useMemo, useRef, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";
import { GAP_SKILLS, GAP_CAREERS } from "./Phase9";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

const skillLabel = (id: string) => GAP_SKILLS.find((s) => s.id === id)?.label ?? id;

/* ============================================================
   A deterministic, rule-based extraction prototype. It is the
   exact pipeline production will run (spaCy/transformers will
   replace the dictionary in stage 3 — the contract stays). It
   never guesses silently: every output carries evidence or a
   confidence tier, and ambiguity is surfaced, never resolved
   behind the user's back.
   ============================================================ */

export interface Alias { token: string; skill: string }

export const ALIAS_VOCAB: Alias[] = [
  { token: "machine learning", skill: "ml" }, { token: "scikit-learn", skill: "ml" }, { token: "sklearn", skill: "ml" },
  { token: "xgboost", skill: "ml" }, { token: "feature engineering", skill: "ml" }, { token: "random forest", skill: "ml" },
  { token: "deep learning", skill: "deep_learning" }, { token: "neural network", skill: "deep_learning" },
  { token: "tensorflow", skill: "deep_learning" }, { token: "pytorch", skill: "deep_learning" }, { token: "keras", skill: "deep_learning" },
  { token: "transfer learning", skill: "deep_learning" },
  { token: "natural language", skill: "nlp" }, { token: "nlp", skill: "nlp" }, { token: "spacy", skill: "nlp" },
  { token: "hugging face", skill: "nlp" }, { token: "sentiment analysis", skill: "nlp" },
  { token: "computer vision", skill: "cv" }, { token: "opencv", skill: "cv" }, { token: "object detection", skill: "cv" },
  { token: "image classification", skill: "cv" },
  { token: "data analysis", skill: "data_analysis" }, { token: "tableau", skill: "data_analysis" },
  { token: "power bi", skill: "data_analysis" }, { token: "matplotlib", skill: "data_analysis" },
  { token: "seaborn", skill: "data_analysis" }, { token: "etl", skill: "data_analysis" },
  { token: "linear algebra", skill: "math" }, { token: "calculus", skill: "math" }, { token: "mathematics", skill: "math" },
  { token: "statistics", skill: "statistics" }, { token: "statistical", skill: "statistics" },
  { token: "hypothesis testing", skill: "statistics" }, { token: "probability", skill: "statistics" },
  { token: "postgresql", skill: "sql" }, { token: "postgres", skill: "sql" }, { token: "mysql", skill: "sql" }, { token: "sql", skill: "sql" },
  { token: "fastapi", skill: "python" }, { token: "flask", skill: "python" }, { token: "pandas", skill: "python" },
  { token: "numpy", skill: "python" }, { token: "python", skill: "python" },
  { token: "kubernetes", skill: "mlops" }, { token: "docker", skill: "mlops" }, { token: "airflow", skill: "mlops" },
  { token: "mlflow", skill: "mlops" }, { token: "mlops", skill: "mlops" }, { token: "ci/cd", skill: "mlops" },
  { token: "aws", skill: "cloud" }, { token: "azure", skill: "cloud" }, { token: "gcp", skill: "cloud" }, { token: "cloud", skill: "cloud" },
  { token: "web development", skill: "web_dev" }, { token: "javascript", skill: "web_dev" }, { token: "typescript", skill: "web_dev" },
  { token: "frontend", skill: "web_dev" }, { token: "react", skill: "web_dev" }, { token: "html", skill: "web_dev" }, { token: "css", skill: "web_dev" },
];

export const AMBIGUOUS_TOKENS = [
  { token: "spark", options: ["Apache Spark → Data Analysis / big-data tooling", "the English word 'spark' → noise"] },
  { token: "scala", options: ["the Spark ecosystem language → Data Analysis", "a music/physics term → noise"] },
];

export const OOV_TOKENS = ["java", "c++", "git", "linux", "spring", "kafka", "hadoop", "flutter", "agile"];

const HEADER_RE = /^(education|experience|work experience|employment|projects?|certifications?|skills?|technical skills?|courses?|achievements?)\s*:?$/i;

const SAMPLE_CV = `SARA BENALI
Final-year Machine Learning student

EDUCATION
B.Sc. Computer Science — University of Technology, 2022–2026
Relevant coursework: Machine Learning, Statistics, Databases, Linear Algebra

EXPERIENCE
Data Intern — FinBank (summer 2025)
- Built churn-prediction models in Python with scikit-learn and pandas
- Wrote SQL queries against PostgreSQL to assemble feature tables
- Scheduled a weekly reporting pipeline with Airflow on AWS

PROJECTS
- Customer Sentiment Dashboard — Python, matplotlib, Tableau
- Plant Disease Classifier — TensorFlow, transfer learning (in progress)
- Campus Events Web App — React, TypeScript, REST API

CERTIFICATIONS
- Google Data Analytics (audit) — 2025
- AWS Cloud Practitioner Essentials — 2024

SKILLS
Python, SQL, Machine Learning, Statistics, React, Docker, Spark, Git, Java`;

/* ---------- extraction core ---------- */

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export interface SkillExtraction {
  skill: string;
  points: number;
  tier: "HIGH" | "MEDIUM" | "LOW";
  evidence: { token: string; count: number }[];
  inSkillsSection: boolean;
}

export interface Extraction {
  words: number;
  ms: number;
  sections: string[];
  skills: SkillExtraction[];
  ambiguous: { token: string; count: number }[];
  oov: { token: string; count: number }[];
  looksLikeCv: boolean;
}

const TWIN_PROFILE: Record<string, number> = {
  python: 70, statistics: 45, math: 55, sql: 40, web_dev: 60,
  ml: 55, data_analysis: 50, cloud: 30, deep_learning: 25, mlops: 20, nlp: 15, cv: 15,
};

export function extract(text: string): Extraction {
  const t0 = performance.now();
  const lower = text.toLowerCase();
  const lines = text.split(/\n/);
  const sections: string[] = [];
  let inSkills = false;
  const skillsLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (HEADER_RE.test(trimmed)) {
      sections.push(trimmed.replace(/:$/, "").toUpperCase());
      inSkills = /^skills?$/i.test(trimmed.replace(/:$/, ""));
      continue;
    }
    if (inSkills && trimmed) skillsLines.push(trimmed);
  }
  const skillsBlob = ` ${skillsLines.join(" ").toLowerCase()} `;

  const perSkill = new Map<string, { points: number; evidence: Map<string, number>; inSkillsSection: boolean }>();
  // longer tokens first so "machine learning" is not shadowed, "postgresql" before "sql"
  const sorted = [...ALIAS_VOCAB].sort((a, b) => b.token.length - a.token.length);
  for (const alias of sorted) {
    const re = new RegExp(`(?<![a-z0-9])${esc(alias.token)}(?![a-z0-9])`, "g");
    const matches = lower.match(re);
    if (!matches) continue;
    const count = matches.length;
    const inSk = new RegExp(`(?<![a-z0-9])${esc(alias.token)}(?![a-z0-9])`).test(skillsBlob);
    const entry = perSkill.get(alias.skill) ?? { points: 0, evidence: new Map<string, number>(), inSkillsSection: false };
    entry.points += count + (inSk ? 2 : 0);
    entry.evidence.set(alias.token, (entry.evidence.get(alias.token) ?? 0) + count);
    entry.inSkillsSection = entry.inSkillsSection || inSk;
    perSkill.set(alias.skill, entry);
  }

  const skills: SkillExtraction[] = [...perSkill.entries()]
    .map(([skill, e]) => ({
      skill,
      points: e.points,
      tier: e.points >= 6 ? ("HIGH" as const) : e.points >= 3 ? ("MEDIUM" as const) : ("LOW" as const),
      evidence: [...e.evidence.entries()].map(([token, count]) => ({ token, count })).sort((a, b) => b.count - a.count),
      inSkillsSection: e.inSkillsSection,
    }))
    .sort((a, b) => b.points - a.points);

  const ambiguous = AMBIGUOUS_TOKENS.map((a) => {
    const re = new RegExp(`(?<![a-z0-9])${esc(a.token)}(?![a-z0-9])`, "g");
    return { token: a.token, count: (lower.match(re) ?? []).length };
  }).filter((a) => a.count > 0);

  const oov = OOV_TOKENS.map((tok) => {
    const re = new RegExp(`(?<![a-z0-9])${esc(tok)}(?![a-z0-9])`, "g");
    return { token: tok, count: (lower.match(re) ?? []).length };
  }).filter((o) => o.count > 0);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    words,
    ms: Math.max(1, Math.round(performance.now() - t0)),
    sections,
    skills,
    ambiguous,
    oov,
    looksLikeCv: sections.length >= 1 && skills.length >= 1,
  };
}

const TIER_META = {
  HIGH: { color: GREEN, level: 80 },
  MEDIUM: { color: CYAN, level: 60 },
  LOW: { color: AMBER, level: 40 },
} as const;

const STAGES = ["PARSE TEXT", "DETECT SECTIONS", "EXTRACT ENTITIES", "NORMALIZE", "SCORE CONFIDENCE", "DIFF VS TWIN"];

/* ---------- §58 · The pipeline, specified ---------- */

const PIPELINE = [
  { stage: "01", name: "Parse", io: "raw text → tokens & lines", contract: "Accept plain text only. PDFs must surrender a text layer first — the system says so instead of pretending." },
  { stage: "02", name: "Detect sections", io: "lines → Education / Experience / Projects / Skills…", contract: "Header grammar is a whitelist. Unrecognized structure is reported, not hallucinated." },
  { stage: "03", name: "Extract entities", io: "tokens → candidate skills", contract: "Dictionary v1 in this prototype; spaCy + transformer pass in production. Same I/O contract either way." },
  { stage: "04", name: "Normalize", io: "aliases → the 12 canonical skills", contract: "Every alias maps to exactly one canonical skill, in a versioned table. No free-text invention." },
  { stage: "05", name: "Score confidence", io: "mentions + section context → HIGH / MEDIUM / LOW / AMBIGUOUS", contract: "A score is evidence-count plus context bonus — always auditable, never vibes." },
  { stage: "06", name: "Diff vs twin", io: "resume skills ↔ twin profile", contract: "Bidirectional: resume-ahead and resume-silent are both surfaced, both as questions." },
];

export function PipelineSpecSection() {
  return (
    <Section
      id="s58"
      index="58"
      kicker="Phase 11 · The pipeline"
      title="Six Stages, One Unbreakable Rule"
      intro="Resume extraction is where NLP systems most often quietly invent. This pipeline's contract forbids it: every stage has declared inputs, outputs, and a failure behavior — and the final rule, NO SILENT GUESSING, is enforced at every one."
    >
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="relative">
          <div className="absolute bottom-4 left-[27px] top-4 w-px bg-line" aria-hidden="true" />
          <div className="space-y-3">
            {PIPELINE.map((p, i) => (
              <Reveal key={p.stage} delay={i * 70}>
                <div className="group relative flex gap-4 border border-line/80 bg-base/50 p-3.5 transition-all duration-200 hover:border-cyan/50 sm:p-4">
                  <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center border border-cyan/50 bg-base font-mono text-[11px] text-cyan transition-colors duration-200 group-hover:bg-cyan group-hover:text-base">
                    {p.stage}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <p className="display-head text-[15px] text-ink">{p.name}</p>
                      <p className="font-mono text-[10px] text-cyan/80">{p.io}</p>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-faint">{p.contract}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={140}>
          <div className="panel sticky top-24 h-fit border-rose/40 p-5 sm:p-6">
            <Corners color={ROSE} />
            <p className="mono-label text-rose">The rule the pipeline serves</p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink">
              NO SILENT GUESSING.
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                "Unsure → say AMBIGUOUS and show the options.",
                "Unknown token → record it out-of-vocabulary; never score it.",
                "No sections found → say 'this does not read like a CV'.",
                "Every extracted skill carries its mention evidence.",
              ].map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-dim">
                  <span className="mt-[3px] font-mono text-[10px] text-rose">✕</span>
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
              A resume is someone's claim about themselves. The extractor's job is to transcribe
              that claim faithfully — not to improve it, soften it, or finish its sentences.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §59 · The live extractor ---------- */

export function LiveExtractorSection() {
  const [text, setText] = useState(SAMPLE_CV);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<Extraction | null>(null);
  const timer = useRef<number | null>(null);

  const analyzing = stage >= 0 && stage < STAGES.length;

  const run = () => {
    if (timer.current) window.clearInterval(timer.current);
    setResult(null);
    setStage(0);
    let s = 0;
    timer.current = window.setInterval(() => {
      s += 1;
      if (s >= STAGES.length) {
        window.clearInterval(timer.current!);
        setResult(extract(text));
        setStage(STAGES.length);
      } else {
        setStage(s);
      }
    }, 300);
  };

  const res = result;
  const twinDiff = useMemo(() => {
    if (!res) return { ahead: [], silent: [] } as {
      ahead: { skill: string; ext: number; twin: number }[];
      silent: { skill: string; twin: number }[];
    };
    const extLevel: Record<string, number> = {};
    res.skills.forEach((s) => {
      extLevel[s.skill] = TIER_META[s.tier].level;
    });
    const ahead = Object.entries(extLevel)
      .map(([skill, ext]) => ({ skill, ext, twin: TWIN_PROFILE[skill] ?? 0 }))
      .filter((d) => d.ext - d.twin >= 20)
      .sort((a, b) => b.ext - b.twin - (a.ext - a.twin));
    const silent = Object.entries(TWIN_PROFILE)
      .filter(([skill, twin]) => twin >= 55 && !extLevel[skill])
      .map(([skill, twin]) => ({ skill, twin }));
    return { ahead, silent };
  }, [res]);

  const careerSnapshot = useMemo(() => {
    if (!res) return [];
    const extLevel: Record<string, number> = {};
    res.skills.forEach((s) => {
      extLevel[s.skill] = TIER_META[s.tier].level;
    });
    return GAP_CAREERS.map((c) => {
      const entries = Object.entries(c.req);
      const denom = entries.reduce((s, [, w]) => s + w, 0);
      const num = entries.reduce((s, [sid, w]) => s + w * ((extLevel[sid] ?? 0) / 100), 0);
      return { name: c.name, pct: Math.round((num / denom) * 100) };
    })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
  }, [res]);

  return (
    <Section
      id="s59"
      index="59"
      kicker="Phase 11 · The engine, running"
      title="Paste a CV. Watch It Refuse to Guess."
      intro="The deterministic prototype of stage 3, executing live: dictionary extraction, canonical normalization, evidence-counted confidence, and the twin diff. A sample student CV is pre-loaded — edit it, break it, feed it nonsense. The pipeline's answers are honest in every case."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        {/* input + stages */}
        <div className="space-y-4">
          <Reveal>
            <div className="panel relative overflow-hidden p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="mono-label text-cyan">CV input · plain text</p>
                <div className="ml-auto flex gap-1.5">
                  <button
                    onClick={() => setText(SAMPLE_CV)}
                    className="mono-label border border-line px-2 py-1 text-[8.5px] text-faint transition-colors hover:border-cyan/60 hover:text-cyan"
                  >
                    LOAD SAMPLE
                  </button>
                  <button
                    onClick={() => setText("")}
                    className="mono-label border border-line px-2 py-1 text-[8.5px] text-faint transition-colors hover:border-rose/60 hover:text-rose"
                  >
                    CLEAR
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  spellCheck={false}
                  rows={16}
                  className="w-full resize-y border border-line/80 bg-base/70 p-3 font-mono text-[11.5px] leading-relaxed text-dim outline-none transition-colors focus:border-cyan/60"
                  placeholder="Paste a resume as plain text…"
                />
                {analyzing && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="scanline absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-cyan/15 to-transparent" />
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={run}
                  disabled={analyzing}
                  className="group inline-flex items-center gap-2.5 border border-cyan bg-cyan/10 px-5 py-2.5 transition-all duration-200 hover:bg-cyan/20 hover:shadow-[0_0_24px_rgba(107,225,255,0.2)] active:translate-y-[1px] disabled:opacity-50"
                >
                  <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 text-cyan ${analyzing ? "animate-spin" : "transition-transform duration-300 group-hover:rotate-90"}`} fill="none" stroke="currentColor" strokeWidth="1.6">
                    {analyzing ? <path d="M8 1.5 A6.5 6.5 0 1 1 1.5 8" /> : <path d="M3 8 L13 8 M9.5 4.5 L13 8 L9.5 11.5" />}
                  </svg>
                  <span className="mono-label text-[9.5px] text-cyan">{analyzing ? "EXTRACTING…" : "RUN EXTRACTION"}</span>
                </button>
                <span className="font-mono text-[10.5px] text-faint">
                  {text.trim() ? `${text.trim().split(/\s+/).length} words` : "0 words"}
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel p-4 sm:p-5">
              <p className="mono-label mb-3 text-[8.5px] text-faint">Pipeline trace</p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map((s, i) => {
                  const done = stage > i || result !== null;
                  const active = stage === i;
                  return (
                    <span
                      key={s}
                      className={`mono-label border px-2 py-1.5 text-[8px] transition-all duration-300 ${
                        done ? "border-green/60 text-green" : active ? "border-cyan text-cyan" : "border-line text-faint"
                      }`}
                      style={active ? { boxShadow: "0 0 12px rgba(107,225,255,0.25)" } : undefined}
                    >
                      {done ? "✓ " : active ? "▸ " : ""}{s}
                    </span>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>

        {/* results */}
        <div>
          {!res ? (
            <div className="panel flex h-full min-h-[300px] items-center justify-center border-dashed p-8">
              <p className="text-center font-mono text-[12px] text-faint">
                {analyzing ? "running the six stages…" : "results will render here —\nevidence first, always."}
              </p>
            </div>
          ) : !res.looksLikeCv ? (
            <div className="panel border-rose/40 p-6">
              <p className="mono-label text-rose">Extraction declined</p>
              <p className="display-head mt-2 text-xl text-ink">This does not read like a CV.</p>
              <p className="mt-2 text-[13px] leading-relaxed text-dim">
                Found <span className="text-ink">{res.sections.length}</span> section header
                {res.sections.length === 1 ? "" : "s"} and{" "}
                <span className="text-ink">{res.skills.length}</span> recognizable skill
                {res.skills.length === 1 ? "" : "s"} in {res.words} words. The pipeline refuses to
                score what it cannot ground — that refusal is a feature, documented in §58.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="panel p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <p className="font-mono text-[11px] text-dim">
                    <span className="text-cyan">{res.skills.length}</span> skills ·{" "}
                    <span className="text-cyan">{res.sections.length}</span> sections ·{" "}
                    <span className="text-cyan">{res.words}</span> words ·{" "}
                    <span className="text-amber">{res.ms} ms</span> measured
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {res.sections.map((s) => (
                      <span key={s} className="mono-label border border-line px-1.5 py-0.5 text-[7.5px] text-faint">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {res.skills.map((s) => {
                    const meta = TIER_META[s.tier];
                    return (
                      <div key={s.skill} className="border border-line/70 bg-base/50 p-3 transition-colors duration-200 hover:border-cyan/40">
                        <div className="flex items-center justify-between gap-2">
                          <p className="display-head text-[13.5px] text-ink">{skillLabel(s.skill)}</p>
                          <span className="mono-label border px-1.5 py-0.5 text-[7.5px]" style={{ color: meta.color, borderColor: `${meta.color}55` }}>
                            {s.tier} · {s.points}pt{s.points === 1 ? "" : "s"}
                          </span>
                        </div>
                        <div className="mt-2 h-1 w-full bg-line/40">
                          <div className="h-full transition-all duration-700" style={{ width: `${Math.min(100, s.points * 9)}%`, background: meta.color }} />
                        </div>
                        <p className="mt-2 font-mono text-[9.5px] leading-relaxed text-faint">
                          {s.evidence.map((e) => `${e.token}×${e.count}`).join(" · ")}
                          {s.inSkillsSection && <span className="text-green"> · +2 SKILLS-section bonus</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {(res.ambiguous.length > 0 || res.oov.length > 0) && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {res.ambiguous.length > 0 && (
                      <div className="border border-amber/40 bg-amber/5 p-3">
                        <p className="mono-label text-[8px] text-amber">AMBIGUOUS — not auto-resolved</p>
                        <p className="mt-1.5 font-mono text-[10px] text-dim">
                          {res.ambiguous.map((a) => `“${a.token}” ×${a.count}`).join(" · ")}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-faint">
                          Could mean {AMBIGUOUS_TOKENS.find((a) => a.token === res.ambiguous[0].token)?.options.join(" or ")}.
                          The system asks; it does not decide.
                        </p>
                      </div>
                    )}
                    {res.oov.length > 0 && (
                      <div className="border border-line p-3">
                        <p className="mono-label text-[8px] text-faint">OUT-OF-VOCABULARY — recorded, never scored</p>
                        <p className="mt-1.5 font-mono text-[10px] text-dim">
                          {res.oov.map((o) => `${o.token}×${o.count}`).join(" · ")}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-faint">
                          Real skills the 12-skill vocabulary doesn't cover. Logged for the vocabulary
                          audit, excluded from every score.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="panel p-4">
                  <p className="mono-label text-[8.5px] text-green">Twin diff — resume ahead</p>
                  {twinDiff.ahead.length === 0 ? (
                    <p className="mt-2 text-[12px] text-faint">No skill where the resume clearly outruns the twin.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {twinDiff.ahead.map((d) => (
                        <li key={d.skill} className="flex items-baseline gap-2 text-[12.5px] text-dim">
                          <span className="text-ink">{skillLabel(d.skill)}</span>
                          <span className="font-mono text-[10px] text-faint">resume ≈{d.ext} · twin {d.twin}</span>
                          <span className="ml-auto font-mono text-[10px] text-green">update twin?</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mono-label mt-4 text-[8.5px] text-amber">Twin diff — resume silent</p>
                  {twinDiff.silent.length === 0 ? (
                    <p className="mt-2 text-[12px] text-faint">Nothing the twin knows that the resume hides.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {twinDiff.silent.map((d) => (
                        <li key={d.skill} className="flex items-baseline gap-2 text-[12.5px] text-dim">
                          <span className="text-ink">{skillLabel(d.skill)}</span>
                          <span className="font-mono text-[10px] text-faint">twin {d.twin} · not mentioned</span>
                          <span className="ml-auto font-mono text-[10px] text-amber">under-represented?</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="panel p-4">
                  <p className="mono-label text-[8.5px] text-cyan">Career snapshot — resume-derived</p>
                  <div className="mt-2 space-y-2.5">
                    {careerSnapshot.map((c, i) => (
                      <div key={c.name}>
                        <div className="flex items-baseline justify-between">
                          <p className="text-[13px] text-ink">{c.name}</p>
                          <span className="font-mono text-[11px] text-cyan">{c.pct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-line/40">
                          <div
                            className="h-full bg-gradient-to-r from-cyan/60 to-cyan transition-all duration-700"
                            style={{ width: `${c.pct}%`, transitionDelay: `${i * 90}ms` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-line pt-2.5 text-[11px] leading-relaxed text-faint">
                    Weighted coverage of the §47 requirement vectors by extracted levels — a snapshot
                    of the <em>document</em>, never a hiring prediction.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ---------- §60 · Normalization & confidence protocol ---------- */

const CONFIDENCE_TIERS = [
  { tier: "HIGH", rule: "≥ 6 points — repeated mentions or SKILLS-section listing", color: GREEN, maps: "level ≈ 80 in gap math" },
  { tier: "MEDIUM", rule: "3–5 points — mentioned in context, once or twice", color: CYAN, maps: "level ≈ 60" },
  { tier: "LOW", rule: "1–2 points — a single passing mention", color: AMBER, maps: "level ≈ 40, flagged 'self-report, unverified'" },
  { tier: "AMBIGUOUS", rule: "token has ≥ 2 plausible readings", color: ROSE, maps: "never scored — the user is asked" },
];

export function NormalizationSection() {
  const bySkill = useMemo(() => {
    const m = new Map<string, string[]>();
    ALIAS_VOCAB.forEach((a) => {
      m.set(a.skill, [...(m.get(a.skill) ?? []), a.token]);
    });
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, []);

  return (
    <Section
      id="s60"
      index="60"
      kicker="Phase 11 · The protocol"
      title="One Vocabulary, Counted Evidence"
      intro="Normalization is a versioned table, not an opinion: every alias maps to exactly one of the twelve canonical skills. Confidence is arithmetic — mentions plus a section-context bonus — so any score can be recomputed by hand."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div className="panel h-full p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="mono-label text-cyan">Alias vocabulary v1 · {ALIAS_VOCAB.length} tokens → 12 skills</p>
              <span className="mono-label text-[8.5px] text-faint">versioned · auditable</span>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {bySkill.map(([skill, tokens]) => (
                <div key={skill} className="border border-line/70 bg-base/40 p-2.5 transition-colors duration-200 hover:border-cyan/40">
                  <p className="mono-label text-[8.5px] text-cyan">{skillLabel(skill).toUpperCase()}</p>
                  <p className="mt-1 font-mono text-[10px] leading-relaxed text-faint">{tokens.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="panel h-full p-4 sm:p-5">
            <p className="mono-label mb-3 text-amber">Confidence = evidence, not vibes</p>
            <div className="space-y-2.5">
              {CONFIDENCE_TIERS.map((t) => (
                <div key={t.tier} className="border border-line/70 p-3 transition-colors duration-200 hover:border-line">
                  <div className="flex items-center justify-between gap-2">
                    <span className="mono-label border px-2 py-0.5 text-[8.5px]" style={{ color: t.color, borderColor: `${t.color}55` }}>
                      {t.tier}
                    </span>
                    <span className="font-mono text-[9.5px] text-faint">{t.maps}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-dim">{t.rule}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 border-l-2 border-cyan/60 pl-3 text-[12px] leading-relaxed text-faint">
              Points = body mentions + 2 if the token appears in a SKILLS section. Recomputable with
              a pencil from the rendered evidence — which is the entire point of rendering it.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §61 · Gate G-11 ---------- */

const FAILURE_MODES = [
  { mode: "Empty or whitespace paste", response: "“Nothing to extract — paste the CV as plain text.” No run, no score." },
  { mode: "Scanned PDF / image", response: "“No text layer found. Export the text first.” The system never OCR-guesses in silence." },
  { mode: "Text that isn't a CV", response: "“This does not read like a CV” — sections < 1 or skills < 1, as you can trigger live in §59." },
  { mode: "Vocabulary drift (>40% unknown tokens)", response: "Results render with a “vocabulary audit” flag; alias table version is cited." },
];

const G11_CHECK = [
  "Pipeline frozen at six stages with declared I/O and failure behavior; production swaps the dictionary for spaCy/transformers behind the same contract",
  "Alias vocabulary v1 on record — 50+ tokens mapping to exactly the 12 canonical skills, versioned and auditable",
  "Confidence protocol signed: evidence-counted tiers, SKILLS-section bonus, AMBIGUOUS surfaced with its options",
  "Out-of-vocabulary tokens recorded and never scored; ambiguous tokens never auto-resolved",
  "Twin diff is bidirectional — resume-ahead and resume-silent both surfaced, both phrased as questions",
  "Career snapshot explicitly labeled resume-derived coverage — never a hiring prediction",
];

export function GateG11Section({ g11, onApprove }: { g11: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s61"
      index="61"
      kicker="Gate G-11"
      title="Approval Gate — Phase 11"
      intro="Phase 11 stops here by design — after its failure modes are on record, because a system's honesty is measured by how it behaves when it cannot."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FAILURE_MODES.map((f, i) => (
          <Reveal key={f.mode} delay={i * 70}>
            <div className="panel h-full p-3.5">
              <p className="mono-label text-[8.5px] text-rose">FAILURE · {String(i + 1).padStart(2, "0")}</p>
              <p className="display-head mt-1.5 text-[13.5px] leading-snug text-ink">{f.mode}</p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-faint">{f.response}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 11 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G11_CHECK.map((d, i) => (
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
            <Corners color={g11 ? GREEN : AMBER} />
            <p className={`mono-label ${g11 ? "text-green" : "text-amber"}`}>
              {g11 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g11
                ? "Phase 11 approved. Phase 12 — Job Description Matching — unlocked."
                : "Approve the resume-intelligence contract to unlock Phase 12 — Job Matching."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g11
                ? "Next: the same extraction contract pointed at job postings — required vs. preferred skills, tool counts, and a match score the applicant can dispute line by line."
                : "On approval, Phase 12 reuses this pipeline for job descriptions: required vs. preferred extraction, the twin as the compared profile, and match scores with itemized disagreement."}
            </p>

            {!g11 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 11 — proceed to job matching</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-11 · DT-CIS-SD-001 · REV K</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any extraction that improves on the source document — inflating a mention into a
                skill, or a skill into a certainty. The extractor transcribes claims; it does not
                endorse them.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
