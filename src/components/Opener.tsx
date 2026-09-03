import { DOC_META, STATS, REV_LEDGER } from "../data/design";
import { useCountUp, useReveal } from "../hooks";
import Schematic from "./Schematic";

function Stat({ value, label, suffix, delay }: { value: number; label: string; suffix: string; delay: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const n = useCountUp(value, visible);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "in" : ""} panel panel-hover px-4 py-4`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="display-head text-3xl text-cyan sm:text-4xl">
        {suffix}
        {n}
      </p>
      <p className="mono-label mt-1.5 text-[9px] text-faint">{label}</p>
    </div>
  );
}

export default function Opener({ g5 }: { g5: boolean }) {
  return (
    <header className="relative mx-auto w-full max-w-6xl px-5 pt-28 sm:px-8 md:pt-36">
      {/* breadcrumb strip */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="blink inline-block h-3 w-2 bg-cyan" aria-hidden="true" />
        <p className="mono-label text-dim">
          System Design Document <span className="text-faint">·</span>{" "}
          <span className="text-cyan">{DOC_META.phase}</span>{" "}
          <span className="text-faint">of 18</span>
        </p>
        <span
          className={`mono-label ml-auto border px-2.5 py-1 text-[9.5px] ${
            g5 ? "border-green/50 text-green" : "border-amber/50 text-amber"
          }`}
        >
          {g5 ? "G-5 PASSED ✓" : "G-1→G-4 PASSED · G-5 PENDING"}
        </span>
      </div>

      {/* masthead + schematic */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <h1 className="display-head text-[2.6rem] leading-[0.98] text-ink sm:text-6xl lg:text-[4.2rem]">
            AI Digital Twin
            <span className="mt-2 block text-cyan">&amp; Career Intelligence</span>
            <span className="mt-2 block text-[0.52em] font-medium tracking-tight text-dim">System — DT-CIS</span>
          </h1>

          <p className="mt-7 max-w-xl border-l-2 border-amber pl-4 text-[15px] leading-relaxed text-dim">
            A continuously updated, explainable digital representation of a student — fed to
            supervised models, clustering, skill-gap engines, NLP extractors and a what-if
            simulator — that answers{" "}
            <em className="text-ink not-italic font-medium">“where am I, what am I missing, and what changes if I improve?”</em>{" "}
            without ever pretending to predict the future.
          </p>

          {/* meta ledger */}
          <dl className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            {[
              ["Document", DOC_META.docNo],
              ["Revision", DOC_META.rev],
              ["Author", "Student · ML Engineering"],
              ["Reviewer", "Academic Supervisor"],
              ["Period", DOC_META.date],
              ["Classification", "Decision-support · Non-prophetic"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 border-b border-line/70 pb-1.5">
                <dt className="mono-label text-[9px] text-faint">{k}</dt>
                <dd className="text-right font-mono text-[11px] text-dim">{v}</dd>
              </div>
            ))}
          </dl>

          {/* stats */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {STATS.map((s, i) => (
              <Stat key={s.label} value={s.value} label={s.label} suffix={s.suffix} delay={i * 70} />
            ))}
          </div>
        </div>

        <Schematic />
      </div>

      {/* engineering title block */}
      <div className="relative mt-10 grid grid-cols-2 overflow-hidden sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["DOC NO.", DOC_META.docNo],
          ["REV", DOC_META.rev],
          ["SCALE", DOC_META.scale],
          ["SHEET", DOC_META.sheet],
          ["PHASE", "5 / 18"],
          ["DRAWN BY", "ML STUDENT"],
        ].map(([k, v]) => (
          <div key={k} className="-ml-px -mt-px border border-line bg-panel/70 px-4 py-3">
            <p className="mono-label text-[8.5px] text-faint">{k}</p>
            <p className="mt-1 font-mono text-[11.5px] font-medium text-ink">{v}</p>
          </div>
        ))}
      </div>

      {/* revision ledger */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {REV_LEDGER.map((r) => (
          <div
            key={r.rev}
            className="panel flex items-start gap-4 border-l-2 p-4"
            style={{ borderLeftColor: r.tone === "green" ? "#7ce7a5" : "#ffc266" }}
          >
            <span
              className={`mono-label mt-[2px] shrink-0 border px-2 py-[3px] text-[9px] ${
                r.tone === "green" ? "border-green/50 text-green" : "border-amber/50 text-amber"
              }`}
            >
              {r.rev}
            </span>
            <div>
              <p className="display-head text-[14px] text-ink">
                {r.phase}
                <span
                  className={`mono-label ml-2 text-[8.5px] ${
                    r.tone === "green" ? "text-green" : "text-amber"
                  }`}
                >
                  {r.status}
                </span>
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-faint">{r.note}</p>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
