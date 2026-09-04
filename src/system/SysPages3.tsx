import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSys, analyzeResume, analyzeJob, readinessFor, coverageFor, acadFor, interestFitFor, sysGaps } from "./profile";
import { trackEvent } from "./Insights";
import { GAP_SKILLS, GAP_CAREERS } from "../components/Phase9";
import { Reveal, Tag, Corners } from "../components/ui";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

const skillLabel = (id: string) => GAP_SKILLS.find((s) => s.id === id)?.label ?? id;
const careerName = (id: string) => GAP_CAREERS.find((c) => c.id === id)?.name ?? id;
const fmt = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}`;

/* ================= RESUME ANALYZER ================= */

const SAMPLE_CV = `Amina Kaci — Final-year Computer Science student
Education: B.Sc. Computer Science (2022–2026), GPA 3.6/4.0
Skills: Python, pandas, scikit-learn, SQL, machine learning, statistics, data analysis, Git
Projects: Student performance predictor (Python, scikit-learn) · E-commerce churn dashboard (pandas, Tableau)
Experience: 1 year internship as data analyst — built SQL reports and A/B testing dashboards
Certifications: Google Data Analytics, freeCodeCamp Machine Learning`;

export function SysResume() {
  const { profile, setSkill } = useSys();
  const [text, setText] = useState(SAMPLE_CV);
  const [busy, setBusy] = useState(false);
  const [runId, setRunId] = useState(0);
  const result = useMemo(() => (runId ? analyzeResume(text, profile.skills) : null), [runId, text, profile.skills]);

  const analyze = () => {
    setBusy(true);
    setRunId(0);
    trackEvent("resume");
    window.setTimeout(() => { setRunId((r) => r + 1); setBusy(false); }, 700);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Reveal>
        <div className="flex h-full flex-col border border-line/80 bg-base/50 p-4 sm:p-5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="mono-label text-[8.5px] text-faint">PASTE A CV — IT NEVER LEAVES THIS DEVICE</p>
            <button onClick={() => setText(SAMPLE_CV)} className="mono-label text-[8.5px] text-cyan hover:text-ink">LOAD SAMPLE</button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="h-[300px] flex-1 resize-none border border-line/80 bg-base/70 p-3 font-mono text-[11.5px] leading-relaxed text-dim outline-none transition-colors focus:border-cyan/60"
            placeholder="Paste the resume text here…"
          />
          <button onClick={analyze} disabled={busy || text.trim().length < 20}
            className="mono-label mt-3 border border-cyan bg-cyan/10 px-4 py-3 text-[10px] text-cyan transition-all duration-200 hover:bg-cyan/20 hover:shadow-[0_0_22px_rgba(107,225,255,0.15)] disabled:cursor-not-allowed disabled:opacity-30">
            {busy ? "EXTRACTING — PIPELINE N-1…N-5 RUNNING" : "RUN EXTRACTION PIPELINE"}
          </button>
          <p className="mt-2 font-mono text-[8.5px] leading-relaxed text-faint">
            deterministic dictionary extraction (§58): transcribe claims, count evidence, normalize against the §47
            lexicon, refuse to guess. {text.trim().split(/\s+/).filter(Boolean).length} words staged.
          </p>
        </div>
      </Reveal>

      <div className="space-y-4">
        {!result ? (
          <Reveal delay={80}>
            <div className={`flex h-[380px] items-center justify-center border border-dashed border-line ${busy ? "relative overflow-hidden" : ""}`}>
              {busy && <span className="scanline" aria-hidden="true" />}
              <p className="mono-label text-[9px] text-faint">{busy ? "PIPELINE RUNNING · NO LLMs, NO NETWORK — JUST EVIDENCE" : "AWAITING EXTRACTION RUN"}</p>
            </div>
          </Reveal>
        ) : (
          <>
            <Reveal>
              <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
                <p className="mono-label mb-3 text-[8.5px] text-faint">EXTRACTED SKILLS · CONFIDENCE = EVIDENCE COUNT</p>
                <div className="space-y-2">
                  {result.skills.map((s) => (
                    <div key={s.skillId} className="group">
                      <div className="flex items-center justify-between">
                        <p className="text-[12.5px] text-ink">{s.label}</p>
                        <p className="font-mono text-[10px] text-faint">
                          conf <span className={s.conf > 0.7 ? "text-green" : "text-amber"}>{(s.conf * 100).toFixed(0)}%</span>
                          {" "}· tokens: {s.tokens.slice(0, 3).join(", ")}
                        </p>
                      </div>
                      <div className="mt-1 flex h-1.5 w-full gap-px">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex-1" style={{ background: s.conf > (i + 1) / 3.2 ? CYAN : "rgba(107,225,255,0.12)" }} />
                        ))}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="font-mono text-[9px] text-faint">resume ≈ {s.est} · twin says {profile.skills[s.skillId] ?? 0}</p>
                        {s.est > (profile.skills[s.skillId] ?? 0) + 15 && (
                          <button onClick={() => setSkill(s.skillId, Math.min(100, s.est))}
                            className="mono-label border border-amber/60 px-1.5 py-0.5 text-[7.5px] text-amber transition-colors hover:bg-amber/15">
                            ADOPT → {s.est}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {result.skills.length === 0 && <p className="text-[12px] text-faint">Nothing matched the §47 lexicon — the extractor refuses to guess.</p>}
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
                <p className="mono-label mb-2.5 text-[8.5px] text-faint">TWIN DIFF · STRUCTURED SIGNALS</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["WORDS", String(result.wordCount), CYAN],
                    ["YEARS", result.years !== null ? `${result.years}y` : "n/a", AMBER],
                    ["DEGREES", result.degrees.join(", ") || "n/a", "#9db8ff"],
                    ["TOOLS", result.tools.slice(0, 3).join(", ") || "n/a", GREEN],
                  ].map(([l, v, c]) => (
                    <div key={l} className="border border-line/70 p-2.5">
                      <p className="mono-label text-[7.5px] text-faint">{l}</p>
                      <p className="mt-1 truncate font-mono text-[12px]" style={{ color: c as string }}>{v}</p>
                    </div>
                  ))}
                </div>
                {result.underRepresented.length > 0 && (
                  <p className="mt-3 border-l-2 border-amber/60 pl-3 text-[11.5px] leading-relaxed text-dim">
                    <span className="mono-label mr-1.5 text-amber">UNDER-REPRESENTED</span>
                    your resume claims more than the twin stores for: {result.underRepresented.map((s) => s.label).join(", ")}. Adopt the estimates above, or correct the resume.
                  </p>
                )}
                {result.missingFromTwin.length > 0 && (
                  <p className="mt-2 border-l-2 border-rose/60 pl-3 text-[11.5px] leading-relaxed text-dim">
                    <span className="mono-label mr-1.5 text-rose">MISSING FROM TWIN</span>
                    claimed on the resume but near-zero in the twin: {result.missingFromTwin.map((s) => s.label).join(", ")}.
                  </p>
                )}
                <p className="mt-3 font-mono text-[8.5px] text-faint">imperfect extraction is a feature: every field shows its evidence or says “n/a” — never a silent guess.</p>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= JOB MATCHER ================= */

const SAMPLE_JD = `Machine Learning Engineer — FinBank (Junior)
Requirements:
- Must have strong Python and SQL
- Proficiency in machine learning and statistics
- Experience with data analysis and pandas
- Solid understanding of Git workflows
Preferred:
- Familiarity with Docker and MLOps practices is a plus
- Exposure to cloud platforms (AWS) — nice to have
- Deep learning knowledge a bonus`;

export function SysJobs() {
  const { profile } = useSys();
  const [text, setText] = useState(SAMPLE_JD);
  const [busy, setBusy] = useState(false);
  const [runId, setRunId] = useState(0);
  const result = useMemo(() => (runId ? analyzeJob(text, profile.skills) : null), [runId, text, profile.skills]);

  const analyze = () => {
    setBusy(true);
    setRunId(0);
    trackEvent("jd");
    window.setTimeout(() => { setRunId((r) => r + 1); setBusy(false); }, 600);
  };

  const band = (m: number) => (m >= 70 ? GREEN : m >= 45 ? AMBER : ROSE);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Reveal>
        <div className="flex h-full flex-col border border-line/80 bg-base/50 p-4 sm:p-5">
          <p className="mono-label mb-2.5 text-[8.5px] text-faint">PASTE A JOB DESCRIPTION</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            className="h-[300px] flex-1 resize-none border border-line/80 bg-base/70 p-3 font-mono text-[11.5px] leading-relaxed text-dim outline-none transition-colors focus:border-amber/60"
            placeholder="Paste the posting here…"
          />
          <button onClick={analyze} disabled={busy || text.trim().length < 20}
            className="mono-label mt-3 border border-amber bg-amber/10 px-4 py-3 text-[10px] text-amber transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_22px_rgba(255,194,102,0.15)] disabled:cursor-not-allowed disabled:opacity-30">
            {busy ? "WEIGHING REQUIREMENTS…" : "MATCH AGAINST MY TWIN"}
          </button>
          <p className="mt-2 font-mono text-[8.5px] leading-relaxed text-faint">
            required skills weigh ×2, preferred ×1 (§62). Unmapped tools are disclosed, not guessed.
          </p>
        </div>
      </Reveal>

      <div className="space-y-4">
        {!result ? (
          <Reveal delay={80}>
            <div className={`flex h-[380px] items-center justify-center border border-dashed border-line ${busy ? "relative overflow-hidden" : ""}`}>
              {busy && <span className="scanline" aria-hidden="true" />}
              <p className="mono-label text-[9px] text-faint">{busy ? "PARSING · REQUIRED ×2 / PREFERRED ×1" : "AWAITING MATCH RUN"}</p>
            </div>
          </Reveal>
        ) : (
          <>
            <Reveal>
              <div className="relative border border-line/80 bg-base/50 p-4 sm:p-5">
                <Corners color={band(result.match)} />
                <div className="flex items-center gap-5">
                  <div className="relative h-24 w-24 shrink-0">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={band(result.match)} strokeWidth="9"
                        strokeDasharray={`${(result.match / 100) * 264} 264`} strokeLinecap="butt"
                        className="transition-all duration-1000" style={{ filter: `drop-shadow(0 0 6px ${band(result.match)})` }} />
                    </svg>
                    <p className="absolute inset-0 flex items-center justify-center font-mono text-[19px]" style={{ color: band(result.match) }}>
                      {result.match.toFixed(0)}%
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="mono-label text-[8.5px] text-faint">KEYWORD-OVERLAP FIT GAUGE</p>
                    <p className="display-head mt-1 text-lg text-ink">{result.skills.length} skills detected · {result.requiredCount} required</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
                      {result.match >= 70 ? "Strong overlap — the gaps below are the highest-leverage closes." :
                        result.match >= 45 ? "Partial overlap — a deliberate upskill plan closes most of this." :
                          "Low overlap — this posting leans on skills your twin hasn't built yet."}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mono-label mb-2 text-[8.5px] text-green">STRONG MATCHES</p>
                    <ul className="space-y-1">
                      {result.strong.map((s) => (
                        <li key={s.skillId} className="flex justify-between text-[12px] text-dim">
                          <span>✓ {s.label}</span><span className="font-mono text-green">{s.level}</span>
                        </li>
                      ))}
                      {result.strong.length === 0 && <li className="text-[11.5px] text-faint">none ≥ 70 yet</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="mono-label mb-2 text-[8.5px] text-rose">HIGHEST-LEVERAGE GAPS</p>
                    <ul className="space-y-1">
                      {result.gaps.slice(0, 5).map((s) => (
                        <li key={s.skillId} className="flex justify-between text-[12px] text-dim">
                          <span>✗ {s.label} {s.required && <span className="mono-label text-[7px] text-rose">REQ</span>}</span>
                          <span className="font-mono text-rose">{s.level}</span>
                        </li>
                      ))}
                      {result.gaps.length === 0 && <li className="text-[11.5px] text-faint">nothing below 50 — solid footing</li>}
                    </ul>
                  </div>
                </div>
                {result.unmapped.length > 0 && (
                  <p className="mt-3 border-t border-line pt-2.5 font-mono text-[9.5px] text-faint">
                    unmapped signals (named, excluded from the number): {result.unmapped.join(", ")}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <p className="text-[11.5px] text-dim">
                    <span className="mono-label mr-1.5 text-amber">ACTION</span>
                    {result.gaps.length ? <>close {result.gaps.slice(0, 2).map((g) => g.label).join(" and ")} via your roadmap.</> : "maintain the trajectory — keep building."}
                  </p>
                  <Link to="/system/roadmap" className="mono-label border border-cyan/60 px-2.5 py-1.5 text-[8.5px] text-cyan hover:bg-cyan/15">ROADMAP →</Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="border border-rose/40 bg-rose/[0.04] p-3.5">
                <p className="mono-label text-[8.5px] text-rose">A MATCH IS NOT A HIRE</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
                  This number measures weighted keyword overlap between a posting and your twin — nothing about a
                  recruiter, a team, or your future. It is a conversation starter, never a verdict (§64).
                </p>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= FUTURE SIMULATOR ================= */

export function SysSimulate() {
  const { profile } = useSys();
  const [after, setAfter] = useState<Record<string, number>>({ ...profile.skills });
  const [sortBy, setSortBy] = useState<"after" | "delta">("delta");
  const [journaled, setJournaled] = useState(false);

  const changed = GAP_SKILLS.filter((s) => after[s.id] !== profile.skills[s.id]);
  const effort = changed.reduce((sum, s) => {
    const d = after[s.id] - profile.skills[s.id];
    return d > 0 ? sum + (d / 10) * s.effortPer10 : sum;
  }, 0);

  const board = useMemo(() => {
    const simProfile = { ...profile, skills: after };
    return GAP_CAREERS.map((c) => ({
      c,
      before: readinessFor(profile, c.id),
      after: readinessFor(simProfile, c.id),
      delta: readinessFor(simProfile, c.id) - readinessFor(profile, c.id),
    })).sort((a, b) => (sortBy === "after" ? b.after - a.after : b.delta - a.delta));
  }, [profile, after, sortBy]);

  // exact attribution for the current target (§74: linear in coverage)
  const attr = useMemo(() => {
    const c = GAP_CAREERS.find((x) => x.id === profile.targetCareer)!;
    const den = Object.values(c.req).reduce((a, w) => a + w * 100, 0);
    return GAP_SKILLS
      .map((s) => {
        const w = c.req[s.id] ?? 0;
        const dMin = Math.min(after[s.id], w * 100) - Math.min(profile.skills[s.id], w * 100);
        return { s, dLevel: after[s.id] - profile.skills[s.id], contrib: w > 0 ? (dMin / den) * 100 * (0.5 / 0.75) : 0 };
      })
      .filter((r) => Math.abs(r.dLevel) > 0.5)
      .sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib));
  }, [profile, after]);
  const attrSum = attr.reduce((s, r) => s + r.contrib, 0);

  return (
    <div className="space-y-4">
      <Reveal>
        <div className="flex flex-wrap items-center gap-3 border border-rose/50 bg-rose/[0.05] px-4 py-3">
          <Tag tone="rose">SCENARIO SIMULATION</Tag>
          <p className="mono-label text-[9px] text-rose/90">NOT A PREDICTION OF YOUR FUTURE — a read-only replay of approved engines; the twin is never written to (§74 S-3)</p>
          <button
            onClick={() => { trackEvent("sim"); setJournaled(true); window.setTimeout(() => setJournaled(false), 1400); }}
            disabled={changed.length === 0}
            className={`mono-label ml-auto border px-3 py-1.5 text-[8.5px] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
              journaled ? "border-green bg-green/15 text-green" : "border-amber/60 text-amber hover:bg-amber/10"
            }`}
          >
            {journaled ? "✓ JOURNALED — REFLECTION, NOT DATA" : "JOURNAL THIS SCENARIO"}
          </button>
        </div>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.25fr]">
        <Reveal>
          <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="mono-label text-[8.5px] text-faint">PERTURB A COPY OF YOUR TWIN · BEFORE → AFTER</p>
              <button onClick={() => setAfter({ ...profile.skills })} className="mono-label text-[8.5px] text-rose hover:text-ink">RESET</button>
            </div>
            <div className="space-y-1.5">
              {GAP_SKILLS.map((s) => {
                const b = profile.skills[s.id];
                const a = after[s.id];
                const d = a - b;
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="mono-label w-24 shrink-0 text-[8px] text-dim">{s.label}</span>
                    <span className="w-6 text-right font-mono text-[10px] text-faint">{b}</span>
                    <span className="font-mono text-[8px] text-faint">→</span>
                    <input type="range" min={0} max={100} value={a}
                      onChange={(e) => setAfter((p) => ({ ...p, [s.id]: Number(e.target.value) }))}
                      className="twin-range h-1 flex-1 cursor-ew-resize" aria-label={`${s.label} scenario`} />
                    <span className={`w-10 text-right font-mono text-[9.5px] ${d > 0 ? "text-green" : d < 0 ? "text-rose" : "text-faint"}`}>
                      {d !== 0 ? fmt(d) : "·"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 border-t border-line pt-2.5 font-mono text-[9.5px] text-faint">
              {changed.length} skill{changed.length === 1 ? "" : "s"} perturbed · effort ≈ <span className="text-amber">{Math.round(effort)}h</span> calibrated (§50)
            </p>
          </div>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={70}>
            <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="mono-label text-[8.5px] text-faint">BEFORE / AFTER — ALL TWELVE CAREERS</p>
                <div className="flex gap-1.5">
                  {(["delta", "after"] as const).map((s) => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`mono-label border px-2 py-0.5 text-[8.5px] transition-all duration-200 ${sortBy === s ? "border-amber bg-amber/15 text-amber" : "border-line text-faint hover:border-amber/50 hover:text-dim"}`}>
                      BY {s === "delta" ? "GAIN" : "AFTER"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                {board.map((row) => {
                  const isT = row.c.id === profile.targetCareer;
                  return (
                    <div key={row.c.id} className={`flex items-center gap-3 border px-3 py-1.5 ${isT ? "border-amber/60 bg-amber/5" : "border-transparent"}`}>
                      <span className={`w-44 shrink-0 truncate text-[12px] ${isT ? "text-amber" : "text-dim"}`}>{row.c.name}</span>
                      <div className="relative h-2 flex-1 bg-line/30">
                        <div className="absolute inset-y-0 left-0 bg-[#3d5a80] transition-all duration-500" style={{ width: `${Math.min(100, row.before)}%` }} />
                        <div className={`absolute inset-y-0 left-0 transition-all duration-500 ${isT ? "bg-amber" : "bg-cyan"}`} style={{ width: `${Math.min(100, row.after)}%` }} />
                      </div>
                      <span className="w-24 text-right font-mono text-[10.5px]">
                        <span className="text-faint">{row.before.toFixed(1)}</span>
                        <span className="mx-1 text-faint">→</span>
                        <span className={isT ? "text-amber" : "text-cyan"}>{row.after.toFixed(1)}</span>
                        <span className={`ml-1.5 ${row.delta > 0.05 ? "text-green" : row.delta < -0.05 ? "text-rose" : "text-faint"}`}>
                          {Math.abs(row.delta) > 0.05 ? fmt(row.delta) : "—"}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 font-mono text-[8.5px] text-faint">grey = your twin today · coloured = the scenario · grey→colour shows exactly what moved</p>
            </div>
          </Reveal>

          <Reveal delay={130}>
            <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="mono-label text-[8.5px] text-faint">EXACT ATTRIBUTION — {careerName(profile.targetCareer).toUpperCase()}</p>
                <p className="font-mono text-[11px]" style={{ color: attrSum >= 0 ? GREEN : ROSE }}>Σ = {fmt(attrSum)} pts</p>
              </div>
              {attr.length === 0 ? (
                <p className="mt-3 text-center font-mono text-[10px] text-faint">BASELINE SCENARIO — MOVE A SLIDER TO SEE WHO MOVES THE NEEDLE</p>
              ) : (
                <div className="mt-2.5 space-y-1.5">
                  {attr.map((r) => (
                    <div key={r.s.id} className="flex items-center gap-2">
                      <span className="mono-label w-24 shrink-0 text-[8px] text-dim">{r.s.label}</span>
                      <span className={`w-12 font-mono text-[9.5px] ${r.dLevel > 0 ? "text-green" : "text-rose"}`}>Δ{fmt(r.dLevel)}</span>
                      <div className="relative h-3 flex-1 bg-line/30">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-line" />
                        <div className="absolute inset-y-0 transition-all duration-500"
                          style={{
                            background: r.contrib >= 0 ? GREEN : ROSE,
                            left: r.contrib >= 0 ? "50%" : `${50 - Math.min(50, Math.abs(r.contrib) * 5)}%`,
                            width: `${Math.min(50, Math.abs(r.contrib) * 5)}%`,
                            opacity: 0.85,
                          }} />
                      </div>
                      <span className={`w-14 text-right font-mono text-[10px] ${r.contrib >= 0 ? "text-green" : "text-rose"}`}>{fmt(r.contrib)}</span>
                    </div>
                  ))}
                  <p className="pt-1 font-mono text-[8.5px] text-faint">the bar sum equals the board's Δ for your target — no residual, because the engine is linear in coverage (§74 S-2)</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

/* ================= PROGRESS ================= */

export function SysProgress() {
  const { snapshots, profile } = useSys();
  const [focus, setFocus] = useState("python");

  const W = 560;
  const H = 190;
  const n = snapshots.length;
  const xAt = (i: number) => (n <= 1 ? W / 2 : 26 + (i * (W - 52)) / (n - 1));
  const yAt = (v: number) => H - 22 - (v / 100) * (H - 48);

  const first = snapshots[0];
  const last = snapshots[n - 1];
  const growth = first && last ? last.readiness - first.readiness : null;
  const focusGrowth = first && last ? (last.skills[focus] ?? 0) - (first.skills[focus] ?? 0) : null;
  const today = readinessFor(profile, profile.targetCareer);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["SNAPSHOTS", String(n), CYAN],
          ["READINESS TODAY", `${today.toFixed(1)}%`, AMBER],
          ["GROWTH SINCE v1", growth !== null ? fmt(growth) + " pts" : "—", growth !== null && growth >= 0 ? GREEN : ROSE],
          [`${skillLabel(focus).toUpperCase()} GROWTH`, focusGrowth !== null ? fmt(focusGrowth) : "—", focusGrowth !== null && focusGrowth >= 0 ? GREEN : ROSE],
        ].map(([l, v, c]) => (
          <Reveal key={l as string}>
            <div className="border border-line/80 bg-base/50 p-4">
              <p className="mono-label text-[8px] text-faint">{l as string}</p>
              <p className="mt-1 font-mono text-[20px]" style={{ color: c as string }}>{v as string}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="border border-line/80 bg-base/50 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="mono-label text-[8.5px] text-faint">GROWTH TIMELINE — EARNED ONE COMMIT AT A TIME</p>
            <div className="flex flex-wrap gap-1">
              {GAP_SKILLS.slice(0, 8).map((s) => (
                <button key={s.id} onClick={() => setFocus(s.id)}
                  className={`mono-label border px-2 py-0.5 text-[7.5px] transition-all duration-200 ${focus === s.id ? "border-cyan bg-cyan/15 text-cyan" : "border-line text-faint hover:text-dim"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {n === 0 ? (
            <div className="flex h-[220px] flex-col items-center justify-center gap-3 border border-dashed border-line">
              <p className="mono-label text-[9px] text-faint">NO SNAPSHOTS YET</p>
              <Link to="/system/twin" className="mono-label border border-cyan/60 px-3 py-2 text-[9px] text-cyan hover:bg-cyan/15">COMMIT YOUR FIRST SNAPSHOT →</Link>
            </div>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line x1="26" x2={W - 26} y1={yAt(v)} y2={yAt(v)} stroke="#1c2c44" strokeWidth="0.7" />
                  <text x="22" y={yAt(v) + 3} textAnchor="end" className="fill-[#5c7292] font-mono" fontSize="7">{v}</text>
                </g>
              ))}
              {GAP_SKILLS.filter((s) => s.id !== focus).map((s) => (
                <polyline key={s.id} points={snapshots.map((sn, i) => `${xAt(i)},${yAt(sn.skills[s.id] ?? 0)}`).join(" ")} fill="none" stroke="#2f4a6b" strokeWidth="1" opacity="0.5" />
              ))}
              <polyline points={snapshots.map((sn, i) => `${xAt(i)},${yAt(sn.skills[focus] ?? 0)}`).join(" ")} fill="none" stroke={CYAN} strokeWidth="2.2" style={{ filter: "drop-shadow(0 0 5px rgba(107,225,255,0.5))" }} />
              <polyline points={snapshots.map((sn, i) => `${xAt(i)},${yAt(sn.readiness)}`).join(" ")} fill="none" stroke={AMBER} strokeWidth="2.2" strokeDasharray="5 4" style={{ filter: "drop-shadow(0 0 5px rgba(255,194,102,0.4))" }} />
              {snapshots.map((sn, i) => (
                <g key={sn.rev}>
                  <circle cx={xAt(i)} cy={yAt(sn.readiness)} r="3.4" fill={sn.amended ? ROSE : AMBER} stroke="#0b1626" strokeWidth="1.4" />
                  <circle cx={xAt(i)} cy={yAt(sn.skills[focus] ?? 0)} r="3.4" fill={CYAN} stroke="#0b1626" strokeWidth="1.4" />
                  <text x={xAt(i)} y={H - 6} textAnchor="middle" className="fill-[#5c7292] font-mono" fontSize="7.5">{sn.rev}{sn.amended ? "*" : ""}</text>
                </g>
              ))}
            </svg>
          )}
          <p className="mt-2 font-mono text-[8.5px] text-faint">
            thin = other skills · <span style={{ color: CYAN }}>solid = {skillLabel(focus)}</span> · <span style={{ color: AMBER }}>dashed = career readiness</span> · <span style={{ color: ROSE }}>red = amended</span>
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["PROJECTS LOGGED", profile.portfolio.projects, "portfolio store · weight in Portfolio Strength"],
            ["MEAN DIFFICULTY", profile.portfolio.avgDiff + " / 5", "harder projects earn more strength per unit"],
            ["CERTIFICATIONS", profile.portfolio.certs, "counted after skills, never instead of them (R-2)"],
          ].map(([l, v, note]) => (
            <div key={l as string} className="border border-line/80 bg-base/50 p-4">
              <p className="mono-label text-[8px] text-faint">{l as string}</p>
              <p className="mt-1 font-mono text-[22px] text-ink">{v}</p>
              <p className="mt-1 font-mono text-[8.5px] leading-relaxed text-faint">{note as string}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
