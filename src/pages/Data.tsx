import { PageHero } from "../layout/Shell";
import { DataRegisterSection, ProxySection, SchemaSection } from "../components/Phase2";
import { EDAProtocolSection, LedgerSection, LeakageSection, BalanceSection } from "../components/Phase3";
import { GateG2Section, GateG3Section } from "../components/Roadmap";

const TOC = [
  { id: "s16", n: "16", label: "Dataset Register" },
  { id: "s17", n: "17", label: "Proxy Policy" },
  { id: "s18", n: "18", label: "Schema Matching" },
  { id: "s19", n: "19", label: "Gate G-2" },
  { id: "s20", n: "20", label: "EDA Contract" },
  { id: "s21", n: "21", label: "Attribute Ledger" },
  { id: "s22", n: "22", label: "Leakage Log" },
  { id: "s23", n: "23", label: "Balance" },
  { id: "s24", n: "24", label: "Gate G-3" },
];

export default function Data() {
  return (
    <>
      <PageHero
        kicker="SHEET 02 · DATA"
        title="Data & Exploratory Analysis"
        intro="Ten datasets evaluated before a row is read — four adopted, four conditional, two rejected on the record. Then the EDA contract: every analytical decision pre-committed, the 33-attribute ledger signed, and the leakage case closed in writing."
        stamp="APPROVED · REV B–C"
        phaseWatermark="02"
        toc={TOC}
      />
      <DataRegisterSection />
      <ProxySection />
      <SchemaSection />
      <GateG2Section g2 onApprove={() => undefined} />
      <EDAProtocolSection />
      <LedgerSection />
      <LeakageSection />
      <BalanceSection />
      <GateG3Section g3 onApprove={() => undefined} />
    </>
  );
}
