import { PageHero } from "../layout/Shell";
import { PageMapSection, AppShellSection, StateCacheSection, GateG16Section } from "../components/Phase16";
import { TestMatrixSection, TestRunnerSection, FailureLedgerSection, GateG17Section } from "../components/Phase17";

const TOC = [
  { id: "s78", n: "78", label: "Page Map" },
  { id: "s79", n: "79", label: "App Shell" },
  { id: "s80", n: "80", label: "State & Cache" },
  { id: "s81", n: "81", label: "Gate G-16" },
  { id: "s82", n: "82", label: "Test Matrix" },
  { id: "s83", n: "83", label: "Live Runner" },
  { id: "s84", n: "84", label: "Failure Ledger" },
  { id: "s85", n: "85", label: "Gate G-17" },
];

export default function Delivery() {
  return (
    <>
      <PageHero
        kicker="SHEET 09 · DELIVERY"
        title="Application & Testing"
        intro="The twelve-page Streamlit blueprint rehearsed as a living wireframe — every page bound to approved engines and tagged by the state it touches. Then the 28-test suite that turns seventeen revisions of promises into executable assertions."
        stamp="APPROVED · REV P–Q"
        phaseWatermark="09"
        toc={TOC}
      />
      <PageMapSection />
      <AppShellSection />
      <StateCacheSection />
      <GateG16Section g16 onApprove={() => undefined} />
      <TestMatrixSection />
      <TestRunnerSection />
      <FailureLedgerSection />
      <GateG17Section g17 onApprove={() => undefined} />
    </>
  );
}
