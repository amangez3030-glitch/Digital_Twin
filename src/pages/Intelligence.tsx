import { PageHero } from "../layout/Shell";
import { EquationSection, LabSection, WeightMatrixSection, ExplainContractSection, GateG8Section } from "../components/Phase8";
import { FormulationSection, GapEngineSection, PrereqGraphSection, GateG9Section } from "../components/Phase9";
import { CatalogSection, RoadmapBuilderSection, WhyNotSection, GateG10Section } from "../components/Phase10";

const TOC = [
  { id: "s45", n: "45", label: "Scoring Equation" },
  { id: "s46", n: "46", label: "Compatibility Lab" },
  { id: "s47", n: "47", label: "Weight Matrix" },
  { id: "s48", n: "48", label: "Explain Contract" },
  { id: "s49", n: "49", label: "Gate G-8" },
  { id: "s50", n: "50", label: "Gap Formulation" },
  { id: "s51", n: "51", label: "Live Gap Engine" },
  { id: "s52", n: "52", label: "Prerequisite DAG" },
  { id: "s53", n: "53", label: "Gate G-9" },
  { id: "s54", n: "54", label: "Honest Catalog" },
  { id: "s55", n: "55", label: "Roadmap Builder" },
  { id: "s56", n: "56", label: "Why-Not Panel" },
  { id: "s57", n: "57", label: "Gate G-10" },
];

export default function Intelligence() {
  return (
    <>
      <PageHero
        kicker="SHEET 05 · ENGINES"
        title="Career Intelligence"
        intro="The heart of the system, running live: a four-term compatibility score that decomposes feature by feature, a skill-gap engine with a prerequisite DAG and payoff-per-effort ranking, and a recommendation engine whose every suggestion cites the shortfall that caused it."
        stamp="APPROVED · REV H–J"
        phaseWatermark="05"
        toc={TOC}
      />
      <EquationSection />
      <LabSection />
      <WeightMatrixSection />
      <ExplainContractSection />
      <GateG8Section g8 onApprove={() => undefined} />
      <FormulationSection />
      <GapEngineSection />
      <PrereqGraphSection />
      <GateG9Section g9 onApprove={() => undefined} />
      <CatalogSection />
      <RoadmapBuilderSection />
      <WhyNotSection />
      <GateG10Section g10 onApprove={() => undefined} />
    </>
  );
}
