import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSession } from "../lib/auth";
import Backplates from "../components/Backplates";
import VideoBackdrop from "../components/VideoBackdrop";
import ParticleField from "../components/ParticleField";
import { SysProvider, useSys, readinessFor } from "./profile";
import { GAP_CAREERS } from "../components/Phase9";
import { SysDashboard, SysTwin, SysCareers } from "./SysPages1";
import { SysSkills, SysRoadmap } from "./SysPages2";
import { SysResume, SysJobs, SysSimulate, SysProgress } from "./SysPages3";
import { MilestoneProvider, InsightTicker, MilestoneStrip, trackEvent, useToast } from "./Insights";
import { AdvisorPanel, answer, type Msg } from "./Advisor";

const msgTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
  { id: "advisor", label: "Career Advisor", hint: "ask the twin", icon: <path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 3v-3.6A7.5 7.5 0 1 1 21 11.5Z" /> },
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
  advisor: ["Career Advisor", "Ask the twin anything. It answers only from your live profile — decompositions, gaps, sequences, simulations — and refuses to invent what the data can't support."],
};

function SystemInner({ user }: { user: string }) {
  const { page = "" } = useParams();
  const [title, intro] = TITLES[page] ?? TITLES[""];
  const { profile } = useSys();
  const profileRef = useRef(profile);
  profileRef.current = profile;

  /* the twin's voice — shared by the Advisor page and the floating panel */
  const [chat, setChat] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    if (chat.length === 0) {
      const hello = answer("hello", profileRef.current, user);
      setChat([{ role: "twin", text: hello.text, chips: hello.chips, ts: msgTime() }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (text: string) => {
    if (page !== "advisor") setPanel(true);
    trackEvent("ask");
    setChat((c) => [...c, { role: "user", text, ts: msgTime() }]);
    setTyping(true);
    window.setTimeout(() => {
      const reply = answer(text, profileRef.current, user);
      setChat((c) => [...c, { role: "twin", text: reply.text, chips: reply.chips, ts: msgTime() }]);
      setTyping(false);
    }, 550 + Math.random() * 500);
  };

  /* ⌘K / Ctrl+K anywhere in the system */
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          <div className="flex items-center gap-2.5">
            <StatusPill />
            <button
              onClick={() => setPalette(true)}
              title="Command palette"
              className="mono-label hidden border border-line/80 bg-base/50 px-2.5 py-1.5 text-[8.5px] text-dim transition-all duration-200 hover:border-cyan/60 hover:text-cyan sm:block"
            >
              ⌘K
            </button>
          </div>
        </div>

        <div key={page} className="pagein">
          {page === "" && (
            <>
              <InsightTicker />
              <SysDashboard user={user} />
              <div className="mt-5">
                <MilestoneStrip />
              </div>
            </>
          )}
          {page === "twin" && <SysTwin />}
          {page === "careers" && <SysCareers />}
          {page === "skills" && <SysSkills />}
          {page === "roadmap" && <SysRoadmap />}
          {page === "resume" && <SysResume />}
          {page === "jobs" && <SysJobs />}
          {page === "simulate" && <SysSimulate />}
          {page === "progress" && <SysProgress />}
          {page === "advisor" && (
            <div className="h-[calc(100vh-230px)] min-h-[460px]">
              <AdvisorPanel messages={chat} typing={typing} send={send} variant="page" />
            </div>
          )}
        </div>
      </div>

      {/* the twin listens from every page */}
      {page !== "advisor" && (
        <>
          <button
            onClick={() => setPanel(true)}
            className="group fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 border border-cyan bg-[#0a1626]/95 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan/15 hover:shadow-[0_0_30px_rgba(107,225,255,0.25)] active:translate-y-0"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
            </span>
            <span className="mono-label text-[9.5px] text-cyan">ASK THE TWIN</span>
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-cyan transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
            </svg>
          </button>

          {panel && (
            <div className="fixed inset-0 z-[80]">
              <div className="absolute inset-0 bg-black/55" onClick={() => setPanel(false)} />
              <div className="panelin absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col border-l border-line bg-[#0a1424]/97">
                <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
                  <CrosshairMini />
                  <div>
                    <p className="mono-label text-[9.5px] text-cyan">CAREER ADVISOR</p>
                    <p className="font-mono text-[8.5px] text-faint">reads your live twin · answers, never invents</p>
                  </div>
                  <button
                    onClick={() => setPanel(false)}
                    aria-label="Close advisor panel"
                    className="ml-auto flex h-8 w-8 items-center justify-center border border-line text-faint transition-colors hover:border-rose hover:text-rose"
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                    </svg>
                  </button>
                </div>
                <div className="min-h-0 flex-1">
                  <AdvisorPanel messages={chat} typing={typing} send={send} variant="overlay" onClose={() => setPanel(false)} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <CommandPalette open={palette} onClose={() => setPalette(false)} send={send} />
    </div>
  );
}

function CrosshairMini() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3.5" y="3.5" width="17" height="17" />
      <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" strokeWidth="1.1" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- ⌘K command palette ---------- */

function CommandPalette({ open, onClose, send }: { open: boolean; onClose: () => void; send: (t: string) => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const pages = NAV.map((n) => ({
      kind: "page" as const,
      label: n.label,
      sub: n.hint,
      run: () => navigate(n.id ? `/system/${n.id}` : "/system"),
    }));
    const asks = [
      "What should I learn next?",
      "Why is my top career recommended?",
      "If I improve SQL by 20, what changes?",
      "What am I missing for my target?",
    ].map((t) => ({
      kind: "ask" as const,
      label: `Ask the twin — “${t}”`,
      sub: "career advisor",
      run: () => send(t),
    }));
    const all = [...pages, { kind: "page" as const, label: "Design Dossier", sub: "the explanation", run: () => navigate("/") }, ...asks];
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((i) => i.label.toLowerCase().includes(needle)) : all;
  }, [q, navigate, send]);

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center px-4 pt-[14vh]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="msgin relative w-full max-w-[520px] border border-cyan/40 bg-[#0a1424]/98 shadow-[0_0_60px_rgba(107,225,255,0.12)]">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 14 14" />
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && items[0]) {
                items[0].run();
                onClose();
              }
              if (e.key === "Escape") onClose();
            }}
            placeholder="Jump to a page, or ask the twin…"
            className="w-full bg-transparent font-mono text-[13px] text-ink outline-none placeholder:text-faint/60"
          />
          <span className="mono-label shrink-0 border border-line px-1.5 py-0.5 text-[7.5px] text-faint">ESC</span>
        </div>
        <div className="max-h-[46vh] overflow-y-auto p-1.5">
          {items.length === 0 && (
            <p className="px-3 py-4 font-mono text-[11px] text-faint">Nothing matches — the twin suggests fewer letters.</p>
          )}
          {items.slice(0, 9).map((i, idx) => (
            <button
              key={i.label}
              onClick={() => {
                i.run();
                onClose();
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                idx === 0 ? "bg-cyan/[0.08]" : "hover:bg-cyan/[0.05]"
              }`}
            >
              <span className={`mono-label text-[8px] ${i.kind === "ask" ? "text-amber" : "text-cyan"}`}>
                {i.kind === "ask" ? "ASK" : "GO"}
              </span>
              <span className="mono-label flex-1 text-[10px] text-dim">{i.label}</span>
              <span className="mono-label text-[7.5px] text-faint">{i.sub.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <p className="border-t border-line px-4 py-2 font-mono text-[8.5px] text-faint">
          ⌘K anywhere in the system · Enter runs the highlighted line
        </p>
      </div>
    </div>
  );
}

/* ---------- the hidden handshake ---------- */

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

function Konami() {
  const toast = useToast();
  const buf = useRef<string[]>([]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      buf.current = [...buf.current.slice(-9), e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (KONAMI.every((k, i) => buf.current[buf.current.length - KONAMI.length + i] === k)) {
        document.body.classList.toggle("overclock");
        const on = document.body.classList.contains("overclock");
        toast(
          on ? "TWIN OVERCLOCKED" : "TWIN RETURNED TO SPEC",
          on ? "Ambient field at 120%. Cosmetic only — the math never changes." : "Back to factory settings. The math never changed."
        );
        buf.current = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toast]);
  return null;
}

export default function SystemShell() {
  const user = getSession()?.name ?? "Student";
  return (
    <SysProvider>
      <MilestoneProvider>
        <div className="relative min-h-screen">
          {/* ambient layers — hologram plate, video streams, 3D constellation */}
          <div className="bg-blueprint" aria-hidden="true" />
          <Backplates path="/system" />
          <VideoBackdrop />
          <ParticleField />
          <div className="bg-scan" aria-hidden="true" />
          <div className="bg-noise" aria-hidden="true" />
          <SystemInner user={user} />
          <Konami />
        </div>
      </MilestoneProvider>
    </SysProvider>
  );
}
