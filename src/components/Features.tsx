import { useMemo, useState } from "react";
import { FEATURES, type Layer } from "../data/design";
import { Section, Reveal, PriorityTag, LayerTag } from "./ui";

const LAYERS: ("ALL" | Layer)[] = ["ALL", "DATA", "ML", "NLP", "REC", "APP"];

export default function FeaturesSection() {
  const [filter, setFilter] = useState<"ALL" | Layer>("ALL");
  const [open, setOpen] = useState<string | null>("F-02");

  const rows = useMemo(
    () => (filter === "ALL" ? FEATURES : FEATURES.filter((f) => f.layer === filter)),
    [filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: FEATURES.length };
    FEATURES.forEach((f) => (c[f.layer] = (c[f.layer] ?? 0) + 1));
    return c;
  }, []);

  return (
    <Section
      id="s04"
      index="04"
      kicker="Deliverable 5"
      title="Complete Feature List"
      intro="Sixteen modules, frozen after this phase. Every row carries a MoSCoW priority, its delivery phase, the ML task it rides on, and an honesty clause — the sentence that keeps it defensible."
    >
      {/* filter rail */}
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mono-label mr-1 text-faint">Filter:</span>
          {LAYERS.map((l) => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`mono-label border px-3 py-1.5 text-[9.5px] transition-all duration-200 ${
                filter === l
                  ? "border-cyan bg-cyan/10 text-cyan"
                  : "border-line text-faint hover:border-line2 hover:text-dim"
              }`}
            >
              {l} <span className="ml-1 opacity-60">{counts[l] ?? 0}</span>
            </button>
          ))}
          <span className="mono-label ml-auto hidden text-faint sm:block">
            CLICK ROW FOR DETAIL
          </span>
        </div>
      </Reveal>

      {/* ledger */}
      <div className="border border-line">
        {rows.map((f, i) => {
          const isOpen = open === f.id;
          return (
            <Reveal key={f.id} delay={Math.min(i * 40, 240)}>
              <div
                className={`border-b border-line/70 transition-colors duration-200 ${
                  isOpen ? "bg-panel2/80" : "bg-panel/40 hover:bg-panel/80"
                } ${i === rows.length - 1 ? "border-b-0" : ""}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : f.id)}
                  className="grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 px-4 py-3.5 text-left sm:grid-cols-[52px_1fr_150px_90px_70px_24px] sm:gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-mono text-xs font-semibold text-cyan">{f.id}</span>
                  <span className="font-display text-[15px] font-semibold text-ink">{f.name}</span>
                  <span className="hidden sm:block">
                    <LayerTag l={f.layer} />
                  </span>
                  <span className="hidden sm:block">
                    <PriorityTag p={f.priority} />
                  </span>
                  <span className="hidden text-right font-mono text-[11px] text-faint sm:block">
                    PH {f.phase}
                  </span>
                  <svg
                    viewBox="0 0 16 16"
                    className={`h-3.5 w-3.5 justify-self-end text-faint transition-transform duration-300 ${isOpen ? "rotate-45 text-cyan" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M8 3 V13 M3 8 H13" />
                  </svg>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-4 px-4 pb-5 pt-1 sm:grid-cols-3 sm:px-[76px]">
                      <div>
                        <p className="mono-label text-[8.5px] text-faint">Summary</p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{f.summary}</p>
                      </div>
                      <div>
                        <p className="mono-label text-[8.5px] text-faint">ML / technical task</p>
                        <p className="mt-1.5 font-mono text-[12px] text-cyan">{f.mlTask}</p>
                        <p className="mono-label mt-3 text-[8.5px] text-faint sm:hidden">Priority / Phase</p>
                        <p className="mt-1 flex gap-2 sm:hidden">
                          <PriorityTag p={f.priority} />
                          <LayerTag l={f.layer} />
                          <span className="font-mono text-[11px] text-faint">PH {f.phase}</span>
                        </p>
                      </div>
                      <div className="border-l-2 border-amber/60 pl-3">
                        <p className="mono-label text-[8.5px] text-amber">Honesty clause</p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{f.honesty}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
