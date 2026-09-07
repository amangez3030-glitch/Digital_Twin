import { useMemo, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";
import { GAP_SKILLS, GAP_CAREERS } from "./Phase9";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

const skillLabel = (id: string) => GAP_SKILLS.find((s) => s.id === id)?.label ?? id;

/* ============================================================
   The Future Simulator. The engines of §45/§50 are linear in
   skill coverage, so a scenario's delta is not a mystery — it
   decomposes exactly into per-skill contributions. This lab
   runs that arithmetic live, and the clause refuses to let
   anyone call it a prediction.
   ============================================================ */

/* The twin's current state — scenarios perturb it, never replace it. */
const BASE: Record<string, number> = {
  python: 70, statistics: 45, math: 55, sql: 40, web_dev: 60, ml: 55,
  data_analysis: 50, cloud: 30, deep_learning: 25, mlops: 20, nlp: 15, cv: 15,
};

const CAREER_TAGS: Record<string, string[]> = {
  mle: ["ai", "data"], aie: ["ai"], ds: ["ai", "data"], da: ["data"],
  swe: ["se", "web"], be: ["se"], fe: ["web"], csa: ["sec"],
  ce: ["se"], rs: ["research", "ai"], cve: ["ai"], nle: ["ai"],
};

/* Fixed context held constant across every scenario (the twin's current values). */
const ACAD_READINESS = 78.5; // 0.5·78 GPA + 0.3·85 attendance + 0.2·70 assignments
const INTERESTS = ["ai", "data"];

function coverage(skills: Record<string, number>, careerId: string) {
  const c = GAP_CAREERS.find((x) => x.id === careerId)!;
  let num = 0;
  let den = 0;
  for (const [sid, w] of Object.entries(c.req)) {
    num += Math.min(skills[sid] ?? 0, w * 100);
    den += w * 100;
  }
  return (num / den) * 100;
}

function interestFit(careerId: string) {
  const tags = CAREER_TAGS[careerId] ?? [];
  const hits = tags.filter((t) => INTERESTS.includes(t)).length;
  return tags.length ? (hits / tags.length) * 100 : 0;
}

/* §45, model term absent → renormalized over 0.75 */
function readiness(skills: Record<string, number>, careerId: string) {
  return (0.5 * coverage(skills, careerId) + 0.15 * ACAD_READINESS + 0.1 * interestFit(careerId)) / 0.75;
}

/* Exact per-skill attribution: Δreadiness = (0.5/0.75) · Δcoverage */
function attribute(before: Record<string, number>, after: Record<string, number>, careerId: string) {
  const c = GAP_CAREERS.find((x) => x.id === careerId)!;
  const den = Object.values(c.req).reduce((a, w) => a + w * 100, 0);
  const rows = GAP_SKILLS.map((s) => {
    const w = c.req[s.id] ?? 0;
    const dMin = Math.min(after[s.id], w * 100) - Math.min(before[s.id], w * 100);
    const contrib = w > 0 ? (dMin / den) * 100 * (0.5 / 0.75) : 0;
    return { skill: s, dLevel: after[s.id] - before[s.id], w, contrib, relevant: w > 0 };
  }).filter((r) => r.relevant);
  return rows.sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib));
}

/* ---------- §74 · The contract ---------- */

