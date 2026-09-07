import { PageHero } from "../layout/Shell";
import { ExplanationMatrixSection, ShapleyLabSection, XaiLimitsSection, GateG13Section } from "../components/Phase13";

const TOC = [
  { id: "s66", n: "66", label: "Explanation Matrix" },
  { id: "s67", n: "67", label: "Shapley Waterfall" },
  { id: "s68", n: "68", label: "Named Limits" },
  { id: "s69", n: "69", label: "Gate G-13" },
];

export default function Xai() {
  return (
    <>
      <PageHero
        kicker="SHEET 07 · XAI"
        title="Explainable AI"
        intro="One explanation method per output, chosen in advance: transparent sums for rule terms, TreeSHAP after Run 002, and fakery refused for clusters. The Shapley lab computes exact φ values you can check with a pencil."
        stamp="APPROVED · REV M"
        phaseWatermark="07"
        toc={TOC}
      />
      <ExplanationMatrixSection />
      <ShapleyLabSection />
      <XaiLimitsSection />
      <GateG13Section g13 onApprove={() => undefined} />
    </>
  );
}
