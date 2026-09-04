import { Link, useParams } from "react-router-dom";
import { getSession } from "../lib/auth";
import { SysProvider, useSys, readinessFor } from "./profile";
import { GAP_CAREERS } from "../components/Phase9";
import { SysDashboard, SysTwin, SysCareers } from "./SysPages1";
import { SysSkills, SysRoadmap } from "./SysPages2";
import { SysResume, SysJobs, SysSimulate, SysProgress } from "./SysPages3";

/* ============================================================
   The actual system — the twelve-page product rehearsed in
   §79, now real. Its rail is its own navigation; the document
   dossier remains one click away.
   ============================================================ */

const NAV: { id: string; label: string; hint: string; icon: JSX.Element }[] = [
  { id: "", label: "Dashboard", hint: "overview", icon: <path d="M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z" /> },
  { id: "twin", label: "Digital Twin", hint: "profile & writes", icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></> },
  { id: "careers", label: "Career Intelligence", hint: "12-way ranking", icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></> },
  { id: "skills", label: "Skill Intelligence", hint: "gap analysis", icon: <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /> },
  { id: "roadmap", label: "Learning Roadmap", hint: "what next", icon: <><path d="M4 19c4-1 4-6 8-7s6-4 8-8" /><path d="M16 4h4v4" /></> },
  { id: "resume", label: "Resume Analyzer", hint: "NLP extraction", icon: <><rect x="5" y="3" width="14" height="18" /><path d="M8.5 8h7M8.5 12h7M8.5 16h4" /></> },
  { id: "jobs", label: "Job Matcher", hint: "JD fit gauge", icon: <><rect x="3" y="8" width="18" height="12" /><path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8M3 13h18" /></> },
  { id: "simulate", label: "Future Simulator", hint: "what-if", icon: <><path d="M9 3h6M10 3v5l-5.5 9A2 2 0 0 0 6.2 20h11.6a2 2 0 0 0 1.7-3L14 8V3" /><path d="M7.5 14h9" /></> },
  { id: "progress", label: "Progress", hint: "timeline", icon: <path d="M3 20h18M5 16l4-5 3 3 5-7 3 4" /> },
];

function StatusPill() {
  const { profile, snapshots } = useSys();
  const r = readinessFor(profile, profile.targetCareer);
  const target = GAP_CAREERS.find((c) => c.id === profile.targetCareer)?.name ?? "";
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="mono-label border border-line/80 bg-base/50 px-2.5 py-1.5 text-[8.5px] text-dim">
        TARGET <span className="text-amber">{target.toUpperCase()}</span>
      </span>
      <span className="mono-label border border-line/80 bg-base/50 px-2.5 py-1.5 text-[8.5px] text-dim">
        READINESS <span className="text-cyan">{r.toFixed(1)}%</span>
      </span>
      <span className="mono-label border border-line/80 bg-base/50 px-2.5 py-1.5 text-[8.5px] text-dim">
        SNAPSHOTS <span className="text-green">{snapshots.length}</span>
      </span>
      <span className="mono-label hidden border border-green/50 bg-green/10 px-2.5 py-1.5 text-[8.5px] text-green sm:block">
        ● LIVE — ALL VALUES DERIVED
      </span>
    </div>
  );
}

