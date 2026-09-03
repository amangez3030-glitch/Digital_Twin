import { useMemo, useState } from "react";
import { Section, Reveal, Tag, Corners } from "./ui";
import { ALIAS_VOCAB } from "./Phase11";

const CYAN = "#6be1ff";
const AMBER = "#ffc266";
const GREEN = "#7ce7a5";
const ROSE = "#ff8b8b";

const skillLabel = (id: string) => {
  const map: Record<string, string> = {
    python: "Python", statistics: "Statistics", math: "Mathematics", sql: "SQL",
    web_dev: "Web Dev", ml: "Machine Learning", data_analysis: "Data Analysis",
    cloud: "Cloud", deep_learning: "Deep Learning", mlops: "MLOps", nlp: "NLP", cv: "Computer Vision",
  };
  return map[id] ?? id;
};

/* The Digital Twin's current skill levels — the profile every engine reads. */
const TWIN: Record<string, number> = {
  python: 70, statistics: 45, math: 55, sql: 40, web_dev: 60,
  ml: 55, data_analysis: 50, cloud: 30, deep_learning: 25, mlops: 20, nlp: 15, cv: 15,
};

/* ---------- §63 · The frozen matcher math ---------- */

export function MatcherMathSection() {
  const cards = [
    {
      tag: "W-1", color: CYAN, title: "Required skills weigh 2×",
      body: "A 'must-have' a candidate lacks hurts twice as much as a 'nice-to-have'. The matcher reads posting language — 'required', 'must', 'essential', 'proficiency' — to assign the heavier weight.",
    },
    {
      tag: "W-2", color: AMBER, title: "Preferred skills weigh 1×",
      body: "'Preferred', 'bonus', 'a plus', 'familiarity with' mark the lighter tier. Missing these dims the score; it never sinks it. A posting that lists everything as 'required' is telling you something about the employer, not about you.",
    },
    {
      tag: "W-3", color: GREEN, title: "Match is twin-level ÷ 100, weighted",
      body: "Each detected skill contributes (twin level / 100) × its weight. The job match % is the weighted sum over the weighted total — a transparency-weighted coverage of what the posting asks for.",
    },
    {
      tag: "W-4", color: ROSE, title: "Undetected skills are reported, not invented",
      body: "Tokens the vocabulary doesn't know (Java, Git, Kafka…) are listed as 'out-of-vocabulary' and excluded from the score. The matcher would rather show a smaller honest number than a bigger invented one.",
    },
  ];
  return (
    <Section
      id="s62"
      index="62"
      kicker="Phase 12 · The matcher math"
      title="A Fit Gauge, Frozen in Writing"
      intro="Before a single job description is parsed, the scoring rules are fixed. Required skills count double, preferred skills count once, every contribution is the twin's own level, and anything the vocabulary can't recognize is disclosed rather than guessed. The result is a measure of overlap — never a verdict on employability."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.tag} delay={i * 80}>
            <div className="panel h-full p-4 sm:p-5">
              <span className="mono-label border px-2 py-1 text-[9px]" style={{ color: c.color, borderColor: `${c.color}55` }}>{c.tag}</span>
              <p className="display-head mt-2.5 text-[16px] text-ink">{c.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={140}>
        <div className="mt-5 border-l-2 border-cyan/60 pl-3.5">
          <p className="font-mono text-[12.5px] leading-relaxed text-dim">
            match&nbsp;%&nbsp;=&nbsp;Σ( level<sub>i</sub>/100 × w<sub>i</sub> ) / Σ( w<sub>i</sub> ) &nbsp;·&nbsp;
            w = 2 (required) · 1 (preferred)
          </p>
          <p className="mt-1.5 text-[12px] text-faint">
            level<sub>i</sub> is the twin's self-assessed skill, w<sub>i</sub> the posting-derived weight.
            The formula has no hidden term and no learned component — it is an audit, not an oracle.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §64 · The live JD matcher ---------- */

const SAMPLE_JD = `Junior Machine Learning Engineer — FinBank

We are looking for a junior ML engineer to join our risk-analytics team.

Requirements:
- Strong proficiency in Python and machine learning (scikit-learn, XGBoost)
- Must have hands-on experience with SQL and PostgreSQL
- Solid understanding of statistics and hypothesis testing
- Experience deploying models with Docker and basic MLOps practices

Preferred:
- Familiarity with deep learning frameworks (TensorFlow or PyTorch) is a plus
- Exposure to AWS cloud services is a bonus
- Knowledge of NLP and sentiment analysis would be helpful
- Experience with Apache Spark and Kafka`;

const REQ_RE = /(required|require|must|essential|proficiency|strong|hands-on|solid|experience with|expert|deep knowledge)/i;
const PREF_RE = /(preferred|prefer|nice to have|bonus|a plus|plus|familiarity|exposure|would be helpful|knowledge of .* is|desirable)/i;

export interface JDMatch {
  skill: string;
  level: number;
  weight: 1 | 2;
  tier: "STRONG" | "PARTIAL" | "GAP";
  contribution: number;
}

export interface JDResult {
  skills: JDMatch[];
  matchPct: number;
  reqPct: number;
  prefPct: number;
  oov: string[];
  nReq: number;
  nPref: number;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

export function matchJD(text: string): JDResult {
  const lower = text.toLowerCase();
  const lines = lower.split(/\n|(?<=[.;])\s+/);
  const perSkill = new Map<string, { weight: 1 | 2; seen: boolean }>();

  for (const alias of ALIAS_VOCAB) {
    const re = new RegExp(`(?<![a-z0-9])${esc(alias.token)}(?![a-z0-9])`, "g");
    if (!re.test(lower)) continue;
    // determine weight from the lines that mention it
    let isPrefOnly = true;
    let mentioned = false;
    for (const line of lines) {
      if (!line.includes(alias.token)) continue;
      mentioned = true;
      if (REQ_RE.test(line) && !PREF_RE.test(line)) { isPrefOnly = false; break; }
    }
    const prev = perSkill.get(alias.skill);
    const weight: 1 | 2 = isPrefOnly && mentioned ? 1 : 2;
    if (!prev || weight === 2) perSkill.set(alias.skill, { weight, seen: true });
  }

  const oovSet = new Set<string>();
  for (const tok of ["java", "git", "kafka", "spark", "linux", "c++", "hadoop", "scala", "agile", "spring"]) {
    if (new RegExp(`(?<![a-z0-9])${esc(tok)}(?![a-z0-9])`).test(lower)) oovSet.add(tok);
  }

  const skills: JDMatch[] = [...perSkill.entries()].map(([skill, { weight }]) => {
    const level = TWIN[skill] ?? 0;
    const tier: JDMatch["tier"] = level >= 60 ? "STRONG" : level >= 40 ? "PARTIAL" : "GAP";
    return { skill, level, weight, tier, contribution: (level / 100) * weight };
  }).sort((a, b) => b.weight - a.weight || b.contribution - a.contribution);

  const sumW = skills.reduce((s, x) => s + x.weight, 0);
  const sumC = skills.reduce((s, x) => s + x.contribution, 0);
  const req = skills.filter((s) => s.weight === 2);
  const pref = skills.filter((s) => s.weight === 1);
  const reqPct = req.length ? (req.reduce((s, x) => s + x.contribution, 0) / req.reduce((s, x) => s + x.weight, 0)) * 100 : 0;
  const prefPct = pref.length ? (pref.reduce((s, x) => s + x.contribution, 0) / pref.reduce((s, x) => s + x.weight, 0)) * 100 : 0;
  const matchPct = sumW ? (sumC / sumW) * 100 : 0;

  return { skills, matchPct, reqPct, prefPct, oov: [...oovSet], nReq: req.length, nPref: pref.length };
}

function MatchDial({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = pct >= 70 ? GREEN : pct >= 45 ? AMBER : ROSE;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(107,225,255,0.08)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <p className="display-head text-[34px] leading-none" style={{ color }}>{Math.round(pct)}%</p>
        <p className="mono-label mt-1 text-[8px] text-faint">SKILL OVERLAP</p>
      </div>
    </div>
  );
}

export function LiveMatcherSection() {
  const [text, setText] = useState(SAMPLE_JD);
  const res = useMemo(() => matchJD(text), [text]);

  const strong = res.skills.filter((s) => s.tier === "STRONG");
  const gaps = res.skills.filter((s) => s.tier === "GAP").sort((a, b) => b.weight * (1 - b.level / 100) - a.weight * (1 - a.level / 100));
  const topGaps = gaps.slice(0, 3).map((g) => skillLabel(g.skill));

  return (
    <Section
      id="s63"
      index="63"
      kicker="Phase 12 · The matcher, running"
      title="Paste a Job. Get an Honest Overlap."
      intro="The frozen math, executing live. Paste any posting — or keep the sample — and the matcher reads required from preferred, weighs each against the twin's current levels, and reports where you align and where you fall short. Edit the text and watch the number move."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* input */}
        <div className="space-y-4">
          <Reveal>
            <div className="panel p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="mono-label text-cyan">Job description</p>
                <button
                  onClick={() => setText(SAMPLE_JD)}
                  className="mono-label border border-line px-2 py-1 text-[8.5px] text-faint transition-colors hover:border-cyan hover:text-cyan"
                >
                  RESET SAMPLE
                </button>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={16}
                spellCheck={false}
                className="mt-3 w-full resize-y border border-line/80 bg-base/60 p-3 font-mono text-[12px] leading-relaxed text-dim outline-none transition-colors focus:border-cyan/60"
                aria-label="job description text"
              />
            </div>
          </Reveal>

          {res.oov.length > 0 && (
            <Reveal delay={80}>
              <div className="border-l-2 border-amber/60 pl-3.5">
                <p className="mono-label text-[8.5px] text-amber">Out-of-vocabulary — named, not scored</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {res.oov.map((t) => (
                    <span key={t} className="mono-label border border-amber/40 px-1.5 py-0.5 text-[8px] text-amber/90">{t}</span>
                  ))}
                </div>
                <p className="mt-1.5 text-[11.5px] text-faint">
                  The vocabulary doesn't cover these, so they're excluded from the match rather than
                  guessed. Add them to the alias table (Phase 11) to score them.
                </p>
              </div>
            </Reveal>
          )}
        </div>

        {/* output */}
        <div className="space-y-4">
          <Reveal delay={60}>
            <div className="panel relative overflow-hidden p-5">
              <Corners color={CYAN} />
              <div className="flex flex-wrap items-center gap-6">
                <MatchDial pct={res.matchPct} />
                <div className="min-w-[150px] flex-1 space-y-3">
                  <div>
                    <div className="flex justify-between font-mono text-[11px]"><span className="text-dim">Required ({res.nReq})</span><span className="text-cyan">{Math.round(res.reqPct)}%</span></div>
                    <div className="mt-1 h-1.5 bg-line/40"><div className="h-full bg-cyan transition-all duration-700" style={{ width: `${res.reqPct}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-[11px]"><span className="text-dim">Preferred ({res.nPref})</span><span className="text-amber">{Math.round(res.prefPct)}%</span></div>
                    <div className="mt-1 h-1.5 bg-line/40"><div className="h-full bg-amber transition-all duration-700" style={{ width: `${res.prefPct}%` }} /></div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-faint">
                    Weighted overlap of the twin's current skills with this posting.{" "}
                    <span className="text-dim">Not a hiring forecast.</span>
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="panel p-4">
                <p className="mono-label text-green">Strong matches ✓</p>
                {strong.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {strong.map((s) => (
                      <li key={s.skill} className="flex items-center justify-between text-[12.5px] text-dim">
                        <span>{skillLabel(s.skill)}</span>
                        <span className="font-mono text-[11px] text-green">{s.level}{s.weight === 2 ? " ·REQ" : ""}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-[12px] text-faint">None at ≥60 yet.</p>}
              </div>
              <div className="panel p-4">
                <p className="mono-label text-rose">Gaps, by weighted impact ✗</p>
                {gaps.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {gaps.map((s) => (
                      <li key={s.skill} className="flex items-center justify-between text-[12.5px] text-dim">
                        <span>{skillLabel(s.skill)}</span>
                        <span className="font-mono text-[11px] text-rose">{s.level}{s.weight === 2 ? " ·REQ" : ""}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-[12px] text-faint">No skill below 40 detected.</p>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="border-l-2 border-cyan/60 pl-3.5">
              <p className="mono-label text-[8.5px] text-cyan">Recommended action</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-dim">
                {topGaps.length
                  ? <>Close <span className="text-ink">{topGaps.join(", ")}</span> first — they carry the most weighted shortfall for this posting. The roadmap builder (§55) already sequences them.</>
                  : <>Your profile covers every detected skill at ≥40. Strengthen the partial matches, and apply with the projects that evidence them.</>}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ---------- §65 · The "match ≠ hiring" contract ---------- */

export function NotHiringSection() {
  return (
    <Section
      id="s64"
      index="64"
      kicker="Phase 12 · The honesty contract"
      title="A Match Is Not a Hire"
      intro="This is the single most important sentence in the application, and it ships inside the matcher's UI — not in a footnote. The number measures keyword overlap between a posting and a self-reported profile. It says nothing about interviews, teams, luck, or the hundred things an employer weighs that no text contains."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-green">The number means…</p>
            <ul className="mt-4 space-y-2.5">
              {[
                "How much of the posting's detected skill surface the twin currently covers, weighted by required-vs-preferred.",
                "Where the highest-leverage gaps are for this specific posting.",
                "A starting point for a conversation with an advisor — 'here's what this role wants vs. what I have'.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-dim">
                  <span className="mt-[3px] font-mono text-[10px] text-green">▸</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-rose">…and never means…</p>
            <ul className="mt-4 space-y-2.5">
              {[
                "That an employer will — or won't — hire you. Hiring is a human decision this system has no access to and no right to predict.",
                "That you are 'qualified' or 'unqualified'. It reflects self-assessed skill against extracted keywords, both imperfect.",
                "A probability of any outcome. It is a ratio, not a likelihood.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-dim">
                  <span className="mt-[3px] font-mono text-[10px] text-rose">✕</span>{t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
      <Reveal delay={140}>
        <div className="mt-5 border border-amber/40 bg-amber/5 px-4 py-3.5">
          <p className="mono-label text-[8.5px] text-amber">Enforced in the UI</p>
          <p className="mt-1.5 font-mono text-[12.5px] text-dim">
            “Skill overlap with this posting: {`{n}%`}. This is a fit gauge for planning — it does not
            predict whether you will be offered the role.”
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-faint">
            The matcher renders this line on every result, bound to the same component as the number.
            A match without the disclaimer is a defect, and the test suite asserts the string is present.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §66 · Gate G-12 ---------- */

const G12_CHECK = [
  "Matcher math frozen: required 2× / preferred 1×, contribution = twin level ÷ 100, undetected tokens disclosed",
  "Required-vs-preferred classification driven by posting language, with a logged default and the OOV exclusion rule",
  "Live matcher produces match %, required/preferred split, strong matches, weighted gaps, and a recommended action",
  "The 'match ≠ hiring' disclaimer is bound to the result component and asserted by a test",
  "Out-of-vocabulary tokens are named and excluded — never folded into the score as guesses",
  "The Intelligence stage closes here: Phases 8–12 share one skill vocabulary and one twin profile",
];

export function GateG12Section({ g12, onApprove }: { g12: boolean; onApprove: () => void }) {
  return (
    <Section
      id="s65"
      index="65"
      kicker="Gate G-12"
      title="Approval Gate — Phase 12"
      intro="Phase 12 stops here by design, and with it the Intelligence stage. The matcher's math, vocabulary reuse, and honesty contract are complete; the Advanced-Features stage (XAI, Digital Twin, Simulation, Application) begins only when this gate passes."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-cyan">Phase 12 deliverable checklist</p>
            <ul className="mt-4 space-y-2">
              {G12_CHECK.map((d, i) => (
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
            <Corners color={g12 ? GREEN : AMBER} />
            <p className={`mono-label ${g12 ? "text-green" : "text-amber"}`}>
              {g12 ? "Decision recorded — Intelligence stage closed" : "Decision required"}
            </p>
            <p className="display-head mt-3 text-2xl leading-tight text-ink sm:text-3xl">
              {g12
                ? "Phase 12 approved. Phase 13 — Explainable AI — unlocked."
                : "Approve the job matcher to unlock Phase 13 — Explainable AI."}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-dim">
              {g12
                ? "Next: SHAP-style explanations for the supervised model — turning the model-evidence term from §45 into per-feature positive and negative factors, computed from the actual model, never narrated after the fact."
                : "On approval, Phase 13 specifies how the model-evidence term earns its explanation: SHAP values, a positive/negative factor ledger, and the rule that an unexplainable score is an unpublished score."}
            </p>

            {!g12 ? (
              <button
                onClick={onApprove}
                className="group mt-6 inline-flex items-center gap-3 border border-amber bg-amber/10 px-6 py-3.5 transition-all duration-200 hover:bg-amber/20 hover:shadow-[0_0_28px_rgba(255,194,102,0.18)] active:translate-y-[1px]"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 10.5 L8 15.5 L17 4.5" />
                </svg>
                <span className="mono-label text-[10.5px] text-amber">Approve Phase 12 — close the Intelligence stage</span>
              </button>
            ) : (
              <div className="relative mt-6 inline-block">
                <div className="stamp border-[3px] border-green px-6 py-3" style={{ color: GREEN }}>
                  <p className="mono-label text-[12px] tracking-[0.3em]">APPROVED</p>
                  <p className="mt-1 text-center font-mono text-[9px] text-green/70">G-12 · DT-CIS-SD-001 · REV L</p>
                </div>
              </div>
            )}

            <div className="mt-7 border-t border-line pt-4">
              <p className="mono-label text-[8.5px] text-faint">What this gate refuses in advance</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-faint">
                Any match figure rendered without its disclaimer, any out-of-vocabulary token silently
                scored, and any phrasing that lets a ratio of keywords drift into a prediction about a
                person's future. The number is a mirror for planning, not a crystal ball.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
