import { MODELS, ML_PIPELINE, DATASETS, DATA_HONESTY } from "../data/design";
import { Section, Reveal, Tag, Corners } from "./ui";

/* ---------- 05 · ML / DL / NLP components ---------- */
export function MLSection() {
  return (
    <Section
      id="s05"
      index="05"
      kicker="Deliverable 6"
      title="ML / DL / NLP Components"
      intro="Six model candidates enter; evidence decides who stays. The pipeline below is the contract every experiment in Phases 5–7 must obey."
    >
      {/* model candidates */}
      <Reveal>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border border-line text-left">
            <thead>
              <tr className="bg-panel2/80">
                <th className="mono-label border-b border-line px-4 py-3 text-[9px] text-faint">Model</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-faint">Family</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-faint">Role in comparison</th>
                <th className="mono-label border-b border-l border-line px-4 py-3 text-[9px] text-faint">Evidence required</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m, i) => (
                <tr key={m.name} className={`transition-colors duration-200 hover:bg-panel2/60 ${i % 2 ? "bg-panel/40" : ""}`}>
                  <td className="border-b border-line/70 px-4 py-3.5 font-display text-[14.5px] font-semibold text-ink">
                    {m.name}
                  </td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5 font-mono text-[11.5px] text-cyan">
                    {m.family}
                  </td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5 text-[13.5px] leading-relaxed text-dim">
                    {m.role}
                  </td>
                  <td className="border-b border-l border-line/70 px-4 py-3.5 text-[13.5px] leading-relaxed text-dim">
                    {m.evidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* metrics strip */}
      <Reveal delay={100}>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mono-label text-faint">Reported for every candidate:</span>
          {["Accuracy", "Precision", "Recall", "Macro-F1", "ROC-AUC (OvR)", "Confusion matrix", "5-fold CV variance"].map((m) => (
            <Tag key={m} tone="cyan">{m}</Tag>
          ))}
        </div>
      </Reveal>

      {/* pipeline contract */}
      <div className="mt-10">
        <Reveal>
          <p className="mono-label text-cyan">The evaluation contract</p>
        </Reveal>
        <div className="mt-4 grid gap-px bg-line/60 sm:grid-cols-5">
          {ML_PIPELINE.map((p, i) => (
            <Reveal key={p.step} delay={i * 80}>
              <div className="group h-full bg-panel p-4 transition-colors duration-200 hover:bg-panel2">
                <p className="font-mono text-[10px] text-faint">{String(i + 1).padStart(2, "0")}</p>
                <p className="display-head mt-1.5 text-[15px] text-ink">{p.step}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-dim">{p.note}</p>
                <div className="mt-3 h-[2px] w-6 bg-cyan/60 transition-all duration-300 group-hover:w-full" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------- 06 · Datasets ---------- */
export function DatasetSection() {
  return (
    <Section
      id="s06"
      index="06"
      kicker="Deliverable 7"
      title="Dataset Requirements"
      intro="Candidates, not commitments. Every source is verified for license and limits in Phase 2 before a single row is loaded — and the central honesty problem is named up front."
    >
      {/* honesty banner */}
      <Reveal>
        <div className="panel relative mb-8 border-amber/40 p-5 sm:p-6">
          <Corners color="#ffc266" />
          <p className="mono-label text-amber">The problem every dishonest project hides</p>
          <p className="mt-2.5 max-w-4xl text-[14.5px] leading-relaxed text-dim">{DATA_HONESTY}</p>
        </div>
      </Reveal>

      {/* dataset cards */}
      <div className="space-y-4">
        {DATASETS.map((d, i) => (
          <Reveal key={d.name} delay={i * 60}>
            <div className="panel panel-hover grid gap-4 p-5 lg:grid-cols-[280px_1fr]">
              <div>
                <p className="font-mono text-[10px] text-faint">DS-{String(i + 1).padStart(2, "0")}</p>
                <p className="display-head mt-1 text-[17px] leading-tight text-ink">{d.name}</p>
                <div className="mt-3 space-y-1.5 font-mono text-[11px]">
                  <p><span className="text-faint">SRC</span> <span className="text-dim">{d.source}</span></p>
                  <p><span className="text-faint">LIC</span> <span className={d.license.includes("MUST") ? "text-amber" : "text-green"}>{d.license}</span></p>
                  <p><span className="text-faint">N</span> <span className="text-dim">{d.records}</span></p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mono-label text-[8.5px] text-cyan">Intended use</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-dim">{d.use}</p>
                </div>
                <div>
                  <p className="mono-label text-[8.5px] text-rose">Known limits</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-dim">{d.limits}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
