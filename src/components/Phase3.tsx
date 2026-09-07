import { useState } from "react";
import {
  EDA_INTRO,
  EDA_WORKPACKAGES,
  EDA_EXIT,
  UCI_ATTRIBUTES,
  MISSINGNESS_NOTE,
  LEAKAGE,
  BALANCE_PROTOCOL,
  type AttrDecision,
  type AttrGroup,
} from "../data/design";
import { useReveal, useCountUp } from "../hooks";
import { Section, Reveal, Tag, Corners } from "./ui";

const DECISION_TONE: Record<AttrDecision, "green" | "rose" | "amber" | "cyan"> = {
  KEEP: "green",
  EXCLUDE: "rose",
  LEAK: "amber",
  TARGET: "cyan",
};

const DECISION_HEX: Record<AttrDecision, string> = {
  KEEP: "#7ce7a5",
  EXCLUDE: "#ff8b8b",
  LEAK: "#ffc266",
  TARGET: "#6be1ff",
};

/* ---------- §20 · EDA protocol ---------- */
export function EDAProtocolSection() {
  return (
    <Section
      id="s20"
      index="20"
      kicker="Phase 3 · Work order"
      title="The EDA Contract"
      intro={EDA_INTRO}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {EDA_WORKPACKAGES.map((w, i) => (
          <Reveal key={w.id} delay={(i % 2) * 90}>
            <div className="panel panel-hover group h-full p-5">
              <div className="flex items-baseline gap-3">
                <span className="display-head text-2xl text-cyan">{w.id}</span>
                <p className="display-head text-[17px] text-ink">{w.name}</p>
                <span className="mono-label ml-auto border border-line px-2 py-[2px] text-[8.5px] text-faint transition-colors group-hover:border-cyan/40 group-hover:text-cyan">
                  RUNS IN NOTEBOOK
                </span>
              </div>
              <div className="mt-4 space-y-2 border-t border-line/70 pt-3">
                <p className="text-[12.5px] leading-relaxed text-dim">
                  <span className="mono-label mr-2 text-[8.5px] text-faint">INPUT</span>
                  {w.input}
                </p>
                <p className="text-[12.5px] leading-relaxed text-dim">
                  <span className="mono-label mr-2 text-[8.5px] text-faint">OUTPUT</span>
                  {w.output}
                </p>
                <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-green">
                  <svg viewBox="0 0 16 16" className="mt-[3px] h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.5 8.5 L6.5 12.5 L13.5 4" />
                  </svg>
                  <span>{w.acceptance}</span>
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <div className="mt-6 border-l-2 border-amber bg-panel/60 p-4">
          <p className="mono-label text-amber">Exit criterion — Phase 3</p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-dim">{EDA_EXIT}</p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §21 · Attribute ledger ---------- */
function LedgerStats() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const counts: { d: AttrDecision; n: number }[] = (["KEEP", "EXCLUDE", "LEAK", "TARGET"] as AttrDecision[]).map(
    (d) => ({ d, n: UCI_ATTRIBUTES.filter((a) => a.decision === d).length })
  );
  const total = UCI_ATTRIBUTES.length;
  const t = useCountUp(total, visible);
  return (
    <div ref={ref} className={`reveal ${visible ? "in" : ""} grid grid-cols-2 gap-3 sm:grid-cols-5`}>
      {counts.map((c) => (
        <StatCell key={c.d} decision={c.d} n={c.n} />
      ))}
      <div className="panel flex flex-col items-center justify-center border-line2/60 px-4 py-4">
        <p className="display-head text-3xl text-ink">{t}</p>
        <p className="mono-label mt-1 text-[8.5px] text-faint">ATTRIBUTES · TOTAL</p>
      </div>
    </div>
  );
}

function StatCell({ decision, n }: { decision: AttrDecision; n: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const v = useCountUp(n, visible);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "in" : ""} panel panel-hover px-4 py-4`}
      style={{ borderColor: `${DECISION_HEX[decision]}44` }}
    >
      <p className="display-head text-3xl" style={{ color: DECISION_HEX[decision] }}>{v}</p>
      <p className="mono-label mt-1 text-[8.5px]" style={{ color: `${DECISION_HEX[decision]}aa` }}>
        {decision}
      </p>
    </div>
  );
}

function MissingnessWall() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="panel mt-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <p className="display-head text-[17px] text-ink">Missingness wall — every cell, accounted for</p>
        <span className="mono-label ml-auto border border-green/40 px-2.5 py-1 text-[9px] text-green">
          0 / 33 MISSING · DOCUMENTED · RE-VERIFY AT LOAD
        </span>
      </div>
      <div className="mt-5 grid grid-cols-[repeat(11,minmax(0,1fr))] gap-1.5">
        {UCI_ATTRIBUTES.map((a, i) => (
          <div
            key={a.name}
            title={`${a.name} — 0 missing cells`}
            className={`flex aspect-square items-center justify-center border border-green/25 bg-green/[0.07] font-mono text-[8.5px] text-green/80 transition-all duration-500 hover:scale-110 hover:border-green/70 hover:bg-green/15 ${
              visible ? "opacity-100" : "translate-y-2 opacity-0"
            }`}
            style={{ transitionDelay: `${i * 22}ms` }}
          >
            {a.name.slice(0, 2).toUpperCase()}
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-line/70 pt-4 text-[12.5px] leading-relaxed text-faint">{MISSINGNESS_NOTE}</p>
    </div>
  );
}

export function LedgerSection() {
  const [decision, setDecision] = useState<"ALL" | AttrDecision>("ALL");
  const [group, setGroup] = useState<"ALL" | AttrGroup>("ALL");

  const rows = UCI_ATTRIBUTES.filter(
    (a) => (decision === "ALL" || a.decision === decision) && (group === "ALL" || a.group === group)
  );

  const chip = (active: boolean) =>
    `mono-label border px-2.5 py-1 text-[9px] transition-all duration-200 ${
      active
        ? "border-cyan/50 bg-cyan/10 text-cyan"
        : "border-line text-faint hover:border-line2 hover:text-dim"
    }`;

  return (
    <Section
      id="s21"
      index="21"
      kicker="Phase 3 · Every column judged"
      title="The 33-Attribute Ledger"
      intro="The complete attribute inventory of the UCI Student Performance dataset, transcribed from its data dictionary — with a signed disposition for every column before the data is loaded. This is the artifact that makes 'no silent column drops' auditable instead of promised."
    >
      <Reveal>
        <LedgerStats />
      </Reveal>

      <Reveal delay={80}>
        <div className="panel relative mt-6 overflow-hidden">
          <Corners color="#6be1ff" />
          {/* filters */}
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4">
            <span className="mono-label mr-1 text-[8.5px] text-faint">DISPOSITION</span>
            {(["ALL", "KEEP", "EXCLUDE", "LEAK", "TARGET"] as const).map((d) => (
              <button key={d} onClick={() => setDecision(d)} className={chip(decision === d)}>
                {d}
              </button>
            ))}
            <span className="mono-label ml-4 mr-1 text-[8.5px] text-faint">DOMAIN</span>
            {(["ALL", "SCHOOL", "FAMILY", "STUDY", "DEMOGRAPHIC", "ACHIEVEMENT"] as const).map((g) => (
              <button key={g} onClick={() => setGroup(g)} className={chip(group === g)}>
                {g}
              </button>
            ))}
            <span className="mono-label ml-auto text-[9px] text-dim">
              SHOWING {rows.length} / {UCI_ATTRIBUTES.length}
            </span>
          </div>

          {/* header */}
          <div className="mono-label hidden grid-cols-[110px_54px_104px_118px_100px_1fr] gap-4 border-b border-line bg-deep/60 px-5 py-2.5 text-[8.5px] text-faint md:grid">
            <span>ATTRIBUTE</span><span>TYPE</span><span>RANGE</span><span>DOMAIN</span><span>DISPOSITION</span><span>RECORDED REASON</span>
          </div>

          {/* rows */}
          <div className="max-h-[520px] overflow-y-auto">
            {rows.map((a) => (
              <div
                key={a.name}
                className="group grid grid-cols-2 items-center gap-x-4 gap-y-1 border-b border-line/50 px-5 py-3 transition-colors duration-200 last:border-b-0 hover:bg-panel2/80 md:grid-cols-[110px_54px_104px_118px_100px_1fr]"
              >
                <p className="font-mono text-[12.5px] font-medium text-ink">{a.name}</p>
                <p className="text-right font-mono text-[10px] text-faint md:text-left">{a.type}</p>
                <p className="font-mono text-[10.5px] text-dim">{a.range}</p>
                <p className="text-right font-mono text-[10px] text-faint md:text-left">{a.group}</p>
                <div>
                  <Tag tone={DECISION_TONE[a.decision]}>{a.decision}</Tag>
                </div>
                <p className="col-span-2 text-[12px] leading-relaxed text-faint transition-colors group-hover:text-dim md:col-span-1">
                  {a.note}
                </p>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="px-5 py-8 text-center font-mono text-[11px] text-faint">
                No attribute matches this combination of filters.
              </p>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <MissingnessWall />
      </Reveal>
    </Section>
  );
}

/* ---------- §22 · Leakage log ---------- */
function PipelineCard({ m, active }: { m: typeof LEAKAGE.modelA; active: boolean }) {
  return (
    <div
      className={`panel relative p-5 transition-all duration-500 sm:p-6 ${
        active ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
      }`}
      style={{ borderColor: active ? (m.flag.startsWith("LEAKAGE") ? "rgba(255,139,139,0.45)" : "rgba(124,231,165,0.45)") : undefined }}
    >
      {active && <Corners color={m.flag.startsWith("LEAKAGE") ? "#ff8b8b" : "#7ce7a5"} />}
      <div className="flex flex-wrap items-center gap-3">
        <p className="display-head text-[17px] text-ink">{m.name}</p>
        <Tag tone={m.flag.startsWith("LEAKAGE") ? "rose" : "green"}>{m.flag}</Tag>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {m.steps.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className="border border-line bg-deep/70 px-3 py-1.5 font-mono text-[11px] text-dim">{s}</span>
            {i < m.steps.length - 1 && (
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-faint" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 8 H13 M9.5 4.5 L13 8 L9.5 11.5" />
              </svg>
            )}
          </span>
        ))}
      </div>
      <p className="mt-5 border-t border-line/70 pt-4 text-[13.5px] leading-relaxed text-dim">{m.verdict}</p>
    </div>
  );
}

export function LeakageSection() {
  const [model, setModel] = useState<"A" | "B">("A");
  return (
    <Section
      id="s22"
      index="22"
      kicker="Phase 3 · The famous trap"
      title="Leakage Log — G1, G2 vs G3"
      intro="Every student-performance project faces this temptation; the credible ones document how they refused it. This log pre-commits the decision before any metric exists to tempt anyone."
    >
      <Reveal>
        <div className="border-l-2 border-amber bg-panel/60 p-4 sm:p-5">
          <p className="text-[14px] leading-relaxed text-dim">{LEAKAGE.claim}</p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mono-label mr-1 text-[8.5px] text-faint">INSPECT</span>
          <button
            onClick={() => setModel("A")}
            className={`mono-label border px-3 py-1.5 text-[9.5px] transition-all duration-200 ${
              model === "A" ? "border-rose/60 bg-rose/10 text-rose" : "border-line text-faint hover:text-dim"
            }`}
          >
            MODEL A — THE TRAP
          </button>
          <button
            onClick={() => setModel("B")}
            className={`mono-label border px-3 py-1.5 text-[9.5px] transition-all duration-200 ${
              model === "B" ? "border-green/60 bg-green/10 text-green" : "border-line text-faint hover:text-dim"
            }`}
          >
            MODEL B — THE HONEST ANSWER
          </button>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="relative mt-4 min-h-[210px]">
          <PipelineCard m={LEAKAGE.modelA} active={model === "A"} />
          <PipelineCard m={LEAKAGE.modelB} active={model === "B"} />
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="border-l-2 border-cyan bg-panel/60 p-4 text-[12.5px] leading-relaxed text-dim">
            <span className="mono-label mr-2 text-[8.5px] text-cyan">SENSITIVITY ANALYSIS</span>
            {LEAKAGE.sensitivity}
          </p>
          <p className="mono-label border border-line px-3 py-2 text-[8.5px] text-faint">
            EXACT G1↔G3 COEFFICIENTS → AP-5, AT LOAD
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- §23 · Balance & stratification contract ---------- */
function SplitBar() {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref}>
      <div className="flex h-12 w-full overflow-hidden border border-line">
        {BALANCE_PROTOCOL.splits.map((s, i) => (
          <div
            key={s.name}
            className="flex items-center justify-center gap-2 transition-[width] duration-700 ease-out"
            style={{
              width: visible ? `${s.share}%` : "0%",
              transitionDelay: `${i * 160}ms`,
              background: `${s.color}14`,
              borderRight: i < 2 ? `1px solid ${s.color}55` : "none",
            }}
          >
            <span className="mono-label whitespace-nowrap text-[9px]" style={{ color: s.color }}>
              {s.name} · {s.share}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {BALANCE_PROTOCOL.splits.map((s) => (
          <div key={s.name} className="border-t-2 px-1 pt-2" style={{ borderColor: s.color }}>
            <p className="mono-label text-[9px]" style={{ color: s.color }}>{s.name}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-faint">{s.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BalanceSection() {
  return (
    <Section
      id="s23"
      index="23"
      kicker="Phase 3 · Target & splits"
      title="Class Balance Contract"
      intro="The target is defined once, in writing, before any split is cut — and the protocol for imbalance is signed before the ratio is even measured. Measuring first and deciding afterwards is how convenient decisions get made."
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-6">
          <Reveal>
            <div className="panel relative overflow-hidden p-5">
              <Corners color="#ffc266" />
              <p className="mono-label text-amber">Target definition — frozen</p>
              <pre className="mt-4 overflow-x-auto border border-line bg-deep/80 p-4 font-mono text-[12px] leading-relaxed text-green">
                {BALANCE_PROTOCOL.target}
              </pre>
              <p className="mt-4 text-[12.5px] leading-relaxed text-faint">
                The pass criterion ships with the dataset documentation; this project did not invent
                it and will not adjust it to flatter any model. Both subject files are treated as
                separate populations throughout.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="panel p-5">
              <p className="mono-label text-cyan">Partition contract — 60 / 20 / 20</p>
              <div className="mt-4">
                <SplitBar />
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <div className="panel h-full p-5 sm:p-6">
            <p className="mono-label text-rose">If the classes are imbalanced — the signed response</p>
            <ol className="mt-4 space-y-4">
              {BALANCE_PROTOCOL.responses.map((r, i) => (
                <li key={r} className="flex gap-3">
                  <span className="display-head shrink-0 text-xl text-line2">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[13px] leading-relaxed text-dim">{r}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-line pt-4">
              <p className="text-[12px] leading-relaxed text-faint">
                This protocol exists because the tempting move — quietly resampling until the metrics
                look good — is exactly the move a defense committee asks about. The report will show
                the measured ratio and every countermeasure taken, or not taken, and why.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
