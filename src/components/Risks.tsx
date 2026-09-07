import { useState } from "react";
import { RISKS } from "../data/design";
import { Section, Reveal, Tag } from "./ui";

function severity(l: number, i: number) {
  const s = l * i;
  if (s >= 15) return { label: "SEVERE", color: "#ff8b8b", bg: "rgba(255,139,139,0.16)" };
  if (s >= 8) return { label: "HIGH", color: "#ffc266", bg: "rgba(255,194,102,0.13)" };
  return { label: "MODERATE", color: "#7ce7a5", bg: "rgba(124,231,165,0.10)" };
}

export default function RiskSection() {
  const [sel, setSel] = useState<string>("R-1");
  const risk = RISKS.find((r) => r.id === sel) ?? RISKS[0];
  const sev = severity(risk.likelihood, risk.impact);

  return (
    <Section
      id="s11"
      index="11"
      kicker="Deliverable 12"
      title="Major Risks"
      intro="Plotted on a 5 × 5 likelihood–impact grid. Click any marker — every risk carries a mitigation that is a design decision, not a hope."
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* matrix */}
        <Reveal>
          <div className="panel p-5 sm:p-6">
            <p className="mono-label mb-4 text-faint">Risk register — likelihood ↑ × impact →</p>
            <div className="flex gap-3">
              {/* y axis labels */}
              <div className="grid w-5 shrink-0 grid-rows-5 font-mono text-[10px] text-faint">
                {[5, 4, 3, 2, 1].map((n) => (
                  <span key={n} className="flex items-center justify-end pr-1">{n}</span>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-5 gap-1">
                {[5, 4, 3, 2, 1].map((l) =>
                  [1, 2, 3, 4, 5].map((i) => {
                    const cell = severity(l, i);
                    const here = RISKS.filter((r) => r.likelihood === l && r.impact === i);
                    return (
                      <div
                        key={`${l}-${i}`}
                        className="relative flex aspect-square items-center justify-center gap-1 border border-line/60"
                        style={{ background: cell.bg }}
                      >
                        {here.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setSel(r.id)}
                            title={`${r.id} — ${r.title}`}
                            className={`mono-label flex h-7 w-9 items-center justify-center border text-[8.5px] transition-all duration-200 hover:scale-110 ${
                              sel === r.id ? "scale-110" : ""
                            }`}
                            style={{
                              borderColor: severity(r.likelihood, r.impact).color,
                              color: severity(r.likelihood, r.impact).color,
                              background: sel === r.id ? "rgba(8,17,32,0.9)" : "rgba(8,17,32,0.55)",
                            }}
                          >
                            {r.id}
                          </button>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            {/* x axis labels */}
            <div className="mt-2 flex pl-8 font-mono text-[10px] text-faint">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="w-full text-center">{n}</span>
              ))}
            </div>
            {/* legend */}
            <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-3">
              {(["SEVERE", "HIGH", "MODERATE"] as const).map((lab) => {
                const c = lab === "SEVERE" ? "#ff8b8b" : lab === "HIGH" ? "#ffc266" : "#7ce7a5";
                return (
                  <span key={lab} className="flex items-center gap-1.5 font-mono text-[10px] text-faint">
                    <span className="inline-block h-2 w-2" style={{ background: c }} /> {lab}
                  </span>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* inspector + list */}
        <div>
          <Reveal delay={100}>
            <div className="panel relative p-5" style={{ borderColor: `${sev.color}55` }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-semibold" style={{ color: sev.color }}>{risk.id}</span>
                <Tag tone={sev.label === "SEVERE" ? "rose" : sev.label === "HIGH" ? "amber" : "green"}>
                  {sev.label} · {risk.likelihood}×{risk.impact}
                </Tag>
              </div>
              <p className="display-head mt-2 text-xl text-ink">{risk.title}</p>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-dim">{risk.detail}</p>
              <div className="mt-3 border-l-2 pl-3" style={{ borderColor: sev.color }}>
                <p className="mono-label text-[8.5px]" style={{ color: sev.color }}>Mitigation — design decision</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink">{risk.mitigation}</p>
              </div>
            </div>
          </Reveal>
          <div className="mt-4 space-y-1">
            {RISKS.map((r, i) => {
              const s = severity(r.likelihood, r.impact);
              return (
                <Reveal key={r.id} delay={i * 40}>
                  <button
                    onClick={() => setSel(r.id)}
                    className={`flex w-full items-center gap-3 border px-3.5 py-2.5 text-left transition-all duration-200 ${
                      sel === r.id ? "border-line2 bg-panel2" : "border-line/70 bg-panel/40 hover:bg-panel"
                    }`}
                  >
                    <span className="inline-block h-2 w-2 shrink-0" style={{ background: s.color }} />
                    <span className="font-mono text-[11px] text-faint">{r.id}</span>
                    <span className={`truncate text-[13px] ${sel === r.id ? "text-ink" : "text-dim"}`}>{r.title}</span>
                    <span className="ml-auto font-mono text-[10px] text-faint">{r.likelihood}×{r.impact}</span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
