import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GAP_CAREERS, GAP_SKILLS } from "../components/Phase9";
import { readinessFor, coverageFor, acadFor, interestFitFor, sysGaps, SKILL_ALIASES, type SysProfile } from "./profile";

/* ============================================================
   The Career Advisor — §9 of the design, now real.
   A deterministic intent engine that answers ONLY from the
   live twin: every number it speaks is computed at reply time.
   It refuses — out loud — to invent futures, hires or salaries.
   ============================================================ */

export interface Msg {
  role: "user" | "twin";
  text: string;
  chips?: string[];
  ts: string;
}

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SKILL_LABELS: Record<string, string> = Object.fromEntries(GAP_SKILLS.map((s) => [s.id, s.label]));

function findSkill(q: string): string | null {
  const t = q.toLowerCase();
  let best: { id: string; len: number } | null = null;
  for (const [id, aliases] of Object.entries(SKILL_ALIASES)) {
    for (const a of aliases) {
      if (t.includes(a) && (!best || a.length > best.len)) best = { id, len: a.length };
    }
  }
  return best?.id ?? null;
}

function findCareers(q: string): string[] {
  const t = q.toLowerCase();
  const hits: { id: string; score: number }[] = [];
  for (const c of GAP_CAREERS) {
    const words = c.name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const found = words.filter((w) => t.includes(w)).length;
    if (found > 0) hits.push({ id: c.id, score: found / words.length });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.filter((h) => h.score >= 0.5).map((h) => h.id);
}

const careerName = (id: string) => GAP_CAREERS.find((c) => c.id === id)?.name ?? id;

const PROJECTS = [
  { name: "SQL Analytics Dashboard", diff: 2, skills: ["sql", "data_analysis", "web_dev"], why: "fast portfolio win" },
  { name: "Student Performance Predictor", diff: 3, skills: ["python", "ml", "statistics"], why: "mirrors this system's own supervised task" },
  { name: "Churn Detector with SHAP Explanations", diff: 4, skills: ["ml", "python", "data_analysis"], why: "shows the model AND its reasons" },
  { name: "NLP Resume Screener", diff: 4, skills: ["nlp", "python"], why: "the exact pipeline you saw in the Resume Analyzer" },
  { name: "End-to-End MLOps Pipeline", diff: 5, skills: ["mlops", "cloud", "python"], why: "the strongest 'job-shaped' artifact" },
  { name: "Computer Vision Disease Detector", diff: 5, skills: ["cv", "deep_learning"], why: "deep-learning flagship" },
];

export interface Reply { text: string; chips: string[] }

export function answer(raw: string, p: SysProfile, userName: string): Reply {
  const q = raw.toLowerCase().trim();
  const target = p.targetCareer;
  const tName = careerName(target);
  const tRead = readinessFor(p, target);
  const ranked = GAP_CAREERS.map((c) => ({ c, r: readinessFor(p, c.id) })).sort((a, b) => b.r - a.r);

  /* --- refusals first: honesty before helpfulness --- */
  if (/(will i (get )?(hired|the job)|hire me|guarantee|promise me|my future|my destiny)/.test(q)) {
    return {
      text: `I won't do that — and the refusal is the feature.\nI model **your twin's arithmetic** against published career requirement vectors. I have no access to a hiring market, an employer, or a future. What I can tell you honestly: your readiness for **${tName}** is **${tRead.toFixed(1)}%**, and the gaps below are the highest-leverage things you control.`,
      chips: [`What am I missing for ${tName}?`, "What should I learn next?", "Show my readiness breakdown"],
    };
  }
  if (/(salary|pay|money|income|wage)/.test(q)) {
    return {
      text: "Out of scope, on purpose. Compensation depends on market, location, and negotiation — none of which live in your twin, so any number I gave would be invented. I stick to what the data supports: skills, gaps, and sequencing.",
      chips: ["What should I learn next?", "Which project should I build?"],
    };
  }
  if (/(personality|psycholog|what kind of person|am i smart)/.test(q)) {
    return {
      text: "I don't do personalities. Your twin stores **behavior** — skills, academics, projects — and behavior can change. A cluster centroid or a compatibility score is a description of recorded data at one moment, never a character verdict.",
      chips: ["Show my readiness breakdown", "What am I good at?"],
    };
  }

  /* --- greetings & help --- */
  if (/^(hi|hello|hey|salam|bonjour|hola|good (morning|afternoon|evening))\b/.test(q) || q === "hi") {
    return {
      text: `Hello **${userName}** — I'm your twin's voice. I read the same profile every page of this system reads, and I answer only from it.\nRight now: **${tName}** is your target at **${tRead.toFixed(1)}%** readiness, and your top match overall is **${careerName(ranked[0].c.id)}** (${ranked[0].r.toFixed(1)}%).`,
      chips: [`Why is ${careerName(ranked[0].c.id)} my top match?`, `What am I missing for ${tName}?`, "What should I learn next?", "What if I raise SQL to 80?"],
    };
  }
  if (/(what can you do|help|who are you|how do you work)/.test(q)) {
    return {
      text: `I answer questions **from your twin**, live:\n- **Why is X my top match?** — score decomposition, factor by factor\n- **What am I missing for X?** — weighted gaps against the career's requirement vector\n- **What should I learn next?** — the payoff-ranked, prerequisite-ordered sequence\n- **What if I raise SQL to 80?** — exact scenario deltas, attributed per skill\n- **Which project should I build?** — matched to your target and your weakest relevant skills\nAnything I can't ground in your data, I say so.`,
      chips: [`Why is ${careerName(ranked[0].c.id)} my top match?`, "What if I raise SQL to 80?", "Which project should I build?"],
    };
  }

  /* --- what-if simulation: parse ALL "skill … number" pairs --- */
  const simMatches = [...raw.toLowerCase().matchAll(/([a-z +/]{2,24}?)\s*(?:to|→|->|=|:)?\s*(\d{1,3})/g)]
    .map((m) => ({ id: findSkill(m[1]), v: Math.max(0, Math.min(100, Number(m[2]))) }))
    .filter((m) => m.id && m.v !== p.skills[m.id!]) as { id: string; v: number }[];
  if (/(what if|simulate|improve|raise|increase|if i (learn|get|reach)|bump)/.test(q) && simMatches.length > 0) {
    const hypothetical: SysProfile = { ...p, skills: { ...p.skills } };
    for (const m of simMatches) hypothetical.skills[m.id] = m.v;
    const before = readinessFor(p, target);
    const after = readinessFor(hypothetical, target);
    const lines = simMatches.map((m) => `- **${SKILL_LABELS[m.id]}**: ${p.skills[m.id]} → ${m.v}`).join("\n");
    const delta = after - before;
    const newRank = GAP_CAREERS.map((c) => ({ c, r: readinessFor(hypothetical, c.id) })).sort((a, b) => b.r - a.r);
    const climbed = newRank.findIndex((x) => x.c.id === target) < ranked.findIndex((x) => x.c.id === target);
    return {
      text: `Scenario replayed through the same §45 engine — read-only, your twin is untouched:\n${lines}\n**${tName}** readiness: **${before.toFixed(1)} → ${after.toFixed(1)}** (${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts)\n${climbed ? `It also **climbs the board** — to rank #${newRank.findIndex((x) => x.c.id === target) + 1} of 12.` : `Rank holds at #${ranked.findIndex((x) => x.c.id === target) + 1} — other careers moved with you.`}\nThis is a simulation of the formula, not a prediction of your life.`,
      chips: ["What should I learn next?", `What am I still missing for ${tName}?`, "Which project should I build?"],
    };
  }

  /* --- compare two careers --- */
  const careersMentioned = findCareers(q);
  if (/(compare|vs\.?|versus| or )/.test(q) && careersMentioned.length >= 2) {
    const [aId, bId] = [careersMentioned[0], careersMentioned[1]];
    const ra = readinessFor(p, aId);
    const rb = readinessFor(p, bId);
    const ca = GAP_CAREERS.find((c) => c.id === aId)!;
    const cb = GAP_CAREERS.find((c) => c.id === bId)!;
    const diffs = GAP_SKILLS.map((s) => {
      const wa = ca.req[s.id] ?? 0;
      const wb = cb.req[s.id] ?? 0;
      return { s, d: (p.skills[s.id] / 100) * (wa - wb) * 100 };
    })
      .filter((x) => Math.abs(x.d) > 1)
      .sort((x, y) => Math.abs(y.d) - Math.abs(x.d))
      .slice(0, 2);
    const winner = ra >= rb ? aId : bId;
    return {
      text: `**${careerName(aId)} ${ra.toFixed(1)}** vs **${careerName(bId)} ${rb.toFixed(1)}** — your twin favors **${careerName(winner)}**.\nDecisive skills:\n${diffs.map((d) => `- **${d.s.label}** (${p.skills[d.s.id]}): worth ${d.d > 0 ? "+" : ""}${d.d.toFixed(1)} pts more to ${careerName(aId)}`).join("\n")}`,
      chips: [`What am I missing for ${careerName(winner)}?`, `Why is ${careerName(winner)} my top match?`],
    };
  }

  /* --- why / top match / recommend --- */
  if (/(why|recommend|top match|best career|which career|good at|strong)/.test(q)) {
    const focusId = careersMentioned[0] ?? ranked[0].c.id;
    const focus = GAP_CAREERS.find((c) => c.id === focusId)!;
    const r = readinessFor(p, focusId);
    const cov = coverageFor(focusId, p.skills);
    const acad = acadFor(p.academics);
    const fit = interestFitFor(focusId, p.interests);
    const pos = Object.entries(focus.req)
      .map(([sid, w]) => ({ sid, w, v: p.skills[sid] ?? 0, c: ((Math.min(p.skills[sid] ?? 0, w * 100) / (w * 100)) * w * 100) }))
      .sort((a, b) => b.c - a.c)
      .slice(0, 3);
    const neg = Object.entries(focus.req)
      .map(([sid, w]) => ({ sid, w, miss: (1 - Math.min(p.skills[sid] ?? 0, w * 100) / (w * 100)) * w * 100 }))
      .sort((a, b) => b.miss - a.miss)
      .slice(0, 3);
    const den = Object.values(focus.req).reduce((a, w) => a + w * 100, 0);
    return {
      text: `**${focus.name}** scores **${r.toFixed(1)}** for you. Decomposition (model term absent, renormalized over 0.75):\n- skill coverage ${cov.toFixed(1)} → contributes **${((0.5 * cov) / 0.75).toFixed(1)}**\n- academics ${acad.toFixed(1)} → **${((0.15 * acad) / 0.75).toFixed(1)}**\n- interest fit ${fit.toFixed(1)} → **${((0.1 * fit) / 0.75).toFixed(1)}**\nCarrying it:\n${pos.map((x) => `- ✓ **${SKILL_LABELS[x.sid]}** at ${x.v} (weight ${x.w.toFixed(2)})`).join("\n")}\nHolding it back:\n${neg.map((x) => `- ✗ **${SKILL_LABELS[x.sid]}** — ${((x.miss / den) * 50).toFixed(1)} pts of coverage left on the table`).join("\n")}`,
      chips: [`What am I missing for ${focus.name}?`, "What should I learn next?", "Compare with Data Scientist"],
    };
  }

  /* --- missing / gaps --- */
  if (/(missing|gap|lack|weak|need to (learn|know)|what do i need)/.test(q)) {
    const focusId = careersMentioned[0] ?? target;
    const focus = GAP_CAREERS.find((c) => c.id === focusId)!;
    const gaps = sysGaps({ ...p, targetCareer: focusId })
      .filter((g) => g.gap > 0)
      .sort((a, b) => b.shortfall - a.shortfall)
      .slice(0, 5);
    if (gaps.length === 0) {
      return {
        text: `Nothing above zero — your profile already meets every requirement weight for **${focus.name}** at the levels it asks. The engine recommends nothing, which is itself a recommendation.`,
        chips: ["Which project should I build?", "Show my readiness breakdown"],
      };
    }
    const blocked = gaps.filter((g) => g.blockedBy.length > 0);
    return {
      text: `Against **${focus.name}**'s requirement vector, your biggest weighted shortfalls:\n${gaps.map((g) => `- **${g.label}**: ${g.current} → ${g.target} (gap ${g.gap} · weight ${g.weight.toFixed(2)} · **−${g.shortfall.toFixed(1)} pts**${g.blockedBy.length ? `, blocked behind ${g.blockedBy.join(" + ")}` : ""})`).join("\n")}\n${blocked.length ? `\n${blocked.length} of these won't pay off yet — prerequisites gate them. Build the foundations first.` : "All of these are actionable right now."}`,
      chips: ["What should I learn next?", `What if I raise ${gaps[0].label} to ${Math.min(100, gaps[0].current + 30)}?`],
    };
  }

  /* --- learn next --- */
  if (/(learn next|what next|next step|roadmap|where do i start|start with)/.test(q)) {
    const gaps = sysGaps(p).filter((g) => g.gap > 0 && g.blockedBy.length === 0).sort((a, b) => b.payoff - a.payoff).slice(0, 3);
    if (gaps.length === 0) {
      return { text: "No actionable gaps left for your target — the roadmap is empty by design. Time to build something and commit a snapshot.", chips: ["Which project should I build?"] };
    }
    return {
      text: `Your next moves, in payoff-per-effort order for **${tName}**:\n${gaps.map((g, i) => `${i + 1}. **${g.label}** ${g.current} → ${g.target} — removes **${g.shortfall.toFixed(1)} pts** of weighted shortfall, ≈${g.effortHours}h, payoff ${g.payoff.toFixed(2)} pts/h`).join("\n")}\nSequence matters: each is chosen only after its prerequisites sit ≥ 60.`,
      chips: [`What if I raise ${gaps[0].label} to ${Math.min(100, gaps[0].target)}?`, "Which project should I build?", "Show my readiness breakdown"],
    };
  }

  /* --- readiness breakdown --- */
  if (/(readiness|ready|score|breakdown|where am i|how am i doing|status)/.test(q)) {
    const acad = acadFor(p.academics);
    const cov = coverageFor(target, p.skills);
    const tech = GAP_CAREERS.find((c) => c.id === target)!;
    const tw = Object.entries(tech.req).reduce((a, [s, w]) => a + (p.skills[s] ?? 0) * w, 0) / Object.values(tech.req).reduce((a, w) => a + w, 0);
    const port = Math.min(100, p.portfolio.projects * 14 + p.portfolio.avgDiff * 9 + p.portfolio.certs * 7);
    return {
      text: `Your five live indicators (formulas in the Design Dossier, §71):\n- **Career Readiness ${tRead.toFixed(1)}** — (0.5·coverage + 0.15·academic + 0.10·interest) / 0.75\n- **Skill Coverage ${cov.toFixed(1)}** — capped progress toward ${tName}'s requirements\n- **Technical Readiness ${tw.toFixed(1)}** — requirement-weighted mean of your levels\n- **Academic Readiness ${acad.toFixed(1)}** — 0.5·GPA + 0.3·attendance + 0.2·assignments\n- **Portfolio Strength ${port.toFixed(1)}** — ${p.portfolio.projects} projects, avg difficulty ${p.portfolio.avgDiff}, ${p.portfolio.certs} certs`,
      chips: [`What am I missing for ${tName}?`, "What should I learn next?", `Why is ${careerName(ranked[0].c.id)} my top match?`],
    };
  }

  /* --- projects --- */
  if (/(project|build|portfolio|make something|ship)/.test(q)) {
    const req = GAP_CAREERS.find((c) => c.id === target)!.req;
    const scored = PROJECTS.map((pr) => {
      const relevance = pr.skills.reduce((a, s) => a + (req[s] ?? 0), 0);
      const need = pr.skills.reduce((a, s) => a + Math.max(0, 70 - (p.skills[s] ?? 0)) * (req[s] ?? 0), 0);
      return { pr, score: relevance * 2 + need };
    }).sort((a, b) => b.score - a.score).slice(0, 3);
    return {
      text: `For **${tName}**, ranked by career relevance × the skills you most need:\n${scored.map(({ pr }, i) => `${i + 1}. **${pr.name}** ${"★".repeat(pr.diff)}${"☆".repeat(5 - pr.diff)} — trains ${pr.skills.map((s) => SKILL_LABELS[s]).join(", ")}; ${pr.why}`).join("\n")}\nRule of thumb: one difficulty step above your portfolio average (${p.portfolio.avgDiff}) — stretch, don't drown.`,
      chips: ["What should I learn next?", `What am I missing for ${tName}?`],
    };
  }

  /* --- resume / job pointers --- */
  if (/(resume|cv\b)/.test(q)) {
    return {
      text: "Paste your CV in the **Resume Analyzer** — the extractor runs right here on-device, counts evidence per skill, and hands you **Adopt** buttons to pull verified claims into the twin. Then ask me again; I'll speak from the updated profile.",
      chips: ["What should I learn next?", "Show my readiness breakdown"],
    };
  }
  if (/(job|posting|vacancy|apply|match this jd)/.test(q)) {
    return {
      text: "The **Job Matcher** takes a pasted posting: required skills weigh double, preferred weigh one, and unmapped tools are disclosed, not guessed. Remember the seal on that page — *a match is not a hire.*",
      chips: [`What am I missing for ${tName}?`, "What should I learn next?"],
    };
  }

  /* --- fallback: honest limits --- */
  return {
    text: `I can only answer from your twin's data — and that question isn't grounded in it. Try me on:\n- why a career ranks where it does for you\n- what's missing for any of the 12 careers\n- what to learn next, and what to build\n- what-if scenarios with skill targets`,
    chips: [`Why is ${careerName(ranked[0].c.id)} my top match?`, `What am I missing for ${tName}?`, "What if I raise SQL to 80?", "Which project should I build?"],
  };
}

/* ============================================================
   The conversation surface — shared by the full page and the
   floating overlay, so the twin keeps listening everywhere.
   ============================================================ */

export function AdvisorPanel({
  messages,
  typing,
  send,
  variant,
  onClose,
}: {
  messages: Msg[];
  typing: boolean;
  send: (text: string) => void;
  variant: "page" | "overlay";
  onClose?: () => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  const lastChips = [...messages].reverse().find((m) => m.role === "twin")?.chips ?? [];

  const submit = () => {
    const t = draft.trim();
    if (!t || typing) return;
    setDraft("");
    send(t);
  };

  const isPage = variant === "page";

  return (
    <div className={`flex h-full flex-col ${isPage ? "border border-line bg-base/50" : ""}`}>
      {/* transcript */}
      <div className={`no-scrollbar flex-1 space-y-4 overflow-y-auto ${isPage ? "p-5 sm:p-7" : "p-4"}`}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`msgin max-w-[88%] border px-3.5 py-3 sm:max-w-[78%] ${
                m.role === "user"
                  ? "border-cyan/40 bg-cyan/[0.07]"
                  : "border-line bg-[#0c1830]/80"
              }`}
            >
              {m.role === "twin" && (
                <p className="mono-label mb-1.5 flex items-center gap-1.5 text-[7.5px] text-green">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green" />
                  </span>
                  TWIN · GROUNDED IN YOUR PROFILE
                </p>
              )}
              <RichText text={m.text} />
              <p className="mt-1.5 text-right font-mono text-[8px] text-faint">{m.ts}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="msgin flex items-center gap-1.5 border border-line bg-[#0c1830]/80 px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-cyan" style={{ animation: `blinkc 0.9s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
              <span className="mono-label ml-2 text-[8px] text-faint">COMPUTING FROM TWIN…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* chips + input */}
      <div className={`border-t border-line ${isPage ? "p-4 sm:p-5" : "p-3"}`}>
        {lastChips.length > 0 && (
          <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {lastChips.map((c) => (
              <button
                key={c}
                onClick={() => !typing && send(c)}
                disabled={typing}
                className="mono-label shrink-0 border border-line px-2.5 py-1.5 text-[8.5px] text-dim transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/60 hover:text-cyan disabled:opacity-40"
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder='Try "What am I missing for ML Engineer?"'
            className="min-w-0 flex-1 border border-line bg-base/60 px-3.5 py-2.5 font-mono text-[12.5px] text-ink outline-none transition-all duration-200 placeholder:text-faint/60 focus:border-cyan focus:shadow-[0_0_0_1px_rgba(107,225,255,0.3)]"
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || typing}
            className="mono-label border border-cyan bg-cyan/10 px-4 text-[9.5px] text-cyan transition-all duration-200 hover:bg-cyan/25 hover:shadow-[0_0_18px_rgba(107,225,255,0.2)] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ASK ▸
          </button>
          {!isPage && onClose && (
            <button
              onClick={onClose}
              aria-label="Close advisor"
              className="mono-label border border-line px-3 text-[9px] text-faint transition-colors hover:border-rose hover:text-rose"
            >
              ✕
            </button>
          )}
        </div>
        <p className="mt-2 font-mono text-[8.5px] leading-relaxed text-faint">
          deterministic · on-device · answers cite your live twin{isPage && (
            <> · the full explanation lives in the <Link to="/xai" className="text-cyan hover:underline">Design Dossier</Link></>
          )}
        </p>
      </div>
    </div>
  );
}

/* tiny renderer: **bold** + lines */
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-1 text-[12.5px] leading-relaxed text-dim">
      {text.split("\n").map((line, i) => (
        <p key={i} className={line.startsWith("- ") ? "pl-3" : ""}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="font-semibold text-ink">{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}
