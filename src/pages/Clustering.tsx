import { PageHero } from "../layout/Shell";
import {
  ClusterProtocolSection,
  ElbowLabSection,
  NamingSection,
  GuardrailsSection,
  GateG7Section,
} from "../components/Phase7";

const TOC = [
  { id: "s40", n: "40", label: "Protocol" },
  { id: "s41", n: "41", label: "Elbow Lab" },
  { id: "s42", n: "42", label: "Naming Rules" },
  { id: "s43", n: "43", label: "Guardrails" },
  { id: "s44", n: "44", label: "Gate G-7" },
];

export default function Clustering() {
  return (
    <>
      <PageHero
        kicker="SHEET 04 · CLUSTERS"
        title="Student Clustering"
        intro="The phase most tempted by pseudo-science — met head-on. k must be earned by elbow, silhouette and seed stability; a live k-means lab does the real arithmetic; and the naming rules forbid personalities, rankings and destinies."
        stamp="APPROVED · REV G"
        phaseWatermark="04"
        toc={TOC}
      />
      <ClusterProtocolSection />
      <ElbowLabSection />
      <NamingSection />
      <GuardrailsSection />
      <GateG7Section g7 onApprove={() => undefined} />
    </>
  );
}
