import { useState } from "react";
import { DOC_META } from "./data/design";
import Header from "./components/Header";
import Opener from "./components/Opener";
import {
  ProblemSection,
  ObjectivesSection,
  UsersSection,
  EthicsSection,
  DiffSection,
} from "./components/CoreSections";
import FeaturesSection from "./components/Features";
import { MLSection, DatasetSection } from "./components/MLSections";
import { ArchSection, DbSection, StackSection, DifficultySection } from "./components/ArchSections";
import RiskSection from "./components/Risks";
import { RoadmapSection, GateG1Section, GateG2Section, GateG3Section } from "./components/Roadmap";
import { DataRegisterSection, ProxySection, SchemaSection } from "./components/Phase2";
import { EDAProtocolSection, LedgerSection, LeakageSection, BalanceSection } from "./components/Phase3";

function Footer({ g3 }: { g3: boolean }) {
  return (
    <footer className="relative mt-28 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 md:grid-cols-3">
        <div>
          <p className="mono-label text-cyan">{DOC_META.docNo} · {DOC_META.rev}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-faint">
            AI Digital Twin &amp; Career Intelligence System — Phases 1–2 approved, Phase 3 issued.
            A decision-support design document. No datasets were loaded, no models trained, and no
            numbers invented in the making of this page — the EDA ledger pre-commits its verdicts
            instead.
          </p>
        </div>
        <div>
          <p className="mono-label text-faint">Standing rules carried into every phase</p>
          <ul className="mt-2 space-y-1 font-mono text-[11.5px] text-faint">
            <li><span className="text-rose">01</span> never fabricate data or metrics</li>
            <li><span className="text-rose">02</span> never hide an error or a failed baseline</li>
            <li><span className="text-rose">03</span> smaller working feature &gt; fake advanced one</li>
            <li><span className="text-rose">04</span> say what cannot be done — and the valid alternative</li>
            <li><span className="text-rose">05</span> no silent column drops — the ledger is auditable</li>
          </ul>
        </div>
        <div className="md:text-right">
          <p className="mono-label text-faint">Gate status</p>
          <p className={`mt-2 font-mono text-[12.5px] ${g3 ? "text-green" : "text-amber"}`}>
            {g3 ? "G-3 PASSED → PHASE 4 (PREPROCESSING)" : "G-1 ✓ · G-2 ✓ · G-3 PENDING APPROVAL"}
          </p>
          <a
            href="#top"
            className="mono-label mt-4 inline-block border border-line px-3 py-1.5 text-[9px] text-dim transition-colors hover:border-cyan hover:text-cyan"
          >
            ↑ Back to title block
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const g2 = true; // Phase 2 approved — recorded at gate G-2 (REV B)
  const [g3, setG3] = useState(false);

  return (
    <div id="top" className="min-h-screen">
      {/* ambient layers */}
      <div className="bg-blueprint" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
      <div className="bg-scan" aria-hidden="true" />

      <Header g3={g3} />
      <Opener g3={g3} />

      <main>
        {/* REV A — Phase 1 · System Design */}
        <ProblemSection />
        <ObjectivesSection />
        <UsersSection />
        <FeaturesSection />
        <MLSection />
        <DatasetSection />
        <ArchSection />
        <DbSection />
        <StackSection />
        <DifficultySection />
        <RiskSection />
        <EthicsSection />
        <DiffSection />
        <RoadmapSection g2={g2} />
        <GateG1Section />

        {/* REV B — Phase 2 · Data */}
        <DataRegisterSection />
        <ProxySection />
        <SchemaSection />
        <GateG2Section g2={g2} onApprove={() => undefined} />

        {/* REV C — Phase 3 · EDA */}
        <EDAProtocolSection />
        <LedgerSection />
        <LeakageSection />
        <BalanceSection />
        <GateG3Section g3={g3} onApprove={() => setG3(true)} />
      </main>

      <Footer g3={g3} />
    </div>
  );
}
