import { Link } from "react-router-dom";
import { useSys, readinessFor, coverageFor, technicalFor, acadFor, interestFitFor, sysGaps, INTEREST_DEFS } from "./profile";
import { GAP_SKILLS, GAP_CAREERS } from "../components/Phase9";
import { Reveal, Tag } from "../components/ui";
import { useCountUp, useReveal } from "../hooks";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

const careerName = (id: string) => GAP_CAREERS.find((c) => c.id === id)?.name ?? id;

function Kpi({ label, value, color, formula }: { label: string; value: number; color: string; formula: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const n = useCountUp(Math.round(value), visible);
  return (
    <div ref={ref} className={`reveal ${visible ? "in" : ""} group border border-line/80 bg-base/50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/40`}>
      <div className="flex items-baseline justify-between">
        <p className="mono-label text-[8.5px] text-dim">{label}</p>
        <p className="font-mono text-[19px]" style={{ color }}>{n}<span className="text-[11px] text-faint">%</span></p>
      </div>
      <div className="mt-2 h-1 w-full bg-line/40">
        <div className="h-full transition-all duration-700" style={{ width: `${Math.min(100, value)}%`, background: color, boxShadow: `0 0 8px ${color}55` }} />
      </div>
      <p className="mt-1.5 font-mono text-[8.5px] leading-relaxed text-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100">= {formula}</p>
    </div>
  );
}

/* ================= DASHBOARD ================= */

export function SysDashboard({ user }: { user: string }) {
  const { profile, snapshots } = useSys();
  const target = profile.targetCareer;

  const board = GAP_CAREERS.map((c) => ({ c, r: readinessFor(profile, c.id) })).sort((a, b) => b.r - a.r);
  const gaps = sysGaps(profile).filter((g) => g.gap > 0);
  const actionable = gaps.filter((g) => g.blockedBy.length === 0).sort((a, b) => b.payoff - a.payoff);
  const best = actionable[0];

  return (
    <div className="space-y-5">
      {/* identity strip */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-4 border border-line/80 bg-base/50 p-4 sm:p-5">
          <span className="flex h-12 w-12 items-center justify-center border border-cyan/50 bg-cyan/10 font-mono text-[18px] font-bold text-cyan">
            {user.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="display-head text-xl text-ink">{user}</p>
            <p className="mono-label mt-0.5 text-[8.5px] text-faint">
              DIGITAL TWIN · TARGET <span className="text-amber">{careerName(target).toUpperCase()}</span> · {snapshots.length} SNAPSHOT{snapshots.length === 1 ? "" : "S"} ON RECORD
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Link to="/system/twin" className="mono-label border border-cyan/60 bg-cyan/10 px-3 py-2 text-[9px] text-cyan transition-all duration-200 hover:bg-cyan/20 hover:shadow-[0_0_18px_rgba(107,225,255,0.15)]">EDIT TWIN</Link>
            <Link to="/system/simulate" className="mono-label border border-amber/60 bg-amber/10 px-3 py-2 text-[9px] text-amber transition-all duration-200 hover:bg-amber/20">WHAT-IF</Link>
          </div>
        </div>
      </Reveal>

      {/* readiness KPIs — all derived, formulas on hover */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="CAREER READINESS" value={(0.5 * coverageFor(target, profile.skills) + 0.15 * acadFor(profile.academics) + 0.1 * interestFitFor(target, profile.interests)) / 0.75} color={AMBER} formula="(0.5·cov + 0.15·acad + 0.10·interest)/0.75" />
        <Kpi label="SKILL COVERAGE" value={coverageFor(target, profile.skills)} color={CYAN} formula="Σmin(level, 100·w)/Σ(100·w)" />
        <Kpi label="TECHNICAL" value={technicalFor(target, profile.skills)} color={GREEN} formula="requirement-weighted mean level" />
        <Kpi label="ACADEMIC" value={acadFor(profile.academics)} color="#9db8ff" formula="0.5·GPA + 0.3·att + 0.2·assign" />
        <Kpi label="PORTFOLIO" value={Math.min(100, profile.portfolio.projects * 14 + profile.portfolio.avgDiff * 9 + profile.portfolio.certs * 7)} color={ROSE} formula="projects·14 + difficulty·9 + certs·7" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* career board */}
        <Reveal>
          <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="mono-label text-[8.5px] text-faint">CAREER COMPATIBILITY — LIVE FROM YOUR TWIN</p>
              <Link to="/system/careers" className="mono-label text-[8.5px] text-cyan transition-colors hover:text-ink">FULL BOARD →</Link>
            </div>
            <div className="space-y-1.5">
              {board.slice(0, 7).map(({ c, r }, i) => (
                <div key={c.id} className="group flex items-center gap-3">
                  <span className="mono-label w-5 text-[9px] text-faint">{i + 1}</span>
                  <span className={`w-40 shrink-0 truncate text-[12px] ${c.id === target ? "text-amber" : "text-dim"} group-hover:text-ink`}>{c.name}</span>
                  <div className="relative h-2 flex-1 bg-line/30">
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-700 ${c.id === target ? "bg-amber" : "bg-cyan/80"}`}
                      style={{ width: `${Math.min(100, r)}%`, boxShadow: `0 0 8px ${c.id === target ? "rgba(255,194,102,0.4)" : "rgba(107,225,255,0.3)"}` }}
                    />
                  </div>
                  <span className={`w-12 text-right font-mono text-[11px] ${c.id === target ? "text-amber" : "text-cyan"}`}>{r.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-line pt-2.5 font-mono text-[8.5px] text-faint">
              model-evidence term absent (no trained run yet) — weight renormalized over 0.75, disclosed per §45
            </p>
          </div>
        </Reveal>

        {/* next move */}
        <div className="space-y-4">
          <Reveal delay={80}>
            <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
              <p className="mono-label text-[8.5px] text-faint">YOUR NEXT MOVE — DERIVED</p>
              {best ? (
                <>
                  <p className="display-head mt-2 text-2xl text-cyan">{best.label}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">
                    closes a <span className="text-ink">{best.shortfall.toFixed(0)}-pt weighted shortfall</span> ({best.current} → {best.target})
                    in ≈ <span className="text-amber">{best.effortHours}h</span> — best payoff-per-effort on your target.
                  </p>
                  <Link to="/system/roadmap" className="mono-label mt-3 inline-block border border-cyan/60 px-3 py-2 text-[9px] text-cyan transition-all duration-200 hover:bg-cyan/15">
                    OPEN LEARNING ROADMAP →
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-[13px] text-dim">No gaps above zero — the engine recommends nothing, which is itself a recommendation.</p>
              )}
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
              <p className="mono-label text-[8.5px] text-faint">TOP GAPS VS {careerName(target).toUpperCase()}</p>
              <div className="mt-2.5 space-y-1.5">
                {gaps.slice(0, 4).map((g) => (
                  <div key={g.skillId} className="flex items-center gap-2.5">
                    <span className="w-28 shrink-0 truncate text-[11.5px] text-dim">{g.label}</span>
                    <div className="relative h-1.5 flex-1 bg-line/30">
                      <div className="absolute inset-y-0 left-0 bg-green/80" style={{ width: `${g.current}%` }} />
                      <div className="absolute inset-y-0 bg-rose/70" style={{ left: `${g.current}%`, width: `${g.gap}%` }} />
                      <div className="absolute inset-y-0 left-0 border-r border-dashed border-ink/60" style={{ width: `${g.target}%` }} />
                    </div>
                    <span className="w-14 text-right font-mono text-[9.5px] text-rose">−{g.shortfall.toFixed(0)} pts</span>
                  </div>
                ))}
                {gaps.length === 0 && <p className="text-[12px] text-green">Target requirements fully met.</p>}
              </div>
              <p className="mt-2 font-mono text-[8.5px] text-faint">green = you have · red = shortfall · dashed = target</p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ================= DIGITAL TWIN ================= */

const FORBIDDEN: [string, string][] = [
  ["twin.sex = 'F'", "sensitive attribute — REV-D EXCLUDE"],
  ["twin.Medu = 4", "socioeconomic proxy — REV-D EXCLUDE"],
  ["twin.G3 = 17", "target column — REV-C, never a feature"],
  ["twin.cluster_id = 2", "cohort description — REV-G, never per-student"],
];

export function SysTwin() {
  const { profile, snapshots, audit, setSkill, setAcad, setPortfolio, toggleInterest, setTarget, commit, amend, reset, log } = useSys();

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-4">
        <Reveal>
          <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
            <p className="mono-label mb-3 text-[8.5px] text-faint">STORE 1/5 — SKILLS[12] · SELF-ASSESSED 0–100</p>
            <div className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
              {GAP_SKILLS.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="mono-label w-24 shrink-0 text-[8px] text-dim">{s.label}</span>
                  <input type="range" min={0} max={100} value={profile.skills[s.id]}
                    onChange={(e) => setSkill(s.id, Number(e.target.value))}
                    className="twin-range h-1 flex-1 cursor-ew-resize" aria-label={s.label} />
                  <span className="w-7 text-right font-mono text-[11px] text-cyan">{profile.skills[s.id]}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={70}>
          <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
            <p className="mono-label mb-3 text-[8.5px] text-faint">STORE 2/5 — ACADEMICS · STORE 3/5 — PORTFOLIO</p>
            <div className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
              {([["gpa", "GPA (0–100)", 0, 100], ["attendance", "Attendance %", 0, 100], ["assignments", "Assignments %", 0, 100], ["studyHours", "Study h/wk", 0, 40]] as const).map(([k, l, mn, mx]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="mono-label w-24 shrink-0 text-[8px] text-dim">{l}</span>
                  <input type="range" min={mn} max={mx} value={profile.academics[k]}
                    onChange={(e) => setAcad(k, Number(e.target.value))}
                    className="twin-range h-1 flex-1 cursor-ew-resize" aria-label={l} />
                  <span className="w-7 text-right font-mono text-[11px] text-dim">{profile.academics[k]}</span>
                </div>
              ))}
              {([["projects", "Projects", 0, 12], ["avgDiff", "Mean difficulty", 1, 5], ["certs", "Certifications", 0, 8]] as const).map(([k, l, mn, mx]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="mono-label w-24 shrink-0 text-[8px] text-dim">{l}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPortfolio(k, Math.max(mn, profile.portfolio[k] - 1))} className="mono-label border border-line px-2 py-0.5 text-[9px] text-faint hover:border-cyan hover:text-cyan">−</button>
                    <span className="w-7 text-center font-mono text-[12px] text-cyan">{profile.portfolio[k]}</span>
                    <button onClick={() => setPortfolio(k, Math.min(mx, profile.portfolio[k] + 1))} className="mono-label border border-line px-2 py-0.5 text-[9px] text-faint hover:border-cyan hover:text-cyan">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
            <p className="mono-label mb-2.5 text-[8.5px] text-faint">STORE 4/5 — INTERESTS · STORE 5/5 — TARGET CAREER</p>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_DEFS.map((i) => {
                const on = profile.interests.includes(i.id);
                return (
                  <button key={i.id} onClick={() => toggleInterest(i.id)}
                    className={`mono-label border px-2.5 py-1.5 text-[8.5px] transition-all duration-200 ${on ? "border-cyan bg-cyan/15 text-cyan" : "border-line text-faint hover:border-cyan/50 hover:text-dim"}`}>
                    {i.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {GAP_CAREERS.map((c) => (
                <button key={c.id} onClick={() => setTarget(c.id)}
                  className={`mono-label border px-2.5 py-1.5 text-[8.5px] transition-all duration-200 ${profile.targetCareer === c.id ? "border-amber bg-amber/15 text-amber" : "border-line text-faint hover:border-amber/50 hover:text-dim"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div className="space-y-4">
        <Reveal delay={90}>
          <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
            <p className="mono-label text-[8.5px] text-faint">VERSION CONTROL — THE TWIN'S MEMORY</p>
            <div className="mt-3 flex gap-2">
              <button onClick={commit} className="mono-label flex-1 border border-cyan bg-cyan/10 px-3 py-2.5 text-[9.5px] text-cyan transition-all duration-200 hover:bg-cyan/20 hover:shadow-[0_0_18px_rgba(107,225,255,0.15)]">
                COMMIT SNAPSHOT v{snapshots.length + 1}
              </button>
              <button onClick={amend} disabled={snapshots.length === 0}
                className="mono-label border border-amber/60 bg-amber/5 px-3 py-2.5 text-[9.5px] text-amber transition-all duration-200 hover:bg-amber/15 disabled:cursor-not-allowed disabled:opacity-30">
                AMEND LAST
              </button>
            </div>
            <p className="mt-2 font-mono text-[8.5px] leading-relaxed text-faint">
              amend archives prior values — correction, never erasure (§72)
            </p>
            <div className="mt-3 max-h-[170px] space-y-1.5 overflow-y-auto border-t border-line pt-3 pr-1">
              {audit.map((a, i) => (
                <div key={i} className="flex items-start gap-2 border-b border-line/40 pb-1.5 text-[10.5px] leading-snug last:border-0">
                  <Tag tone={a.kind === "REJECT" ? "rose" : a.kind === "AMEND" ? "amber" : a.kind === "INIT" ? "dim" : "cyan"}>{a.kind}</Tag>
                  <p className="text-faint"><span className="mr-1.5 font-mono text-[9px] text-dim">{a.ts}</span>{a.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="border border-rose/40 bg-base/50 p-4 sm:p-5">
            <p className="mono-label mb-2.5 text-[8.5px] text-rose">VALIDATOR DRILL — FORBIDDEN WRITES</p>
            <div className="flex flex-wrap gap-1.5">
              {FORBIDDEN.map(([f, r]) => (
                <button key={f} onClick={() => log("REJECT", `write attempt '${f}' refused at the door (${r})`)}
                  className="mono-label border border-rose/40 bg-rose/5 px-2.5 py-1.5 text-[8.5px] text-rose/90 transition-all duration-200 hover:bg-rose/15">
                  {f}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-faint">The twin refuses these at the door and logs the attempt — the field never reaches storage.</p>
            <button onClick={() => { if (window.confirm("Reset the twin to intake defaults? Snapshots and audit are cleared (right to be forgotten).")) reset(); }}
              className="mono-label mt-3 border border-line px-3 py-2 text-[8.5px] text-faint transition-colors hover:border-rose hover:text-rose">
              RESET TWIN — RIGHT TO BE FORGOTTEN
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ================= CAREER INTELLIGENCE ================= */

export function SysCareers() {
  const { profile } = useSys();
  const board = GAP_CAREERS.map((c) => {
    const cov = coverageFor(c.id, profile.skills);
    const acad = acadFor(profile.academics);
    const interest = interestFitFor(c.id, profile.interests);
    const r = (0.5 * cov + 0.15 * acad + 0.1 * interest) / 0.75;
    return { c, cov, acad, interest, r };
  }).sort((a, b) => b.r - a.r);

  const top = board[0];
  const factors = Object.entries(top.c.req)
    .map(([sid, w]) => ({ sid, w, level: profile.skills[sid] ?? 0, pos: w * Math.min(profile.skills[sid] ?? 0, w * 100) / (w * 100), neg: w * (1 - Math.min(profile.skills[sid] ?? 0, w * 100) / (w * 100)) }))
    .sort((a, b) => b.neg - a.neg);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Reveal>
        <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
          <p className="mono-label mb-3 text-[8.5px] text-faint">TWELVE CAREERS — RANKED LIVE · THE TWIN'S CURRENT STATE</p>
          <div className="space-y-1.5">
            {board.map(({ c, r }, i) => (
              <div key={c.id} className={`group flex items-center gap-3 border px-3 py-2 transition-all duration-200 ${c.id === profile.targetCareer ? "border-amber/60 bg-amber/5" : "border-transparent hover:border-line hover:bg-base/60"}`}>
                <span className="mono-label w-5 text-[9px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className={`w-44 shrink-0 truncate text-[12.5px] ${c.id === profile.targetCareer ? "text-amber" : "text-dim"} group-hover:text-ink`}>
                  {c.name}
                  {c.id === profile.targetCareer && <span className="mono-label ml-2 text-[7px] text-amber">TARGET</span>}
                </span>
                <div className="relative h-2 flex-1 bg-line/30">
                  <div className={`absolute inset-y-0 left-0 transition-all duration-700 ${c.id === profile.targetCareer ? "bg-amber" : "bg-cyan/80"}`}
                    style={{ width: `${Math.min(100, r)}%`, boxShadow: `0 0 8px ${c.id === profile.targetCareer ? "rgba(255,194,102,0.4)" : "rgba(107,225,255,0.3)"}` }} />
                </div>
                <span className={`w-12 text-right font-mono text-[11.5px] ${c.id === profile.targetCareer ? "text-amber" : "text-cyan"}`}>{r.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 border-t border-line pt-2.5 font-mono text-[8.5px] text-faint">
            scores are a fit gauge between the twin and a requirement vector — they rank careers, never people (§48 X-4)
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
          <p className="mono-label text-[8.5px] text-faint">WHY <span className="text-amber">{top.c.name.toUpperCase()}</span> LEADS — FACTOR DECOMPOSITION</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[["COVERAGE", top.cov, CYAN], ["ACADEMIC", top.acad, "#9db8ff"], ["INTEREST", top.interest, GREEN]].map(([l, v, col]) => (
              <div key={l as string} className="border border-line/70 p-2.5">
                <p className="font-mono text-[16px]" style={{ color: col as string }}>{(v as number).toFixed(0)}</p>
                <p className="mono-label mt-0.5 text-[7.5px] text-faint">{l as string} · TERM</p>
              </div>
            ))}
          </div>
          <p className="mono-label mt-4 text-[8px] text-green">MAIN POSITIVE FACTORS</p>
          <ul className="mt-1.5 space-y-1">
            {[...factors].sort((a, b) => b.pos - a.pos).slice(0, 3).map((f) => (
              <li key={f.sid} className="flex justify-between text-[11.5px] text-dim">
                <span>+ {GAP_SKILLS.find((s) => s.id === f.sid)?.label}</span>
                <span className="font-mono text-green">{(f.pos * 100).toFixed(0)}% of requirement met</span>
              </li>
            ))}
          </ul>
          <p className="mono-label mt-3.5 text-[8px] text-rose">MAIN NEGATIVE FACTORS</p>
          <ul className="mt-1.5 space-y-1">
            {factors.filter((f) => f.neg > 0.05).slice(0, 3).map((f) => (
              <li key={f.sid} className="flex justify-between text-[11.5px] text-dim">
                <span>− {GAP_SKILLS.find((s) => s.id === f.sid)?.label}</span>
                <span className="font-mono text-rose">{(f.neg * 100).toFixed(0)}% short</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-line pt-2.5 font-mono text-[8.5px] leading-relaxed text-faint">
            rule terms explain themselves structurally; the model term joins after Run 002 with TreeSHAP (§66)
          </p>
        </div>
      </Reveal>
    </div>
  );
}
