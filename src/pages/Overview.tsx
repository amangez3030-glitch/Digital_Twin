import { useState } from "react";
import { Link } from "react-router-dom";
import { DOC_META, PHASES, REV_LEDGER } from "../data/design";
import { Reveal, Tag, Corners } from "../components/ui";
import { useCountUp, useReveal, useTilt } from "../hooks";
import Schematic from "../components/Schematic";
import { useDoc } from "../layout/Shell";
import { PAGES, PHASE_PAGE } from "./registry";

/* ============================================================
   The 3D dossier — all eleven sheets fanned in perspective.
   Tilts with the pointer, lifts on hover, opens the sheet.
   ============================================================ */

function DossierStack() {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(8);
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div className="relative h-[340px] select-none sm:h-[400px]" style={{ perspective: "1500px" }}>
      {/* table shadow */}
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/50 blur-2xl"
      />
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="tilt preserve-3d absolute inset-0"
      >
        <div
          className="preserve-3d float-z absolute inset-0"
          style={{ transform: "rotateX(54deg) rotateZ(-26deg) scale(0.82) translateZ(-30px)" }}
        >
          {PAGES.map((p, i) => {
            const active = hov === i;
            return (
              <Link
                to={p.path}
                key={p.path}
                onPointerEnter={() => setHov(i)}
                onPointerLeave={() => setHov(null)}
                aria-label={`Open sheet ${p.code} — ${p.label}`}
                className="sheet-fade absolute left-1/2 top-1/2 block w-[196px] border bg-[#0b1626] sm:w-[216px]"
                style={{
                  transform: `translate(-50%, -50%) translateZ(${i * 15 + (active ? 30 : 0)}px) rotate(${
                    (i % 2 ? 1.4 : -1.4) + (i - 5) * 0.55
                  }deg)`,
                  borderColor: active ? "#6be1ff" : "#22375a",
                  boxShadow: active
                    ? "0 0 34px rgba(107,225,255,0.3), 0 22px 40px rgba(0,0,0,0.55)"
                    : "0 16px 30px rgba(0,0,0,0.5)",
                  transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1), border-color 0.2s, box-shadow 0.28s",
                  animationDelay: `${i * 55}ms`,
                }}
              >
                <div className={`h-[3px] w-full ${p.status === "APPROVED" ? "bg-green/70" : "bg-amber/90"}`} />
                <div className="p-3">
                  <div className="flex items-baseline justify-between">
                    <span className={`mono-label text-[9.5px] ${active ? "text-cyan" : "text-amber"}`}>{p.code}</span>
                    <span className="font-mono text-[8px] text-faint">{p.status === "APPROVED" ? "✓ APPR" : "SEAL"}</span>
                  </div>
                  <p className={`display-head mt-1 text-[13.5px] leading-tight ${active ? "text-cyan" : "text-ink"}`}>
                    {p.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[8.5px] text-faint">{p.phases} · {p.revs}</p>
                  <div className="mt-2.5 space-y-1" aria-hidden="true">
                    <div className="h-[3px] w-4/5 bg-line/60" />
                    <div className="h-[3px] w-3/5 bg-line/40" />
                    <div className="h-[3px] w-2/3 bg-line/30" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <p className="mono-label pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] text-faint">
        THE DOSSIER · 11 SHEETS · HOVER TO LIFT · CLICK TO OPEN
      </p>
    </div>
  );
}

function Stat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const n = useCountUp(value, visible);
  return (
    <div ref={ref} className={`reveal ${visible ? "in" : ""} border border-line/70 bg-base/40 p-4 transition-colors duration-200 hover:border-cyan/50`}>
      <p className="display-head text-3xl text-cyan">
        {n}
        {suffix}
      </p>
      <p className="mono-label mt-1 text-[8.5px] text-faint">{label}</p>
    </div>
  );
}

function TitleBlock() {
  return (
    <div className="panel relative overflow-hidden p-6 sm:p-8">
      <Corners color="#6be1ff" />
      <p className="mono-label text-dim">
        {DOC_META.prepared} <span className="text-faint">·</span> {DOC_META.date}
      </p>
      <h1 className="display-head mt-4 text-4xl leading-[0.98] text-ink sm:text-5xl lg:text-6xl">
        AI DIGITAL<br />TWIN
        <span className="block mt-2 text-xl font-normal leading-snug text-dim sm:text-2xl">
          &amp; Career Intelligence System
        </span>
      </h1>
      <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-dim">
        An eighteen-phase system design for a digital representation of a student that{" "}
        <em className="not-italic text-ink">explains itself</em> — where every score decomposes, every
        refusal cites its rule, and nothing is invented to look impressive.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line pt-5 sm:grid-cols-3">
        {[
          ["DOC NO", DOC_META.docNo],
          ["REVISION", DOC_META.rev],
          ["PHASE", "18 / 18"],
          ["SCALE", DOC_META.scale],
          ["REVIEW", "Academic Supervisor"],
          ["STATUS", "G-1 → G-17 PASSED"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="mono-label text-[8px] text-faint">{k}</p>
            <p className="mt-0.5 font-mono text-[12px] text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/system"
          className="group inline-flex items-center gap-2.5 border border-green bg-green/10 px-5 py-3 transition-all duration-200 hover:bg-green/20 hover:shadow-[0_0_28px_rgba(124,231,165,0.2)] active:translate-y-[1px]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
          </span>
          <span className="mono-label text-[10px] text-green">OPEN THE SYSTEM — IT RUNS</span>
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-green transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
          </svg>
        </Link>
        <Link
          to="/design"
          className="group inline-flex items-center gap-2.5 border border-cyan bg-cyan/10 px-5 py-3 transition-all duration-200 hover:bg-cyan/20 hover:shadow-[0_0_28px_rgba(107,225,255,0.18)] active:translate-y-[1px]"
        >
          <span className="mono-label text-[10px] text-cyan">READ THE DESIGN DOSSIER</span>
        </Link>
        <Link
          to="/defense"
          className="inline-flex items-center gap-2.5 border border-line px-5 py-3 transition-all duration-200 hover:border-amber/60 hover:text-amber active:translate-y-[1px]"
        >
          <span className="mono-label text-[10px] text-dim group-hover:text-amber">JUMP TO THE FINAL SEAL</span>
        </Link>
      </div>
    </div>
  );
}

function PhaseMap() {
  const { sealed } = useDoc();
  const stageColors: Record<string, string> = {
    Foundations: "#6be1ff",
    Models: "#ffc266",
    Intelligence: "#7ce7a5",
    Application: "#9db8ff",
    Defense: "#ff8b8b",
  };
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-16 sm:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mono-label text-cyan">The eighteen phases</p>
            <h2 className="display-head mt-2 text-2xl text-ink sm:text-3xl">
              One phase, one sheet, one gate.
            </h2>
          </div>
          <p className="max-w-sm text-[12.5px] leading-relaxed text-faint">
            Each card opens the page that hosts the phase. {sealed ? "All eighteen are sealed." : "Seventeen are approved; the seal awaits Phase 18."}
          </p>
        </div>
      </Reveal>
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {PHASES.map((p, i) => {
          const done = sealed || p.n <= 17;
          const page = PHASE_PAGE[p.n];
          const color = stageColors[p.stage] ?? "#6be1ff";
          return (
            <Reveal key={p.n} delay={Math.min(i * 35, 350)}>
              <Link
                to={page}
                className="group relative block h-full overflow-hidden border border-line/80 bg-base/40 p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
                style={{ borderTopColor: color, borderTopWidth: 2 }}
              >
                <p className="font-mono text-[10px]" style={{ color }}>
                  {String(p.n).padStart(2, "0")}
                </p>
                <p className="display-head mt-1 text-[13.5px] leading-tight text-ink">{p.name}</p>
                <p className="mono-label mt-1 text-[7.5px] text-faint">{p.stage.toUpperCase()}</p>
                <p
                  className={`mono-label mt-2 inline-block border px-1.5 py-0.5 text-[7px] ${
                    done ? "border-green/50 text-green" : "border-amber/50 text-amber"
                  }`}
                >
                  {done ? "PASSED" : "SEAL PENDING"}
                </p>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Ledger() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-16 sm:px-8">
      <Reveal>
        <p className="mono-label text-cyan">Revision ledger</p>
        <h2 className="display-head mt-2 text-2xl text-ink sm:text-3xl">Eighteen revisions, all on record.</h2>
      </Reveal>
      <Reveal delay={100}>
        <div className="mt-6 overflow-x-auto border border-line/80">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line bg-base/60">
                {["REV", "PHASE", "STATUS", "NOTE"].map((h) => (
                  <th key={h} className="mono-label px-4 py-2.5 text-[8.5px] font-normal text-faint">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REV_LEDGER.map((r) => (
                <tr key={r.rev} className="group border-b border-line/50 transition-colors duration-150 last:border-0 hover:bg-cyan/[0.04]">
                  <td className="px-4 py-2.5 font-mono text-[11.5px] text-cyan">{r.rev}</td>
                  <td className="px-4 py-2.5 text-[12.5px] text-ink">{r.phase}</td>
                  <td className="px-4 py-2.5">
                    <Tag tone={r.tone}>{r.status}</Tag>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] leading-relaxed text-faint">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}

function TiltTitleBlock() {
  const { ref, onPointerMove, onPointerLeave } = useTilt<HTMLDivElement>(3);
  return (
    <div ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className="tilt">
      <TitleBlock />
    </div>
  );
}

export default function Overview() {
  const { sealed } = useDoc();
  return (
    <>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 pt-24 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-14">
        <TiltTitleBlock />
        <Reveal delay={120}>
          <DossierStack />
        </Reveal>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-5 pt-10 sm:px-8 lg:grid-cols-4">
        <Stat value={18} label="PHASES · EACH WITH A GATE" />
        <Stat value={89} label="SECTIONS IN THIS DOSSIER" />
        <Stat value={12} label="CAREERS · 12 SKILLS · ONE LEXICON" />
        <Stat value={28} label="TESTS IN THE SUITE" suffix="*" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8">
        <Reveal>
          <div className="panel relative p-5">
            <Corners color="#ffc266" />
            <p className="mono-label mb-2 text-faint">System schematic — inputs → twin → engines → outputs</p>
            <Schematic />
          </div>
        </Reveal>
      </div>

      <PhaseMap />
      <Ledger />

      {/* sheet index */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-16 sm:px-8">
        <Reveal>
          <p className="mono-label text-cyan">The sheets</p>
          <h2 className="display-head mt-2 text-2xl text-ink sm:text-3xl">Eleven pages. One document.</h2>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PAGES.filter((p) => p.path !== "/").map((p, i) => (
            <Reveal key={p.path} delay={Math.min(i * 60, 360)}>
              <Link
                to={p.path}
                className="group flex h-full flex-col border border-line/80 bg-base/40 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-cyan/50 hover:shadow-[0_14px_36px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-amber">{p.code}</span>
                  <Tag tone={p.status === "APPROVED" ? "green" : "amber"}>{p.status}</Tag>
                </div>
                <p className="display-head mt-2.5 text-lg leading-tight text-ink">{p.title}</p>
                <p className="mono-label mt-1 text-[8.5px] text-faint">{p.phases} · {p.revs} · GATES {p.gates}</p>
                <p className="mt-2.5 flex-1 text-[12.5px] leading-relaxed text-faint">{p.blurb}</p>
                <p className="mono-label mt-3 text-[8.5px] text-cyan opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                  OPEN SHEET →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mx-auto mt-14 w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className={`relative border-2 px-6 py-5 text-center transition-colors duration-500 ${sealed ? "border-green/60" : "border-amber/50"}`}>
            <p className="mono-label text-[9px] text-faint">DOCUMENT CONTROL</p>
            <p className={`display-head mt-1.5 text-xl ${sealed ? "text-green" : "text-amber"}`}>
              {sealed
                ? "SEALED AT REV R — APPROVED, ARCHIVED, READY FOR DEFENSE"
                : "REVIEW IN PROGRESS — SUPERVISOR DECISIONS ARE RECORDED AT EACH GATE"}
            </p>
          </div>
        </Reveal>
      </div>
    </>
  );
}
