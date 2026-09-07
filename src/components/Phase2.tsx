import { useMemo, useState } from "react";
import {
  DS_CARDS,
  DsCard,
  Verdict,
  PROXY_POLICY,
  SYNTH_PROTOCOL,
  SCHEMA_SOURCES,
  SCHEMA_ARTIFACTS,
  SCHEMA_STEPS,
  P2_DELIVERABLES,
} from "../data/design";
import { Section, Reveal, Tag, Corners } from "./ui";

const V_COLOR: Record<Verdict, string> = {
  ADOPT: "#7ce7a5",
  CONDITIONAL: "#ffc266",
  REJECT: "#ff8b8b",
  BUILD: "#6be1ff",
};

const V_TONE: Record<Verdict, "green" | "amber" | "rose" | "cyan"> = {
  ADOPT: "green",
  CONDITIONAL: "amber",
  REJECT: "rose",
  BUILD: "cyan",
};

const LIC_COLOR: Record<DsCard["licenseOk"], string> = {
  OK: "#7ce7a5",
  VERIFY: "#ffc266",
  FAIL: "#ff8b8b",
};

/* ---------- dossier card ---------- */
function DossierCard({ d, delay }: { d: DsCard; delay: number }) {
  const c = V_COLOR[d.verdict];
  const dead = d.verdict === "REJECT";
  return (
    <Reveal delay={delay}>
      <article
        className={`panel group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-line2 ${
          dead ? "opacity-75" : ""
        }`}
        style={{ borderTop: `2px solid ${c}55` }}
      >
        {/* verdict edge */}
        <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: `${c}66` }} />

        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] text-faint">
              {d.id} <span className="text-line2">·</span> {d.source}
            </p>
            <h3 className="display-head mt-1 text-lg leading-tight text-ink">{d.name}</h3>
          </div>
          <Tag tone={V_TONE[d.verdict]}>{d.verdict}</Tag>
        </header>

        {/* spec ledger */}
        <dl className="mt-4 space-y-1.5 border-t border-line/70 pt-3 text-[12px]">
          {[
            ["LICENSE", d.license, d.licenseOk],
            ["RECORDS", d.records, null],
            ["TARGET", d.target, null],
            ["GEO", d.geo, null],
          ].map(([k, v, ok]) => (
            <div key={k as string} className="grid grid-cols-[64px_1fr] gap-2">
              <dt className="mono-label pt-[2px] text-[8px] text-faint">{k as string}</dt>
              <dd className="text-dim">
                {v as string}
                {ok !== null && (
                  <span
                    className="mono-label ml-2 border px-1.5 py-[1px] text-[8px]"
                    style={{ color: LIC_COLOR[ok as DsCard["licenseOk"]], borderColor: `${LIC_COLOR[ok as DsCard["licenseOk"]]}55` }}
                  >
                    {ok === "OK" ? "VERIFIED" : ok === "VERIFY" ? "VERIFY AT INTAKE" : "FAILED"}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 border-t border-line/70 pt-3 text-[12.5px] leading-relaxed text-dim">
          <span className="mono-label mr-2 text-[8px] text-faint">FEATURES</span>
          {d.features}
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-dim">
          <span className="mono-label mr-2 text-[8px] text-faint">MISSING</span>
          {d.missing}
        </p>

        <ul className="mt-3 space-y-1.5">
          {d.limits.map((l) => (
            <li key={l} className="flex items-start gap-2 text-[12px] leading-relaxed text-faint">
              <svg viewBox="0 0 12 12" className="mt-[4px] h-2.5 w-2.5 shrink-0" style={{ color: "#ff8b8b" }} fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 1 L11 10 H1 Z" />
              </svg>
              {l}
            </li>
          ))}
        </ul>

        <footer className="mt-auto pt-4">
          <p
            className="border-l-2 pl-3 text-[12.5px] leading-relaxed text-dim"
            style={{ borderColor: `${c}88` }}
          >
            <span className="mono-label block text-[8px]" style={{ color: c }}>
              {dead ? "WHY REJECTED" : d.verdict === "BUILD" ? "WHY BUILT" : "ROLE IN THE SYSTEM"}
            </span>
            <span className="mt-1 block">{d.role}</span>
          </p>
          <p className="mt-2 text-[11.5px] italic leading-relaxed text-faint">{d.note}</p>
        </footer>
      </article>
    </Reveal>
  );
}

/* ---------- 16 · Data register ---------- */
type Filter = "ALL" | Verdict;

export function DataRegisterSection() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: DS_CARDS.length, ADOPT: 0, CONDITIONAL: 0, REJECT: 0, BUILD: 0 };
    DS_CARDS.forEach((d) => c[d.verdict]++);
    return c;
  }, []);

  const visible = filter === "ALL" ? DS_CARDS : DS_CARDS.filter((d) => d.verdict === filter);

  return (
    <Section
      id="s16"
      index="16"
      kicker="Phase 2 · Deliverable — Data Register"
      title="Ten Candidate Sources, Three Verdicts — and One We Build"
      intro="Every dataset the system might touch was evaluated before a single row was read: source, license, records, features, target, missingness, limits, geography. The verdicts below are the Phase 2 decision — adopt, adopt-conditionally, reject, or build under a written protocol."
    >
      {/* G-1 passed strip */}
      <Reveal>
        <div className="mb-8 flex flex-wrap items-center gap-3 border border-green/25 bg-green/[0.04] px-4 py-3">
          <span className="mono-label border border-green/50 px-2 py-[3px] text-[9px] text-green">G-1 · PASSED</span>
          <p className="text-[12.5px] text-dim">
            Phase 1 design frozen and approved. Phase 2 opens with the data question:{" "}
            <span className="text-ink">what may we legally and honestly use?</span>
          </p>
        </div>
      </Reveal>

      {/* verdict filter */}
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {(["ALL", "ADOPT", "CONDITIONAL", "REJECT", "BUILD"] as Filter[]).map((f) => {
            const on = filter === f;
            const color = f === "ALL" ? "#6be1ff" : V_COLOR[f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`mono-label border px-3 py-1.5 text-[9.5px] transition-all duration-200 ${
                  on ? "bg-panel2" : "hover:bg-panel2/60"
                }`}
                style={{
                  borderColor: on ? `${color}88` : undefined,
                  color: on ? color : undefined,
                }}
              >
                {f} <span className="text-faint">({counts[f]})</span>
              </button>
            );
          })}
          <span className="mono-label ml-auto hidden text-[8.5px] text-faint sm:block">
            DOCUMENT-OR-EXCLUDE RULE · NO QUIET SUBSTITUTIONS
          </span>
        </div>
      </Reveal>

      {/* dossiers */}
      <div className="grid gap-5 md:grid-cols-2">
        {visible.map((d, i) => (
          <DossierCard key={d.id} d={d} delay={(i % 2) * 80} />
        ))}
      </div>

      {/* summary strip */}
      <Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {(Object.keys(V_COLOR) as Verdict[]).map((v) => (
            <div key={v} className="panel px-4 py-3" style={{ borderLeft: `2px solid ${V_COLOR[v]}66` }}>
              <p className="display-head text-2xl" style={{ color: V_COLOR[v] }}>
                {String(counts[v]).padStart(2, "0")}
              </p>
              <p className="mono-label mt-1 text-[8.5px] text-faint">{v}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- 17 · Proxy policy + synthetic protocol ---------- */
const PROXY_COLS: { key: keyof typeof PROXY_POLICY; label: string; color: string; icon: "check" | "cross" | "arrow" }[] = [
  { key: "learns", label: "What the supervised model learns", color: "#7ce7a5", icon: "check" },
  { key: "notLearns", label: "What it does not — and cannot — learn", color: "#ff8b8b", icon: "cross" },
  { key: "instead", label: "What it feeds instead", color: "#6be1ff", icon: "arrow" },
];

function Glyph({ kind, color }: { kind: "check" | "cross" | "arrow"; color: string }) {
  return (
    <svg viewBox="0 0 14 14" className="mt-[3px] h-3.5 w-3.5 shrink-0" style={{ color }} fill="none" stroke="currentColor" strokeWidth="1.8">
      {kind === "check" && <path d="M2 7.5 L5.5 11 L12 3" />}
      {kind === "cross" && <path d="M3 3 L11 11 M11 3 L3 11" />}
      {kind === "arrow" && <path d="M2 7 H11 M7.5 3 L11.5 7 L7.5 11" />}
    </svg>
  );
}

export function ProxySection() {
  return (
    <Section
      id="s17"
      index="17"
      kicker="Phase 2 · Honesty Contract"
      title="What the Supervised Model Actually Learns"
      intro="Risk R-1 named the problem: no public dataset maps students to realized careers. This section is the written mitigation — the proxy-label policy the model card will repeat, and the protocol for the one dataset we must generate ourselves."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {PROXY_COLS.map((col, ci) => (
          <Reveal key={col.key} delay={ci * 90}>
            <div className="panel h-full p-5" style={{ borderTop: `2px solid ${col.color}55` }}>
              <p className="mono-label" style={{ color: col.color }}>
                {col.label}
              </p>
              <ul className="mt-4 space-y-3">
                {PROXY_POLICY[col.key].map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-dim">
                    <Glyph kind={col.icon} color={col.color} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      {/* model card sentence */}
      <Reveal>
        <div className="relative mt-6 overflow-hidden border border-amber/30 bg-amber/[0.04] p-5 sm:p-6">
          <Corners color="#ffc266" />
          <p className="mono-label text-amber">The sentence the model card must carry</p>
          <p className="mt-3 font-mono text-[13px] leading-relaxed text-dim sm:text-[14px]">
            “This model was trained to classify <span className="text-amber">coarse 1994-US-census occupation families</span> from
            education and work features. It outputs <span className="text-amber">compatibility with documented career requirement
            vectors</span> — it does not predict your career, your employability, or your future.”
          </p>
        </div>
      </Reveal>

      {/* synthetic protocol */}
      <Reveal>
        <div className="panel mt-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="mono-label border border-cyan/50 bg-cyan/10 px-2.5 py-1 text-[9.5px] text-cyan">
              D10 · SYNTHETIC COHORT PROTOCOL
            </span>
            <p className="mono-label text-[8.5px] text-faint">GENERATED — NOT INVENTED FOR CONVENIENCE</p>
          </div>
          <div className="mt-5 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {SYNTH_PROTOCOL.map((row) => (
              <div key={row.k} className="border-b border-line/70 pb-3">
                <p className="mono-label text-[8.5px] text-cyan">{row.k.toUpperCase()}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{row.v}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- 18 · Schema matching ---------- */
export function SchemaSection() {
  return (
    <Section
      id="s18"
      index="18"
      kicker="Phase 2 · Integration"
      title="Schema Matching — Four Sources, One Vocabulary"
      intro="The datasets do not share a schema, a skill vocabulary, or a career taxonomy. Steps S1–S6 are the plan for making them speak one language — and the checklist that proves they agree."
    >
      {/* flow strip */}
      <Reveal>
        <div className="panel mb-8 overflow-x-auto p-5">
          <div className="flex min-w-[640px] items-center gap-3 font-mono text-[11px]">
            <div className="flex flex-col gap-1.5">
              {SCHEMA_SOURCES.map((s) => (
                <span key={s} className="border border-line2 bg-panel2 px-2.5 py-1 text-dim">
                  {s}
                </span>
              ))}
            </div>
            <span className="flow-dash text-[16px] text-cyan">⟶</span>
            <div className="flex flex-col items-center gap-1 border border-cyan/40 bg-cyan/[0.06] px-4 py-3 text-center">
              <span className="display-head text-sm text-cyan">SCHEMA MATCH</span>
              <span className="mono-label text-[7.5px] text-faint">S1 → S6</span>
            </div>
            <span className="flow-dash text-[16px] text-cyan">⟶</span>
            <div className="flex flex-col gap-1.5">
              {SCHEMA_ARTIFACTS.map((a) => (
                <span key={a} className="border border-green/40 bg-green/[0.05] px-2.5 py-1 text-green">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* steps */}
      <div className="relative ml-[5px] border-l border-line pl-6 sm:ml-[9px] sm:pl-8">
        {SCHEMA_STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 60}>
            <div className="relative mb-3">
              <span className="absolute -left-[30px] top-4 inline-block h-[10px] w-[10px] rotate-45 border border-cyan bg-cyan/20 sm:-left-[38px]" />
              <div className="panel panel-hover grid gap-3 p-4 sm:grid-cols-[86px_1fr] sm:gap-5">
                <p className="display-head text-xl text-cyan">
                  {s.n}
                  <span className="ml-2 align-middle font-mono text-[9px] tracking-widest text-faint">STEP</span>
                </p>
                <div>
                  <p className="display-head text-[15.5px] text-ink">{s.name}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-dim">{s.body}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* deliverables */}
      <Reveal>
        <div className="panel mt-6 p-5 sm:p-6">
          <p className="mono-label text-cyan">Phase 2 file deliverables</p>
          <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {P2_DELIVERABLES.map((d) => (
              <div key={d.f} className="flex items-start gap-3 border-b border-line/70 pb-3">
                <svg viewBox="0 0 16 16" className="mt-[2px] h-3.5 w-3.5 shrink-0 text-faint" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M4 1.5 H9.5 L13 5 V14.5 H4 Z" />
                  <path d="M9.5 1.5 V5 H13" />
                </svg>
                <div>
                  <p className="font-mono text-[12px] text-ink">{d.f}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-faint">{d.what}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
