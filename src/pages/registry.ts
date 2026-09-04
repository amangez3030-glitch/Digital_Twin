/* ============================================================
   Site map — every page of the DT-CIS design document site.
   One registry drives the nav, the pagers and the phase map.
   ============================================================ */

export interface PageDef {
  path: string;
  code: string;
  label: string;
  title: string;
  phases: string;
  revs: string;
  gates: string;
  status: "APPROVED" | "SEAL PENDING";
  blurb: string;
}

export const PAGES: PageDef[] = [
  {
    path: "/",
    code: "00",
    label: "Overview",
    title: "The Document",
    phases: "All 18 phases",
    revs: "REV A–R",
    gates: "G-1 → G-17",
    status: "APPROVED",
    blurb: "Title block, revision ledger, the eighteen-phase map and the system schematic — the cover sheet of the whole dossier.",
  },
  {
    path: "/design",
    code: "01",
    label: "Design",
    title: "System Design",
    phases: "Phase 1",
    revs: "REV A",
    gates: "G-1",
    status: "APPROVED",
    blurb: "Problem statement, objectives, the sixteen-module feature ledger, architecture, database, stack, risks and ethics — the constitution everything else obeys.",
  },
  {
    path: "/data",
    code: "02",
    label: "Data",
    title: "Data & EDA",
    phases: "Phases 2–3",
    revs: "REV B–C",
    gates: "G-2 · G-3",
    status: "APPROVED",
    blurb: "The ten-dataset register, the proxy-label honesty contract, schema matching, and the pre-committed EDA: 33-attribute ledger, leakage log, balance protocol.",
  },
  {
    path: "/models",
    code: "03",
    label: "Models",
    title: "Pipelines → Advanced ML",
    phases: "Phases 4–6",
    revs: "REV D–F",
    gates: "G-4 → G-6",
    status: "APPROVED",
    blurb: "The ColumnTransformer composition, fit discipline, executable leakage tests, the baseline harness, the confusion-matrix lab and the evidence rules for model selection.",
  },
  {
    path: "/clustering",
    code: "04",
    label: "Clusters",
    title: "Student Clustering",
    phases: "Phase 7",
    revs: "REV G",
    gates: "G-7",
    status: "APPROVED",
    blurb: "k-selection protocol, a live k-means elbow/silhouette lab, the naming rules that forbid personalities and destinies, and the guardrails personas must never cross.",
  },
  {
    path: "/intelligence",
    code: "05",
    label: "Engines",
    title: "Career Intelligence",
    phases: "Phases 8–10",
    revs: "REV H–J",
    gates: "G-8 → G-10",
    status: "APPROVED",
    blurb: "The explainable compatibility scorer, the live skill-gap engine with prerequisite DAG, and the recommendation engine with its honest catalog and why-not panel.",
  },
  {
    path: "/nlp",
    code: "06",
    label: "NLP",
    title: "Resume & Job Matching",
    phases: "Phases 11–12",
    revs: "REV K–L",
    gates: "G-11 · G-12",
    status: "APPROVED",
    blurb: "The deterministic resume extractor with confidence evidence, the alias vocabulary, the job-description matcher, and the match-is-not-a-hire contract.",
  },
  {
    path: "/xai",
    code: "07",
    label: "XAI",
    title: "Explainable AI",
    phases: "Phase 13",
    revs: "REV M",
    gates: "G-13",
    status: "APPROVED",
    blurb: "One explanation method per output — SHIP for rule terms, TreeSHAP after Run 002, fakery refused for clusters — plus a hand-checkable Shapley waterfall lab.",
  },
  {
    path: "/twin",
    code: "08",
    label: "Twin",
    title: "Digital Twin & Simulator",
    phases: "Phases 14–15",
    revs: "REV N–O",
    gates: "G-14 · G-15",
    status: "APPROVED",
    blurb: "The twin's constitution and live console — versioned snapshots, audit trail, forbidden-write drill — and the exactly-attributable what-if simulator.",
  },
  {
    path: "/delivery",
    code: "09",
    label: "Delivery",
    title: "App & Testing",
    phases: "Phases 16–17",
    revs: "REV P–Q",
    gates: "G-16 · G-17",
    status: "APPROVED",
    blurb: "The twelve-page Streamlit blueprint rehearsed as a living wireframe, the state-kind contract, and the 28-test suite with its live runner and failure ledger.",
  },
  {
    path: "/defense",
    code: "10",
    label: "Defense",
    title: "Finalization",
    phases: "Phase 18",
    revs: "REV R",
    gates: "Final seal",
    status: "SEAL PENDING",
    blurb: "The deliverables vault, the rehearseable demo script, viva prep for the questions that will actually be asked, and the final seal of the document.",
  },
];

/* Which page hosts each of the 18 phases (for the overview map). */
export const PHASE_PAGE: Record<number, string> = {
  1: "/design",
  2: "/data",
  3: "/data",
  4: "/models",
  5: "/models",
  6: "/models",
  7: "/clustering",
  8: "/intelligence",
  9: "/intelligence",
  10: "/intelligence",
  11: "/nlp",
  12: "/nlp",
  13: "/xai",
  14: "/twin",
  15: "/twin",
  16: "/delivery",
  17: "/delivery",
  18: "/defense",
};

export const pageByPath = (path: string) => PAGES.find((p) => p.path === path);

/* The product itself — rendered above the document sheets in the sidebar. */
export const SYS_LINKS: { path: string; label: string }[] = [
  { path: "/system", label: "Dashboard" },
  { path: "/system/twin", label: "Digital Twin" },
  { path: "/system/careers", label: "Career Intelligence" },
  { path: "/system/skills", label: "Skill Intelligence" },
  { path: "/system/roadmap", label: "Learning Roadmap" },
  { path: "/system/resume", label: "Resume Analyzer" },
  { path: "/system/jobs", label: "Job Matcher" },
  { path: "/system/simulate", label: "Future Simulator" },
  { path: "/system/progress", label: "Progress" },
];

/* Sidebar grouping — the sheet index of the dossier. */
export const NAV_GROUPS: { key: string; label: string; paths: string[] }[] = [
  { key: "foundations", label: "COVER", paths: ["/"] },
  { key: "foundations", label: "FOUNDATIONS", paths: ["/design", "/data"] },
  { key: "models", label: "MODELS", paths: ["/models", "/clustering"] },
  { key: "intelligence", label: "INTELLIGENCE", paths: ["/intelligence", "/nlp", "/xai"] },
  { key: "application", label: "APPLICATION", paths: ["/twin", "/delivery"] },
  { key: "defense", label: "DEFENSE", paths: ["/defense"] },
];
