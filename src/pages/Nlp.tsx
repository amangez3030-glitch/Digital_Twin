import { PageHero } from "../layout/Shell";
import { PipelineSpecSection, LiveExtractorSection, NormalizationSection, GateG11Section } from "../components/Phase11";
import { MatcherMathSection, LiveMatcherSection, NotHiringSection, GateG12Section } from "../components/Phase12";

const TOC = [
  { id: "s58", n: "58", label: "Extraction Pipeline" },
  { id: "s59", n: "59", label: "Live Extractor" },
  { id: "s60", n: "60", label: "Normalization" },
  { id: "s61", n: "61", label: "Gate G-11" },
  { id: "s62", n: "62", label: "Matcher Math" },
  { id: "s63", n: "63", label: "Live JD Matcher" },
  { id: "s64", n: "64", label: "Match ≠ Hiring" },
  { id: "s65", n: "65", label: "Gate G-12" },
];

export default function Nlp() {
  return (
    <>
      <PageHero
        kicker="SHEET 06 · NLP"
        title="Resume & Job Matching"
        intro="A deterministic extractor that transcribes claims, counts its evidence and refuses to guess silently — then a job-description matcher that weighs required over preferred and never mistakes a fit gauge for a hiring forecast."
        stamp="APPROVED · REV K–L"
        phaseWatermark="06"
        toc={TOC}
      />
      <PipelineSpecSection />
      <LiveExtractorSection />
      <NormalizationSection />
      <GateG11Section g11 onApprove={() => undefined} />
      <MatcherMathSection />
      <LiveMatcherSection />
      <NotHiringSection />
      <GateG12Section g12 onApprove={() => undefined} />
    </>
  );
}
