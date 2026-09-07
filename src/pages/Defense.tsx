import { PageHero, useDoc } from "../layout/Shell";
import { VaultSection, DemoSection, VivaSection, SealSection } from "../components/Phase18";

const TOC = [
  { id: "s86", n: "86", label: "Deliverables Vault" },
  { id: "s87", n: "87", label: "Demo Script" },
  { id: "s88", n: "88", label: "Viva Prep" },
  { id: "s89", n: "89", label: "Final Seal" },
];

export default function Defense() {
  const { sealed, seal } = useDoc();
  return (
    <>
      <PageHero
        kicker="SHEET 10 · DEFENSE"
        title="Finalization"
        intro="The last sheet of the dossier: what ships with the project, how the demo is rehearsed, the viva questions that will actually be asked — and the seal that archives all eighteen revisions."
        stamp={sealed ? "SEALED · ARCHIVED" : "SEAL PENDING"}
        stampTone={sealed ? "green" : "amber"}
        phaseWatermark="10"
        toc={TOC}
      />
      <VaultSection />
      <DemoSection />
      <VivaSection />
      <SealSection sealed={sealed} onSeal={seal} />
    </>
  );
}
