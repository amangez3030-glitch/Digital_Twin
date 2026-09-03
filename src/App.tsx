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
import { PipelineSection, FitSection, TestsSection, ValidatorSection, GateG4Section } from "./components/Phase4";
import { HarnessSection, ConfusionLabSection, RocSection, RunbookSection, GateG5Section } from "./components/Phase5";
import { CandidatesSection, NestedCVSection, EvidenceSection, ModelCardSection, GateG6Section } from "./components/Phase6";
import {
  ClusterProtocolSection,
  ElbowLabSection,
  NamingSection,
  GuardrailsSection,
  GateG7Section,
} from "./components/Phase7";
import {
  EquationSection,
  LabSection,
  WeightMatrixSection,
  ExplainContractSection,
  GateG8Section,
} from "./components/Phase8";

function Footer({ g8 }: { g8: boolean }) {
  return (
    <footer className="relative mt-28 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 md:grid-cols-3">
        <div>
          <p className="mono-label text-cyan">{DOC_META.docNo} · {DOC_META.rev}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-faint">
            AI Digital Twin &amp; Career Intelligence System — Phase 8 of 18. A decision-support
            design document. No datasets were loaded and no models trained — but the compatibility
            engine in §46 is real: drag a slider and watch a score argue for itself.
          </p>
        </div>
        <div>
          <p className="mono-label text-faint">Standing rules carried into every phase</p>
          <ul className="mt-2 space-y-1 font-mono text-[11.5px] text-faint">
            <li><span className="text-rose">01</span> never fabricate data or metrics</li>
            <li><span className="text-rose">02</span> never hide an error or a failed baseline</li>
            <li><span className="text-rose">03</span> smaller working feature &gt; fake advanced one</li>
            <li><span className="text-rose">04</span> say what cannot be done — and the valid alternative</li>
          </ul>
        </div>
        <div className="md:text-right">
          <p className="mono-label text-faint">Gate status</p>
          <p className={`mt-2 font-mono text-[12.5px] ${g8 ? "text-green" : "text-amber"}`}>
            {g8 ? "G-8 PASSED → PHASE 9 (SKILL GAP ENGINE)" : "G-8 PENDING SUPERVISOR APPROVAL"}
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
  // Gates G-1 → G-7 are recorded as passed (REV A–G approved).
  // G-8 is the live decision of this revision.
  const [g8, setG8] = useState(false);

  return (
    <div id="top" className="min-h-screen">
      {/* ambient layers */}
      <div className="bg-blueprint" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
      <div className="bg-scan" aria-hidden="true" />

      <Header g8={g8} />
      <Opener g8={g8} />

      <main>
        {/* Phase 1 — System Design */}
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
        <RoadmapSection />
        <GateG1Section />

        {/* Phase 2 — Data */}
        <DataRegisterSection />
        <ProxySection />
        <SchemaSection />
        <GateG2Section g2 onApprove={() => undefined} />

        {/* Phase 3 — EDA */}
        <EDAProtocolSection />
        <LedgerSection />
        <LeakageSection />
        <BalanceSection />
        <GateG3Section g3 onApprove={() => undefined} />

        {/* Phase 4 — Preprocessing */}
        <PipelineSection />
        <FitSection />
        <TestsSection />
        <ValidatorSection />
        <GateG4Section g4 onApprove={() => undefined} />

        {/* Phase 5 — Baseline Models */}
        <HarnessSection />
        <ConfusionLabSection />
        <RocSection />
        <RunbookSection />
        <GateG5Section g5 onApprove={() => undefined} />

        {/* Phase 6 — Advanced ML */}
        <CandidatesSection />
        <NestedCVSection />
        <EvidenceSection />
        <ModelCardSection />
        <GateG6Section g6 onApprove={() => undefined} />

        {/* Phase 7 — Student Clustering */}
        <ClusterProtocolSection />
        <ElbowLabSection />
        <NamingSection />
        <GuardrailsSection />
        <GateG7Section g7 onApprove={() => undefined} />

        {/* Phase 8 — Career Recommendation */}
        <EquationSection />
        <LabSection />
        <WeightMatrixSection />
        <ExplainContractSection />
        <GateG8Section g8={g8} onApprove={() => setG8(true)} />
      </main>

      <Footer g8={g8} />
    </div>
  );
}
