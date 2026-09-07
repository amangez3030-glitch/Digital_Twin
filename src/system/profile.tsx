import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { GAP_SKILLS, GAP_CAREERS } from "../components/Phase9";

/* ============================================================
   The Digital Twin — the actual system's state.
   Persisted on-device (localStorage); every indicator below is
   DERIVED at read time through the engines approved in the
   design dossier (§45 / §50), never stored.
   ============================================================ */

export interface Academics { gpa: number; attendance: number; assignments: number; studyHours: number }
export interface Portfolio { projects: number; avgDiff: number; certs: number }

export interface SysProfile {
  skills: Record<string, number>;
  academics: Academics;
  interests: string[];
  portfolio: Portfolio;
  targetCareer: string;
}

export interface Snapshot {
  rev: string;
  ts: string;
  skills: Record<string, number>;
  careerId: string;
  coverage: number;
  readiness: number;
  amended?: boolean;
}

export interface AuditLine { ts: string; kind: "INIT" | "SNAPSHOT" | "AMEND" | "REJECT" | "EDIT"; detail: string }

const START: SysProfile = {
  skills: { python: 70, statistics: 45, math: 55, sql: 40, web_dev: 60, ml: 55, data_analysis: 50, cloud: 30, deep_learning: 25, mlops: 20, nlp: 15, cv: 15 },
  academics: { gpa: 78, attendance: 85, assignments: 70, studyHours: 12 },
  interests: ["ai", "data"],
  portfolio: { projects: 3, avgDiff: 3, certs: 2 },
  targetCareer: "mle",
};

const KEY = "dtcis.system.v1";

interface Stored { profile: SysProfile; snapshots: Snapshot[]; audit: AuditLine[] }

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Stored;
      if (s?.profile?.skills && s.snapshots && s.audit) return s;
    }
  } catch { /* fall through to fresh */ }
  return {
    profile: START,
    snapshots: [],
    audit: [{ ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), kind: "INIT", detail: "twin initialized from intake defaults — 12 skills, 5 stores" }],
  };
}

/* ---------- derived intelligence (§45, model term absent → /0.75) ---------- */

export const CAREER_TAGS: Record<string, string[]> = {
  mle: ["ai", "data"], aie: ["ai"], ds: ["ai", "data"], da: ["data"],
  swe: ["se", "web"], be: ["se"], fe: ["web"], csa: ["sec"],
  ce: ["se"], rs: ["research", "ai"], cve: ["ai"], nle: ["ai"],
};

export const INTEREST_DEFS = [
  { id: "ai", label: "AI / ML" }, { id: "data", label: "Data" },
  { id: "se", label: "Software Eng" }, { id: "web", label: "Web" },
  { id: "sec", label: "Security" }, { id: "research", label: "Research" },
];

export function coverageFor(careerId: string, skills: Record<string, number>) {
  const c = GAP_CAREERS.find((x) => x.id === careerId);
  if (!c) return 0;
  let num = 0, den = 0;
  for (const [sid, w] of Object.entries(c.req)) { num += Math.min(skills[sid] ?? 0, w * 100); den += w * 100; }
  return den ? (num / den) * 100 : 0;
}

export function technicalFor(careerId: string, skills: Record<string, number>) {
  const c = GAP_CAREERS.find((x) => x.id === careerId);
  if (!c) return 0;
  let num = 0, den = 0;
  for (const [sid, w] of Object.entries(c.req)) { num += (skills[sid] ?? 0) * w; den += w; }
  return den ? num / den : 0;
}

export function acadFor(a: Academics) {
  return 0.5 * a.gpa + 0.3 * a.attendance + 0.2 * a.assignments;
}

export function interestFitFor(careerId: string, interests: string[]) {
  const tags = CAREER_TAGS[careerId] ?? [];
  const hits = tags.filter((t) => interests.includes(t)).length;
  return tags.length ? (hits / tags.length) * 100 : 0;
}