function Rail() {
  const { page = "" } = useParams();
  return (
    <nav aria-label="System pages" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line bg-[#0a1424]/90 px-4 py-2.5 lg:w-[220px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
      <p className="mono-label hidden px-2 pb-2 text-[7.5px] tracking-[0.28em] text-amber lg:block">
        DT-CIS · THE SYSTEM
      </p>
      {NAV.map((n) => {
        const active = page === n.id;
        return (
          <Link
            key={n.id}
            to={n.id ? `/system/${n.id}` : "/system"}
            className={`group relative flex shrink-0 items-center gap-2.5 px-2.5 py-2 transition-all duration-200 lg:px-2 ${
              active ? "bg-cyan/[0.08]" : "hover:bg-cyan/[0.04]"
            }`}
          >
            <span className={`absolute inset-y-1 left-0 hidden w-[2.5px] origin-top transition-transform duration-300 lg:block ${active ? "scale-y-100 bg-cyan" : "scale-y-0 bg-line group-hover:scale-y-50"}`} />
            <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-cyan" : "text-faint group-hover:text-dim"}`} fill="none" stroke="currentColor" strokeWidth="1.5">
              {n.icon}
            </svg>
            <span className="min-w-0">
              <span className={`mono-label block text-[9.5px] tracking-[0.12em] ${active ? "text-cyan" : "text-dim group-hover:text-ink"}`}>
                {n.label.toUpperCase()}
              </span>
              <span className="mono-label hidden text-[7.5px] text-faint lg:block">{n.hint}</span>
            </span>
          </Link>
        );
      })}
      <div className="mt-auto hidden border-t border-line pt-3 lg:block">
        <Link to="/" className="mono-label block px-2 py-1.5 text-[8.5px] text-faint transition-colors hover:text-cyan">
          ← DESIGN DOSSIER
        </Link>
        <p className="mt-2 px-2 font-mono text-[8px] leading-relaxed text-faint">
          profile stored on-device only · every number derived at read time
        </p>
      </div>
    </nav>
  );
}

const TITLES: Record<string, [string, string]> = {
  "": ["Dashboard", "Where am I now? Five readiness indicators, your career board, and the one next move — all derived live from the twin."],
  twin: ["Digital Twin", "The five stores. Edit anything; the whole system recomputes. Commit snapshots to build the timeline; amend, never erase."],
  careers: ["Career Intelligence", "Twelve careers ranked against your twin by the §45 engine — and the factor decomposition behind the leader."],
  skills: ["Skill Intelligence", "Your levels against the target's requirement vector: weighted shortfalls, effort, payoff, and the prerequisite blocks."],
  roadmap: ["Learning Roadmap", "The next six moves — prerequisite-ordered, payoff-ranked, with free resources and build checkpoints. Derived, not decreed."],
  resume: ["Resume Analyzer", "Paste a CV. The extractor transcribes claims, counts evidence, and diffs them against the twin — nothing leaves this device."],
  jobs: ["Job Matcher", "Paste a posting. Required skills weigh double; the result is a fit gauge, never a hiring forecast."],
  simulate: ["Future Simulator", "Perturb a copy of the twin and watch twelve futures recompute — with exact attribution and a label that refuses to call it prophecy."],
  progress: ["Progress", "The timeline the twin earns, one snapshot at a time: skill growth, readiness drift, and portfolio milestones."],
};

function SystemInner({ user }: { user: string }) {
  const { page = "" } = useParams();
  const [title, intro] = TITLES[page] ?? TITLES[""];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
      <Rail />
      <div className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6 lg:pt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mono-label text-[8.5px] text-faint">DT-CIS · DECISION-SUPPORT SYSTEM · RUNS ENTIRELY IN YOUR BROWSER</p>
            <h1 className="display-head mt-1.5 text-3xl text-ink sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-dim">{intro}</p>
          </div>
          <StatusPill />
        </div>

        <div key={page} className="pagein">
          {page === "" && <SysDashboard user={user} />}
          {page === "twin" && <SysTwin />}
          {page === "careers" && <SysCareers />}
          {page === "skills" && <SysSkills />}
          {page === "roadmap" && <SysRoadmap />}
          {page === "resume" && <SysResume />}
          {page === "jobs" && <SysJobs />}
          {page === "simulate" && <SysSimulate />}
          {page === "progress" && <SysProgress />}
        </div>
      </div>
    </div>
  );
}

export default function SystemShell() {
  const user = getSession()?.name ?? "Student";
  return (
    <SysProvider>
      <SystemInner user={user} />
    </SysProvider>
  );
}
