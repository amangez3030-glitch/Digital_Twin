import { PageHero } from "../layout/Shell";
import { ConstitutionSection, TwinConsoleSection, WritePathSection, GateG14Section } from "../components/Phase14";
import { SimContractSection, SimLabSection, ClauseSection, GateG15Section } from "../components/Phase15";

const TOC = [
  { id: "s70", n: "70", label: "Constitution" },
  { id: "s71", n: "71", label: "Live Console" },
  { id: "s72", n: "72", label: "Write Path" },
  { id: "s73", n: "73", label: "Gate G-14" },
  { id: "s74", n: "74", label: "Sim Contract" },
  { id: "s75", n: "75", label: "What-If Lab" },
  { id: "s76", n: "76", label: "The Clause" },
  { id: "s77", n: "77", label: "Gate G-15" },
];

export default function Twin() {
  return (
    <>
      <PageHero
        kicker="SHEET 08 · TWIN"
        title="Digital Twin & Simulator"
        intro="The entity the system orbits: five stores it may hold, five classes of field it must refuse, and a live console that amends — never erases — its history. Then the what-if simulator, whose deltas are exactly attributable because the engine is linear in skill coverage."
        stamp="APPROVED · REV N–O"
        phaseWatermark="08"
        toc={TOC}
      />
      <ConstitutionSection />
      <TwinConsoleSection />
      <WritePathSection />
      <GateG14Section g14 onApprove={() => undefined} />
      <SimContractSection />
      <SimLabSection />
      <ClauseSection />
      <GateG15Section g15 onApprove={() => undefined} />
    </>
  );
}
