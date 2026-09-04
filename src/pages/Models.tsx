import { PageHero } from "../layout/Shell";
import { PipelineSection, FitSection, TestsSection, ValidatorSection, GateG4Section } from "../components/Phase4";
import { HarnessSection, ConfusionLabSection, RocSection, RunbookSection, GateG5Section } from "../components/Phase5";
import { CandidatesSection, NestedCVSection, EvidenceSection, ModelCardSection, GateG6Section } from "../components/Phase6";

const TOC = [
  { id: "s25", n: "25", label: "ColumnTransformer" },
  { id: "s26", n: "26", label: "Fit Discipline" },
  { id: "s27", n: "27", label: "Leakage Tests" },
  { id: "s28", n: "28", label: "Twin Validator" },
  { id: "s29", n: "29", label: "Gate G-4" },
  { id: "s30", n: "30", label: "Baseline Harness" },
  { id: "s31", n: "31", label: "Confusion Lab" },
  { id: "s32", n: "32", label: "ROC by Hand" },
  { id: "s33", n: "33", label: "Evidence Chain" },
  { id: "s34", n: "34", label: "Gate G-5" },
  { id: "s35", n: "35", label: "Candidates" },
  { id: "s36", n: "36", label: "Nested CV" },
  { id: "s37", n: "37", label: "Evidence Rule" },
  { id: "s38", n: "38", label: "Model Card" },
  { id: "s39", n: "39", label: "Gate G-6" },
];

export default function Models() {
  return (
    <>
      <PageHero
        kicker="SHEET 03 · MODELS"
        title="Pipelines → Advanced ML"
        intro="Preprocessing as final code — the ColumnTransformer composition, fit discipline, and the leakage checklist converted to executable tests. Then baselines and advanced candidates: the harness runs, the metric labs teach by hand, and the winner's rule is signed before any run."
        stamp="APPROVED · REV D–F"
        phaseWatermark="03"
        toc={TOC}
      />
      <PipelineSection />
      <FitSection />
      <TestsSection />
      <ValidatorSection />
      <GateG4Section g4 onApprove={() => undefined} />
      <HarnessSection />
      <ConfusionLabSection />
      <RocSection />
      <RunbookSection />
      <GateG5Section g5 onApprove={() => undefined} />
      <CandidatesSection />
      <NestedCVSection />
      <EvidenceSection />
      <ModelCardSection />
      <GateG6Section g6 onApprove={() => undefined} />
    </>
  );
}
