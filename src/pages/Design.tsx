import { PageHero } from "../layout/Shell";
import {
  ProblemSection,
  ObjectivesSection,
  UsersSection,
  EthicsSection,
  DiffSection,
} from "../components/CoreSections";
import FeaturesSection from "../components/Features";
import { MLSection, DatasetSection } from "../components/MLSections";
import { ArchSection, DbSection, StackSection, DifficultySection } from "../components/ArchSections";
import RiskSection from "../components/Risks";
import { RoadmapSection, GateG1Section } from "../components/Roadmap";

export default function Design() {
  return (
    <>
      <PageHero
        kicker="PHASE 1 · REV A · GATE G-1"
        title="System Design"
        intro="The constitution of the project: what the system is for, who it serves, what it will never do, and how every later phase must justify itself against this sheet."
        stamp="G-1 PASSED"
        stampTone="green"
        phaseWatermark="01"
        toc={[
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
        ]}
      />
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
    </>
  );
}