export function SimContractSection() {
  return (
    <Section
      id="s74"
      index="74"
      kicker="Phase 15 · The contract"
      title="Why This What-If Is Allowed to Exist"
      intro="Most 'career simulators' wave a hand and produce a number. This one is permitted because of a property the approved engines already have: the §45 score is linear in skill coverage, so a scenario's effect is not estimated — it is accounted for, point by point."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">S-1 · The only thing you may change</p>
            <p className="mt-3 text-[13px] leading-relaxed text-dim">
              A scenario perturbs <span className="text-ink">skills only</span>. Academics, portfolio,
              interests and the model term are held at the twin's current values and printed as
              constants. You are asking "what if I learned X" — not "what if I were someone else".
            </p>
            <p className="mt-4 border-l-2 border-cyan/60 pl-3 font-mono text-[11px] leading-relaxed text-faint">
              Δreadiness = (0.5 / 0.75) · Δcoverage<br />
              Δcoverage = Σ [min(after, w·100) − min(before, w·100)] / Σ(w·100)
            </p>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-amber">S-2 · Exact attribution, or nothing</p>
            <p className="mt-3 text-[13px] leading-relaxed text-dim">
              Every point of movement decomposes into <span className="text-ink">per-skill
              contributions</span> — Δlevel × weight, scaled by the engine's constants. If a delta
              cannot be traced to a slider you moved, the math is wrong and the scenario is rejected.
              There is no residual, because there is no black box.
            </p>
            <p className="mt-4 font-mono text-[11px] text-faint">
              contrib(s) = [min(after, w·100) − min(before, w·100)] / Σ(w·100) · (0.5/0.75)
            </p>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-rose">S-3 · Scenarios never touch the twin</p>
            <p className="mt-3 text-[13px] leading-relaxed text-dim">
              A scenario is a <span className="text-ink">read-only replay</span> — it reads the twin's
              current state, perturbs a copy, and discards it. Nothing is written back (§72's corridor
              has no "what-if" door). The journal in §75 records scenarios for reflection, never as
              profile data.
            </p>
            <p className="mt-4 font-mono text-[11px] text-faint">
              twin.write(scenario) → <span className="text-rose">COMPILE ERROR, BY DESIGN</span>
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §75 · The live lab ---------- */

interface ScenarioEntry {
  id: number;
  ts: string;
  changed: number;
  hours: number;
  top: string;
  topDelta: number;
}

const PRESETS: { name: string; desc: string; after: Record<string, number> }[] = [
  { name: "SQL + DL push", desc: "sql→80 · deep_learning→70", after: { sql: 80, deep_learning: 70 } },
  { name: "Balanced semester", desc: "core skills to ~75–85", after: { python: 85, ml: 80, statistics: 70, sql: 75, math: 70 } },
  { name: "One skill only", desc: "mlops→60", after: { mlops: 60 } },
];

export function SimLabSection() {
  const [after, setAfter] = useState<Record<string, number>>({ ...BASE });
  const [focus, setFocus] = useState("mle");
  const [sortBy, setSortBy] = useState<"after" | "delta">("after");
  const [journal, setJournal] = useState<ScenarioEntry[]>([]);
  const [stamped, setStamped] = useState(false);

  const changedSkills = GAP_SKILLS.filter((s) => after[s.id] !== BASE[s.id]);
  const effortHours = useMemo(
    () =>
      changedSkills.reduce((sum, s) => {
        const d = after[s.id] - BASE[s.id];
        return d > 0 ? sum + (d / 10) * s.effortPer10 : sum;
      }, 0),
    [after, changedSkills]
  );

  const board = useMemo(() => {
    const rows = GAP_CAREERS.map((c) => {
      const before = readiness(BASE, c.id);
      const afterR = readiness(after, c.id);
      return { c, before, after: afterR, delta: afterR - before };
    });
    rows.sort((a, b) => (sortBy === "after" ? b.after - a.after : b.delta - a.delta));
    return rows;
  }, [after, sortBy]);

  const attr = useMemo(() => attribute(BASE, after, focus), [after, focus]);
  const attrSum = attr.reduce((s, r) => s + r.contrib, 0);
  const focusRow = board.find((b) => b.c.id === focus)!;

  const applyPreset = (p: (typeof PRESETS)[number]) => setAfter({ ...BASE, ...p.after });

  const commit = () => {
    if (changedSkills.length === 0) return;
    const top = [...board].sort((a, b) => b.delta - a.delta)[0];
    setJournal((prev) => [
      {
        id: prev.length + 1,
        ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        changed: changedSkills.length,
        hours: Math.round(effortHours),
        top: top.c.name,
        topDelta: top.delta,
      },
      ...prev,
    ].slice(0, 4));
    setStamped(true);
    window.setTimeout(() => setStamped(false), 1500);
  };

  const fmt = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}`;

  return (
    <Section
      id="s75"
      index="75"
      kicker="Phase 15 · The simulator, running"
      title="Move a Skill. Watch Twelve Futures Recompute."
      intro="The twin's current state is the baseline; every slider perturbs a copy. All twelve careers re-score live through the §45 engine, the deltas are exact, and the attribution table below the board shows precisely who moved the needle — because the math says it must."
    >
      <div className="panel relative overflow-hidden p-5 sm:p-7">
        <Corners color={AMBER} />

        {/* masthead */}
        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-line pb-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`absolute inline-flex h-full w-full rounded-full ${changedSkills.length ? "bg-amber" : "bg-green"} opacity-60`} style={{ animation: "blinkc 1.6s ease-in-out infinite" }} />
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${changedSkills.length ? "bg-amber" : "bg-green"}`} />
          </span>
          <p className="display-head text-lg text-ink sm:text-xl">SIM / SCENARIO-{String(journal.length + 1).padStart(2, "0")}</p>
          <Tag tone={changedSkills.length ? "amber" : "green"}>
            {changedSkills.length ? `${changedSkills.length} SKILL${changedSkills.length > 1 ? "S" : ""} PERTURBED` : "BASELINE — TWIN UNCHANGED"}
          </Tag>
          <span className="mono-label ml-auto border border-rose/50 px-2 py-1 text-[9px] text-rose">
            SCENARIO SIMULATION — NOT A PREDICTION
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.25fr]">
          {/* controls */}
          <div className="space-y-4">
            <div className="border border-line/80 bg-base/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="mono-label text-[8.5px] text-faint">perturb the copy · before → after</p>
                <button onClick={() => setAfter({ ...BASE })}
                  className="mono-label border border-line px-2 py-0.5 text-[8.5px] text-faint transition-colors hover:border-rose hover:text-rose">
                  RESET TO TWIN
                </button>
              </div>
              <div className="space-y-1.5">
                {GAP_SKILLS.map((s) => {
                  const b = BASE[s.id];
                  const a = after[s.id];
                  const d = a - b;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="mono-label w-[84px] shrink-0 text-[8px] text-dim">{s.label}</span>
                      <span className="w-6 text-right font-mono text-[10px] text-faint">{b}</span>
                      <span className="font-mono text-[8px] text-faint">→</span>
                      <input type="range" min={0} max={100} value={a}
                        onChange={(e) => setAfter((p) => ({ ...p, [s.id]: Number(e.target.value) }))}
                        className="twin-range h-1 flex-1 cursor-ew-resize" aria-label={`${s.label} scenario level`} />
                      <span className={`w-6 text-right font-mono text-[10px] ${d !== 0 ? "text-amber" : "text-dim"}`}>{a}</span>
                      <span className={`w-10 text-right font-mono text-[9.5px] ${d > 0 ? "text-green" : d < 0 ? "text-rose" : "text-faint"}`}>
                        {d !== 0 ? fmt(d) : "·"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-line/80 bg-base/50 p-4">
              <p className="mono-label mb-2 text-[8.5px] text-faint">presets</p>
              <div className="grid gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p.name} onClick={() => applyPreset(p)}
                    className="group flex items-center justify-between border border-line px-3 py-2 text-left transition-all duration-200 hover:border-amber/60 hover:bg-amber/5">
                    <span className="display-head text-[13px] text-ink">{p.name}</span>
                    <span className="font-mono text-[9.5px] text-faint group-hover:text-amber">{p.desc}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <p className="font-mono text-[10.5px] text-faint">
                  effort ≈ <span className="text-amber">{Math.round(effortHours)}h</span> of learning (§50 calibration)
                </p>
                <button onClick={commit} disabled={changedSkills.length === 0}
                  className={`mono-label border px-3 py-2 text-[9px] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
                    stamped ? "border-green bg-green/15 text-green" : "border-amber bg-amber/10 text-amber hover:bg-amber/20 hover:shadow-[0_0_18px_rgba(255,194,102,0.15)]"
                  }`}>
                  {stamped ? "✓ JOURNALED" : "JOURNAL SCENARIO"}
                </button>
              </div>
            </div>

            {journal.length > 0 && (
              <div className="border border-line/80 bg-base/50 p-4">
                <p className="mono-label mb-2 text-[8.5px] text-faint">scenario journal · reflection log, never profile data</p>
                <div className="space-y-1.5">
                  {journal.map((j) => (
                    <div key={j.id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b border-line/40 pb-1.5 text-[11px] last:border-0">
                      <span className="font-mono text-[9.5px] text-amber">#{String(j.id).padStart(2, "0")}</span>
                      <span className="text-faint">{j.ts}</span>
                      <span className="text-dim">{j.changed} skills · ≈{j.hours}h</span>
                      <span className="ml-auto font-mono text-[9.5px]" style={{ color: j.topDelta >= 0 ? GREEN : ROSE }}>
                        {j.top} {fmt(j.topDelta)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* board + attribution */}
          <div className="space-y-4">
            <div className="border border-line/80 bg-base/50 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="mono-label text-[8.5px] text-faint">before / after — all twelve careers</p>
                <div className="flex gap-1.5">
                  {(["after", "delta"] as const).map((s) => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`mono-label border px-2 py-0.5 text-[8.5px] transition-all duration-200 ${sortBy === s ? "border-amber bg-amber/15 text-amber" : "border-line text-faint hover:border-amber/50 hover:text-dim"}`}>
                      RANK BY {s === "after" ? "AFTER" : "GAIN"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                {board.map((row) => {
                  const isFocus = row.c.id === focus;
                  const d = row.delta;
                  return (
                    <button key={row.c.id} onClick={() => setFocus(row.c.id)}
                      className={`group block w-full border px-3 py-2 text-left transition-all duration-200 ${
                        isFocus ? "border-amber/70 bg-amber/5" : "border-line/70 hover:border-amber/40"
                      }`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`display-head text-[13px] ${isFocus ? "text-amber" : "text-ink"}`}>{row.c.name}</p>
                        <p className="font-mono text-[11px]">
                          <span className="text-faint">{row.before.toFixed(1)}</span>
                          <span className="mx-1.5 text-faint">→</span>
                          <span className={isFocus ? "text-amber" : "text-cyan"}>{row.after.toFixed(1)}</span>
                          <span className={`ml-2 ${d > 0.05 ? "text-green" : d < -0.05 ? "text-rose" : "text-faint"}`}>
                            {d > 0.05 ? `↑ ${fmt(d)}` : d < -0.05 ? `↓ ${fmt(d)}` : "—"}
                          </span>
                        </p>
                      </div>
                      <div className="relative mt-1.5 h-1.5 w-full bg-line/30">
                        <div className="absolute inset-y-0 left-0 bg-[#3d5a80] transition-all duration-500" style={{ width: `${Math.min(100, row.before)}%` }} />
                        <div className={`absolute inset-y-0 left-0 transition-all duration-500 ${isFocus ? "bg-amber" : "bg-cyan"}`}
                          style={{ width: `${Math.min(100, row.after)}%`, boxShadow: `0 0 8px ${isFocus ? "rgba(255,194,102,0.4)" : "rgba(107,225,255,0.35)"}` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 font-mono text-[8.5px] text-faint">
                grey = before · <span className="text-cyan">cyan = after</span> · click a row to attribute its delta
              </p>
            </div>

            {/* attribution */}
            <div className="border border-line/80 bg-base/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="mono-label text-[8.5px] text-faint">exact attribution — {GAP_CAREERS.find((c) => c.id === focus)?.name}</p>
                <p className="font-mono text-[11px]" style={{ color: attrSum >= 0 ? GREEN : ROSE }}>
                  Σ = {fmt(attrSum)} pts
                </p>
              </div>
              {changedSkills.length === 0 ? (
                <p className="py-3 text-center font-mono text-[10px] text-faint">
                  BASELINE SCENARIO — MOVE A SLIDER TO SEE WHO MOVES THE NEEDLE
                </p>
              ) : (
                <div className="space-y-1.5">
                  {attr.filter((r) => Math.abs(r.dLevel) > 0.5 || Math.abs(r.contrib) > 0.05).map((r) => (
                    <div key={r.skill.id} className="flex items-center gap-2">
                      <span className="mono-label w-[84px] shrink-0 text-[8px] text-dim">{r.skill.label}</span>
                      <span className="w-14 font-mono text-[9.5px] text-faint">w={r.w.toFixed(2)}</span>
                      <span className={`w-12 font-mono text-[9.5px] ${r.dLevel > 0 ? "text-green" : "text-rose"}`}>Δ{fmt(r.dLevel)}</span>
                      <div className="relative h-3 flex-1 bg-line/30">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
                        <div
                          className="absolute inset-y-0 transition-all duration-500"
                          style={{
                            background: r.contrib >= 0 ? GREEN : ROSE,
                            left: r.contrib >= 0 ? "50%" : `${50 - Math.min(50, Math.abs(r.contrib) * 6)}%`,
                            width: `${Math.min(50, Math.abs(r.contrib) * 6)}%`,
                            opacity: 0.85,
                          }}
                        />
                      </div>
                      <span className={`w-14 text-right font-mono text-[10px] ${r.contrib >= 0 ? "text-green" : "text-rose"}`}>{fmt(r.contrib)}</span>
                    </div>
                  ))}
                  <p className="pt-1 font-mono text-[9px] text-faint">
                    unchanged skills contribute exactly 0.0 — the sum of the bars equals the board's Δ ({fmt(focusRow.delta)}). No residual.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §76 · The clause ---------- */

const CAN_SAY = [
  "'Raising SQL to 80 and Deep Learning to 70 moves ML Engineer from 68.4 to 84.9 — here is each skill's share of that.'",
  "'That scenario costs roughly 110 calibrated hours; the balanced one costs 230 and buys less on this target.'",
  "'Data Scientist overtakes ML Engineer under this scenario — the ranking is sensitive to SQL, which you are treating as a chore.'",
];

const CANNOT_SAY = [
  "'You will become an ML Engineer if you do this.' — the simulator models the twin's arithmetic, not a hiring market.",
  "'Your future salary / employability will be X.' — no outcome beyond the compatibility gauge is in scope, ever.",
  "'This is a prediction.' — it is a replay of an approved formula under a hypothetical. The label is non-negotiable.",
];

export function ClauseSection() {
  return (
    <Section
      id="s76"
      index="76"
      kicker="Phase 15 · The clause"
      title="A Simulation Is Not a Fortune"
      intro="This is the sentence the whole feature stands on, and it ships inside the simulator's UI on every render — not in a footnote, not once. The lab may show movement; it may never show destiny."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-green">The lab may say…</p>
            <ul className="mt-4 space-y-3">
              {CAN_SAY.map((t, i) => (
                <li key={i} className="border-l-2 border-green/60 pl-3.5 text-[13px] leading-relaxed text-dim">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-rose">…and may never say…</p>
            <ul className="mt-4 space-y-3">
              {CANNOT_SAY.map((t, i) => (
                <li key={i} className="border-l-2 border-rose/60 pl-3.5 text-[13px] leading-relaxed text-dim">
                  {t}
                </li>
              ))}
            </ul>
            <div className="relative mt-5 inline-block">
              <div className="stamp border-[3px] border-rose px-6 py-3" style={{ color: ROSE }}>
                <p className="mono-label text-[12px] tracking-[0.3em]">SCENARIO SIMULATION</p>
                <p className="mt-1 text-center font-mono text-[9px] text-rose/70">NOT A PREDICTION OF YOUR FUTURE</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- §77 · Gate G-15 ---------- */

const G15_CHECK = [
  "Contract signed: scenarios perturb skills only; all other inputs held at the twin's current values and printed as constants",
  "Exact attribution: every delta decomposes into per-skill contributions; the bar sum equals the board delta, no residual",
  "Read-only replay: the simulator never writes to the twin — §72's corridor has no what-if door",
  "Scenario journal records reflections (skills changed, calibrated hours, biggest mover) — never profile data",
  "The not-a-prediction label renders on every simulator view, asserted by test, in the UI's own voice",
];

export function GateG15Section({ g15, onApprove }: { g15: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s77"
      index="77"
      kicker="Gate G-15"
      title="Approval Gate — Phase 15"
      intro="Phase 15 stops here by design. The simulator's contract, lab and clause are complete; the Application stage then turns to the system's voice."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 15 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G15_CHECK.map((d, i) => (
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
            <Corners color={g15 ? GREEN : AMBER} />
            <p className={`mono-label ${g15 ? "text-green" : "text-amber"}`}>
              {g15 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g15
                ? "Phase 15 approved. Phase 16 — the Streamlit Application — unlocked."
                : "Approve the Future Simulator to unlock Phase 16 — the Application."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g15
                ? "Next: the delivery layer — the multi-page Streamlit app that composes every approved engine into the twelve dashboards, with session state, caching and the ethics footer on every page."
                : "On approval, Phase 16 specifies the Streamlit application: page map, state model, caching strategy, and how each page binds to an engine already approved in this document."}
            </p>

            {!g15 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 15 — proceed to the application</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-15 · DT-CIS-SD-001 · REV O</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any scenario that writes to the twin, any delta with a residual it cannot attribute, and
                any view that shows movement without the label. Hope is welcome here; prophecy is not.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
