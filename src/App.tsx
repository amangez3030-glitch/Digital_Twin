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
import {
  FormulationSection,
  GapEngineSection,
  PrereqGraphSection,
  GateG9Section,
} from "./components/Phase9";
import {
  CatalogSection,
  RoadmapBuilderSection,
  WhyNotSection,
  GateG10Section,
} from "./components/Phase10";
import {
  PipelineSpecSection,
  LiveExtractorSection,
  NormalizationSection,
  GateG11Section,
} from "./components/Phase11";
import {
  MatcherMathSection,
  LiveMatcherSection,
  NotHiringSection,
  GateG12Section,
} from "./components/Phase12";
import {
  ExplanationMatrixSection,
  ShapleyLabSection,
  XaiLimitsSection,
  GateG13Section,
} from "./components/Phase13";
import {
  ConstitutionSection,
  TwinConsoleSection,
  WritePathSection,
  GateG14Section,
} from "./components/Phase14";
import {
  SimContractSection,
  SimLabSection,
  ClauseSection,
  GateG15Section,
} from "./components/Phase15";

function Footer({ g15 }: { g15: boolean }) {
  return (
    <footer className="relative mt-28 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 md:grid-cols-3">
        <div>
          <p className="mono-label text-cyan">{DOC_META.docNo} · {DOC_META.rev}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-faint">
            AI Digital Twin &amp; Career Intelligence System — Phase 15 of 18. A decision-support
            design document. The simulator in §75 replays hypotheticals through approved engines with
            exact attribution — and wears its "not a prediction" label on every render.
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
          <p className={`mt-2 font-mono text-[12.5px] ${g15 ? "text-green" : "text-amber"}`}>
            {g15 ? "G-15 PASSED → PHASE 16 (THE APPLICATION)" : "G-15 PENDING SUPERVISOR APPROVAL"}
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
  // Gates G-1 → G-14 are recorded as passed (REV A–N approved).
  // G-15 is the live decision of this revision.
  const [g15, setG15] = useState(false);

  return (
    <div id="top" className="min-h-screen">
      {/* ambient layers */}
      <div className="bg-blueprint" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
      <div className="bg-scan" aria-hidden="true" />

      <Header g15={g15} />
      <Opener g15={g15} />

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
        <GateG8Section g8={true} onApprove={() => undefined} />

        {/* Phase 9 — Skill Gap Engine */}
        <FormulationSection />
        <GapEngineSection />
        <PrereqGraphSection />
        <GateG9Section g9={true} onApprove={() => undefined} />

        {/* Phase 10 — Recommendation Engine */}
        <CatalogSection />
        <RoadmapBuilderSection />
        <WhyNotSection />
        <GateG10Section g10 onApprove={() => undefined} />

        {/* Phase 11 — NLP Resume Intelligence */}
        <PipelineSpecSection />
        <LiveExtractorSection />
        <NormalizationSection />
        <GateG11Section g11 onApprove={() => undefined} />

        {/* Phase 12 — Job Matching */}
        <MatcherMathSection />
        <LiveMatcherSection />
        <NotHiringSection />
        <GateG12Section g12 onApprove={() => undefined} />

        {/* Phase 13 — Explainable AI */}
        <ExplanationMatrixSection />
        <ShapleyLabSection />
        <XaiLimitsSection />
        <GateG13Section g13 onApprove={() => undefined} />

        {/* Phase 14 — The Digital Twin */}
        <ConstitutionSection />
        <TwinConsoleSection />
        <WritePathSection />
        <GateG14Section g14 onApprove={() => undefined} />

        {/* Phase 15 — The Future Simulator */}
        <SimContractSection />
        <SimLabSection />
        <ClauseSection />
        <GateG15Section g15={g15} onApprove={() => setG15(true)} />
      </main>

      <Footer g15={g15} />
    </div>
  );
}
