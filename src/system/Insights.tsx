import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSys, readinessFor, sysGaps, type AuditLine, type SysProfile } from "./profile";
import { GAP_CAREERS } from "../components/Phase9";

/* ============================================================
   The twin's lively bits — all derived from real data:
   · InsightTicker  — a pulse strip that narrates your profile
   · Milestones     — unlocked by what you actually do
   · trackEvent     — one-line hooks for actions across pages
   ============================================================ */

/* ---------- event tracking (localStorage counters) ---------- */

const EV_KEY = "dtcis_events_v1";
const SEEN_KEY = "dtcis_milestones_seen_v1";

type EventName = "ask" | "resume" | "jd" | "sim" | "adopt";

function readEvents(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(EV_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function trackEvent(name: EventName) {
  const ev = readEvents();
  ev[name] = (ev[name] ?? 0) + 1;
  try {
    localStorage.setItem(EV_KEY, JSON.stringify(ev));
  } catch {
    /* private mode — the twin forgives */
  }
  window.dispatchEvent(new CustomEvent("dtcis-ev"));
}

/* ---------- toast bus ---------- */

const ToastCtx = createContext<(title: string, sub?: string) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

/* ---------- milestones ---------- */

interface Milestone {
  id: string;
  name: string;
  line: string;
  earned: (s: { snapshots: number; audit: string[]; skills: Record<string, number>; ev: Record<string, number> }) => boolean;
}

const MILESTONES: Milestone[] = [
  { id: "first-write", name: "First Write", line: "The twin remembers its first you.", earned: (s) => s.snapshots >= 1 },
  { id: "steady-hand", name: "Steady Hand", line: "Three snapshots — a trend is born.", earned: (s) => s.snapshots >= 3 },
  { id: "archivist", name: "Archivist", line: "Six snapshots. The timeline is yours now.", earned: (s) => s.snapshots >= 6 },
  { id: "amender", name: "Amender", line: "You corrected the record instead of hiding it.", earned: (s) => s.audit.includes("AMEND") },
  { id: "door-tester", name: "Door Tester", line: "You tried a forbidden write. The door held.", earned: (s) => s.audit.includes("REJECT") },
  { id: "breadth", name: "Breadth", line: "Five skills at 70+. A generalist with teeth.", earned: (s) => Object.values(s.skills).filter((v) => v >= 70).length >= 5 },
  { id: "depth", name: "Depth", line: "A skill at 90+. Someone noticed.", earned: (s) => Object.values(s.skills).some((v) => v >= 90) },
  { id: "asked", name: "Asked the Twin", line: "You interrogated your own profile. Good instinct.", earned: (s) => (s.ev.ask ?? 0) >= 1 },
  { id: "curious", name: "Curious", line: "Five questions. The twin is warming up.", earned: (s) => (s.ev.ask ?? 0) >= 5 },
  { id: "analyst", name: "Analyst", line: "A resume met the extractor and survived.", earned: (s) => (s.ev.resume ?? 0) >= 1 },
  { id: "hunter", name: "Hunter", line: "A job posting met the matcher. Fit gauged.", earned: (s) => (s.ev.jd ?? 0) >= 1 },
  { id: "dreamer", name: "Dreamer", line: "A scenario journaled. Hope, with arithmetic.", earned: (s) => (s.ev.sim ?? 0) >= 1 },
];

export function MilestoneProvider({ children }: { children: React.ReactNode }) {
  const { profile, snapshots, audit } = useSys();
  const [, force] = useState(0);
  const [toasts, setToasts] = useState<{ id: number; title: string; sub?: string }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const bump = () => force((x) => x + 1);
    window.addEventListener("dtcis-ev", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("dtcis-ev", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const ev = readEvents();
  const earnedNow = useMemo(
    () =>
      MILESTONES.filter((m) =>
        m.earned({ snapshots: snapshots.length, audit: audit.map((a) => a.kind), skills: profile.skills, ev })
      ),
    [snapshots.length, audit, profile.skills, ev]
  );

  const push = (title: string, sub?: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { id, title, sub }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4600);
  };

  /* toast newly earned milestones, once ever */
  useEffect(() => {
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    } catch {
      seen = [];
    }
    const fresh = earnedNow.filter((m) => !seen.includes(m.id));
    if (fresh.length > 0) {
      fresh.forEach((m, i) => window.setTimeout(() => push(m.name, m.line), i * 700));
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, ...fresh.map((m) => m.id)]));
      } catch {
        /* fine */
      }
    }
  }, [earnedNow]);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      {/* toast host */}
      <div className="pointer-events-none fixed bottom-5 left-5 z-[90] flex w-[300px] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="toastin pointer-events-auto border border-green/50 bg-[#0a1626]/95 p-3 shadow-[0_0_28px_rgba(124,231,165,0.12)]">
            <p className="mono-label flex items-center gap-2 text-[9px] text-green">
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 1.5 9.8 5.6 14.3 6 10.9 9 11.9 13.4 8 11.1 4.1 13.4 5.1 9 1.7 6 6.2 5.6Z" />
              </svg>
              MILESTONE UNLOCKED
            </p>
            <p className="display-head mt-1 text-[14px] text-ink">{t.title}</p>
            {t.sub && <p className="mt-0.5 font-mono text-[9.5px] leading-relaxed text-faint">{t.sub}</p>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function MilestoneStrip() {
  const { profile, snapshots, audit } = useSys();
  const [, force] = useState(0);
  useEffect(() => {
    const bump = () => force((x) => x + 1);
    window.addEventListener("dtcis-ev", bump);
    return () => window.removeEventListener("dtcis-ev", bump);
  }, []);
  const ev = readEvents();
  const earned = (m: Milestone) =>
    m.earned({ snapshots: snapshots.length, audit: audit.map((a) => a.kind), skills: profile.skills, ev });
  const count = MILESTONES.filter(earned).length;

  return (
    <div className="border border-line/80 bg-base/40 p-4">
      <div className="flex items-center justify-between">
        <p className="mono-label text-[8.5px] text-faint">MILESTONES · EARNED BY DOING, NOT CLAIMING</p>
        <p className="mono-label text-[9px] text-green">{count} / {MILESTONES.length}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {MILESTONES.map((m) => {
          const on = earned(m);
          return (
            <span
              key={m.id}
              title={`${m.name} — ${m.line}`}
              className={`mono-label cursor-help border px-2 py-1 text-[8px] transition-all duration-300 ${
                on
                  ? "border-green/60 bg-green/10 text-green shadow-[0_0_12px_rgba(124,231,165,0.12)]"
                  : "border-line/70 text-faint opacity-50"
              }`}
            >
              {on ? "★ " : "☆ "}{m.name.toUpperCase()}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- the insight engine ---------- */

function buildInsights(profile: SysProfile, snapshotsCount: number): string[] {
  const out: string[] = [];
  const target = GAP_CAREERS.find((c) => c.id === profile.targetCareer);
  const r = readinessFor(profile, profile.targetCareer);
  const gaps = sysGaps(profile).filter((g) => g.gap > 0);
  const top = gaps[0];

  if (target) {
    out.push(
      `Readiness for ${target.name} sits at ${r.toFixed(1)}% — every figure on this screen derives from your ${Object.keys(profile.skills).length} skill stores.`
    );
  }
  if (top) {
    out.push(
      `${top.label} is your highest-leverage gap: ${top.gap} pts below target. Closing it removes ${top.shortfall.toFixed(1)} weighted shortfall for ≈${Math.round(top.effortHours)}h of learning.`
    );
  }
  const strongest = [...Object.entries(profile.skills)].sort((a, b) => b[1] - a[1])[0];
  if (strongest) {
    out.push(`${strongest[0].charAt(0).toUpperCase() + strongest[0].slice(1).replace(/_/g, " ")} at ${strongest[1]} is your loudest signal — the roadmap builds on strengths first, not just gaps.`);
  }
  if (profile.academics.attendance < 75) {
    out.push(`Attendance at ${profile.academics.attendance}% is quietly costing you: it carries 30% of Academic Readiness. The twin notices.`);
  }
  if (target) {
    const tags = (profile.interests ?? []).length;
    if (tags === 0) out.push("No interests toggled yet — the interest term (10% of the score) is idle. Tell the twin what you actually like.");
  }
  if (snapshotsCount === 0) {
    out.push("No snapshots yet — the twin has a present but no past. Commit one on the Digital Twin page and the timeline begins.");
  } else {
    out.push(`${snapshotsCount} snapshot${snapshotsCount > 1 ? "s" : ""} on record. The Progress page turns them into a story you can defend.`);
  }
  out.push("Ask the advisor “what should I learn next?” — it answers from this exact profile, and refuses to invent anything it can't show you.");
  return out;
}

/* ---------- the pulse strip ---------- */

export function InsightTicker() {
  const { profile, snapshots } = useSys();
  const insights = useMemo(() => buildInsights(profile, snapshots.length), [profile, snapshots.length]);
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const full = insights[idx % insights.length];

  useEffect(() => setChars(0), [idx, full]);

  useEffect(() => {
    if (chars < full.length) {
      const t = window.setTimeout(() => setChars((c) => c + 2), 18);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setIdx((i) => i + 1), 5200);
    return () => window.clearTimeout(t);
  }, [chars, full]);

  /* live clock */
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="relative mb-5 overflow-hidden border border-cyan/30 bg-[#0a1626]/70">
      <div className="flex items-stretch">
        {/* ECG */}
        <div className="flex w-[120px] shrink-0 items-center border-r border-line/60 bg-cyan/[0.04] px-3">
          <svg viewBox="0 0 100 40" className="w-full" aria-hidden="true">
            <path
              d="M0 20 H18 L24 20 28 8 33 32 38 14 42 20 H60 L66 20 70 12 74 26 78 20 H100"
              fill="none"
              stroke="#6be1ff"
              strokeWidth="1.6"
              strokeDasharray="140"
              className="ecg-path"
            />
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
            </span>
            <p className="mono-label text-[8px] text-cyan">TWIN PULSE · LIVE NARRATION OF YOUR PROFILE</p>
            <p className="mono-label ml-auto hidden text-[8px] text-faint sm:block">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
          <p className="mt-1 truncate font-mono text-[11.5px] text-dim" title={full}>
            <span className="text-cyan">▸ </span>
            {full.slice(0, chars)}
            <span className="blink ml-0.5 inline-block h-[0.9em] w-[6px] translate-y-[0.12em] bg-cyan" />
          </p>
        </div>
      </div>
    </div>
  );
}
