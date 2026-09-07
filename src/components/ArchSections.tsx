import { useState } from "react";
import { ARCHITECTURE, ARCH_NOTES, DB_TABLES, STACK, NON_CHOICES, DIFFICULTY, DIFFICULTY_SUMMARY } from "../data/design";
import { Section, Reveal, Tag, DiffBlocks } from "./ui";

/* ---------- 07 · Architecture ---------- */
export function ArchSection() {
  const [hot, setHot] = useState<string | null>(null);

  return (
    <Section
      id="s07"
      index="07"
      kicker="Deliverable 8"
      title="System Architecture"
      intro="Four layers, one process. Hover a layer to read its contract; the side ledger records what was deliberately left out."
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* stack diagram */}
        <div>
          {ARCHITECTURE.map((l, i) => (
            <Reveal key={l.code} delay={i * 90}>
              <div
                onMouseEnter={() => setHot(l.code)}
                onMouseLeave={() => setHot(null)}
                className={`panel relative transition-all duration-300 ${hot === l.code ? "border-cyan/60 bg-panel2" : ""}`}
              >
                <div className="flex items-center gap-3 border-b border-line/70 px-5 py-3">
                  <span className="font-mono text-[11px] font-semibold text-cyan">{l.code}</span>
                  <span className="display-head text-[17px] text-ink">{l.name}</span>
                  <span className="mono-label ml-auto hidden text-[8.5px] text-faint sm:block">{l.tech}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-5 py-3.5">
                  {l.boxes.map((b) => (
                    <span
                      key={b}
                      className={`border border-line bg-deep px-2.5 py-1 font-mono text-[11px] transition-colors duration-200 ${hot === l.code ? "border-line2 text-ink" : "text-dim"}`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: hot === l.code ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-line/60 px-5 py-3 text-[12.5px] leading-relaxed text-dim">
                      {l.note}
                    </p>
                  </div>
                </div>
              </div>
              {i < ARCHITECTURE.length - 1 && (
                <div className="flex justify-center py-1.5" aria-hidden="true">
                  <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                    <path d="M7 0 V16 M2 12 L7 18 L12 12" stroke="#2b6b85" strokeWidth="1.5" />
                  </svg>
                </div>
              )}
            </Reveal>
          ))}
        </div>

        {/* side ledger */}
        <div className="space-y-4">
          {ARCH_NOTES.map((n, i) => (
            <Reveal key={n.k} delay={i * 90 + 60}>
              <div className="panel panel-hover p-5">
                <p className="mono-label text-amber">{n.k}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-dim">{n.v}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={340}>
            <div className="border border-dashed border-line2 p-5">
              <p className="mono-label text-faint">Data-flow invariant</p>
              <p className="mt-2 font-mono text-[12px] leading-relaxed text-dim">
                UI <span className="text-cyan">→</span> L2 services <span className="text-cyan">→</span> L3
                ML services <span className="text-cyan">→</span> L4 artifacts.
                <br />
                <span className="text-faint">UI never touches L4 directly. Enforced by tests.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ---------- 08 · Database ---------- */
const GROUP_COLOR: Record<string, "cyan" | "green" | "amber" | "rose" | "dim"> = {
  CORE: "cyan",
  CAREER: "green",
  ACADEMIC: "amber",
  PORTFOLIO: "amber",
  TWIN: "cyan",
  ML: "rose",
};

export function DbSection() {
  return (
    <Section
      id="s08"
      index="08"
      kicker="Deliverable 9"
      title="Database Design"
      intro="SQLite, fourteen tables, normalized where it earns its keep. PK / FK / UQ marked; JSON columns only where the shape is genuinely variable."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DB_TABLES.map((t, i) => (
          <Reveal key={t.name} delay={(i % 3) * 70}>
            <div className="panel panel-hover h-full p-4">
              <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
                <p className="font-mono text-[13px] font-semibold text-ink">{t.name}</p>
                <Tag tone={GROUP_COLOR[t.group] ?? "dim"}>{t.group}</Tag>
              </div>
              <ul className="mt-2.5 space-y-1">
                {t.cols.map((c) => (
                  <li key={c.n} className="flex items-baseline justify-between gap-2 font-mono text-[11.5px]">
                    <span className="text-dim">
                      {c.k && (
                        <span className={`mr-1.5 text-[9px] ${c.k === "PK" ? "text-amber" : c.k === "FK" ? "text-cyan" : "text-green"}`}>
                          {c.k}
                        </span>
                      )}
                      {c.n}
                    </span>
                    <span className="text-faint">{c.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <p className="mt-6 font-mono text-[12px] leading-relaxed text-faint">
          <span className="text-cyan">Relations:</span> students 1—N student_skills N—1 skills · careers 1—N
          career_requirements N—1 skills · students 1—N predictions · students 1—N simulation_runs · every
          mutation mirrored into audit_log. <span className="text-amber">student_skills carries source ∈ {'{'}self, resume, advisor{'}'} so provenance is always known.</span>
        </p>
      </Reveal>
    </Section>
  );
}

/* ---------- 09 · Stack ---------- */
export function StackSection() {
  return (
    <Section
      id="s09"
      index="09"
      kicker="Deliverable 10"
      title="Technology Stack"
      intro="Everything below was chosen for a reason; the second table records what was rejected, and why. A stack is defined as much by its nos as by its yeses."
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {STACK.map((g, i) => (
            <Reveal key={g.group} delay={(i % 2) * 80}>
              <div className="panel panel-hover h-full p-5">
                <p className="mono-label text-cyan">{g.group}</p>
                <ul className="mt-3 space-y-2.5">
                  {g.items.map((it) => (
                    <li key={it.n} className="flex items-baseline gap-2">
                      <span className="mt-[5px] inline-block h-1.5 w-1.5 shrink-0 bg-cyan/70" />
                      <span className="font-mono text-[12.5px] font-medium text-ink">{it.n}</span>
                      <span className="text-[12px] text-faint">— {it.r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={140}>
          <div className="panel relative h-full border-rose/30 p-5">
            <p className="mono-label text-rose">Explicit non-choices</p>
            <ul className="mt-4 space-y-4">
              {NON_CHOICES.map((n) => (
                <li key={n.n} className="border-l-2 border-rose/50 pl-3">
                  <p className="font-mono text-[12.5px] font-medium text-ink">
                    <span className="mr-2 text-rose">✕</span>
                    {n.n}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-dim">{n.r}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- 10 · Difficulty ---------- */
export function DifficultySection() {
  const totalWeeks = DIFFICULTY.reduce((s, d) => s + d.weeks, 0);

  return (
    <Section
      id="s10"
      index="10"
      kicker="Deliverable 11"
      title="Project Difficulty & Effort"
      intro="Estimated solo, per subsystem. The distribution tells the real story: the dangerous weeks are data and NLP, not the models."
    >
      <Reveal>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border border-line text-left">
            <thead>
              <tr className="bg-panel2/80">
                <th className="mono-label border-b border-line px-4 py-3 text-[9px] text-faint">Subsystem</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-faint">Difficulty</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-faint">Weeks</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-faint">Hardest part</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-faint">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {DIFFICULTY.map((d, i) => (
                <tr key={d.part} className={`transition-colors duration-200 hover:bg-panel2/60 ${i % 2 ? "bg-panel/40" : ""}`}>
                  <td className="border-b border-line/70 px-4 py-3.5 font-display text-[14px] font-semibold text-ink">{d.part}</td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5">
                    <DiffBlocks n={d.diff} />
                  </td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5 font-mono text-[12.5px] text-cyan">{d.weeks.toFixed(1)}</td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5 text-[13px] leading-relaxed text-dim">{d.hard}</td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5 text-[13px] leading-relaxed text-dim">{d.fix}</td>
                </tr>
              ))}
              <tr className="bg-panel2/80">
                <td className="px-4 py-3.5 font-display text-[14px] font-bold text-amber">TOTAL</td>
                <td className="border-l border-line/70 px-4 py-3.5 font-mono text-[11px] text-faint">≈ upper-undergrad</td>
                <td className="border-l border-line/70 px-4 py-3.5 font-mono text-[13px] font-semibold text-amber">~{totalWeeks.toFixed(1)}</td>
                <td colSpan={2} className="border-l border-line/70 px-4 py-3.5 text-[13px] text-dim">with a 15–20% contingency understood, not written into each row</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-6 max-w-3xl border-l-2 border-amber pl-4 text-[14px] leading-relaxed text-dim">
          {DIFFICULTY_SUMMARY}
        </p>
      </Reveal>
    </Section>
  );
}
