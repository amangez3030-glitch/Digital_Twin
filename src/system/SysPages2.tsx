import { Link } from "react-router-dom";
import { useSys, sysGaps } from "./profile";
import { GAP_CAREERS, GAP_SKILLS } from "../components/Phase9";
import { CATALOG } from "../components/Phase10";
import { Reveal, Tag } from "../components/ui";

const GREEN = "#7ce7a5";
const AMBER = "#ffc266";
const ROSE = "#ff8b8b";
const CYAN = "#6be1ff";

const careerName = (id: string) => GAP_CAREERS.find((c) => c.id === id)?.name ?? id;
const skillLabel = (id: string) => GAP_SKILLS.find((s) => s.id === id)?.label ?? id;

/* ================= SKILL INTELLIGENCE ================= */

export function SysSkills() {
  const { profile, setTarget } = useSys();
  const gaps = sysGaps(profile);
  const actionable = gaps.filter((g) => g.blockedBy.length === 0 && g.gap > 0);
  const learnNext = [...actionable].sort((a, b) => b.payoff - a.payoff)[0];

  return (
    <div className="space-y-4">
      <Reveal>
        <div className="flex flex-wrap items-center gap-3 border border-line/80 bg-base/50 p-4">
          <p className="mono-label text-[8.5px] text-faint">GAP ANALYSIS VS</p>
          <div className="flex flex-wrap gap-1.5">
            {GAP_CAREERS.slice(0, 6).map((c) => (
              <button key={c.id} onClick={() => setTarget(c.id)}
                className={`mono-label border px-2.5 py-1.5 text-[8.5px] transition-all duration-200 ${profile.targetCareer === c.id ? "border-amber bg-amber/15 text-amber" : "border-line text-faint hover:border-amber/50 hover:text-dim"}`}>
                {c.name}
              </button>
            ))}
          </div>
          <p className="mono-label ml-auto text-[8.5px] text-faint">more targets in the <Link className="text-cyan" to="/system/twin">twin editor</Link></p>
        </div>
      </Reveal>

      <Reveal delay={70}>
        <div className="overflow-x-auto border border-line/80 bg-base/50">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-line bg-base/60">
                {["SKILL", "CURRENT → TARGET", "GAP", "SHORTFALL", "EFFORT", "PAYOFF/H", "STATUS"].map((h) => (
                  <th key={h} className="mono-label px-4 py-2.5 text-[8px] font-normal text-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gaps.map((g) => {
                const status = g.gap === 0 ? "MET" : g.blockedBy.length > 0 ? "BLOCKED" : "OPEN";
                const tone = status === "MET" ? "green" : status === "BLOCKED" ? "rose" : "amber";
                const isNext = learnNext?.skillId === g.skillId;
                return (
                  <tr key={g.skillId} className={`border-b border-line/50 transition-colors duration-150 last:border-0 hover:bg-cyan/[0.04] ${isNext ? "bg-cyan/[0.05]" : ""}`}>
                    <td className="px-4 py-2.5">
                      <span className="text-[12.5px] text-ink">{g.label}</span>
                      {isNext && <span className="mono-label ml-2 border border-cyan/60 px-1.5 py-0.5 text-[7px] text-cyan">LEARN NEXT</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="relative h-1.5 w-32 bg-line/30">
                          <div className="absolute inset-y-0 left-0 bg-green/80" style={{ width: `${g.current}%` }} />
                          <div className="absolute inset-y-0 bg-rose/70" style={{ left: `${g.current}%`, width: `${Math.min(g.gap, 100 - g.current)}%` }} />
                          <div className="absolute inset-y-0 border-r border-dashed border-ink/70" style={{ left: `${g.target}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-faint">{g.current} → {g.target}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-dim">{g.gap > 0 ? `−${g.gap}` : "0"}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px]" style={{ color: g.shortfall > 10 ? ROSE : g.shortfall > 0 ? AMBER : GREEN }}>{g.shortfall.toFixed(0)} pts</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-dim">{g.effortHours}h</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-cyan">{g.effortHours > 0 ? g.payoff.toFixed(2) : "—"}</td>
                    <td className="px-4 py-2.5">
                      <Tag tone={tone as "green" | "rose" | "amber"}>{status}</Tag>
                      {status === "BLOCKED" && (
                        <p className="mt-1 font-mono text-[8.5px] text-rose/80">needs {g.blockedBy.map(skillLabel).join(", ")} ≥ 60</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal delay={130}>
        <p className="border-l-2 border-amber/60 pl-3.5 text-[12.5px] leading-relaxed text-faint">
          <span className="mono-label mr-2 text-amber">THE ORDERING RULE</span>
          shortfall = gap × career weight; a skill is actionable only when every prerequisite sits ≥ 60 — otherwise it is
          BLOCKED and the engine names the foundation to build first. Payoff-per-effort decides what comes next (§50).
        </p>
      </Reveal>
    </div>
  );
}

/* ================= LEARNING ROADMAP ================= */

const HEAVY = 35;

export function SysRoadmap() {
  const { profile } = useSys();
  const gaps = sysGaps(profile);
  const active = gaps.filter((g) => g.gap > 0);

  const seq: (typeof active[number] & { order: number; unlocks: string[] })[] = [];
  const placed = new Set<string>();
  const pool = [...active];
  while (pool.length && seq.length < 6) {
    const ready = pool.filter((g) => g.blockedBy.every((b) => placed.has(b)));
    if (!ready.length) break;
    ready.sort((a, b) => b.payoff - a.payoff);
    const next = ready[0];
    pool.splice(pool.indexOf(next), 1);
    placed.add(next.skillId);
    const unlocks = active.filter((g) => g !== next && GAP_SKILLS.find((s) => s.id === g.skillId)?.prereq.includes(next.skillId)).map((g) => g.label);
    seq.push({ ...next, order: seq.length + 1, unlocks });
  }

  const timeline: ({ type: "block"; step: (typeof seq)[number] } | { type: "checkpoint" })[] = [];
  let heavyRun = 0;
  for (const step of seq) {
    timeline.push({ type: "block", step });
    heavyRun = step.effortHours > HEAVY ? heavyRun + 1 : 0;
    if (heavyRun >= 2) { timeline.push({ type: "checkpoint" }); heavyRun = 0; }
  }

  let cum = 0;
  const cumAt: Record<number, number> = {};
  for (const s of seq) { cum += s.effortHours; cumAt[s.order] = cum; }
  const weekly = profile.academics.studyHours || 8;
  const totalWeeks = Math.max(1, Math.ceil(cum / weekly));
  const topPayoff = seq.length ? Math.max(...seq.map((s) => s.payoff)) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <div>
        <Reveal>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <p className="mono-label text-[8.5px] text-faint">SEQUENCE FOR {careerName(profile.targetCareer).toUpperCase()} · ≈ {cum}h → {totalWeeks} WEEKS AT {weekly}H/WK</p>
            {seq.length > 0 && <Tag tone="amber">DERIVED FROM YOUR TWIN</Tag>}
          </div>
        </Reveal>
        {seq.length === 0 ? (
          <Reveal>
            <div className="flex h-40 items-center justify-center border border-dashed border-line">
              <p className="text-[13px] text-faint">No open gaps — the engine recommends nothing, which is itself a recommendation.</p>
            </div>
          </Reveal>
        ) : (
          <div className="relative pl-5">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line" aria-hidden="true" />
            <div className="space-y-3">
              {timeline.map((t, i) =>
                t.type === "checkpoint" ? (
                  <Reveal key={`cp-${i}`} delay={i * 50}>
                    <div className="relative flex items-center gap-3 border border-dashed border-green/50 bg-green/5 px-4 py-2.5">
                      <span className="absolute -left-5 h-[9px] w-[9px] rounded-full border-2 border-green bg-base" />
                      <p className="text-[12px] text-dim">
                        <span className="mono-label mr-2 text-[8.5px] text-green">CHECKPOINT</span>
                        Two heavy blocks done — build one small thing with what you just learned. Evidence beats momentum.
                      </p>
                    </div>
                  </Reveal>
                ) : (
                  <Reveal key={t.step.skillId} delay={i * 50}>
                    <div className="group relative border border-line/80 bg-base/50 p-3.5 transition-all duration-200 hover:border-cyan/50 hover:shadow-[0_0_22px_rgba(107,225,255,0.07)] sm:p-4">
                      <span className="absolute -left-5 top-4 h-[9px] w-[9px] rounded-full border-2 border-cyan bg-base transition-colors duration-200 group-hover:bg-cyan" />
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="display-head text-[15px] text-cyan">{String(t.step.order).padStart(2, "0")}</span>
                        <p className="display-head text-[16px] text-ink">{t.step.label}</p>
                        <span className="font-mono text-[10.5px] text-faint">{t.step.current} → <span className="text-cyan">{t.step.target}</span></span>
                        {t.step.payoff === topPayoff && <Tag tone="green">#1 PAYOFF</Tag>}
                        <span className="ml-auto font-mono text-[11px] text-amber">~{t.step.effortHours}h</span>
                      </div>
                      <div className="mt-2.5 h-1.5 w-full bg-line/40">
                        <div className="h-full bg-gradient-to-r from-cyan/70 to-cyan transition-all duration-500" style={{ width: `${Math.min(100, (t.step.effortHours / 120) * 100)}%` }} />
                      </div>
                      <p className="mt-2.5 text-[12.5px] leading-relaxed text-dim">
                        <span className="text-green">WHY:</span> removes a <span className="text-ink">{t.step.shortfall.toFixed(0)}-pt weighted shortfall</span>,
                        ranked #{seq.filter((s) => s.payoff >= t.step.payoff).length} of {seq.length} by payoff-per-effort
                        {t.step.unlocks.length > 0 && <> · unlocks <span className="text-cyan">{t.step.unlocks.join(", ")}</span></>}.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {CATALOG.filter((c) => c.skill === t.step.skillId).map((c) => (
                          <span key={c.name} className="mono-label border border-line/80 px-2 py-1 text-[8px] text-dim transition-colors hover:border-cyan/50 hover:text-cyan">
                            {c.name} · ~{c.hours}h · FREE
                          </span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )
              )}
              {pool.length > 0 && (
                <Reveal delay={timeline.length * 50}>
                  <div className="relative border border-line/60 bg-base/30 px-4 py-3">
                    <span className="absolute -left-5 top-4 h-[9px] w-[9px] rounded-full border-2 border-line bg-base" />
                    <p className="mono-label text-[8.5px] text-faint">THEN, IN PAYOFF ORDER — {pool.map((r) => r.label).join(" · ")}</p>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        )}
      </div>

      <Reveal delay={120}>
        <div className="space-y-4">
          <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
            <p className="mono-label text-[8.5px] text-faint">THE WHY-NOT PANEL</p>
            <ul className="mt-3 space-y-2.5">
              {[
                ["A paid bootcamp", "the free paths cover the same ground — money changes the incentive structure of advice"],
                ["A certification, right now", "certificates certify skill you already have; fill the gap first (rule R-2)"],
                ["Advanced transformers course", "blocked by the prerequisite DAG — the engine refuses to set you up to drown"],
              ].map(([r, why]) => (
                <li key={r} className="border-l-2 border-rose/50 pl-3">
                  <p className="text-[12.5px] text-ink">{r} — <span className="mono-label text-[8px] text-rose">DECLINED</span></p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-faint">{why}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
            <p className="mono-label text-[8.5px] text-faint">SEQUENCING RULES</p>
            <ul className="mt-2.5 space-y-1.5 font-mono text-[10.5px] leading-relaxed text-faint">
              <li><span className="text-cyan">R-1</span> prerequisites gate the order (DAG, §52)</li>
              <li><span className="text-cyan">R-2</span> gaps before certificates</li>
              <li><span className="text-cyan">R-3</span> payoff-per-effort decides ties</li>
              <li><span className="text-green">R-4</span> two heavy blocks → build checkpoint</li>
              <li><span className="text-amber">catalog</span> free / free-to-audit only, zero affiliates</li>
            </ul>
            <Link to="/system/simulate" className="mono-label mt-4 inline-block border border-amber/60 px-3 py-2 text-[9px] text-amber transition-all duration-200 hover:bg-amber/15">
              TEST THIS PLAN IN THE SIMULATOR →
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