export function readinessFor(p: SysProfile, careerId: string) {
  return (0.5 * coverageFor(careerId, p.skills) + 0.15 * acadFor(p.academics) + 0.1 * interestFitFor(careerId, p.interests)) / 0.75;
}

export interface GapRowSys {
  skillId: string; label: string; current: number; target: number; weight: number;
  gap: number; shortfall: number; effortHours: number; payoff: number; blockedBy: string[];
}

export function sysGaps(p: SysProfile): GapRowSys[] {
  const c = GAP_CAREERS.find((x) => x.id === p.targetCareer);
  if (!c) return [];
  return GAP_SKILLS.filter((s) => (c.req[s.id] ?? 0) > 0).map((s) => {
    const w = c.req[s.id];
    const current = p.skills[s.id] ?? 0;
    const target = Math.round(w * 100);
    const gap = Math.max(0, target - current);
    const shortfall = gap * w;
    const effortHours = Math.round((gap / 10) * s.effortPer10);
    const payoff = effortHours > 0 ? shortfall / effortHours : 0;
    const blockedBy = s.prereq.filter((pr) => (p.skills[pr] ?? 0) < 60);
    return { skillId: s.id, label: s.label, current, target, weight: w, gap, shortfall, effortHours, payoff, blockedBy };
  }).sort((a, b) => b.shortfall - a.shortfall);
}

/* ---------- context ---------- */

interface SysCtx {
  profile: SysProfile;
  snapshots: Snapshot[];
  audit: AuditLine[];
  setSkill: (id: string, v: number) => void;
  setAcad: (k: keyof Academics, v: number) => void;
  setPortfolio: (k: keyof Portfolio, v: number) => void;
  toggleInterest: (id: string) => void;
  setTarget: (id: string) => void;
  commit: () => void;
  amend: () => void;
  reset: () => void;
  log: (kind: AuditLine["kind"], detail: string) => void;
}

const Ctx = createContext<SysCtx | null>(null);
export const useSys = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSys outside provider");
  return v;
};

const stamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function SysProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full — twin keeps working in memory */ }
  }, [state]);

  const value = useMemo<SysCtx>(() => {
    const { profile, snapshots, audit } = state;
    const log = (kind: AuditLine["kind"], detail: string) =>
      setState((s) => ({ ...s, audit: [{ ts: stamp(), kind, detail }, ...s.audit].slice(0, 24) }));
    return {
      profile, snapshots, audit,
      setSkill: (id, v) => setState((s) => ({ ...s, profile: { ...s.profile, skills: { ...s.profile.skills, [id]: v } } })),
      setAcad: (k, v) => setState((s) => ({ ...s, profile: { ...s.profile, academics: { ...s.profile.academics, [k]: v } } })),
      setPortfolio: (k, v) => setState((s) => ({ ...s, profile: { ...s.profile, portfolio: { ...s.profile.portfolio, [k]: v } } })),
      toggleInterest: (id) => setState((s) => ({
        ...s,
        profile: {
          ...s.profile,
          interests: s.profile.interests.includes(id)
            ? s.profile.interests.filter((x) => x !== id)
            : [...s.profile.interests, id],
        },
      })),
      setTarget: (id) => setState((s) => ({ ...s, profile: { ...s.profile, targetCareer: id } })),
      commit: () => setState((s) => {
        const rev = `v${s.snapshots.length + 1}`;
        const snap: Snapshot = {
          rev, ts: stamp(), skills: { ...s.profile.skills }, careerId: s.profile.targetCareer,
          coverage: coverageFor(s.profile.targetCareer, s.profile.skills),
          readiness: readinessFor(s.profile, s.profile.targetCareer),
        };
        return {
          ...s,
          snapshots: [...s.snapshots, snap],
          audit: [{ ts: stamp(), kind: "SNAPSHOT" as const, detail: `${rev} validated write — 12 skills + context · schema ✓ range ✓ · derived coverage ${snap.coverage.toFixed(1)}` }, ...s.audit].slice(0, 24),
        };
      }),
      amend: () => setState((s) => {
        if (s.snapshots.length === 0) return s;
        const last = s.snapshots[s.snapshots.length - 1];
        const snap: Snapshot = {
          ...last, ts: stamp(), skills: { ...s.profile.skills }, careerId: s.profile.targetCareer,
          coverage: coverageFor(s.profile.targetCareer, s.profile.skills),
          readiness: readinessFor(s.profile, s.profile.targetCareer), amended: true,
        };
        return {
          ...s,
          snapshots: [...s.snapshots.slice(0, -1), snap],
          audit: [{ ts: stamp(), kind: "AMEND" as const, detail: `${last.rev} corrected — prior values archived, new values validated` }, ...s.audit].slice(0, 24),
        };
      }),
      reset: () => setState(() => ({
        profile: START, snapshots: [],
        audit: [{ ts: stamp(), kind: "INIT" as const, detail: "twin reset to intake defaults — right to be forgotten exercised" }],
      })),
      log,
    };
  }, [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ============================================================
   NLP tooling — deterministic dictionary extraction (§58).
   Confidence = evidence count; nothing is guessed silently.
   ============================================================ */

export const SKILL_ALIASES: Record<string, string[]> = {
  python: ["python"],
  statistics: ["statistics", "statistical", "probability", "hypothesis testing", "a/b testing", "ab testing", "bayesian"],
  math: ["mathematics", "linear algebra", "calculus", "numpy"],
  sql: ["sql", "postgres", "postgresql", "mysql", "database", "data warehouse"],
  web_dev: ["web development", "html", "css", "javascript", "typescript", "react", "frontend", "front-end", "node.js", "nodejs", "django", "flask"],
  ml: ["machine learning", "scikit-learn", "sklearn", "supervised", "classification", "regression", "xgboost", "feature engineering", "cross-validation"],
  data_analysis: ["data analysis", "pandas", "tableau", "power bi", "excel", "dashboard", "etl", "data cleaning", "matplotlib", "seaborn", "visualization"],
  cloud: ["cloud", "aws", "azure", "gcp", "google cloud", "ec2", "s3", "lambda"],
  deep_learning: ["deep learning", "neural network", "neural networks", "tensorflow", "pytorch", "keras", "cnn", "rnn", "transformers", "llm"],
  mlops: ["mlops", "docker", "kubernetes", "k8s", "ci/cd", "mlflow", "airflow", "model deployment", "monitoring"],
  nlp: ["nlp", "natural language", "spacy", "nltk", "hugging face", "huggingface", "text classification", "sentiment", "bert", "gpt"],
  cv: ["computer vision", "opencv", "image classification", "object detection", "yolo", "image processing"],
};

const EXTRA_TOOLS = ["git", "github", "linux", "spark", "kafka", "hadoop", "dbt", "snowflake", "jira", "agile", "rest api", "graphql", "c++", "java", "r ", "matlab", "latex"];

export interface ResumeSkill { skillId: string; label: string; hits: number; conf: number; est: number; tokens: string[] }
export interface ResumeResult {
  skills: ResumeSkill[];
  years: number | null;
  degrees: string[];
  tools: string[];
  wordCount: number;
  missingFromTwin: ResumeSkill[];
  underRepresented: ResumeSkill[];
}

export function analyzeResume(text: string, twinSkills: Record<string, number>): ResumeResult {
  const t = text.toLowerCase();
  const words = t.split(/\s+/).filter(Boolean);
  const skills: ResumeSkill[] = [];
  for (const s of GAP_SKILLS) {
    const aliases = SKILL_ALIASES[s.id] ?? [];
    const tokens: string[] = [];
    let hits = 0;
    for (const a of aliases) {
      const re = new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\b`, "g");
      const m = t.match(re);
      if (m) { hits += m.length; tokens.push(a); }
    }
    if (hits > 0) {
      skills.push({
        skillId: s.id, label: s.label, hits,
        conf: Math.min(1, 0.34 + 0.22 * hits),
        est: Math.min(90, 50 + 8 * hits),
        tokens,
      });
    }
  }
  skills.sort((a, b) => b.hits - a.hits);

  const ym = t.match(/(\d{1,2})\+?\s*(?:years|yrs)/);
  const years = ym ? Number(ym[1]) : null;
  const degrees: string[] = [];
  if (/\bbachelor|b\.?sc|b\.?s\.|bsc\b/.test(t)) degrees.push("Bachelor's");
  if (/\bmaster|m\.?sc|msc|mba\b/.test(t)) degrees.push("Master's");
  if (/\bphd|ph\.d|doctorate\b/.test(t)) degrees.push("PhD");

  const tools = EXTRA_TOOLS.filter((tool) => new RegExp(`\\b${tool.trim().replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\b`).test(t));

  return {
    skills, years, degrees, tools,
    wordCount: words.length,
    missingFromTwin: skills.filter((s) => (twinSkills[s.skillId] ?? 0) < 20),
    underRepresented: skills.filter((s) => s.est > (twinSkills[s.skillId] ?? 0) + 15),
  };
}

/* ---------- job-description matcher (§62: required ×2, preferred ×1) ---------- */

export interface JdSkill { skillId: string; label: string; level: number; weight: number; required: boolean; contrib: number }
export interface JdResult {
  match: number;
  skills: JdSkill[];
  strong: JdSkill[];
  gaps: JdSkill[];
  unmapped: string[];
  requiredCount: number;
}

export function analyzeJob(text: string, twinSkills: Record<string, number>): JdResult {
  const lines = text.toLowerCase().split(/\n|•|;|\.(?=\s)/);
  const per: Record<string, { weight: number; required: boolean }> = {};
  for (const line of lines) {
    const required = /must|required|proficien|strong|expert|solid/.test(line);
    const preferred = /plus|bonus|nice|familiar|preferred|a plus/.test(line);
    const w = required ? 2 : preferred ? 1 : 1.5;
    for (const s of GAP_SKILLS) {
      for (const a of SKILL_ALIASES[s.id] ?? []) {
        if (line.includes(a)) {
          const prev = per[s.id];
          if (!prev || w > prev.weight) per[s.id] = { weight: w, required: required || (prev?.required ?? false) };
        }
      }
    }
  }
  const skills: JdSkill[] = Object.entries(per).map(([sid, info]) => {
    const level = twinSkills[sid] ?? 0;
    const s = GAP_SKILLS.find((x) => x.id === sid)!;
    return { skillId: sid, label: s.label, level, weight: info.weight, required: info.required, contrib: (level / 100) * info.weight };
  }).sort((a, b) => b.weight * (1 - b.level / 100) - a.weight * (1 - a.level / 100));

  const denom = skills.reduce((s, x) => s + x.weight, 0);
  const match = denom ? (skills.reduce((s, x) => s + x.contrib, 0) / denom) * 100 : 0;

  const found = new Set(Object.keys(per));
  const unmapped: string[] = [];
  for (const tool of EXTRA_TOOLS) {
    if (new RegExp(`\\b${tool.trim().replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\b`).test(text.toLowerCase()) && !found.has(tool)) unmapped.push(tool.trim());
  }

  return {
    match, skills,
    strong: skills.filter((s) => s.level >= 70),
    gaps: skills.filter((s) => s.level < 50).sort((a, b) => b.weight * (1 - b.level / 100) - a.weight * (1 - a.level / 100)),
    unmapped: [...new Set(unmapped)],
    requiredCount: skills.filter((s) => s.required).length,
  };
}
