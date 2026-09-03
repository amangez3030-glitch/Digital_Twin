import {
  PROBLEM,
  MAIN_OBJECTIVE,
  OBJECTIVES,
  USERS,
  ETHICS,
  DIFF_ROWS,
} from "../data/design";
import { Section, Reveal, Tag, Corners, Glyph } from "./ui";

/* ---------- 01 · Problem ---------- */
export function ProblemSection() {
  return (
    <Section id="s01" index="01" kicker="Deliverable 1" title="Final Problem Statement">
      <Reveal>
        <blockquote className="relative">
          <p className="display-head max-w-4xl text-2xl leading-snug text-ink sm:text-[1.9rem]">
            <span className="text-cyan">“</span>
            {PROBLEM.headline}
            <span className="text-cyan">”</span>
          </p>
        </blockquote>
      </Reveal>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Reveal delay={80}>
          <div className="space-y-4">
            {PROBLEM.paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-dim">
                {p}
              </p>
            ))}
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div className="panel relative h-full p-6">
            <Corners color="#ffc266" />
            <p className="mono-label text-amber">Research question</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">{PROBLEM.question}</p>
            <p className="mt-4 border-t border-line pt-3 font-mono text-[11px] text-faint">
              Scope note: “twin” here means a versioned feature vector with journaled mutations —
              not a consciousness, not a simulation of a person. The word is kept because it is the
              project's identity; the definition is kept honest.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- 02 · Objectives ---------- */
export function ObjectivesSection() {
  return (
    <Section
      id="s02"
      index="02"
      kicker="Deliverable 2 + 3"
      title="Main & Specific Objectives"
      intro="One main objective, nine specific ones — each with an acceptance measure so ‘done’ is verifiable, not a feeling."
    >
      <Reveal>
        <div className="panel relative p-6 sm:p-7">
          <Corners />
          <p className="mono-label text-cyan">Main objective — O-0</p>
          <p className="display-head mt-3 text-xl leading-snug text-ink sm:text-2xl">{MAIN_OBJECTIVE}</p>
        </div>
      </Reveal>
      <div className="mt-8 space-y-px">
        {OBJECTIVES.map((o, i) => (
          <Reveal key={o.id} delay={i * 50}>
            <div className="group grid gap-2 border border-line bg-panel/60 p-4 transition-colors duration-200 hover:border-line2 hover:bg-panel2/70 sm:grid-cols-[64px_1fr_260px] sm:gap-5">
              <span className="font-mono text-sm font-semibold text-cyan">{o.id}</span>
              <p className="text-[14.5px] leading-relaxed text-dim group-hover:text-ink transition-colors duration-200">
                {o.text}
              </p>
              <p className="mono-label self-center text-left text-[9px] text-faint sm:text-right">
                ✓ measured by: <span className="text-green">{o.measure}</span>
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 03 · Users ---------- */
export function UsersSection() {
  return (
    <Section
      id="s03"
      index="03"
      kicker="Deliverable 4"
      title="Target Users"
      intro="Three audiences, three different contracts. The evaluator is listed on purpose: a system that cannot survive its own defense is not finished."
    >
      <div className="space-y-4">
        {USERS.map((u, i) => (
          <Reveal key={u.code} delay={i * 90}>
            <div className="panel panel-hover relative grid gap-5 p-6 md:grid-cols-[220px_1fr]">
              {i === 0 && <Corners />}
              <div>
                <p className="font-mono text-xs text-faint">{u.code}</p>
                <p className="display-head mt-1 text-xl text-ink">{u.who}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {u.needs.map((n) => (
                    <Tag key={n} tone={i === 0 ? "cyan" : i === 1 ? "green" : "amber"}>
                      {n}
                    </Tag>
                  ))}
                </div>
              </div>
              <p className="self-center text-[14.5px] leading-relaxed text-dim">{u.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 12 · Ethics ---------- */
const ETHIC_GLYPHS = ["shield", "scale", "eye", "wave", "key", "split", "doc", "card"];

export function EthicsSection() {
  return (
    <Section
      id="s12"
      index="12"
      kicker="Deliverable 13"
      title="Ethical Considerations"
      intro="This system speaks about people's futures, so its ethics are enforced in the design — not appended in the report's last paragraph."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {ETHICS.map((e, i) => (
          <Reveal key={e.code} delay={(i % 2) * 90}>
            <div className="panel panel-hover group h-full p-5">
              <div className="flex items-center gap-3">
                <span className="text-cyan transition-transform duration-300 group-hover:scale-110">
                  <Glyph kind={ETHIC_GLYPHS[i % ETHIC_GLYPHS.length]} className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-mono text-[10px] text-faint">{e.code}</p>
                  <p className="display-head text-[17px] text-ink">{e.title}</p>
                </div>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-dim">{e.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 13 · Differentiation ---------- */
export function DiffSection() {
  return (
    <Section
      id="s13"
      index="13"
      kicker="Deliverable 14"
      title="Why This Is Not an Ordinary Career Recommender"
      intro="Side by side with the typical final-year project: a quiz, a score, a shrug."
    >
      <Reveal>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border border-line text-left">
            <thead>
              <tr className="bg-panel2/80">
                <th className="mono-label border-b border-line px-4 py-3 text-[9px] text-faint">Aspect</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-faint">Typical student project</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-amber">DT-CIS (this system)</th>
              </tr>
            </thead>
            <tbody>
              {DIFF_ROWS.map((r, i) => (
                <tr
                  key={r.aspect}
                  className={`transition-colors duration-200 hover:bg-panel2/60 ${i % 2 ? "bg-panel/40" : ""}`}
                >
                  <td className="border-b border-line/70 px-4 py-3.5 font-display text-[14px] font-semibold text-ink">
                    {r.aspect}
                  </td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5 text-[13.5px] text-faint">
                    {r.typical}
                  </td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5 text-[13.5px] leading-relaxed text-dim">
                    <span className="mr-2 text-green">▸</span>
                    {r.this_}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-6 max-w-3xl border-l-2 border-green pl-4 text-[14px] leading-relaxed text-dim">
          The honest summary: most projects in this space <span className="text-ink">predict a label</span>.
          This one <span className="text-ink">maintains an evidence trail</span> — a twin the student can
          inspect, correct, project forward, and defend row by row in a viva.
        </p>
      </Reveal>
    </Section>
  );
}
