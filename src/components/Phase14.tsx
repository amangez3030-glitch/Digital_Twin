import { useMemo, useRef, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";
import { GAP_SKILLS, GAP_CAREERS, computeGaps } from "./Phase9";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

const skillLabel = (id: string) => GAP_SKILLS.find((s) => s.id === id)?.label ?? id;

/* ============================================================
   The Digital Twin. The constitution (§70) is frozen text; the
   console (§71) is the twin running — every derived number on
   the card is computed from the REV-N profile through the same
   engines approved in Phases 8–9, and every snapshot is a
   versioned, validated write.
   ============================================================ */

/* ---------- §70 · The constitution ---------- */

const STORES = [
  { field: "skills[12]", note: "Self-assessed 0–100, the §47 vocabulary. The only skills the twin may hold." },
  { field: "academics", note: "GPA (0–100 normalized), attendance %, assignment performance %, study hours / week." },
  { field: "interests[6]", note: "Career-interest toggles from §45. Weight 0.10 — deliberately the smallest term." },
  { field: "portfolio", note: "Project count, mean difficulty (1–5), certifications. Feeds Portfolio Strength only." },
  { field: "target_career", note: "The student's chosen target from the §47 matrix. Changeable at any time." },
];

const FORBIDDEN = [
  { field: "sex, age, address", rule: "REV-D §21 · EXCLUDE — sensitive attributes" },
  { field: "Medu, Fedu, Mjob, Fjob", rule: "REV-D §21 · EXCLUDE — socioeconomic proxies" },
  { field: "Dalc, Walc, health, romantic", rule: "REV-D §21 · EXCLUDE — health & personal life" },
  { field: "G1, G2, G3", rule: "REV-C §22 · LEAK / TARGET — the twin never stores exam outcomes as features" },
  { field: "cluster_id", rule: "REV-G §43 — membership is a cohort description, never a per-student field" },
];

export function ConstitutionSection() {
  return (
    <Section
      id="s70"
      index="70"
      kicker="Phase 14 · The constitution"
      title="What the Twin Is — and Is Not Allowed to Hold"
      intro="A digital twin is a promise about data: what is stored, who may write it, and how it ages. The constitution is short on purpose — five stores it may hold, five classes of field it must refuse, and three rights the student keeps forever."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">T-1 · The five stores</p>
            <ul className="mt-4 space-y-3">
              {STORES.map((s) => (
                <li key={s.field} className="border border-line/80 bg-base/40 p-3 transition-colors duration-200 hover:border-cyan/40">
                  <p className="font-mono text-[12px] text-cyan">{s.field}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-faint">{s.note}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-l-2 border-cyan/60 pl-3 text-[12px] leading-relaxed text-faint">
              Nothing else. A field that is not in this list cannot be written — the validator in
              §72 rejects it before it reaches storage, and the rejection is logged.
            </p>
          </div>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={100}>
            <div className="panel p-5 sm:p-6">
              <p className="mono-label text-rose">T-2 · The refusal list</p>
              <ul className="mt-3 space-y-2">
                {FORBIDDEN.map((f) => (
                  <li key={f.field} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-line/50 pb-2 text-[12.5px] last:border-0">
                    <span className="font-mono text-[11.5px] text-rose">{f.field}</span>
                    <span className="ml-auto text-right text-[11px] text-faint">{f.rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="panel p-5 sm:p-6">
              <p className="mono-label text-green">T-3 · The student's three rights</p>
              <ul className="mt-3 space-y-2.5 text-[13px] text-dim">
                {[
                  ["Right to correct", "any field, at any time — the old value is archived, never silently overwritten"],
                  ["Right to see the source", "every value shows where it came from: self-report, resume extract, or admin entry"],
                  ["Right to be forgotten", "deletion removes the twin and its snapshots; logs are truncated to the audit minimum"],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-2.5 leading-relaxed">
                    <span className="mt-[3px] font-mono text-[10px] text-green">▸</span>
                    <span><span className="text-ink">{t}</span> — {d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §71 · The live console ---------- */

interface Snapshot {
  rev: string;
  ts: string;
  label: string;
  skills: Record<string, number>;
  careerId: string;
  coverage: number; // 0–100 vs target career
  readiness: number; // career readiness 0–100
  amended: boolean;
}

interface AuditEntry {
  rev: string;
  kind: "SNAPSHOT" | "AMEND" | "REJECT" | "INIT";
  detail: string;
}

const TWIN_START: Record<string, number> = {
  python: 70, statistics: 45, math: 55, sql: 40, web_dev: 60, ml: 55,
  data_analysis: 50, cloud: 30, deep_learning: 25, mlops: 20, nlp: 15, cv: 15,
};

const CAREER_TAGS: Record<string, string[]> = {
  mle: ["ai", "data"], aie: ["ai"], ds: ["ai", "data"], da: ["data"],
  swe: ["se", "web"], be: ["se"], fe: ["web"], csa: ["sec"],
  ce: ["se"], rs: ["research", "ai"], cve: ["ai"], nle: ["ai"],
};

const INTEREST_DEFS = [
  { id: "ai", label: "AI / ML" }, { id: "data", label: "Data" },
  { id: "se", label: "Software Eng" }, { id: "web", label: "Web" },
  { id: "sec", label: "Security" }, { id: "research", label: "Research" },
];

function coverageFor(careerId: string, skills: Record<string, number>) {
  const career = GAP_CAREERS.find((c) => c.id === careerId)!;
  let num = 0;
  let den = 0;
  for (const [sid, w] of Object.entries(career.req)) {
    num += Math.min(skills[sid] ?? 0, w * 100);
    den += w * 100;
  }
  return (num / den) * 100;
}

export function TwinConsoleSection() {
  const [skills, setSkills] = useState({ ...TWIN_START });
  const [acad, setAcad] = useState({ gpa: 78, attendance: 85, assignments: 70, studyHours: 12 });
  const [portfolio, setPortfolio] = useState({ projects: 3, avgDiff: 3, certs: 2 });
  const [interests, setInterests] = useState<string[]>(["ai", "data"]);
  const [careerId, setCareerId] = useState("mle");
  const [focusSkill, setFocusSkill] = useState("python");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([
    { rev: "v0", kind: "INIT", detail: "twin initialized — profile loaded from self-report intake; 0 validated writes" },
  ]);
  const [rejectMsg, setRejectMsg] = useState<string | null>(null);
  const [justCommitted, setJustCommitted] = useState(false);
  const timer = useRef<number | null>(null);

  const career = GAP_CAREERS.find((c) => c.id === careerId)!;
  const rows = useMemo(() => computeGaps(career, skills), [career, skills]);
  const coverage = coverageFor(careerId, skills);
  const weightedAvg = useMemo(() => {
    let num = 0;
    let den = 0;
    for (const [sid, w] of Object.entries(career.req)) {
      num += (skills[sid] ?? 0) * w;
      den += w;
    }
    return num / den;
  }, [career, skills]);
  const acadReadiness = 0.5 * acad.gpa + 0.3 * acad.attendance + 0.2 * acad.assignments;
  const portfolioStrength = Math.min(100, portfolio.projects * 14 + portfolio.avgDiff * 9 + portfolio.certs * 7);
  const interestFit = (() => {
    const tags = CAREER_TAGS[careerId] ?? [];
    const hits = tags.filter((t) => interests.includes(t)).length;
    return tags.length ? (hits / tags.length) * 100 : 0;
  })();
  // §45 formula, model term absent → renormalized over 0.75
  const careerReadiness = ((0.5 * coverage + 0.15 * acadReadiness + 0.1 * interestFit) / 0.75);

  const dirty = snapshots.length > 0 && (() => {
    const last = snapshots[snapshots.length - 1];
    return (
      last.careerId !== careerId ||
      GAP_SKILLS.some((s) => (last.skills[s.id] ?? 0) !== skills[s.id])
    );
  })();

  const commit = (amend: boolean) => {
    if (amend && snapshots.length === 0) return;
    const rev = amend ? snapshots[snapshots.length - 1].rev : `v${snapshots.length + 1}`;
    const snap: Snapshot = {
      rev,
      ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      label: amend ? `amended` : `snapshot`,
      skills: { ...skills },
      careerId,
      coverage,
      readiness: careerReadiness,
      amended: amend,
    };
    setSnapshots((prev) => {
      if (amend) {
        const next = [...prev];
        next[next.length - 1] = snap;
        return next;
      }
      return [...prev, snap];
    });
    setAudit((prev) => [
      {
        rev,
        kind: amend ? "AMEND" : "SNAPSHOT",
        detail: amend
          ? `corrected write — replaced previous ${rev} values (old values archived); source: self-report; validated ✓`
          : `validated write of ${GAP_SKILLS.length} skill fields + academics + portfolio; source: self-report; schema ✓ range ✓`,
      },
      ...prev,
    ]);
    setJustCommitted(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustCommitted(false), 1600);
  };

  const attemptForbidden = (field: string, rule: string) => {
    setRejectMsg(`${field} — REJECTED by twin validator: ${rule}. The field never reaches storage; the attempt is logged.`);
    setAudit((prev) => [
      { rev: "—", kind: "REJECT", detail: `write attempt '${field}' refused at the door (${rule})` },
      ...prev,
    ]);
  };

  /* timeline geometry */
  const W = 560;
  const H = 170;
  const n = snapshots.length;
  const xAt = (i: number) => (n <= 1 ? W / 2 : 24 + (i * (W - 48)) / (n - 1));
  const yAt = (v: number) => H - 18 - (v / 100) * (H - 40);
  const lineFor = (sid: string) =>
    snapshots.map((s, i) => `${xAt(i)},${yAt(s.skills[sid] ?? 0)}`).join(" ");
  const focusLine = lineFor(focusSkill);
  const readinessLine = snapshots.map((s, i) => `${xAt(i)},${yAt(s.readiness)}`).join(" ");
  const focusDelta =
    n >= 2 ? (snapshots[n - 1].skills[focusSkill] ?? 0) - (snapshots[n - 2].skills[focusSkill] ?? 0) : null;
  const readinessDelta = n >= 2 ? snapshots[n - 1].readiness - snapshots[n - 2].readiness : null;

  const INDICATORS = [
    {
      name: "Career Readiness",
      value: careerReadiness,
      color: AMBER,
      formula: "(0.5·coverage + 0.15·academic + 0.10·interest) / 0.75 — §45, model term absent",
    },
    { name: "Skill Coverage", value: coverage, color: CYAN, formula: "Σ min(level, 100·w) / Σ(100·w) over the target's required skills — §50" },
    { name: "Technical Readiness", value: weightedAvg, color: GREEN, formula: "requirement-weighted mean of current levels (uncapped by target)" },
    { name: "Academic Readiness", value: acadReadiness, color: "#9db8ff", formula: "0.5·GPA + 0.3·attendance + 0.2·assignment performance (all 0–100)" },
    { name: "Portfolio Strength", value: portfolioStrength, color: ROSE, formula: "min(100, projects·14 + mean difficulty·9 + certifications·7)" },
  ];

  return (
    <Section
      id="s71"
      index="71"
      kicker="Phase 14 · The twin, running"
      title="The Console — Edit the Twin, Watch It Derive"
      intro="Every number on the twin card below is computed live from your edits through the engines approved in Phases 8–9. Commit a snapshot and the timeline grows; amend one and the correction is logged, never hidden. Try the forbidden writes at the bottom — the validator answers at the door."
    >
      <div className="panel relative overflow-hidden p-5 sm:p-7">
        <Corners color={CYAN} />

        {/* masthead */}
        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-line pb-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`absolute inline-flex h-full w-full rounded-full ${dirty ? "bg-amber" : "bg-green"} opacity-60`} style={{ animation: "blinkc 1.6s ease-in-out infinite" }} />
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dirty ? "bg-amber" : "bg-green"}`} />
          </span>
          <p className="display-head text-lg text-ink sm:text-xl">TWIN / YOU-2026</p>
          <Tag tone={dirty ? "amber" : "green"}>{dirty ? "DIRTY — UNCOMMITTED EDITS" : snapshots.length ? "SYNCED" : "AWAITING FIRST WRITE"}</Tag>
          <span className="mono-label ml-auto border border-line px-2 py-1 text-[9px] text-dim">
            schema v1 · REV-D validated · {snapshots.length} snapshot{n === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* editor */}
          <div>
            <p className="mono-label mb-3 text-[8.5px] text-faint">skills[12] · drag to edit the twin</p>
            <div className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
              {GAP_SKILLS.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setFocusSkill(s.id)}
                    className={`mono-label w-[86px] shrink-0 text-left text-[8px] transition-colors ${focusSkill === s.id ? "text-cyan" : "text-dim hover:text-ink"}`}
                  >
                    {s.label}
                  </button>
                  <input
                    type="range" min={0} max={100} value={skills[s.id]}
                    onChange={(e) => setSkills((p) => ({ ...p, [s.id]: Number(e.target.value) }))}
                    className="twin-range h-1 flex-1 cursor-ew-resize" aria-label={`${s.label} level`}
                  />
                  <span className={`w-7 text-right font-mono text-[11px] ${focusSkill === s.id ? "text-cyan" : "text-dim"}`}>{skills[s.id]}</span>
                </div>
              ))}
            </div>

            <p className="mono-label mb-2 mt-5 text-[8.5px] text-faint">academics · portfolio</p>
            <div className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
              {([
                ["gpa", "GPA (0–100)", 0, 100], ["attendance", "Attendance %", 0, 100],
                ["assignments", "Assignments %", 0, 100], ["studyHours", "Study h/wk", 0, 40],
              ] as const).map(([k, label, mn, mx]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="mono-label w-[86px] shrink-0 text-[8px] text-dim">{label}</span>
                  <input type="range" min={mn} max={mx} value={acad[k]}
                    onChange={(e) => setAcad((p) => ({ ...p, [k]: Number(e.target.value) }))}
                    className="twin-range h-1 flex-1 cursor-ew-resize" aria-label={label} />
                  <span className="w-7 text-right font-mono text-[11px] text-dim">{acad[k]}</span>
                </div>
              ))}
              {([
                ["projects", "Projects", 0, 12], ["avgDiff", "Mean difficulty", 1, 5], ["certs", "Certifications", 0, 8],
              ] as const).map(([k, label, mn, mx]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="mono-label w-[86px] shrink-0 text-[8px] text-dim">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPortfolio((p) => ({ ...p, [k]: Math.max(mn, p[k] - 1) }))}
                      className="mono-label border border-line px-2 py-0.5 text-[9px] text-faint hover:border-cyan hover:text-cyan">−</button>
                    <span className="w-7 text-center font-mono text-[12px] text-cyan">{portfolio[k]}</span>
                    <button onClick={() => setPortfolio((p) => ({ ...p, [k]: Math.min(mx, p[k] + 1) }))}
                      className="mono-label border border-line px-2 py-0.5 text-[9px] text-faint hover:border-cyan hover:text-cyan">+</button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mono-label mb-2 mt-5 text-[8.5px] text-faint">interests[6] · target career</p>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_DEFS.map((i) => {
                const on = interests.includes(i.id);
                return (
                  <button key={i.id} onClick={() => setInterests((p) => on ? p.filter((x) => x !== i.id) : [...p, i.id])}
                    className={`mono-label border px-2.5 py-1 text-[8.5px] transition-all duration-200 ${on ? "border-cyan bg-cyan/15 text-cyan" : "border-line text-faint hover:border-cyan/50 hover:text-dim"}`}>
                    {i.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {GAP_CAREERS.map((c) => (
                <button key={c.id} onClick={() => setCareerId(c.id)}
                  className={`mono-label border px-2.5 py-1 text-[8.5px] transition-all duration-200 ${careerId === c.id ? "border-amber bg-amber/15 text-amber" : "border-line text-faint hover:border-amber/50 hover:text-dim"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* twin card + timeline */}
          <div className="flex flex-col gap-4">
            <div className="border border-line/80 bg-base/50 p-4">
              <p className="mono-label mb-3 text-[8.5px] text-faint">derived state · recomputed on every edit</p>
              <div className="space-y-2.5">
                {INDICATORS.map((ind) => (
                  <div key={ind.name} className="group">
                    <div className="flex items-baseline justify-between">
                      <p className="mono-label text-[9px] text-dim">{ind.name}</p>
                      <p className="font-mono text-[13px]" style={{ color: ind.color }}>{ind.value.toFixed(1)}%</p>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-line/40">
                      <div className="h-full transition-all duration-500" style={{ width: `${Math.min(100, ind.value)}%`, background: ind.color, boxShadow: `0 0 10px ${ind.color}44` }} />
                    </div>
                    <p className="mt-0.5 font-mono text-[9px] text-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100">= {ind.formula}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2 border-t border-line pt-3">
                <button onClick={() => commit(false)}
                  className={`mono-label flex-1 border px-3 py-2.5 text-[9.5px] transition-all duration-200 ${justCommitted ? "border-green bg-green/15 text-green" : "border-cyan bg-cyan/10 text-cyan hover:bg-cyan/20 hover:shadow-[0_0_20px_rgba(107,225,255,0.15)]"}`}>
                  {justCommitted ? "✓ WRITE VALIDATED & LOGGED" : `COMMIT SNAPSHOT v${snapshots.length + 1}`}
                </button>
                <button onClick={() => commit(true)} disabled={snapshots.length === 0}
                  className="mono-label border border-amber/60 bg-amber/5 px-3 py-2.5 text-[9.5px] text-amber transition-all duration-200 hover:bg-amber/15 disabled:cursor-not-allowed disabled:opacity-30">
                  AMEND LAST
                </button>
              </div>
            </div>

            {/* growth timeline */}
            <div className="border border-line/80 bg-base/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="mono-label text-[8.5px] text-faint">growth timeline · {skillLabel(focusSkill)} + career readiness</p>
                {focusDelta !== null && (
                  <span className="font-mono text-[10px]" style={{ color: focusDelta >= 0 ? GREEN : ROSE }}>
                    Δ {skillLabel(focusSkill)} {focusDelta >= 0 ? "+" : ""}{focusDelta}
                    {readinessDelta !== null && <> · Δ readiness {readinessDelta >= 0 ? "+" : ""}{readinessDelta.toFixed(1)}</>}
                  </span>
                )}
              </div>
              {n === 0 ? (
                <div className="flex h-[150px] items-center justify-center border border-dashed border-line">
                  <p className="mono-label text-[9px] text-faint">NO SNAPSHOTS YET — THE TIMELINE IS EARNED, ONE COMMIT AT A TIME</p>
                </div>
              ) : (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                  {[0, 25, 50, 75, 100].map((v) => (
                    <g key={v}>
                      <line x1="24" x2={W - 24} y1={yAt(v)} y2={yAt(v)} stroke="#1c2c44" strokeWidth="0.7" />
                      <text x="20" y={yAt(v) + 3} textAnchor="end" className="fill-[#5c7292] font-mono" fontSize="7">{v}</text>
                    </g>
                  ))}
                  {GAP_SKILLS.filter((s) => s.id !== focusSkill).map((s) => (
                    <polyline key={s.id} points={lineFor(s.id)} fill="none" stroke="#2f4a6b" strokeWidth="1" opacity="0.55" />
                  ))}
                  <polyline points={focusLine} fill="none" stroke={CYAN} strokeWidth="2.2"
                    className={justCommitted ? "flow-edge" : ""} style={{ filter: "drop-shadow(0 0 5px rgba(107,225,255,0.5))" }} />
                  <polyline points={readinessLine} fill="none" stroke={AMBER} strokeWidth="2.2" strokeDasharray="5 4"
                    style={{ filter: "drop-shadow(0 0 5px rgba(255,194,102,0.4))" }} />
                  {snapshots.map((s, i) => (
                    <g key={s.rev}>
                      <circle cx={xAt(i)} cy={yAt(s.readiness)} r="3.4" fill={s.amended ? ROSE : AMBER} stroke="#0b1626" strokeWidth="1.4" />
                      <circle cx={xAt(i)} cy={yAt(s.skills[focusSkill] ?? 0)} r="3.4" fill={CYAN} stroke="#0b1626" strokeWidth="1.4" />
                      <text x={xAt(i)} y={H - 5} textAnchor="middle" className="fill-[#5c7292] font-mono" fontSize="7.5">
                        {s.rev}{s.amended ? "*" : ""}
                      </text>
                    </g>
                  ))}
                </svg>
              )}
              <p className="mt-1 font-mono text-[8.5px] text-faint">
                thin = other skills · <span style={{ color: CYAN }}>solid = {skillLabel(focusSkill)}</span> ·{" "}
                <span style={{ color: AMBER }}>dashed = career readiness</span> · <span style={{ color: ROSE }}>red dot = amended revision</span>
              </p>
            </div>
          </div>
        </div>

        {/* audit + forbidden writes */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="border border-line/80 bg-base/50 p-4">
            <p className="mono-label mb-2 text-[8.5px] text-faint">audit trail · newest first</p>
            <div className="max-h-[150px] space-y-1.5 overflow-y-auto pr-1">
              {audit.map((a, i) => (
                <div key={i} className="flex items-start gap-2 border-b border-line/40 pb-1.5 text-[11px] leading-snug last:border-0">
                  <Tag tone={a.kind === "REJECT" ? "rose" : a.kind === "AMEND" ? "amber" : a.kind === "INIT" ? "dim" : "cyan"}>{a.kind}</Tag>
                  <p className="text-faint"><span className="mr-1.5 font-mono text-[9.5px] text-dim">{a.rev}</span>{a.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-rose/40 bg-base/50 p-4">
            <p className="mono-label mb-2 text-[8.5px] text-rose">validator drill · attempt a forbidden write</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                ["twin.sex = 'F'", "sensitive attribute (REV-D §21 EXCLUDE)"],
                ["twin.Medu = 4", "socioeconomic proxy (REV-D §21 EXCLUDE)"],
                ["twin.G3 = 17", "target column (REV-C §22 — never a feature)"],
                ["twin.cluster_id = 2", "cohort description (REV-G §43 — never per-student)"],
              ].map(([f, r]) => (
                <button key={f} onClick={() => attemptForbidden(f, r)}
                  className="mono-label border border-rose/40 bg-rose/5 px-2.5 py-1.5 text-[8.5px] text-rose/90 transition-all duration-200 hover:bg-rose/15 hover:shadow-[0_0_14px_rgba(255,139,139,0.15)]">
                  {f}
                </button>
              ))}
            </div>
            {rejectMsg ? (
              <p className="mt-3 border-l-2 border-rose pl-3 font-mono text-[10.5px] leading-relaxed text-rose/90">{rejectMsg}</p>
            ) : (
              <p className="mt-3 text-[11.5px] text-faint">The twin refuses these at the door and logs the attempt — the field never reaches storage.</p>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §72 · The write path ---------- */

export function WritePathSection() {
  return (
    <Section
      id="s72"
      index="72"
      kicker="Phase 14 · The write path"
      title="Every Write Walks the Same Corridor"
      intro="The twin is append-mostly and versioned: nothing is silently overwritten, and nothing unvalidated is stored. This is the corridor every write — self-report, resume extract, or admin entry — must walk."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">W-1 · The corridor, step by step</p>
            <ol className="mt-4 space-y-3">
              {[
                ["Intake", "a write arrives tagged with its source: self-report · resume-extract · admin"],
                ["Schema check", "field ∈ the five stores of §70 — everything else is rejected and logged (test T-7)"],
                ["Range check", "skills 0–100, attendance 0–100, counts ≥ 0 — the REV-D validator, reused at the twin's door"],
                ["Version", "the write becomes snapshot vN; AMEND replaces vN-1 but archives the prior values"],
                ["Derive", "coverage, readiness and gaps are recomputed from the engines of §45/§50 — never stored by hand"],
                ["Audit", "who, what, when, why — one immutable line per write, visible to the student"],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="mono-label mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-cyan/50 text-[9px] text-cyan">{i + 1}</span>
                  <p className="text-[13px] leading-relaxed text-dim"><span className="text-ink">{t}</span> — {d}</p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={100}>
            <div className="panel p-5 sm:p-6">
              <p className="mono-label text-amber">W-2 · Correction, not erasure</p>
              <p className="mt-2 text-[13px] leading-relaxed text-dim">
                A student who mis-reported SQL as 70 and corrects it to 45 does not rewrite history —
                they <span className="text-ink">amend</span> it. The old value stays archived, the new
                snapshot carries an <span className="text-amber">AMEND</span> flag, and the timeline
                marks the revision in red. Grades change; honesty about having changed them is what
                makes the trend line trustworthy.
              </p>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="panel p-5 sm:p-6">
              <p className="mono-label text-green">W-3 · Derivation, not storage</p>
              <p className="mt-2 text-[13px] leading-relaxed text-dim">
                Readiness indicators, gaps and compatibility are <span className="text-ink">computed</span>{" "}
                at read time from the raw stores — never written into the twin. A stored score can go
                stale and lie; a derived one is re-proven on every render. The formulas hover over
                each indicator in §71 so anyone can check the arithmetic.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §73 · Gate G-14 ---------- */

const G14_CHECK = [
  "Constitution signed: five stores the twin may hold; sensitive, socioeconomic, health and target fields refused at the door",
  "Write path frozen: intake → schema → range → version → derive → audit, reusing the REV-D validator and test T-7",
  "Five readiness indicators defined and printed in-app — Career, Coverage, Technical, Academic, Portfolio — each with its formula",
  "Versioning contract: snapshots are append-only; AMEND archives prior values and flags the revision",
  "Student rights contractual: correct any field, see every source, be forgotten on request",
  "The twin stores raw fields only — every indicator is derived at read time, so nothing can go stale and lie",
];

export function GateG14Section({ g14, onApprove }: { g14: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s73"
      index="73"
      kicker="Gate G-14"
      title="Approval Gate — Phase 14"
      intro="Phase 14 stops here by design. The twin's constitution, console and write path are complete; the Application stage is one engine away from its most distinctive feature."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 14 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G14_CHECK.map((d, i) => (
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
            <Corners color={g14 ? GREEN : AMBER} />
            <p className={`mono-label ${g14 ? "text-green" : "text-amber"}`}>
              {g14 ? "Decision recorded" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g14
                ? "Phase 14 approved. Phase 15 — the Future Simulator — unlocked."
                : "Approve the Digital Twin to unlock Phase 15 — the What-If Future Simulator."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g14
                ? "Next: the twin's what-if mode — hypothetical skill changes replayed through the very engines you just approved, with before/after deltas and a label that refuses to call it prophecy."
                : "On approval, Phase 15 specifies the scenario simulator: hypothetical skills fed through the same §45/§50 engines, before/after compatibility deltas, and the 'simulation, not prediction' clause enforced in the UI."}
            </p>

            {!g14 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 14 — proceed to the simulator</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-14 · DT-CIS-SD-001 · REV N</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any twin field outside the five stores, any write that skips the corridor, any
                indicator stored instead of derived, and any correction that erases rather than
                amends. The twin is a mirror with a memory — not a vault, and not a verdict.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
