import { DOC_META } from "../data/design";
import { useScrollSpy } from "../hooks";

export const SECTIONS: { id: string; n: string; label: string }[] = [
  { id: "s01", n: "01", label: "Problem" },
  { id: "s02", n: "02", label: "Objectives" },
  { id: "s03", n: "03", label: "Users" },
  { id: "s04", n: "04", label: "Features" },
  { id: "s05", n: "05", label: "ML Components" },
  { id: "s06", n: "06", label: "Datasets" },
  { id: "s07", n: "07", label: "Architecture" },
  { id: "s08", n: "08", label: "Database" },
  { id: "s09", n: "09", label: "Stack" },
  { id: "s10", n: "10", label: "Difficulty" },
  { id: "s11", n: "11", label: "Risks" },
  { id: "s12", n: "12", label: "Ethics" },
  { id: "s13", n: "13", label: "Differentiation" },
  { id: "s14", n: "14", label: "Roadmap" },
  { id: "s15", n: "15", label: "Gate G-1" },
  { id: "s16", n: "16", label: "Data Register" },
  { id: "s17", n: "17", label: "Proxy Policy" },
  { id: "s18", n: "18", label: "Schema Match" },
  { id: "s19", n: "19", label: "Gate G-2" },
  { id: "s20", n: "20", label: "EDA Contract" },
  { id: "s21", n: "21", label: "Attribute Ledger" },
  { id: "s22", n: "22", label: "Leakage Log" },
  { id: "s23", n: "23", label: "Balance" },
  { id: "s24", n: "24", label: "Gate G-3" },
  { id: "s25", n: "25", label: "Pipeline" },
  { id: "s26", n: "26", label: "Fit Discipline" },
  { id: "s27", n: "27", label: "Leakage Tests" },
  { id: "s28", n: "28", label: "Validator" },
  { id: "s29", n: "29", label: "Gate G-4" },
  { id: "s30", n: "30", label: "Baselines" },
  { id: "s31", n: "31", label: "Confusion Lab" },
  { id: "s32", n: "32", label: "ROC / AUC" },
  { id: "s33", n: "33", label: "Runbook" },
  { id: "s34", n: "34", label: "Gate G-5" },
  { id: "s35", n: "35", label: "Candidates" },
  { id: "s36", n: "36", label: "Nested CV" },
  { id: "s37", n: "37", label: "Evidence Rule" },
  { id: "s38", n: "38", label: "Model Card" },
  { id: "s39", n: "39", label: "Gate G-6" },
  { id: "s40", n: "40", label: "Cluster Protocol" },
  { id: "s41", n: "41", label: "Elbow Lab" },
  { id: "s42", n: "42", label: "Naming" },
  { id: "s43", n: "43", label: "Guardrails" },
  { id: "s44", n: "44", label: "Gate G-7" },
  { id: "s45", n: "45", label: "Scoring Eq." },
  { id: "s46", n: "46", label: "Compat Lab" },
  { id: "s47", n: "47", label: "Weight Vectors" },
  { id: "s48", n: "48", label: "Explain Contract" },
  { id: "s49", n: "49", label: "Gate G-8" },
  { id: "s50", n: "50", label: "Gap Math" },
  { id: "s51", n: "51", label: "Gap Engine" },
  { id: "s52", n: "52", label: "Prereq Graph" },
  { id: "s53", n: "53", label: "Gate G-9" },
  { id: "s54", n: "54", label: "Catalog" },
  { id: "s55", n: "55", label: "Roadmap Builder" },
  { id: "s56", n: "56", label: "Why Not" },
  { id: "s57", n: "57", label: "Gate G-10" },
  { id: "s58", n: "58", label: "Extract Pipeline" },
  { id: "s59", n: "59", label: "Live Extractor" },
  { id: "s60", n: "60", label: "Normalization" },
  { id: "s61", n: "61", label: "Gate G-11" },
];

export default function Header({ g11 }: { g11: boolean }) {
  const active = useScrollSpy(SECTIONS.map((s) => s.id));

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* top bar */}
      <div className="border-b border-line bg-base/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-2.5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
              <path d="M16 4 L26 10 V22 L16 28 L6 22 V10 Z" fill="none" stroke="#6be1ff" strokeWidth="2" />
              <circle cx="16" cy="16" r="3" fill="#ffc266" />
            </svg>
            <span className="font-display text-sm font-semibold tracking-wide text-ink">
              {DOC_META.code}
              <span className="text-faint"> / SD</span>
            </span>
          </a>
          <span className="mono-label hidden text-faint md:block">{DOC_META.docNo} · {DOC_META.rev}</span>
          <span
            className={`mono-label ml-auto border px-2 py-[3px] text-[9px] ${
              g11 ? "border-green/50 text-green" : "border-amber/50 text-amber"
            }`}
          >
            {g11 ? "G-11 PASSED · PHASE 12 NEXT" : "PHASE 11 · G-11 PENDING"}
          </span>
        </div>
      </div>

      {/* index rail */}
      <nav className="border-b border-line/70 bg-deep/85 backdrop-blur-sm" aria-label="Document sections">
        <div className="nav-index mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-1.5 sm:px-8">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`mono-label shrink-0 px-2.5 py-1 text-[9px] transition-colors duration-200 ${
                active === s.id
                  ? "bg-cyan/10 text-cyan"
                  : "text-faint hover:bg-panel2 hover:text-dim"
              }`}
            >
              <span className="mr-1 text-line2">{s.n}</span>
              {s.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
